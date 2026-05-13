using e_ElectoralWeb.Domain.Models.Quiz;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IQuizAction
    {
        Task<List<QuizDto>> GetAllQuizzesActionAsync();
        Task<QuizDto?> GetQuizByIdActionAsync(int id);
        Task<ActionResponce> CreateQuizActionAsync(QuizDto data);
        Task<ActionResponce> UpdateQuizActionAsync(QuizDto data);
        Task<ActionResponce> DeleteQuizActionAsync(int id);
    }
}
