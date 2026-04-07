using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.BusinessLayer.Structure;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Models.Question;
using e_ElectoralWeb.Domain.Models.Service;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class QuestionLogic : QuestionActions, IQuestionLogic
{
    public ServiceResponse CreateQuestion(QuestionCreateDto questionCreateDto)
    {
        var result = CreateQuestionAction(questionCreateDto);
        if (result != false)
            return new ServiceResponse {
                Success = false,
                Message = "Error creating Question"
            };
        return new ServiceResponse
        {
            Success= true;
            Message = "Question  created successfully"
        };
    }

    public ServiceResponse GetQuestion(int questionId)
    {
        throw new NotImplementedException();
    }

    public ServiceResponse GetQuestionList()
    {
        throw new NotImplementedException();
    }

}
