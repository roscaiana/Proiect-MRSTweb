using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.SupportQuestion;
using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.SupportQuestion;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class SupportQuestionActions
{
    private readonly QuizDbContext _context;

    protected SupportQuestionActions(QuizDbContext context)
    {
        _context = context;
    }

    protected Task<List<SupportQuestionDto>> GetPublishedSupportQuestionsActionExecutionAsync()
    {
        return BuildQuery()
            .Where(question => question.IsPublished)
            .ToListAsync();
    }

    protected Task<List<SupportQuestionDto>> GetAllSupportQuestionsActionExecutionAsync()
    {
        return BuildQuery().ToListAsync();
    }

    protected Task<SupportQuestionDto?> GetSupportQuestionByIdActionExecutionAsync(int id)
    {
        return BuildQuery()
            .FirstOrDefaultAsync(question => question.Id == id);
    }

    protected async Task<ActionResponce> CreateSupportQuestionActionExecutionAsync(SupportQuestionDto data)
    {
        var validation = Validate(data);
        if (!validation.IsSuccess)
        {
            return validation;
        }

        var now = DateTime.UtcNow;
        var entity = new SupportQuestionData
        {
            Category = NormalizeCategory(data.Category),
            Question = data.Question.Trim(),
            Answer = data.Answer.Trim(),
            SortOrder = data.SortOrder,
            IsPublished = data.IsPublished,
            CreatedAt = now,
            UpdatedAt = now,
        };

        _context.SupportQuestions.Add(entity);
        await _context.SaveChangesAsync();

        return new ActionResponce
        {
            IsSuccess = true,
            Message = "Support question created.",
            Data = entity.Id,
        };
    }

    protected async Task<ActionResponce> UpdateSupportQuestionActionExecutionAsync(SupportQuestionDto data)
    {
        if (data.Id <= 0)
        {
            return new ActionResponce { IsSuccess = false, Message = "Support question id is required." };
        }

        var validation = Validate(data);
        if (!validation.IsSuccess)
        {
            return validation;
        }

        var entity = await _context.SupportQuestions.FirstOrDefaultAsync(question => question.Id == data.Id);
        if (entity == null)
        {
            return new ActionResponce { IsSuccess = false, Message = "Support question not found." };
        }

        entity.Category = NormalizeCategory(data.Category);
        entity.Question = data.Question.Trim();
        entity.Answer = data.Answer.Trim();
        entity.SortOrder = data.SortOrder;
        entity.IsPublished = data.IsPublished;
        entity.UpdatedAt = DateTime.UtcNow;

        _context.SupportQuestions.Update(entity);
        await _context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "Support question updated." };
    }

    protected async Task<ActionResponce> DeleteSupportQuestionActionExecutionAsync(int id)
    {
        var entity = await _context.SupportQuestions.FirstOrDefaultAsync(question => question.Id == id);
        if (entity == null)
        {
            return new ActionResponce { IsSuccess = false, Message = "Support question not found." };
        }

        _context.SupportQuestions.Remove(entity);
        await _context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "Support question deleted." };
    }

    private IQueryable<SupportQuestionDto> BuildQuery()
    {
        return _context.SupportQuestions
            .AsNoTracking()
            .OrderBy(question => question.SortOrder)
            .ThenBy(question => question.Id)
            .Select(question => new SupportQuestionDto
            {
                Id = question.Id,
                Category = question.Category,
                Question = question.Question,
                Answer = question.Answer,
                SortOrder = question.SortOrder,
                IsPublished = question.IsPublished,
                CreatedAt = question.CreatedAt,
                UpdatedAt = question.UpdatedAt,
            });
    }

    private static ActionResponce Validate(SupportQuestionDto data)
    {
        if (string.IsNullOrWhiteSpace(data.Category))
        {
            return new ActionResponce { IsSuccess = false, Message = "Category is required." };
        }

        if (string.IsNullOrWhiteSpace(data.Question))
        {
            return new ActionResponce { IsSuccess = false, Message = "Question is required." };
        }

        if (string.IsNullOrWhiteSpace(data.Answer))
        {
            return new ActionResponce { IsSuccess = false, Message = "Answer is required." };
        }

        return new ActionResponce { IsSuccess = true };
    }

    private static string NormalizeCategory(string value)
    {
        return value.Trim().ToLowerInvariant();
    }
}
