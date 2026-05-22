namespace e_ElectoralWeb.Domain.Models.QuizResult;

public class QuizEvaluationRequestDto
{
    public int QuizId { get; set; }
    public string Mode { get; set; } = string.Empty;
    public int TimeTaken { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime CompletedAt { get; set; }
    public List<int> QuestionIds { get; set; } = new();
    public List<QuizEvaluationSubmissionDto> Answers { get; set; } = new();
}
