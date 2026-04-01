using Microsoft.EntityFrameworkCore;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Entities.Quiz;

namespace e_ElectoralWeb.DataAccessLayer.Context;

public class QuizDbContext : DbContext
{
    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(
            "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=e_ElectoralWebDb;Integrated Security=True;Encrypt=True;TrustServerCertificate=True"
        );
    }

    public DbSet<QuizEntity> Quizzes { get; set; }
    public DbSet<QuestionEntity> Questions { get; set; }
    public DbSet<AnswerOptionEntity> AnswerOptions { get; set; }
}
