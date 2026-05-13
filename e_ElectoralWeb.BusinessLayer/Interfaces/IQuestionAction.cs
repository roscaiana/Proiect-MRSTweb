using e_ElectoralWeb.Domain.Models.Question;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IQuestionAction
    {
        Task<List<QuestionDto>> GetAllQuestionsActionAsync();
        Task<QuestionDto?> GetQuestionByIdActionAsync(int id);
        Task<List<QuestionDto>> GetQuestionsByQuizActionAsync(int quizId);
        Task<ActionResponce> CreateQuestionActionAsync(QuestionDto data);
        Task<ActionResponce> UpdateQuestionActionAsync(QuestionDto data);
        Task<ActionResponce> DeleteQuestionActionAsync(int id);
    }
}
