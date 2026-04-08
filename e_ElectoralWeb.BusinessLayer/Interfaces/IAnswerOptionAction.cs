using e_ElectoralWeb.Domain.Models.AnswerOption;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IAnswerOptionAction
    {
        List<AnswerOptionInfoDto> GetAllAnswerOptionsAction();
        AnswerOptionInfoDto? GetAnswerOptionByIdAction(int id);
        AnswerOptionInfoDto? CreateAnswerOptionAction(AnswerOptionCreateDto dto);
        AnswerOptionInfoDto? UpdateAnswerOptionAction(int id, AnswerOptionUpdateDto dto);
        bool DeleteAnswerOptionAction(int id);
    }
}
