using e_ElectoralWeb.Domain.Models.AnswerOption;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IAnswerOptionAction
    {
        List<AnswerOptionDto> GetAllAnswerOptionsAction();
        AnswerOptionDto? GetAnswerOptionByIdAction(int id);
        List<AnswerOptionDto> GetAnswerOptionsByQuestionAction(int questionId);
        ActionResponce CreateAnswerOptionAction(AnswerOptionDto data);
        ActionResponce UpdateAnswerOptionAction(AnswerOptionDto data);
        ActionResponce DeleteAnswerOptionAction(int id);
    }
}
