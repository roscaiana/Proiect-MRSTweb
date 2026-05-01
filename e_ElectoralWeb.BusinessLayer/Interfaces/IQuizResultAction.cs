using e_ElectoralWeb.Domain.Models.QuizResult;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface IQuizResultAction
{
    ActionResponce SubmitQuizResultAction(QuizResultSubmitDto data);
    List<QuizResultDto> GetQuizResultsByUserAction(int userId);
    QuizResultDto? GetQuizResultByIdAction(int id);
}
