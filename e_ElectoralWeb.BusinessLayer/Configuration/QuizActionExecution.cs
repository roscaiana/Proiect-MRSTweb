using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Quiz;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class QuizActionExecution : QuizActions, IQuizAction
    {
        public QuizActionExecution() { }

        public List<QuizInfoDto> GetAllQuizzesAction()
        {
            return GetAllQuizzesActionExecution();
        }

        public QuizInfoDto? GetQuizByIdAction(int id)
        {
            return GetQuizByIdActionExecution(id);
        }

        public QuizInfoDto CreateQuizAction(QuizCreateDto dto)
        {
            return CreateQuizActionExecution(dto);
        }

        public QuizInfoDto? UpdateQuizAction(int id, QuizUpdateDto dto)
        {
            return UpdateQuizActionExecution(id, dto);
        }

        public bool DeleteQuizAction(int id)
        {
            return DeleteQuizActionExecution(id);
        }
    }
}
