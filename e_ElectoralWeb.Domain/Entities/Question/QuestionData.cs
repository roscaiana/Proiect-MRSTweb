using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.Quiz;

namespace e_ElectoralWeb.Domain.Entities.Question;

public class QuestionData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(400)]
    public string Text { get; set; } = string.Empty;

    public int QuizId { get; set; }
    public QuizData Quiz { get; set; } = null!;

    public List<AnswerOptionData> AnswerOptions { get; set; } = new();
}
