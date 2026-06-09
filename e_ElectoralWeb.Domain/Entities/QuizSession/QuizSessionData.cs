using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.Domain.Entities.User;
using System.ComponentModel.DataAnnotations;

namespace e_ElectoralWeb.Domain.Entities.QuizSession;

public class QuizSessionData
{
    [Key]
    public Guid Id { get; set; }

    public int QuizId { get; set; }
    public QuizData Quiz { get; set; } = null!;

    public int? UserId { get; set; }
    public UserData? User { get; set; }

    [Required]
    [StringLength(20)]
    public string Mode { get; set; } = string.Empty;

    public int QuestionCount { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool IsCompleted { get; set; }

    [Required]
    public string QuestionIdsJson { get; set; } = "[]";
}
