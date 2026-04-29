using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.AnswerOption;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure
{
    public class AnswerOptionExecution : AnswerOptionActions, IAnswerOptionAction
    {
        public List<AnswerOptionDto> GetAllAnswerOptionsAction()
        {
            return GetAllAnswerOptionsActionExecution();
        }

        public AnswerOptionDto? GetAnswerOptionByIdAction(int id)
        {
            return GetAnswerOptionByIdActionExecution(id);
        }

        public List<AnswerOptionDto> GetAnswerOptionsByQuestionAction(int questionId)
        {
            return GetAnswerOptionsByQuestionActionExecution(questionId);
        }

        public ActionResponce CreateAnswerOptionAction(AnswerOptionDto data)
        {
            return CreateAnswerOptionActionExecution(data);
        }

        public ActionResponce UpdateAnswerOptionAction(AnswerOptionDto data)
        {
            return UpdateAnswerOptionActionExecution(data);
        }

        public ActionResponce DeleteAnswerOptionAction(int id)
        {
            return DeleteAnswerOptionActionExecution(id);
        }
    }
}
