using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.QuizSession;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class QuizSessionExecution : QuizSessionActions, IQuizSessionAction
{
    public Task<ActionResponce> StartSessionActionAsync(QuizSessionStartRequestDto data, int? userId)
        => StartSessionActionExecutionAsync(data, userId);
}
