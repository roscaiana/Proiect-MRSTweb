using e_ElectoralWeb.BusinessLayer.Configuration;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;

namespace e_ElectoralWeb.BusinessLayer
{
    public class BusinessLogic
    {
        private readonly QuizDbContext _context;

        public BusinessLogic(QuizDbContext context)
        {
            _context = context;
        }

        public IQuizAction QuizAction()
        {
            return new QuizActionExecution(_context);
        }

        public IQuestionAction QuestionAction()
        {
            return new QuestionActionExecution(_context);
        }

        public IAnswerOptionAction AnswerOptionAction()
        {
            return new AnswerOptionActionExecution(_context);
        }
        public IUserRegAction UserRegAction()
        {
            return new UserRegActionExecution();
        }
        
        public IUserLoginAction UserLoginAction()
        {
            return new UserAuthAction();
        }
     
    }
}
