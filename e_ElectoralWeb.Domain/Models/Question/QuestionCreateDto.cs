namespace e_ElectoralWeb.Domain.Models.Question;

public class QuestionCreateDto
{
    public string Text { get; set; } = string.Empty;
    public int QuizId { get; set; }
}
