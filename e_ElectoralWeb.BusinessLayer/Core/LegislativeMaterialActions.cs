using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.LegislativeMaterial;
using e_ElectoralWeb.Domain.Models.LegislativeMaterial;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class LegislativeMaterialActions
{
    private readonly QuizDbContext _context;

    protected LegislativeMaterialActions(QuizDbContext context)
    {
        _context = context;
    }

    protected Task<List<LegislativeMaterialDto>> GetPublishedLegislativeMaterialsActionExecutionAsync()
    {
        return BuildQuery()
            .Where(material => material.IsPublished)
            .ToListAsync();
    }

    protected Task<List<LegislativeMaterialDto>> GetAllLegislativeMaterialsActionExecutionAsync()
    {
        return BuildQuery().ToListAsync();
    }

    protected Task<LegislativeMaterialDto?> GetLegislativeMaterialByIdActionExecutionAsync(int id)
    {
        return BuildQuery()
            .FirstOrDefaultAsync(material => material.Id == id);
    }

    protected async Task<ActionResponce> CreateLegislativeMaterialActionExecutionAsync(LegislativeMaterialDto data)
    {
        var validation = Validate(data);
        if (!validation.IsSuccess)
        {
            return validation;
        }

        var now = DateTime.UtcNow;
        var entity = new LegislativeMaterialData
        {
            Title = data.Title.Trim(),
            Description = data.Description.Trim(),
            Category = data.Category.Trim(),
            SourceUrl = string.IsNullOrWhiteSpace(data.SourceUrl) ? null : data.SourceUrl.Trim(),
            SortOrder = data.SortOrder,
            IsPublished = data.IsPublished,
            PublishedAt = data.PublishedAt == default ? now : data.PublishedAt,
            CreatedAt = now,
            UpdatedAt = now,
        };

        _context.LegislativeMaterials.Add(entity);
        await _context.SaveChangesAsync();

        return new ActionResponce
        {
            IsSuccess = true,
            Message = "Legislative material created.",
            Data = entity.Id,
        };
    }

    protected async Task<ActionResponce> UpdateLegislativeMaterialActionExecutionAsync(LegislativeMaterialDto data)
    {
        if (data.Id <= 0)
        {
            return new ActionResponce { IsSuccess = false, Message = "Legislative material id is required." };
        }

        var validation = Validate(data);
        if (!validation.IsSuccess)
        {
            return validation;
        }

        var entity = await _context.LegislativeMaterials.FirstOrDefaultAsync(material => material.Id == data.Id);
        if (entity == null)
        {
            return new ActionResponce { IsSuccess = false, Message = "Legislative material not found." };
        }

        entity.Title = data.Title.Trim();
        entity.Description = data.Description.Trim();
        entity.Category = data.Category.Trim();
        entity.SourceUrl = string.IsNullOrWhiteSpace(data.SourceUrl) ? null : data.SourceUrl.Trim();
        entity.SortOrder = data.SortOrder;
        entity.IsPublished = data.IsPublished;
        entity.PublishedAt = data.PublishedAt == default ? entity.PublishedAt : data.PublishedAt;
        entity.UpdatedAt = DateTime.UtcNow;

        _context.LegislativeMaterials.Update(entity);
        await _context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "Legislative material updated." };
    }

    protected async Task<ActionResponce> DeleteLegislativeMaterialActionExecutionAsync(int id)
    {
        var entity = await _context.LegislativeMaterials.FirstOrDefaultAsync(material => material.Id == id);
        if (entity == null)
        {
            return new ActionResponce { IsSuccess = false, Message = "Legislative material not found." };
        }

        _context.LegislativeMaterials.Remove(entity);
        await _context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "Legislative material deleted." };
    }

    private IQueryable<LegislativeMaterialDto> BuildQuery()
    {
        return _context.LegislativeMaterials
            .AsNoTracking()
            .OrderBy(material => material.SortOrder)
            .ThenByDescending(material => material.PublishedAt)
            .ThenBy(material => material.Id)
            .Select(material => new LegislativeMaterialDto
            {
                Id = material.Id,
                Title = material.Title,
                Description = material.Description,
                Category = material.Category,
                SourceUrl = material.SourceUrl,
                SortOrder = material.SortOrder,
                IsPublished = material.IsPublished,
                PublishedAt = material.PublishedAt,
                CreatedAt = material.CreatedAt,
                UpdatedAt = material.UpdatedAt,
            });
    }

    private static ActionResponce Validate(LegislativeMaterialDto data)
    {
        if (string.IsNullOrWhiteSpace(data.Title))
        {
            return new ActionResponce { IsSuccess = false, Message = "Title is required." };
        }

        if (string.IsNullOrWhiteSpace(data.Description))
        {
            return new ActionResponce { IsSuccess = false, Message = "Description is required." };
        }

        if (string.IsNullOrWhiteSpace(data.Category))
        {
            return new ActionResponce { IsSuccess = false, Message = "Category is required." };
        }

        return new ActionResponce { IsSuccess = true };
    }
}
