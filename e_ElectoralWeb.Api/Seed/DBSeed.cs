using System.Text.Json;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.News;
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
        await SeedNewsAsync(quizDb, cancellationToken);
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

    private static async Task SeedNewsAsync(QuizDbContext quizDb, CancellationToken cancellationToken)
    {
        var hasNews = await quizDb.News.AnyAsync(cancellationToken);
        if (hasNews) return;

        var articles = new List<NewsData>
        {
            new() {
                Title = "Graficul examenelor de certificare pentru sesiunea 2026",
                Description = "CICDE a publicat programul examenelor pentru sesiunea 2026. Examenele se desfasoara in format fizic si virtual, iar inscrierea se face din contul de utilizator aprobat.",
                Category = "Sesiunea 2026",
                Image = "/news/cicde-grafic-2026.png",
                SourceUrl = "https://certificare.cicde.md/news/show/44",
                PublishedAt = new DateTime(2026, 3, 4, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2026, 3, 4, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 3, 4, 0, 0, 0, DateTimeKind.Utc),
            },
            new() {
                Title = "Rezultatele sesiunii de certificare 2025",
                Description = "In sesiunea 2025 au fost organizate 565 examene, cu 9570 participanti. Au promovat 7764 candidati, iar rata de promovare pe sesiune a fost de 82,3%.",
                Category = "Rezultate",
                Image = "/news/cicde-rezultate-2025.png",
                SourceUrl = "https://certificare.cicde.md/news/show/43",
                PublishedAt = new DateTime(2025, 10, 9, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2025, 10, 9, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 10, 9, 0, 0, 0, DateTimeKind.Utc),
            },
            new() {
                Title = "Aprobarea noului regulament pentru certificare",
                Description = "Comisia Electorala Centrala a aprobat noua redactie a Regulamentului privind certificarea formarii/specializarii in domeniul electoral, cu aplicare in SICDE.",
                Category = "Cadrul normativ",
                Image = "/news/cicde-regulament-2025.png",
                SourceUrl = "https://certificare.cicde.md/news/show/14",
                PublishedAt = new DateTime(2025, 3, 18, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2025, 3, 18, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2025, 3, 18, 0, 0, 0, DateTimeKind.Utc),
            },
            new() {
                Title = "18-24 mai 2026: totalurile saptamanii",
                Description = "Au fost desfasurate 5 examene cu prezenta fizica in raioane. Din 72 participanti, 61 au promovat, cu rata de promovare de 84,72%.",
                Category = "Totaluri saptamanale",
                Image = "/news/cicde-18-24-mai-2026.jpg",
                SourceUrl = "https://certificare.cicde.md/news/show/50",
                PublishedAt = new DateTime(2026, 5, 25, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2026, 5, 25, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 5, 25, 0, 0, 0, DateTimeKind.Utc),
            },
            new() {
                Title = "04-17 mai 2026: totaluri saptamanale",
                Description = "CICDE a organizat 4 examene de certificare (online si fizic). Au participat 47 persoane, iar 41 au obtinut certificatul de calificare.",
                Category = "Totaluri saptamanale",
                Image = "/news/cicde-04-17-mai-2026.jpg",
                SourceUrl = "https://certificare.cicde.md/news/show/49",
                PublishedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc),
            },
            new() {
                Title = "20 aprilie - 3 mai 2026: totaluri saptamanale",
                Description = "In perioada de referinta au avut loc 3 examene online. Au participat 55 persoane, dintre care 44 au promovat, cu o rata de 80%.",
                Category = "Totaluri saptamanale",
                Image = "/news/cicde-20apr-3mai-2026.jpg",
                SourceUrl = "https://certificare.cicde.md/news/show/48",
                PublishedAt = new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
            },
        };

        quizDb.News.AddRange(articles);
        await quizDb.SaveChangesAsync(cancellationToken);
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
