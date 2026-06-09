using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.News;
using e_ElectoralWeb.Domain.Models.News;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class NewsActions
{
    private readonly QuizDbContext _context;

    protected NewsActions(QuizDbContext context)
    {
        _context = context;
    }

    protected async Task<List<NewsDto>> GetAllNewsActionExecutionAsync()
    {
        var context = _context;
        return await context.News
            .OrderByDescending(n => n.PublishedAt)
            .Select(n => new NewsDto
            {
                Id = n.Id,
                Title = n.Title,
                Description = n.Description,
                Category = n.Category,
                Image = n.Image,
                SourceUrl = n.SourceUrl,
                PublishedAt = n.PublishedAt,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt
            })
            .ToListAsync();
    }

    protected async Task<NewsDto?> GetNewsByIdActionExecutionAsync(int id)
    {
        var context = _context;
        return await context.News
            .Where(n => n.Id == id)
            .Select(n => new NewsDto
            {
                Id = n.Id,
                Title = n.Title,
                Description = n.Description,
                Category = n.Category,
                Image = n.Image,
                SourceUrl = n.SourceUrl,
                PublishedAt = n.PublishedAt,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    protected async Task<ActionResponce> CreateNewsActionExecutionAsync(NewsDto data)
    {
        if (string.IsNullOrWhiteSpace(data.Title))
            return new ActionResponce { IsSuccess = false, Message = "Title is required." };
        if (string.IsNullOrWhiteSpace(data.Description))
            return new ActionResponce { IsSuccess = false, Message = "Description is required." };
        if (string.IsNullOrWhiteSpace(data.Category))
            return new ActionResponce { IsSuccess = false, Message = "Category is required." };
        if (string.IsNullOrWhiteSpace(data.Image))
            return new ActionResponce { IsSuccess = false, Message = "Image is required." };

        var now = DateTime.UtcNow;
        var context = _context;

        var entity = new NewsData
        {
            Title = data.Title.Trim(),
            Description = data.Description.Trim(),
            Category = data.Category.Trim(),
            Image = data.Image.Trim(),
            SourceUrl = string.IsNullOrWhiteSpace(data.SourceUrl) ? null : data.SourceUrl.Trim(),
            PublishedAt = data.PublishedAt == default ? now : data.PublishedAt,
            CreatedAt = now,
            UpdatedAt = now
        };

        context.News.Add(entity);
        await context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "News article created.", Data = entity.Id };
    }

    protected async Task<ActionResponce> UpdateNewsActionExecutionAsync(NewsDto data)
    {
        if (data.Id <= 0)
            return new ActionResponce { IsSuccess = false, Message = "News id is required." };
        if (string.IsNullOrWhiteSpace(data.Title))
            return new ActionResponce { IsSuccess = false, Message = "Title is required." };
        if (string.IsNullOrWhiteSpace(data.Description))
            return new ActionResponce { IsSuccess = false, Message = "Description is required." };
        if (string.IsNullOrWhiteSpace(data.Category))
            return new ActionResponce { IsSuccess = false, Message = "Category is required." };
        if (string.IsNullOrWhiteSpace(data.Image))
            return new ActionResponce { IsSuccess = false, Message = "Image is required." };

        var context = _context;
        var entity = await context.News.FirstOrDefaultAsync(n => n.Id == data.Id);
        if (entity == null)
            return new ActionResponce { IsSuccess = false, Message = "News article not found." };

        entity.Title = data.Title.Trim();
        entity.Description = data.Description.Trim();
        entity.Category = data.Category.Trim();
        entity.Image = data.Image.Trim();
        entity.SourceUrl = string.IsNullOrWhiteSpace(data.SourceUrl) ? null : data.SourceUrl.Trim();
        entity.PublishedAt = data.PublishedAt == default ? entity.PublishedAt : data.PublishedAt;
        entity.UpdatedAt = DateTime.UtcNow;

        context.News.Update(entity);
        await context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "News article updated." };
    }

    protected async Task<ActionResponce> DeleteNewsActionExecutionAsync(int id)
    {
        var context = _context;
        var entity = await context.News.FirstOrDefaultAsync(n => n.Id == id);
        if (entity == null)
            return new ActionResponce { IsSuccess = false, Message = "News article not found." };

        context.News.Remove(entity);
        await context.SaveChangesAsync();

        return new ActionResponce { IsSuccess = true, Message = "News article deleted." };
    }
}
