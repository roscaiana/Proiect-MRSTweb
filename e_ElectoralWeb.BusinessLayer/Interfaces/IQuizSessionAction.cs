using e_ElectoralWeb.Domain.Models.QuizSession;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface IQuizSessionAction
{
    Task<ActionResponce> StartSessionActionAsync(QuizSessionStartRequestDto data, int? userId);
}
