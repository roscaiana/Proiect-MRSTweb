using e_ElectoralWeb.Domain.Entities.Question;

namespace e_ElectoralWeb.Domain.Entities.Quiz;

public class QuizEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public List<QuestionEntity> Questions { get; set; } = new();
}
