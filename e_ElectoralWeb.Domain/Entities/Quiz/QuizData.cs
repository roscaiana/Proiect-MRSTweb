using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using e_ElectoralWeb.Domain.Entities.Question;

namespace e_ElectoralWeb.Domain.Entities.Quiz;

public class QuizData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(400)]
    public string? Description { get; set; }

    public List<QuestionData> Questions { get; set; } = new();
}
