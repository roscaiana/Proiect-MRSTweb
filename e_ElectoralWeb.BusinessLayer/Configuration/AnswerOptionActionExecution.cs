using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Models.AnswerOption;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class AnswerOptionActionExecution : AnswerOptionActions, IAnswerOptionAction
    {
        public AnswerOptionActionExecution(QuizDbContext context) : base(context)
        {
        }

        public List<AnswerOptionInfoDto> GetAllAnswerOptionsAction()
        {
            return GetAllAnswerOptionsActionExecution();
        }
    }
}
