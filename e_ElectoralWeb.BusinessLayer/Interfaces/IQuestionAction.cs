using e_ElectoralWeb.Domain.Models.Question;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IQuestionAction
    {
        List<QuestionDto> GetAllQuestionsAction();
        QuestionDto? GetQuestionByIdAction(int id);
        List<QuestionDto> GetQuestionsByQuizAction(int quizId);
        ActionResponce CreateQuestionAction(QuestionDto data);
        ActionResponce UpdateQuestionAction(QuestionDto data);
        ActionResponce DeleteQuestionAction(int id);
    }
}
