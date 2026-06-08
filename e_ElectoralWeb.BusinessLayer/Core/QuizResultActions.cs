using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.QuizResult;
using e_ElectoralWeb.Domain.Entities.QuizSession;
using e_ElectoralWeb.Domain.Models.QuizResult;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class QuizResultActions
{
    protected QuizResultActions() { }

    protected async Task<ActionResponce> CheckAnswerActionExecutionAsync(QuizAnswerCheckRequestDto data)
    {
        if (data.SessionId == Guid.Empty)
            return new ActionResponce { IsSuccess = false, Message = "SessionId is required." };
        if (data.QuestionId <= 0)
            return new ActionResponce { IsSuccess = false, Message = "QuestionId is required." };
        if (data.AnswerOptionId <= 0)
            return new ActionResponce { IsSuccess = false, Message = "AnswerOptionId is required." };

        using var context = new QuizDbContext();

        var session = await context.QuizSessions.AsNoTracking().FirstOrDefaultAsync(s => s.Id == data.SessionId);
        if (session == null)
            return new ActionResponce { IsSuccess = false, Message = "Quiz session not found." };
        if (!string.Equals(session.Mode, "training", StringComparison.OrdinalIgnoreCase))
            return new ActionResponce { IsSuccess = false, Message = "Immediate feedback is available only in training mode." };

        var sessionQuestionIds = ReadSessionQuestionIds(session);
        if (!sessionQuestionIds.Contains(data.QuestionId))
            return new ActionResponce { IsSuccess = false, Message = "Question is not part of this quiz session." };

        var selectedOption = await context.AnswerOptions
            .Where(a => a.Id == data.AnswerOptionId && a.QuestionId == data.QuestionId)
            .FirstOrDefaultAsync();

        if (selectedOption == null)
            return new ActionResponce { IsSuccess = false, Message = "Answer option not found." };

        var correctAnswerText = await context.AnswerOptions
            .Where(a => a.QuestionId == data.QuestionId && a.IsCorrect)
            .Select(a => a.Text)
            .FirstOrDefaultAsync() ?? string.Empty;

        return new ActionResponce
        {
            IsSuccess = true,
            Data = new QuizAnswerCheckResultDto
            {
                QuestionId = data.QuestionId,
                AnswerOptionId = data.AnswerOptionId,
                IsCorrect = selectedOption.IsCorrect,
                CorrectAnswerText = correctAnswerText
            }
        };
    }

    protected async Task<ActionResponce> EvaluateQuizActionExecutionAsync(QuizEvaluationRequestDto data, bool allowExamMode = false)
    {
        if (string.IsNullOrWhiteSpace(data.Mode))
            return new ActionResponce { IsSuccess = false, Message = "Mode is required." };

        using var context = new QuizDbContext();

        var session = await GetSessionForEvaluationAsync(context, data.SessionId);
        if (data.SessionId.HasValue && session == null)
            return new ActionResponce { IsSuccess = false, Message = "Quiz session not found." };

        var quizId = session?.QuizId ?? data.QuizId;
        var effectiveMode = session?.Mode ?? data.Mode;

        if (string.Equals(effectiveMode, "exam", StringComparison.OrdinalIgnoreCase) && !allowExamMode)
            return new ActionResponce { IsSuccess = false, Message = "Exam results can be calculated only when the exam is submitted." };

        if (quizId <= 0)
            return new ActionResponce { IsSuccess = false, Message = "QuizId is required." };

        var requestedQuestionIds = session != null
            ? ReadSessionQuestionIds(session)
            : data.QuestionIds.Where(id => id > 0).Distinct().ToList();

        if (requestedQuestionIds.Count == 0)
            return new ActionResponce { IsSuccess = false, Message = "QuestionIds are required." };

        var questions = await context.Questions
            .Include(q => q.AnswerOptions)
            .Where(q => q.QuizId == quizId && requestedQuestionIds.Contains(q.Id))
            .OrderBy(q => q.Id)
            .ToListAsync();

        if (questions.Count == 0)
            return new ActionResponce { IsSuccess = false, Message = "Quiz questions not found." };
        if (questions.Count != requestedQuestionIds.Count)
            return new ActionResponce { IsSuccess = false, Message = "One or more questions are invalid for this quiz." };

        var answersByQuestionId = data.Answers
            .GroupBy(a => a.QuestionId)
            .ToDictionary(g => g.Key, g => g.Last().AnswerOptionId);

        var answerResults = new List<QuizEvaluationAnswerDto>();
        var correctAnswers = 0;
        var unanswered = 0;
        var includeCorrectAnswerText = allowExamMode || string.Equals(effectiveMode, "training", StringComparison.OrdinalIgnoreCase);

        foreach (var question in questions)
        {
            answersByQuestionId.TryGetValue(question.Id, out var selectedAnswerId);

            var selectedOption = selectedAnswerId.HasValue
                ? question.AnswerOptions.FirstOrDefault(a => a.Id == selectedAnswerId.Value)
                : null;

            var correctOption = question.AnswerOptions.FirstOrDefault(a => a.IsCorrect);
            var isCorrect = selectedOption != null && correctOption != null && selectedOption.Id == correctOption.Id;

            if (isCorrect)
            {
                correctAnswers++;
            }

            if (selectedOption == null)
            {
                unanswered++;
            }

            answerResults.Add(new QuizEvaluationAnswerDto
            {
                QuestionId = question.Id,
                QuestionText = question.Text,
                UserAnswerId = selectedOption?.Id,
                UserAnswerText = selectedOption?.Text,
                CorrectAnswerText = includeCorrectAnswerText ? correctOption?.Text : null,
                IsCorrect = isCorrect
            });
        }

        var totalQuestions = requestedQuestionIds.Count;
        var wrongAnswers = totalQuestions - correctAnswers - unanswered;
        var score = totalQuestions > 0 ? (int)Math.Round((double)correctAnswers / totalQuestions * 100) : 0;

        return new ActionResponce
        {
            IsSuccess = true,
            Data = new QuizEvaluationResultDto
            {
                QuizId = quizId,
                TotalQuestions = totalQuestions,
                CorrectAnswers = correctAnswers,
                WrongAnswers = wrongAnswers,
                Unanswered = unanswered,
                Score = score,
                TimeTaken = data.TimeTaken,
                DurationSeconds = data.DurationSeconds,
                CompletedAt = data.CompletedAt == default ? DateTime.UtcNow : data.CompletedAt,
                Answers = answerResults
            }
        };
    }

    protected async Task<ActionResponce> SubmitQuizResultActionExecutionAsync(QuizResultSubmitDto data)
    {
        if (!data.SessionId.HasValue)
            return new ActionResponce { IsSuccess = false, Message = "SessionId is required." };
        if (data.UserId <= 0)
            return new ActionResponce { IsSuccess = false, Message = "UserId is required." };

        using var context = new QuizDbContext();

        var session = await context.QuizSessions.FirstOrDefaultAsync(s => s.Id == data.SessionId.Value);
        if (session == null)
            return new ActionResponce { IsSuccess = false, Message = "Quiz session not found." };
        if (session.IsCompleted)
            return new ActionResponce { IsSuccess = false, Message = "Quiz session is already completed." };
        if (session.UserId.HasValue && session.UserId.Value != data.UserId)
            return new ActionResponce { IsSuccess = false, Message = "Quiz session does not belong to this user." };
        if (DateTime.UtcNow > session.ExpiresAt.AddSeconds(30))
            return new ActionResponce { IsSuccess = false, Message = "Quiz session expired." };

        var userExists = await context.Users.AnyAsync(u => u.Id == data.UserId);
        if (!userExists)
            return new ActionResponce { IsSuccess = false, Message = "User not found." };

        var evaluationResponse = await EvaluateQuizActionExecutionAsync(new QuizEvaluationRequestDto
        {
            SessionId = session.Id,
            QuizId = session.QuizId,
            Mode = session.Mode,
            TimeTaken = Math.Clamp(data.TimeTaken, 0, session.DurationSeconds),
            DurationSeconds = session.DurationSeconds,
            CompletedAt = data.CompletedAt == default ? DateTime.UtcNow : data.CompletedAt,
            Answers = data.Answers
        }, allowExamMode: true);

        if (!evaluationResponse.IsSuccess || evaluationResponse.Data is not QuizEvaluationResultDto evaluation)
        {
            return evaluationResponse;
        }

        var entity = new QuizResultData
        {
            QuizId = session.QuizId,
            UserId = data.UserId,
            TotalQuestions = evaluation.TotalQuestions,
            CorrectAnswers = evaluation.CorrectAnswers,
            WrongAnswers = evaluation.WrongAnswers,
            Unanswered = evaluation.Unanswered,
            Score = evaluation.Score,
            TimeTaken = evaluation.TimeTaken,
            Mode = session.Mode,
            CompletedAt = evaluation.CompletedAt
        };

        session.IsCompleted = true;
        session.CompletedAt = evaluation.CompletedAt;
        context.QuizResults.Add(entity);
        await context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "Rezultat salvat.", Data = evaluation };
    }

    protected async Task<List<QuizResultDto>> GetQuizResultsByUserActionExecutionAsync(int userId)
    {
        using var context = new QuizDbContext();
        return await context.QuizResults
            .Include(r => r.Quiz)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CompletedAt)
            .Select(r => new QuizResultDto
            {
                Id = r.Id,
                QuizId = r.QuizId,
                UserId = r.UserId,
                QuizTitle = r.Quiz.Title,
                TotalQuestions = r.TotalQuestions,
                CorrectAnswers = r.CorrectAnswers,
                WrongAnswers = r.WrongAnswers,
                Unanswered = r.Unanswered,
                Score = r.Score,
                TimeTaken = r.TimeTaken,
                Mode = r.Mode,
                CompletedAt = r.CompletedAt
            })
            .ToListAsync();
    }

    protected async Task<QuizResultDto?> GetQuizResultByIdActionExecutionAsync(int id)
    {
        using var context = new QuizDbContext();
        return await context.QuizResults
            .Include(r => r.Quiz)
            .Where(r => r.Id == id)
            .Select(r => new QuizResultDto
            {
                Id = r.Id,
                QuizId = r.QuizId,
                UserId = r.UserId,
                QuizTitle = r.Quiz.Title,
                TotalQuestions = r.TotalQuestions,
                CorrectAnswers = r.CorrectAnswers,
                WrongAnswers = r.WrongAnswers,
                Unanswered = r.Unanswered,
                Score = r.Score,
                TimeTaken = r.TimeTaken,
                Mode = r.Mode,
                CompletedAt = r.CompletedAt
            })
            .FirstOrDefaultAsync();
    }

    private static async Task<QuizSessionData?> GetSessionForEvaluationAsync(QuizDbContext context, Guid? sessionId)
    {
        if (!sessionId.HasValue)
        {
            return null;
        }

        return await context.QuizSessions.AsNoTracking().FirstOrDefaultAsync(s => s.Id == sessionId.Value);
    }

    private static List<int> ReadSessionQuestionIds(QuizSessionData session)
    {
        try
        {
            return JsonSerializer.Deserialize<List<int>>(session.QuestionIdsJson) ?? new List<int>();
        }
        catch
        {
            return new List<int>();
        }
    }
}
