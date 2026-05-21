namespace e_ElectoralWeb.Domain.Models.QuizResult;

public class QuizEvaluationAnswerDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int? UserAnswerId { get; set; }
    public string? UserAnswerText { get; set; }
    public string? CorrectAnswerText { get; set; }
    public bool IsCorrect { get; set; }
}
