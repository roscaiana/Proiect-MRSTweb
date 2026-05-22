namespace e_ElectoralWeb.Domain.Models.QuizResult;

public class QuizAnswerCheckResultDto
{
    public int QuestionId { get; set; }
    public int AnswerOptionId { get; set; }
    public bool IsCorrect { get; set; }
    public string CorrectAnswerText { get; set; } = string.Empty;
}
