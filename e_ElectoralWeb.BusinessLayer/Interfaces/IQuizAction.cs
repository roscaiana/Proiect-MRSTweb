using e_ElectoralWeb.Domain.Models.Quiz;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IQuizAction
    {
        List<QuizDto> GetAllQuizzesAction();
        QuizDto? GetQuizByIdAction(int id);
        ActionResponce CreateQuizAction(QuizDto data);
        ActionResponce UpdateQuizAction(QuizDto data);
        ActionResponce DeleteQuizAction(int id);
    }
}
