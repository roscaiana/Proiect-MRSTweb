using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using e_ElectoralWeb.Domain.Entities.Quiz;

namespace e_ElectoralWeb.Domain.Entities.QuizResult;

public class QuizResultData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int QuizId { get; set; }
    public QuizData Quiz { get; set; } = null!;

    public int UserId { get; set; }

    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int Unanswered { get; set; }
    public int Score { get; set; }
    public int TimeTaken { get; set; }

    [Required]
    [StringLength(20)]
    public string Mode { get; set; } = string.Empty;

    public DateTime CompletedAt { get; set; }
}
