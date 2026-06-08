namespace e_ElectoralWeb.Domain.Models.QuizSession;

public class QuizSessionStartResultDto
{
    public Guid SessionId { get; set; }
    public int QuizId { get; set; }
    public string Mode { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public List<QuizSessionQuestionDto> Questions { get; set; } = new();
}
