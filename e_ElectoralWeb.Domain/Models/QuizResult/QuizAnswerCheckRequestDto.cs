namespace e_ElectoralWeb.Domain.Models.QuizResult;

public class QuizAnswerCheckRequestDto
{
    public Guid SessionId { get; set; }
    public int QuestionId { get; set; }
    public int AnswerOptionId { get; set; }
}
