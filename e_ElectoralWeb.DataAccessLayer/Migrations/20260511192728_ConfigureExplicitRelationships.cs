using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace e_ElectoralWeb.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureExplicitRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create Users table only if it doesn't already exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
                BEGIN
                    CREATE TABLE [Users] (
                        [Id] int NOT NULL IDENTITY,
                        [FirstName] nvarchar(30) NOT NULL,
                        [LastName] nvarchar(30) NOT NULL,
                        [UserName] nvarchar(30) NOT NULL,
                        [Email] nvarchar(30) NOT NULL,
                        [Password] nvarchar(48) NOT NULL,
                        [Phone] nvarchar(12) NOT NULL,
                        [Role] int NOT NULL,
                        [RegisteredOn] datetime2 NOT NULL,
                        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
                    )
                END
            ");

            // Add index on QuizResults.UserId only if it doesn't already exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_QuizResults_UserId' AND object_id = OBJECT_ID('QuizResults'))
                BEGIN
                    CREATE INDEX [IX_QuizResults_UserId] ON [QuizResults] ([UserId])
                END
            ");

            // Add unique index on Users.Email only if it doesn't already exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('Users'))
                BEGIN
                    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email])
                END
            ");

            // Add FK from QuizResults to Users only if it doesn't already exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QuizResults_Users_UserId')
                BEGIN
                    ALTER TABLE [QuizResults]
                    ADD CONSTRAINT [FK_QuizResults_Users_UserId]
                    FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
                    ON DELETE NO ACTION
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QuizResults_Users_UserId')
                BEGIN
                    ALTER TABLE [QuizResults] DROP CONSTRAINT [FK_QuizResults_Users_UserId]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
                BEGIN
                    DROP TABLE [Users]
                END
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_QuizResults_UserId' AND object_id = OBJECT_ID('QuizResults'))
                BEGIN
                    DROP INDEX [IX_QuizResults_UserId] ON [QuizResults]
                END
            ");
        }
    }
}
