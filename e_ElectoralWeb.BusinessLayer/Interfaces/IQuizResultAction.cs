using e_ElectoralWeb.Domain.Models.QuizResult;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface IQuizResultAction
{
    Task<ActionResponce> CheckAnswerActionAsync(QuizAnswerCheckRequestDto data);
    Task<ActionResponce> EvaluateQuizActionAsync(QuizEvaluationRequestDto data);
    Task<ActionResponce> SubmitQuizResultActionAsync(QuizResultSubmitDto data);
    Task<List<QuizResultDto>> GetQuizResultsByUserActionAsync(int userId);
    Task<QuizResultDto?> GetQuizResultByIdActionAsync(int id);
}
