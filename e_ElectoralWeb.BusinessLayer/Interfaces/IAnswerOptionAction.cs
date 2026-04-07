using e_ElectoralWeb.Domain.Models.AnswerOption;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IAnswerOptionAction
    {
        List<AnswerOptionInfoDto> GetAllAnswerOptionsAction();
    }
}
