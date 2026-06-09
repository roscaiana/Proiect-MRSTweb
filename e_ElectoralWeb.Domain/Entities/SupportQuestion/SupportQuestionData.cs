using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace e_ElectoralWeb.Domain.Entities.SupportQuestion;

public class SupportQuestionData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(80)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Question { get; set; } = string.Empty;

    [Required]
    [StringLength(3000)]
    public string Answer { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
