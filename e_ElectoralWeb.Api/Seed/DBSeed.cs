using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.Api.Seed
{
    public static class DBSeed
    {
        public static async Task SeedAsync(CancellationToken cancellationToken = default)
        {
            await using var quizDb = new QuizDbContext();
            await quizDb.Database.MigrateAsync(cancellationToken);

            await using var userDb = new UserContext();
            await userDb.Database.MigrateAsync(cancellationToken);

            await SeedAdminUserAsync(userDb, cancellationToken);
            await SeedQuizDataAsync(quizDb, cancellationToken);
        }

        private static async Task SeedAdminUserAsync(UserContext userDb, CancellationToken cancellationToken)
        {
            if (userDb.Users.Any(u => u.Email == "admin@electoral.md"))
                return;

            userDb.Users.Add(new UserData
            {
                FirstName = "Administrator",
                LastName = string.Empty,
                UserName = "admin",
                Email = "admin@electoral.md",
                Password = "admin123",
                Phone = string.Empty,
                Role = UserRole.Admin,
                RegisteredOn = DateTime.UtcNow
            });

            await userDb.SaveChangesAsync(cancellationToken);
        }

        private static async Task SeedQuizDataAsync(QuizDbContext quizDb, CancellationToken cancellationToken)
        {
            if (quizDb.Quizzes.Any())
                return;

            var quiz1 = new QuizData
            {
                Title = "Cunoștințe electorale — Test 1",
                Description = "Test pentru verificarea cunoștințelor electorale de bază din Republica Moldova.",
                Questions = new List<QuestionData>
                {
                    new QuestionData
                    {
                        Text = "Câte tururi de scrutin are alegerile prezidențiale în Republica Moldova?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "1 tur", IsCorrect = false },
                            new AnswerOptionData { Text = "2 tururi", IsCorrect = true },
                            new AnswerOptionData { Text = "3 tururi", IsCorrect = false },
                            new AnswerOptionData { Text = "4 tururi", IsCorrect = false }
                        }
                    },
                    new QuestionData
                    {
                        Text = "La ce vârstă cetățenii Republicii Moldova dobândesc dreptul de vot?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "16 ani", IsCorrect = false },
                            new AnswerOptionData { Text = "18 ani", IsCorrect = true },
                            new AnswerOptionData { Text = "20 ani", IsCorrect = false },
                            new AnswerOptionData { Text = "21 de ani", IsCorrect = false }
                        }
                    },
                    new QuestionData
                    {
                        Text = "Care este organul electoral central din Republica Moldova?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "Ministerul Justiției", IsCorrect = false },
                            new AnswerOptionData { Text = "Curtea Constituțională", IsCorrect = false },
                            new AnswerOptionData { Text = "Comisia Electorală Centrală", IsCorrect = true },
                            new AnswerOptionData { Text = "Parlamentul Republicii Moldova", IsCorrect = false }
                        }
                    },
                    new QuestionData
                    {
                        Text = "Câți deputați are Parlamentul Republicii Moldova?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "51", IsCorrect = false },
                            new AnswerOptionData { Text = "101", IsCorrect = true },
                            new AnswerOptionData { Text = "120", IsCorrect = false },
                            new AnswerOptionData { Text = "150", IsCorrect = false }
                        }
                    },
                    new QuestionData
                    {
                        Text = "Care este durata mandatului Președintelui Republicii Moldova?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "3 ani", IsCorrect = false },
                            new AnswerOptionData { Text = "4 ani", IsCorrect = true },
                            new AnswerOptionData { Text = "5 ani", IsCorrect = false },
                            new AnswerOptionData { Text = "6 ani", IsCorrect = false }
                        }
                    }
                }
            };

            var quiz2 = new QuizData
            {
                Title = "Legislație electorală — Test 2",
                Description = "Test avansat privind normele și procedurile legii electorale.",
                Questions = new List<QuestionData>
                {
                    new QuestionData
                    {
                        Text = "Ce document este obligatoriu pentru a vota la secția de votare?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "Buletinul de identitate", IsCorrect = true },
                            new AnswerOptionData { Text = "Pașaportul extern", IsCorrect = false },
                            new AnswerOptionData { Text = "Permisul de conducere", IsCorrect = false },
                            new AnswerOptionData { Text = "Carnetul de muncă", IsCorrect = false }
                        }
                    },
                    new QuestionData
                    {
                        Text = "Cât timp înainte de alegeri se închide campania electorală?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "12 ore", IsCorrect = false },
                            new AnswerOptionData { Text = "24 de ore", IsCorrect = true },
                            new AnswerOptionData { Text = "48 de ore", IsCorrect = false },
                            new AnswerOptionData { Text = "72 de ore", IsCorrect = false }
                        }
                    },
                    new QuestionData
                    {
                        Text = "Cine are dreptul de a fi ales în Parlamentul Republicii Moldova?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "Cetățenii care au împlinit 18 ani", IsCorrect = false },
                            new AnswerOptionData { Text = "Cetățenii care au împlinit 18 ani și domiciliază în Moldova", IsCorrect = true },
                            new AnswerOptionData { Text = "Cetățenii care au împlinit 21 de ani", IsCorrect = false },
                            new AnswerOptionData { Text = "Orice rezident permanent", IsCorrect = false }
                        }
                    },
                    new QuestionData
                    {
                        Text = "Ce înseamnă votul secret?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "Votul se exprimă fără ca nimeni să afle opțiunea alegătorului", IsCorrect = true },
                            new AnswerOptionData { Text = "Votul nu este înregistrat oficial", IsCorrect = false },
                            new AnswerOptionData { Text = "Buletinul nu este semnat", IsCorrect = false },
                            new AnswerOptionData { Text = "Votul se face electronic", IsCorrect = false }
                        }
                    },
                    new QuestionData
                    {
                        Text = "Care instituție validează rezultatele alegerilor prezidențiale?",
                        AnswerOptions = new List<AnswerOptionData>
                        {
                            new AnswerOptionData { Text = "Parlamentul", IsCorrect = false },
                            new AnswerOptionData { Text = "Guvernul", IsCorrect = false },
                            new AnswerOptionData { Text = "Curtea Constituțională", IsCorrect = true },
                            new AnswerOptionData { Text = "Comisia Electorală Centrală", IsCorrect = false }
                        }
                    }
                }
            };

            quizDb.Quizzes.Add(quiz1);
            quizDb.Quizzes.Add(quiz2);
            await quizDb.SaveChangesAsync(cancellationToken);
        }
    }
}
