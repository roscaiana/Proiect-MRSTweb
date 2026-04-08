using e_ElectoralWeb.BusinessLayer.Configuration;
using e_ElectoralWeb.BusinessLayer.Interfaces;

namespace e_ElectoralWeb.BusinessLayer
{
    public class BusinessLogic
    {
        public IQuizAction QuizAction()
        {
            return new QuizActionExecution();
        }

        public IQuestionAction QuestionAction()
        {
            return new QuestionActionExecution();
        }

        public IAnswerOptionAction AnswerOptionAction()
        {
            return new AnswerOptionActionExecution();
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
