using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.Appointment;
using e_ElectoralWeb.Domain.Entities.ExamSettings;
using e_ElectoralWeb.Domain.Entities.LegislativeMaterial;
using e_ElectoralWeb.Domain.Entities.News;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.Domain.Entities.QuizResult;
using e_ElectoralWeb.Domain.Entities.QuizSession;
using e_ElectoralWeb.Domain.Entities.SupportQuestion;
using e_ElectoralWeb.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.DataAccessLayer.Context;

public class QuizDbContext : DbContext
{
    public DbSet<QuizData> Quizzes { get; set; }
    public DbSet<QuestionData> Questions { get; set; }
    public DbSet<AnswerOptionData> AnswerOptions { get; set; }
    public DbSet<QuizResultData> QuizResults { get; set; }
    public DbSet<QuizSessionData> QuizSessions { get; set; }
    public DbSet<UserData> Users { get; set; }
    public DbSet<AppointmentData> Appointments { get; set; }
    public DbSet<NewsData> News { get; set; }
    public DbSet<ExamSettingsData> ExamSettings { get; set; }
    public DbSet<SupportQuestionData> SupportQuestions { get; set; }
    public DbSet<LegislativeMaterialData> LegislativeMaterials { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(DbSession.ConnectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(QuizDbContext).Assembly);
    }
}
