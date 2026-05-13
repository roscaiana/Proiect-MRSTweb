using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Models.Question;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class QuestionActions
    {
        protected QuestionActions()
        {
        }

        protected async Task<List<QuestionDto>> GetAllQuestionsActionExecutionAsync()
        {
            using var context = new QuizDbContext();
            return await context.Questions
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    QuizId = q.QuizId
                })
                .ToListAsync();
        }

        protected async Task<QuestionDto?> GetQuestionByIdActionExecutionAsync(int id)
        {
            using var context = new QuizDbContext();
            return await context.Questions
                .Where(q => q.Id == id)
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    QuizId = q.QuizId
                })
                .FirstOrDefaultAsync();
        }

        protected async Task<List<QuestionDto>> GetQuestionsByQuizActionExecutionAsync(int quizId)
        {
            using var context = new QuizDbContext();
            return await context.Questions
                .Where(q => q.QuizId == quizId)
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    QuizId = q.QuizId
                })
                .ToListAsync();
        }

        protected async Task<ActionResponce> CreateQuestionActionExecutionAsync(QuestionDto data)
        {
            if (string.IsNullOrWhiteSpace(data.Text))
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Question text is required."
                };
            }

            using (var context = new QuizDbContext())
            {
                var quizExists = await context.Quizzes.AnyAsync(q => q.Id == data.QuizId);
                if (!quizExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz not found."
                    };
                }

                var exists = await context.Questions.AnyAsync(q =>
                    q.QuizId == data.QuizId &&
                    q.Text == data.Text);
                if (exists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question already exists for this quiz."
                    };
                }

                var entity = new QuestionData
                {
                    Text = data.Text,
                    QuizId = data.QuizId
                };

                context.Questions.Add(entity);
                await context.SaveChangesAsync();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Question created."
            };
        }

        protected async Task<ActionResponce> UpdateQuestionActionExecutionAsync(QuestionDto data)
        {
            if (data.Id <= 0)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Question id is required."
                };
            }

            if (string.IsNullOrWhiteSpace(data.Text))
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Question text is required."
                };
            }

            using (var context = new QuizDbContext())
            {
                var entity = await context.Questions.FirstOrDefaultAsync(q => q.Id == data.Id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question not found."
                    };
                }

                var quizExists = await context.Quizzes.AnyAsync(q => q.Id == data.QuizId);
                if (!quizExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz not found."
                    };
                }

                var exists = await context.Questions.AnyAsync(q =>
                    q.Id != data.Id &&
                    q.QuizId == data.QuizId &&
                    q.Text == data.Text);
                if (exists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question already exists for this quiz."
                    };
                }

                entity.Text = data.Text;
                entity.QuizId = data.QuizId;

                context.Questions.Update(entity);
                await context.SaveChangesAsync();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Question updated."
            };
        }

        protected async Task<ActionResponce> DeleteQuestionActionExecutionAsync(int id)
        {
            using (var context = new QuizDbContext())
            {
                var entity = await context.Questions.FirstOrDefaultAsync(q => q.Id == id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question not found."
                    };
                }

                var options = await context.AnswerOptions.Where(a => a.QuestionId == entity.Id).ToListAsync();
                if (options.Count > 0)
                {
                    context.AnswerOptions.RemoveRange(options);
                }

                context.Questions.Remove(entity);
                await context.SaveChangesAsync();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Question deleted."
            };
        }
    }
}
