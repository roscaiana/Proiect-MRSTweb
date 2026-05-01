using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.QuizResult;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class QuizResultExecution : QuizResultActions, IQuizResultAction
{
    public ActionResponce SubmitQuizResultAction(QuizResultSubmitDto data)
        => SubmitQuizResultActionExecution(data);

    public List<QuizResultDto> GetQuizResultsByUserAction(int userId)
        => GetQuizResultsByUserActionExecution(userId);

    public QuizResultDto? GetQuizResultByIdAction(int id)
        => GetQuizResultByIdActionExecution(id);
}
