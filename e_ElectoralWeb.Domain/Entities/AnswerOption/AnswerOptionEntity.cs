using e_ElectoralWeb.Domain.Entities.Question;

namespace e_ElectoralWeb.Domain.Entities.AnswerOption;

public class AnswerOptionEntity
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }

    public int QuestionId { get; set; }
    public QuestionEntity Question { get; set; } = null!;
}
