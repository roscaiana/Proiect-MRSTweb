using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.AnswerOption;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure
{
    public class AnswerOptionExecution : AnswerOptionActions, IAnswerOptionAction
    {
        public Task<List<AnswerOptionDto>> GetAllAnswerOptionsActionAsync()
        {
            return GetAllAnswerOptionsActionExecutionAsync();
        }

        public Task<AnswerOptionDto?> GetAnswerOptionByIdActionAsync(int id)
        {
            return GetAnswerOptionByIdActionExecutionAsync(id);
        }

        public Task<List<AnswerOptionDto>> GetAnswerOptionsByQuestionActionAsync(int questionId)
        {
            return GetAnswerOptionsByQuestionActionExecutionAsync(questionId);
        }

        public Task<ActionResponce> CreateAnswerOptionActionAsync(AnswerOptionDto data)
        {
            return CreateAnswerOptionActionExecutionAsync(data);
        }

        public Task<ActionResponce> UpdateAnswerOptionActionAsync(AnswerOptionDto data)
        {
            return UpdateAnswerOptionActionExecutionAsync(data);
        }

        public Task<ActionResponce> DeleteAnswerOptionActionAsync(int id)
        {
            return DeleteAnswerOptionActionExecutionAsync(id);
        }
    }
}
