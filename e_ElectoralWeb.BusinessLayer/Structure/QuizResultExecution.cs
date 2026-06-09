using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Models.QuizResult;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class QuizResultExecution : QuizResultActions, IQuizResultAction
{
    public QuizResultExecution(QuizDbContext context) : base(context)
    {
    }

    public Task<ActionResponce> CheckAnswerActionAsync(QuizAnswerCheckRequestDto data)
        => CheckAnswerActionExecutionAsync(data);

    public Task<ActionResponce> EvaluateQuizActionAsync(QuizEvaluationRequestDto data)
        => EvaluateQuizActionExecutionAsync(data);

    public Task<ActionResponce> SubmitQuizResultActionAsync(QuizResultSubmitDto data)
        => SubmitQuizResultActionExecutionAsync(data);

    public Task<List<QuizResultDto>> GetQuizResultsByUserActionAsync(int userId)
        => GetQuizResultsByUserActionExecutionAsync(userId);

    public Task<QuizResultDto?> GetQuizResultByIdActionAsync(int id)
        => GetQuizResultByIdActionExecutionAsync(id);
}
