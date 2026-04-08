using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using e_ElectoralWeb.Domain.Entities.Question;

namespace e_ElectoralWeb.Domain.Entities.AnswerOption;

public class AnswerOptionData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(400)]
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }

    public int QuestionId { get; set; }
    public QuestionData Question { get; set; } = null!;
}
