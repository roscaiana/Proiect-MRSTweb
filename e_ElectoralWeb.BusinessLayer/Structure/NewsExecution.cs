using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.News;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class NewsExecution : NewsActions, INewsAction
{
    public Task<List<NewsDto>> GetAllNewsActionAsync()
        => GetAllNewsActionExecutionAsync();

    public Task<NewsDto?> GetNewsByIdActionAsync(int id)
        => GetNewsByIdActionExecutionAsync(id);

    public Task<ActionResponce> CreateNewsActionAsync(NewsDto data)
        => CreateNewsActionExecutionAsync(data);

    public Task<ActionResponce> UpdateNewsActionAsync(NewsDto data)
        => UpdateNewsActionExecutionAsync(data);

    public Task<ActionResponce> DeleteNewsActionAsync(int id)
        => DeleteNewsActionExecutionAsync(id);
}
