namespace e_ElectoralWeb.Domain.Models.AnswerOption;

public class AnswerOptionUpdateDto
{
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int QuestionId { get; set; }
}
