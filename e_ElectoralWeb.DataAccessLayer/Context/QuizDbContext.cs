using Microsoft.EntityFrameworkCore;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.DataAccessLayer;

namespace e_ElectoralWeb.DataAccessLayer.Context;

public class QuizDbContext : DbContext
{
    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(DbSession.ConnectionString);
    }

    public DbSet<QuizEntity> Quizzes { get; set; }
    public DbSet<QuestionEntity> Questions { get; set; }
    public DbSet<AnswerOptionEntity> AnswerOptions { get; set; }
}
