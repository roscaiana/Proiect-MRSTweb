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
                CREATE TABLE IF NOT EXISTS "SeedHistory"
                (
                    "Id"             SERIAL PRIMARY KEY,
                    "SeedKey"        VARCHAR(100) NOT NULL UNIQUE,
                    "ExecutedAtUtc"  TIMESTAMP    NOT NULL
                );
                """, cancellationToken);

            var seedAlreadyRun = await context.Database
                .SqlQueryRaw<int>(
                    "SELECT COUNT(1) AS \"Value\" FROM \"SeedHistory\" WHERE \"SeedKey\" = {0}",
                    SeedKey)
                .SingleAsync(cancellationToken);

            if (seedAlreadyRun > 0)
                return;

            var isDatabaseEmpty = !await context.Quizzes.AnyAsync(cancellationToken);
            if (!isDatabaseEmpty)
                return;

            await context.Database.ExecuteSqlRawAsync(
                "INSERT INTO \"SeedHistory\" (\"SeedKey\", \"ExecutedAtUtc\") VALUES ({0}, NOW())",
                new object[] { SeedKey },
                cancellationToken);
        }
    }
}
