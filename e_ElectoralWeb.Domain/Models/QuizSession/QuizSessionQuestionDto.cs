namespace e_ElectoralWeb.Domain.Models.QuizSession;

public class QuizSessionQuestionDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public List<QuizSessionAnswerOptionDto> Options { get; set; } = new();
}
