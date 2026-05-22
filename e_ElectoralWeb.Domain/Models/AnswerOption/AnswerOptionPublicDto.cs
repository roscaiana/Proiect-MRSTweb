namespace e_ElectoralWeb.Domain.Models.AnswerOption;

public class AnswerOptionPublicDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int QuestionId { get; set; }
}
