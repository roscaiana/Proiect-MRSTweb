using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Models.Question;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class QuestionActionExecution : QuestionActions, IQuestionAction
    {
        public QuestionActionExecution(QuizDbContext context) : base(context)
        {
        }

        public List<QuestionInfoDto> GetAllQuestionsAction()
        {
            return GetAllQuestionsActionExecution();
        }
    }
}
