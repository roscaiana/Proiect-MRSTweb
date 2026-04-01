using e_ElectoralWeb.Domain.Models.Question;
using e_ElectoralWeb.Domain.Models.Service;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface IQuestionLogic
{
    ServiceResponse CreateQuestion(QuestionCreateDto questionCreateDto);
    ServiceResponse GetQuestion(int questionId);
    ServiceResponse GetQuestionList();
    
}
