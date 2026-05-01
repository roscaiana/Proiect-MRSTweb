using e_ElectoralWeb.BusinessLayer.Configuration;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.BusinessLayer.Structure;

namespace e_ElectoralWeb.BusinessLayer
{
    public class BusinessLogic
    {
        public BusinessLogic() { }

        public IQuizAction QuizAction()
        {
            return new QuizExecution();
        }

        public IQuestionAction QuestionAction()
        {
            return new QuestionExecution();
        }

        public IAnswerOptionAction AnswerOptionAction()
        {
            return new AnswerOptionExecution();
        }

        public IUserRegAction UserRegAction()
        {
            return new UserRegActionExecution();
        }

        public IUserLoginAction UserLoginAction()
        {
            return new UserAuthAction();
        }

        public IQuizResultAction QuizResultAction()
        {
            return new QuizResultExecution();
        }
    }
}
