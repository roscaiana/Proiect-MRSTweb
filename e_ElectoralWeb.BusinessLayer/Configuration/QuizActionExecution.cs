using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Models.Quiz;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class QuizActionExecution : QuizActions, IQuizAction
    {
        public QuizActionExecution(QuizDbContext context) : base(context)
        {
        }

        public List<QuizInfoDto> GetAllQuizzesAction()
        {
            return GetAllQuizzesActionExecution();
        }
    }
}
