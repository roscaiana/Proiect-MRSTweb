namespace e_ElectoralWeb.Domain.Models.Quiz;

public class QuizInfoDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}
