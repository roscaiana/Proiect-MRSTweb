using e_ElectoralWeb.Domain.Models.Quiz;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IQuizAction
    {
        List<QuizInfoDto> GetAllQuizzesAction();
        QuizInfoDto? GetQuizByIdAction(int id);
        QuizInfoDto CreateQuizAction(QuizCreateDto dto);
        QuizInfoDto? UpdateQuizAction(int id, QuizUpdateDto dto);
        bool DeleteQuizAction(int id);
    }
}