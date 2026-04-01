using e_ElectoralWeb.DataAccessLayer.Context;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.Api.Seed
{
    public static class DBSeed
    {
        private const string SeedKey = "initial-seed-v1";

        public static async Task SeedAsync(CancellationToken cancellationToken = default)
        {
            await using var context = new QuizDbContext();

            await context.Database.MigrateAsync(cancellationToken);

            await context.Database.ExecuteSqlRawAsync("""
                                                      IF OBJECT_ID(N'dbo.SeedHistory', N'U') IS NULL
                                                      BEGIN
                                                          CREATE TABLE dbo.SeedHistory
                                                          (
                                                              Id INT IDENTITY(1,1) PRIMARY KEY,
                                                              SeedKey NVARCHAR(100) NOT NULL UNIQUE,
                                                              ExecutedAtUtc DATETIME2 NOT NULL
                                                          );
                                                      END;
                                                      """, cancellationToken);

            var seedAlreadyRun = await context.Database
                .SqlQueryRaw<int>(
                    "SELECT COUNT(1) AS [Value] FROM dbo.SeedHistory WHERE SeedKey = {0}",
                    SeedKey)
                .SingleAsync(cancellationToken);

            if (seedAlreadyRun > 0)
                return;

            var isDatabaseEmpty = !await context.Quizzes.AnyAsync(cancellationToken);
            if (!isDatabaseEmpty)
                return;

            await context.Database.ExecuteSqlRawAsync(
                "INSERT INTO dbo.SeedHistory (SeedKey, ExecutedAtUtc) VALUES ({0}, SYSUTCDATETIME())",
                new object[] { SeedKey },
                cancellationToken);
        }
    }
}
