using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.SupportQuestion;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface ISupportQuestionAction
{
    Task<List<SupportQuestionDto>> GetPublishedSupportQuestionsActionAsync();
    Task<List<SupportQuestionDto>> GetAllSupportQuestionsActionAsync();
    Task<SupportQuestionDto?> GetSupportQuestionByIdActionAsync(int id);
    Task<ActionResponce> CreateSupportQuestionActionAsync(SupportQuestionDto data);
    Task<ActionResponce> UpdateSupportQuestionActionAsync(SupportQuestionDto data);
    Task<ActionResponce> DeleteSupportQuestionActionAsync(int id);
}
