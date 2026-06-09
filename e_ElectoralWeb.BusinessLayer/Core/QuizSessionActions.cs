using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.QuizSession;
using e_ElectoralWeb.Domain.Models.QuizSession;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class QuizSessionActions
{
    private const int MinQuestionCount = 1;
    private const int MaxQuestionCount = 100;
    private const int DefaultQuestionCount = 30;
    private const int DefaultDurationMinutes = 30;

    private readonly QuizDbContext _context;

    protected QuizSessionActions(QuizDbContext context)
    {
        _context = context;
    }

    protected async Task<ActionResponce> StartSessionActionExecutionAsync(QuizSessionStartRequestDto data, int? userId)
    {
        if (data.QuizId <= 0)
        {
            return new ActionResponce { IsSuccess = false, Message = "QuizId is required." };
        }

        var mode = NormalizeMode(data.Mode);
        if (mode == null)
        {
            return new ActionResponce { IsSuccess = false, Message = "Mode must be training or exam." };
        }

        var questionCount = data.QuestionCount <= 0 ? DefaultQuestionCount : data.QuestionCount;
        if (questionCount is < MinQuestionCount or > MaxQuestionCount)
        {
            return new ActionResponce { IsSuccess = false, Message = $"QuestionCount must be between {MinQuestionCount} and {MaxQuestionCount}." };
        }

        var durationMinutes = data.DurationMinutes <= 0 ? DefaultDurationMinutes : data.DurationMinutes;
        var durationSeconds = durationMinutes * 60;

        var context = _context;

        var quizExists = await context.Quizzes.AnyAsync(q => q.Id == data.QuizId);
        if (!quizExists)
        {
            return new ActionResponce { IsSuccess = false, Message = "Quiz not found." };
        }

        if (userId.HasValue)
        {
            var userExists = await context.Users.AnyAsync(u => u.Id == userId.Value && !u.IsBlocked);
            if (!userExists)
            {
                return new ActionResponce { IsSuccess = false, Message = "User not found or blocked." };
            }
        }

        var questions = await context.Questions
            .AsNoTracking()
            .Include(q => q.AnswerOptions)
            .Where(q => q.QuizId == data.QuizId && q.AnswerOptions.Any())
            .OrderBy(_ => Guid.NewGuid())
            .Take(questionCount)
            .ToListAsync();

        if (questions.Count < questionCount)
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = $"Question bank contains only {questions.Count} valid questions."
            };
        }

        var now = DateTime.UtcNow;
        var session = new QuizSessionData
        {
            Id = Guid.NewGuid(),
            QuizId = data.QuizId,
            UserId = userId,
            Mode = mode,
            QuestionCount = questionCount,
            DurationSeconds = durationSeconds,
            StartedAt = now,
            ExpiresAt = now.AddSeconds(durationSeconds),
            QuestionIdsJson = JsonSerializer.Serialize(questions.Select(q => q.Id).ToList())
        };

        context.QuizSessions.Add(session);
        await context.SaveChangesAsync();

        var result = new QuizSessionStartResultDto
        {
            SessionId = session.Id,
            QuizId = session.QuizId,
            Mode = session.Mode,
            DurationSeconds = session.DurationSeconds,
            StartedAt = session.StartedAt,
            ExpiresAt = session.ExpiresAt,
            Questions = questions.Select(q => new QuizSessionQuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                Options = q.AnswerOptions
                    .OrderBy(a => a.Id)
                    .Select(a => new QuizSessionAnswerOptionDto
                    {
                        Id = a.Id,
                        Text = a.Text
                    })
                    .ToList()
            }).ToList()
        };

        return new ActionResponce
        {
            IsSuccess = true,
            Data = result
        };
    }

    private static string? NormalizeMode(string mode)
    {
        var normalized = mode.Trim().ToLowerInvariant();
        return normalized is "training" or "exam" ? normalized : null;
    }
}
