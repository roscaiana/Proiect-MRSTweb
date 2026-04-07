using e_ElectoralWeb.Domain.Models.Question;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IQuestionAction
    {
        List<QuestionInfoDto> GetAllQuestionsAction();
        QuestionInfoDto? GetQuestionByIdAction(int id);
        QuestionInfoDto? CreateQuestionAction(QuestionCreateDto dto);
        QuestionInfoDto? UpdateQuestionAction(int id, QuestionUpdateDto dto);
        bool DeleteQuestionAction(int id);
    }
}
