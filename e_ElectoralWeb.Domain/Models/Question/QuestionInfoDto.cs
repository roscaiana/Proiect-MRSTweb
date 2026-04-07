namespace e_ElectoralWeb.Domain.Models.Question;

public class QuestionInfoDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int QuizId { get; set; }
}
