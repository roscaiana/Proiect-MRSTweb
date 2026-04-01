using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.Quiz;

namespace e_ElectoralWeb.Domain.Entities.Question;

public class QuestionEntity
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int QuizId { get; set; }
    public QuizEntity Quiz { get; set; } = null!;

    public List<AnswerOptionEntity> AnswerOptions { get; set; } = new();
}
