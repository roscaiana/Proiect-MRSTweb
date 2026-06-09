namespace e_ElectoralWeb.Domain.Models.QuizSession;

public class QuizSessionStartRequestDto
{
    public int QuizId { get; set; }
    public string Mode { get; set; } = "training";
    public int QuestionCount { get; set; }
    public int DurationMinutes { get; set; }
}
