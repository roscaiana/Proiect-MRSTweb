using e_ElectoralWeb.Domain.Models.LegislativeMaterial;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface ILegislativeMaterialAction
{
    Task<List<LegislativeMaterialDto>> GetPublishedLegislativeMaterialsActionAsync();
    Task<List<LegislativeMaterialDto>> GetAllLegislativeMaterialsActionAsync();
    Task<LegislativeMaterialDto?> GetLegislativeMaterialByIdActionAsync(int id);
    Task<ActionResponce> CreateLegislativeMaterialActionAsync(LegislativeMaterialDto data);
    Task<ActionResponce> UpdateLegislativeMaterialActionAsync(LegislativeMaterialDto data);
    Task<ActionResponce> DeleteLegislativeMaterialActionAsync(int id);
}
