namespace e_ElectoralWeb.Domain.Models.QuizResult;

public class QuizEvaluationResultDto
{
    public int QuizId { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int Unanswered { get; set; }
    public int Score { get; set; }
    public int TimeTaken { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime CompletedAt { get; set; }
    public List<QuizEvaluationAnswerDto> Answers { get; set; } = new();
}
