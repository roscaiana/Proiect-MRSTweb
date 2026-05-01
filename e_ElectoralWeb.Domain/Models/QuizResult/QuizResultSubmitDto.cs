namespace e_ElectoralWeb.Domain.Models.QuizResult;

public class QuizResultSubmitDto
{
    public int QuizId { get; set; }
    public int UserId { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int Unanswered { get; set; }
    public int Score { get; set; }
    public int TimeTaken { get; set; }
    public string Mode { get; set; } = string.Empty;
    public DateTime CompletedAt { get; set; }
}
