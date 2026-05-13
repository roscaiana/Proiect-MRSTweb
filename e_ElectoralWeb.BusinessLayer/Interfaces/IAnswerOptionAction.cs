using e_ElectoralWeb.Domain.Models.AnswerOption;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IAnswerOptionAction
    {
        Task<List<AnswerOptionDto>> GetAllAnswerOptionsActionAsync();
        Task<AnswerOptionDto?> GetAnswerOptionByIdActionAsync(int id);
        Task<List<AnswerOptionDto>> GetAnswerOptionsByQuestionActionAsync(int questionId);
        Task<ActionResponce> CreateAnswerOptionActionAsync(AnswerOptionDto data);
        Task<ActionResponce> UpdateAnswerOptionActionAsync(AnswerOptionDto data);
        Task<ActionResponce> DeleteAnswerOptionActionAsync(int id);
    }
}
