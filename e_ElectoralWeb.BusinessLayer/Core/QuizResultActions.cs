using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.QuizResult;
using e_ElectoralWeb.Domain.Models.QuizResult;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class QuizResultActions
{
    protected QuizResultActions() { }

    protected ActionResponce SubmitQuizResultActionExecution(QuizResultSubmitDto data)
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

        var quizExists = context.Quizzes.Any(q => q.Id == data.QuizId);
        if (!quizExists)
            return new ActionResponce { IsSuccess = false, Message = "Quiz not found." };

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
        context.SaveChanges();

        return new ActionResponce { IsSuccess = true, Message = "Rezultat salvat.", Data = entity.Id };
    }

    protected List<QuizResultDto> GetQuizResultsByUserActionExecution(int userId)
    {
        using var context = new QuizDbContext();
        return context.QuizResults
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
            .ToList();
    }

    protected QuizResultDto? GetQuizResultByIdActionExecution(int id)
    {
        using var context = new QuizDbContext();
        return context.QuizResults
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
            .FirstOrDefault();
    }
}
