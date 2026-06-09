using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Models.LegislativeMaterial;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class LegislativeMaterialExecution : LegislativeMaterialActions, ILegislativeMaterialAction
{
    public LegislativeMaterialExecution(QuizDbContext context) : base(context)
    {
    }

    public Task<List<LegislativeMaterialDto>> GetPublishedLegislativeMaterialsActionAsync()
        => GetPublishedLegislativeMaterialsActionExecutionAsync();

    public Task<List<LegislativeMaterialDto>> GetAllLegislativeMaterialsActionAsync()
        => GetAllLegislativeMaterialsActionExecutionAsync();

    public Task<LegislativeMaterialDto?> GetLegislativeMaterialByIdActionAsync(int id)
        => GetLegislativeMaterialByIdActionExecutionAsync(id);

    public Task<ActionResponce> CreateLegislativeMaterialActionAsync(LegislativeMaterialDto data)
        => CreateLegislativeMaterialActionExecutionAsync(data);

    public Task<ActionResponce> UpdateLegislativeMaterialActionAsync(LegislativeMaterialDto data)
        => UpdateLegislativeMaterialActionExecutionAsync(data);

    public Task<ActionResponce> DeleteLegislativeMaterialActionAsync(int id)
        => DeleteLegislativeMaterialActionExecutionAsync(id);
}
