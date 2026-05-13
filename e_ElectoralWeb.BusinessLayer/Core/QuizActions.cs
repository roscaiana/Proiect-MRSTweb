using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.Domain.Models.Quiz;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class QuizActions
    {
        protected QuizActions()
        {
        }

        protected async Task<List<QuizDto>> GetAllQuizzesActionExecutionAsync()
        {
            using var context = new QuizDbContext();
            return await context.Quizzes
                .Select(q => new QuizDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description
                })
                .ToListAsync();
        }

        protected async Task<QuizDto?> GetQuizByIdActionExecutionAsync(int id)
        {
            using var context = new QuizDbContext();
            return await context.Quizzes
                .Where(q => q.Id == id)
                .Select(q => new QuizDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description
                })
                .FirstOrDefaultAsync();
        }

        protected async Task<ActionResponce> CreateQuizActionExecutionAsync(QuizDto data)
        {
            if (string.IsNullOrWhiteSpace(data.Title))
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Quiz title is required."
                };
            }

            using (var context = new QuizDbContext())
            {
                var titleExists = await context.Quizzes.AnyAsync(q => q.Title == data.Title);
                if (titleExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz title already exists."
                    };
                }

                var entity = new QuizData
                {
                    Title = data.Title,
                    Description = data.Description
                };

                context.Quizzes.Add(entity);
                await context.SaveChangesAsync();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Quiz created."
            };
        }

        protected async Task<ActionResponce> UpdateQuizActionExecutionAsync(QuizDto data)
        {
            if (data.Id <= 0)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Quiz id is required."
                };
            }

            if (string.IsNullOrWhiteSpace(data.Title))
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Quiz title is required."
                };
            }

            using (var context = new QuizDbContext())
            {
                var entity = await context.Quizzes.FirstOrDefaultAsync(q => q.Id == data.Id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz not found."
                    };
                }

                var titleExists = await context.Quizzes.AnyAsync(q =>
                    q.Id != data.Id &&
                    q.Title == data.Title);
                if (titleExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz title already exists."
                    };
                }

                entity.Title = data.Title;
                entity.Description = data.Description;

                context.Quizzes.Update(entity);
                await context.SaveChangesAsync();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Quiz updated."
            };
        }

        protected async Task<ActionResponce> DeleteQuizActionExecutionAsync(int id)
        {
            using (var context = new QuizDbContext())
            {
                var entity = await context.Quizzes.FirstOrDefaultAsync(q => q.Id == id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz not found."
                    };
                }

                var questionIds = await context.Questions
                    .Where(q => q.QuizId == entity.Id)
                    .Select(q => q.Id)
                    .ToListAsync();

                if (questionIds.Count > 0)
                {
                    var options = await context.AnswerOptions.Where(a => questionIds.Contains(a.QuestionId)).ToListAsync();
                    if (options.Count > 0)
                    {
                        context.AnswerOptions.RemoveRange(options);
                    }

                    var questions = await context.Questions.Where(q => questionIds.Contains(q.Id)).ToListAsync();
                    context.Questions.RemoveRange(questions);
                }

                context.Quizzes.Remove(entity);
                await context.SaveChangesAsync();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Quiz deleted."
            };
        }
    }
}
