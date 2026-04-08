using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.AnswerOption;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class AnswerOptionActionExecution : AnswerOptionActions, IAnswerOptionAction
    {
        public AnswerOptionActionExecution() { }

        public List<AnswerOptionInfoDto> GetAllAnswerOptionsAction()
        {
            return GetAllAnswerOptionsActionExecution();
        }

        public AnswerOptionInfoDto? GetAnswerOptionByIdAction(int id)
        {
            return GetAnswerOptionByIdActionExecution(id);
        }

        public AnswerOptionInfoDto? CreateAnswerOptionAction(AnswerOptionCreateDto dto)
        {
            return CreateAnswerOptionActionExecution(dto);
        }

        public AnswerOptionInfoDto? UpdateAnswerOptionAction(int id, AnswerOptionUpdateDto dto)
        {
            return UpdateAnswerOptionActionExecution(id, dto);
        }

        public bool DeleteAnswerOptionAction(int id)
        {
            return DeleteAnswerOptionActionExecution(id);
        }
    }
}
