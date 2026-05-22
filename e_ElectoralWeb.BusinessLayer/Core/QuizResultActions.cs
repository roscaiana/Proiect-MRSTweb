using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.QuizResult;
using e_ElectoralWeb.Domain.Models.QuizResult;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class QuizResultActions
{
    protected QuizResultActions() { }

    protected async Task<ActionResponce> CheckAnswerActionExecutionAsync(QuizAnswerCheckRequestDto data)
    {
        if (data.QuestionId <= 0)
            return new ActionResponce { IsSuccess = false, Message = "QuestionId is required." };
        if (data.AnswerOptionId <= 0)
            return new ActionResponce { IsSuccess = false, Message = "AnswerOptionId is required." };

        using var context = new QuizDbContext();

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

    protected async Task<ActionResponce> EvaluateQuizActionExecutionAsync(QuizEvaluationRequestDto data)
    {
        if (data.QuizId <= 0)
            return new ActionResponce { IsSuccess = false, Message = "QuizId is required." };
        if (string.IsNullOrWhiteSpace(data.Mode))
            return new ActionResponce { IsSuccess = false, Message = "Mode is required." };
        if (data.QuestionIds == null || data.QuestionIds.Count == 0)
            return new ActionResponce { IsSuccess = false, Message = "QuestionIds are required." };

        using var context = new QuizDbContext();

        var requestedQuestionIds = data.QuestionIds
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        var questions = await context.Questions
            .Include(q => q.AnswerOptions)
            .Where(q => q.QuizId == data.QuizId && requestedQuestionIds.Contains(q.Id))
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
                CorrectAnswerText = correctOption?.Text,
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
                QuizId = data.QuizId,
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
        if (data.QuizId <= 0)
            return new ActionResponce { IsSuccess = false, Message = "QuizId is required." };
        if (data.UserId <= 0)
            return new ActionResponce { IsSuccess = false, Message = "UserId is required." };
        if (data.TotalQuestions <= 0)
            return new ActionResponce { IsSuccess = false, Message = "TotalQuestions must be greater than 0." };
        if (data.Score < 0 || data.Score > 100)
            return new ActionResponce { IsSuccess = false, Message = "Score must be between 0 and 100." };
        if (string.IsNullOrWhiteSpace(data.Mode))
            return new ActionResponce { IsSuccess = false, Message = "Mode is required." };

        using var context = new QuizDbContext();

        var quizExists = await context.Quizzes.AnyAsync(q => q.Id == data.QuizId);
        if (!quizExists)
            return new ActionResponce { IsSuccess = false, Message = "Quiz not found." };

        var userExists = await context.Users.AnyAsync(u => u.Id == data.UserId);
        if (!userExists)
            return new ActionResponce { IsSuccess = false, Message = "User not found." };

        var entity = new QuizResultData
        {
            QuizId = data.QuizId,
            UserId = data.UserId,
            TotalQuestions = data.TotalQuestions,
            CorrectAnswers = data.CorrectAnswers,
            WrongAnswers = data.WrongAnswers,
            Unanswered = data.Unanswered,
            Score = data.Score,
            TimeTaken = data.TimeTaken,
            Mode = data.Mode,
            CompletedAt = data.CompletedAt == default ? DateTime.UtcNow : data.CompletedAt
        };

        context.QuizResults.Add(entity);
        await context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "Rezultat salvat.", Data = entity.Id };
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
}
