using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Question;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure
{
    public class QuestionExecution : QuestionActions, IQuestionAction
    {
        public List<QuestionDto> GetAllQuestionsAction()
        {
            return GetAllQuestionsActionExecution();
        }

        public QuestionDto? GetQuestionByIdAction(int id)
        {
            return GetQuestionByIdActionExecution(id);
        }

        public List<QuestionDto> GetQuestionsByQuizAction(int quizId)
        {
            return GetQuestionsByQuizActionExecution(quizId);
        }

        public ActionResponce CreateQuestionAction(QuestionDto data)
        {
            return CreateQuestionActionExecution(data);
        }

        public ActionResponce UpdateQuestionAction(QuestionDto data)
        {
            return UpdateQuestionActionExecution(data);
        }

        public ActionResponce DeleteQuestionAction(int id)
        {
            return DeleteQuestionActionExecution(id);
        }
    }
}
