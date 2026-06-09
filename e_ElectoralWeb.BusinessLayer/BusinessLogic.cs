using e_ElectoralWeb.BusinessLayer.Configuration;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.BusinessLayer.Structure;
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
            return new QuizExecution(_context);
        }

        public IQuestionAction QuestionAction()
        {
            return new QuestionExecution(_context);
        }

        public IAnswerOptionAction AnswerOptionAction()
        {
            return new AnswerOptionExecution(_context);
        }

        public IUserRegAction UserRegAction()
        {
            return new UserRegActionExecution(_context);
        }

        public IUserLoginAction UserLoginAction()
        {
            return new UserAuthAction(_context);
        }

        public IContactAction ContactAction()
        {
            return new ContactExecution();
        }

        public IQuizResultAction QuizResultAction()
        {
            return new QuizResultExecution(_context);
        }

        public IQuizSessionAction QuizSessionAction()
        {
            return new QuizSessionExecution(_context);
        }

        public IAppointmentAction AppointmentAction()
        {
            return new AppointmentActionExecution(_context);
        }

        public INewsAction NewsAction()
        {
            return new NewsExecution(_context);
        }

        public IExamSettingsAction ExamSettingsAction()
        {
            return new ExamSettingsExecution(_context);
        }
    }
}
