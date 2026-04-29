using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.Api.Seed
{
    public static class DBSeed
    {
        private const string SeedKey = "initial-seed-v1";
        private const string AdminEmail = "admin@electoral.md";
        private const string AdminPassword = "admin123";

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

            await EnsureUsersTableAndAdminAsync(cancellationToken);

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

        private static async Task EnsureUsersTableAndAdminAsync(CancellationToken cancellationToken)
        {
            await using var userContext = new UserContext();

            await userContext.Database.ExecuteSqlRawAsync("""
                                                          IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
                                                          BEGIN
                                                              CREATE TABLE dbo.Users
                                                              (
                                                                  Id INT IDENTITY(1,1) PRIMARY KEY,
                                                                  FirstName NVARCHAR(30) NOT NULL DEFAULT N'',
                                                                  LastName NVARCHAR(30) NOT NULL DEFAULT N'',
                                                                  UserName NVARCHAR(30) NOT NULL,
                                                                  Email NVARCHAR(30) NOT NULL,
                                                                  [Password] NVARCHAR(48) NOT NULL,
                                                                  Phone NVARCHAR(12) NOT NULL DEFAULT N'',
                                                                  Role INT NOT NULL,
                                                                  RegisteredOn DATETIME2 NOT NULL
                                                              );
                                                          END;
                                                          """, cancellationToken);

            var adminUser = await userContext.Users
                .FirstOrDefaultAsync(u => u.Email == AdminEmail, cancellationToken);

            if (adminUser == null)
            {
                adminUser = new UserData
                {
                    FirstName = "Administrator",
                    LastName = string.Empty,
                    UserName = "admin",
                    Email = AdminEmail,
                    Password = AdminPassword,
                    Phone = string.Empty,
                    Role = UserRole.Admin,
                    RegisteredOn = DateTime.UtcNow
                };

                userContext.Users.Add(adminUser);
                await userContext.SaveChangesAsync(cancellationToken);
                return;
            }

            adminUser.FirstName = "Administrator";
            adminUser.UserName = "admin";
            adminUser.Password = AdminPassword;
            adminUser.Role = UserRole.Admin;

            await userContext.SaveChangesAsync(cancellationToken);
        }
    }
}
