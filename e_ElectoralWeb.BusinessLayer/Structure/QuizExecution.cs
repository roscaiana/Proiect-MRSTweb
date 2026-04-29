using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Quiz;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure
{
    public class QuizExecution : QuizActions, IQuizAction
    {
        public List<QuizDto> GetAllQuizzesAction()
        {
            return GetAllQuizzesActionExecution();
        }

        public QuizDto? GetQuizByIdAction(int id)
        {
            return GetQuizByIdActionExecution(id);
        }

        public ActionResponce CreateQuizAction(QuizDto data)
        {
            return CreateQuizActionExecution(data);
        }

        public ActionResponce UpdateQuizAction(QuizDto data)
        {
            return UpdateQuizActionExecution(data);
        }

        public ActionResponce DeleteQuizAction(int id)
        {
            return DeleteQuizActionExecution(id);
        }
    }
}
