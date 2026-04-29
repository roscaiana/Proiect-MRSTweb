using e_ElectoralWeb.DataAccessLayer;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Entities.Quiz;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.DataAccessLayer.Context;

public class QuizContext : DbContext
{
    public DbSet<QuizData> Quizzes { get; set; }
    public DbSet<QuestionData> Questions { get; set; }
    public DbSet<AnswerOptionData> AnswerOptions { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(DbSession.ConnectionString);
    }
}
