using System.Text.Json;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.Domain.Entities.User;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.Api.Seed;

public static class DBSeed
{
    private const string AdminEmail = "admin@electoral.md";
    private const string AdminPassword = "admin123";
    private const string Certification2026Title =
        "Banca de întrebări pentru examenul de certificare general (Sesiunea de certificare 2026)";

    private static readonly string[] LegacyQuizTitles =
    [
        "Cunoștințe electorale — Test 1",
        "Legislație electorală — Test 2",
    ];

    public static async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await using var quizDb = new QuizDbContext();
        await MigrateIfNeededAsync(quizDb, cancellationToken);
        await SeedAdminUserAsync(quizDb, cancellationToken);
        await SeedQuizDataAsync(quizDb, cancellationToken);
    }

    private static async Task MigrateIfNeededAsync(DbContext dbContext, CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.Database.MigrateAsync(cancellationToken);
        }
        catch (SqlException ex) when (ex.Number == 2714)
        {
            // The local database already has the tables, but migration history is not synchronized.
        }
    }

    private static async Task SeedAdminUserAsync(QuizDbContext quizDb, CancellationToken cancellationToken)
    {
        var existingAdmin = await quizDb.Users.FirstOrDefaultAsync(u => u.Email == AdminEmail, cancellationToken);
        if (existingAdmin != null)
        {
            try
            {
                var isValidHash = BCrypt.Net.BCrypt.Verify(AdminPassword, existingAdmin.Password);
                if (!isValidHash && existingAdmin.Password == AdminPassword)
                {
                    existingAdmin.Password = BCrypt.Net.BCrypt.HashPassword(AdminPassword);
                    quizDb.Users.Update(existingAdmin);
                    await quizDb.SaveChangesAsync(cancellationToken);
                }
            }
            catch
            {
                if (existingAdmin.Password == AdminPassword)
                {
                    existingAdmin.Password = BCrypt.Net.BCrypt.HashPassword(AdminPassword);
                    quizDb.Users.Update(existingAdmin);
                    await quizDb.SaveChangesAsync(cancellationToken);
                }
            }

            if (existingAdmin.IsBlocked)
            {
                existingAdmin.IsBlocked = false;
                quizDb.Users.Update(existingAdmin);
                await quizDb.SaveChangesAsync(cancellationToken);
            }

            return;
        }

        quizDb.Users.Add(new UserData
        {
            FirstName = "Administrator",
            LastName = string.Empty,
            UserName = "admin",
            Email = AdminEmail,
            Password = BCrypt.Net.BCrypt.HashPassword(AdminPassword),
            Phone = string.Empty,
            Role = UserRole.Admin,
            IsBlocked = false,
            RegisteredOn = DateTime.UtcNow
        });

        await quizDb.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedQuizDataAsync(QuizDbContext quizDb, CancellationToken cancellationToken)
    {
        await RemoveLegacyQuizzesAsync(quizDb, cancellationToken);

        var importedQuiz = await BuildCertification2026QuizAsync(cancellationToken);
        if (importedQuiz != null)
        {
            await SeedQuizIfMissingAsync(quizDb, importedQuiz, cancellationToken);
        }
    }

    private static async Task RemoveLegacyQuizzesAsync(QuizDbContext quizDb, CancellationToken cancellationToken)
    {
        var legacyQuizzes = await quizDb.Quizzes
            .Where(q => LegacyQuizTitles.Contains(q.Title))
            .ToListAsync(cancellationToken);

        if (legacyQuizzes.Count == 0)
        {
            return;
        }

        quizDb.Quizzes.RemoveRange(legacyQuizzes);
        await quizDb.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedQuizIfMissingAsync(
        QuizDbContext quizDb,
        QuizData quiz,
        CancellationToken cancellationToken)
    {
        var exists = await quizDb.Quizzes.AnyAsync(q => q.Title == quiz.Title, cancellationToken);
        if (exists)
        {
            return;
        }

        quizDb.Quizzes.Add(quiz);
        await quizDb.SaveChangesAsync(cancellationToken);
    }

    private static async Task<QuizData?> BuildCertification2026QuizAsync(CancellationToken cancellationToken)
    {
        var dataFilePath = Path.Combine(AppContext.BaseDirectory, "Seed", "Data", "certification-session-2026.json");
        if (!File.Exists(dataFilePath))
        {
            return null;
        }

        await using var stream = File.OpenRead(dataFilePath);
        var payload = await JsonSerializer.DeserializeAsync<CertificationQuizSeed>(
            stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
            cancellationToken);

        if (payload?.Questions == null || payload.Questions.Count == 0)
        {
            return null;
        }

        return new QuizData
        {
            Title = Certification2026Title,
            Description = payload.Description,
            Questions = payload.Questions
                .OrderBy(question => question.Number)
                .Select(question => new QuestionData
                {
                    Text = question.Text.Trim(),
                    AnswerOptions = question.Options
                        .Select(option => new AnswerOptionData
                        {
                            Text = option.Text.Trim(),
                            IsCorrect = option.IsCorrect
                        })
                        .ToList()
                })
                .ToList()
        };
    }

    private sealed class CertificationQuizSeed
    {
        public string Description { get; set; } = string.Empty;
        public List<CertificationQuestionSeed> Questions { get; set; } = [];
    }

    private sealed class CertificationQuestionSeed
    {
        public int Number { get; set; }
        public string Text { get; set; } = string.Empty;
        public List<CertificationAnswerOptionSeed> Options { get; set; } = [];
    }

    private sealed class CertificationAnswerOptionSeed
    {
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
