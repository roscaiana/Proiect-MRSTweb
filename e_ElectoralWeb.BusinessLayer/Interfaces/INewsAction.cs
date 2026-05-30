using e_ElectoralWeb.Domain.Models.News;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface INewsAction
{
    Task<List<NewsDto>> GetAllNewsActionAsync();
    Task<NewsDto?> GetNewsByIdActionAsync(int id);
    Task<ActionResponce> CreateNewsActionAsync(NewsDto data);
    Task<ActionResponce> UpdateNewsActionAsync(NewsDto data);
    Task<ActionResponce> DeleteNewsActionAsync(int id);
}
