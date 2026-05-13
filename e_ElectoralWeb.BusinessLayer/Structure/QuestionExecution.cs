using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Question;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure
{
    public class QuestionExecution : QuestionActions, IQuestionAction
    {
        public Task<List<QuestionDto>> GetAllQuestionsActionAsync()
        {
            return GetAllQuestionsActionExecutionAsync();
        }

        public Task<QuestionDto?> GetQuestionByIdActionAsync(int id)
        {
            return GetQuestionByIdActionExecutionAsync(id);
        }

        public Task<List<QuestionDto>> GetQuestionsByQuizActionAsync(int quizId)
        {
            return GetQuestionsByQuizActionExecutionAsync(quizId);
        }

        public Task<ActionResponce> CreateQuestionActionAsync(QuestionDto data)
        {
            return CreateQuestionActionExecutionAsync(data);
        }

        public Task<ActionResponce> UpdateQuestionActionAsync(QuestionDto data)
        {
            return UpdateQuestionActionExecutionAsync(data);
        }

        public Task<ActionResponce> DeleteQuestionActionAsync(int id)
        {
            return DeleteQuestionActionExecutionAsync(id);
        }
    }
}
