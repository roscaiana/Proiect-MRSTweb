using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.SupportQuestion;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class SupportQuestionExecution : SupportQuestionActions, ISupportQuestionAction
{
    public SupportQuestionExecution(QuizDbContext context) : base(context)
    {
    }

    public Task<List<SupportQuestionDto>> GetPublishedSupportQuestionsActionAsync()
        => GetPublishedSupportQuestionsActionExecutionAsync();

    public Task<List<SupportQuestionDto>> GetAllSupportQuestionsActionAsync()
        => GetAllSupportQuestionsActionExecutionAsync();

    public Task<SupportQuestionDto?> GetSupportQuestionByIdActionAsync(int id)
        => GetSupportQuestionByIdActionExecutionAsync(id);

    public Task<ActionResponce> CreateSupportQuestionActionAsync(SupportQuestionDto data)
        => CreateSupportQuestionActionExecutionAsync(data);

    public Task<ActionResponce> UpdateSupportQuestionActionAsync(SupportQuestionDto data)
        => UpdateSupportQuestionActionExecutionAsync(data);

    public Task<ActionResponce> DeleteSupportQuestionActionAsync(int id)
        => DeleteSupportQuestionActionExecutionAsync(id);
}
