using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.Domain.Entities.QuizResult;
using e_ElectoralWeb.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.DataAccessLayer.Context;

public class QuizDbContext : DbContext
{
    public DbSet<QuizData> Quizzes { get; set; }
    public DbSet<QuestionData> Questions { get; set; }
    public DbSet<AnswerOptionData> AnswerOptions { get; set; }
    public DbSet<QuizResultData> QuizResults { get; set; }
    public DbSet<UserData> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(DbSession.ConnectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(QuizDbContext).Assembly);
    }
}
