using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Quiz;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure
{
    public class QuizExecution : QuizActions, IQuizAction
    {
        public Task<List<QuizDto>> GetAllQuizzesActionAsync()
        {
            return GetAllQuizzesActionExecutionAsync();
        }

        public Task<QuizDto?> GetQuizByIdActionAsync(int id)
        {
            return GetQuizByIdActionExecutionAsync(id);
        }

        public Task<ActionResponce> CreateQuizActionAsync(QuizDto data)
        {
            return CreateQuizActionExecutionAsync(data);
        }

        public Task<ActionResponce> UpdateQuizActionAsync(QuizDto data)
        {
            return UpdateQuizActionExecutionAsync(data);
        }

        public Task<ActionResponce> DeleteQuizActionAsync(int id)
        {
            return DeleteQuizActionExecutionAsync(id);
        }
    }
}
