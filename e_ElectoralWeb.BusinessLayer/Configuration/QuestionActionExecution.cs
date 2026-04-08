using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Question;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class QuestionActionExecution : QuestionActions, IQuestionAction
    {
        public QuestionActionExecution() { }

        public List<QuestionInfoDto> GetAllQuestionsAction()
        {
            return GetAllQuestionsActionExecution();
        }

        public QuestionInfoDto? GetQuestionByIdAction(int id)
        {
            return GetQuestionByIdActionExecution(id);
        }

        public QuestionInfoDto? CreateQuestionAction(QuestionCreateDto dto)
        {
            return CreateQuestionActionExecution(dto);
        }

        public QuestionInfoDto? UpdateQuestionAction(int id, QuestionUpdateDto dto)
        {
            return UpdateQuestionActionExecution(id, dto);
        }

        public bool DeleteQuestionAction(int id)
        {
            return DeleteQuestionActionExecution(id);
        }
    }
}
