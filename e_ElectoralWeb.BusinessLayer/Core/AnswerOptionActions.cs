using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Models.AnswerOption;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class AnswerOptionActions
    {
        protected AnswerOptionActions()
        {
        }

        protected async Task<List<AnswerOptionDto>> GetAllAnswerOptionsActionExecutionAsync()
        {
            using var context = new QuizDbContext();
            return await context.AnswerOptions
                .Select(a => new AnswerOptionDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect,
                    QuestionId = a.QuestionId
                })
                .ToListAsync();
        }

        protected async Task<AnswerOptionDto?> GetAnswerOptionByIdActionExecutionAsync(int id)
        {
            using var context = new QuizDbContext();
            return await context.AnswerOptions
                .Where(a => a.Id == id)
                .Select(a => new AnswerOptionDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect,
                    QuestionId = a.QuestionId
                })
                .FirstOrDefaultAsync();
        }

        protected async Task<List<AnswerOptionDto>> GetAnswerOptionsByQuestionActionExecutionAsync(int questionId)
        {
            using var context = new QuizDbContext();
            return await context.AnswerOptions
                .Where(a => a.QuestionId == questionId)
                .Select(a => new AnswerOptionDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect,
                    QuestionId = a.QuestionId
                })
                .ToListAsync();
        }

        protected async Task<ActionResponce> CreateAnswerOptionActionExecutionAsync(AnswerOptionDto data)
        {
            if (string.IsNullOrWhiteSpace(data.Text))
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Answer option text is required."
                };
            }

            using (var context = new QuizDbContext())
            {
                var questionExists = await context.Questions.AnyAsync(q => q.Id == data.QuestionId);
                if (!questionExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question not found."
                    };
                }

                var exists = await context.AnswerOptions.AnyAsync(a =>
                    a.QuestionId == data.QuestionId &&
                    a.Text == data.Text);
                if (exists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Answer option already exists for this question."
                    };
                }

                if (data.IsCorrect)
                {
                    var correctExists = await context.AnswerOptions.AnyAsync(a =>
                        a.QuestionId == data.QuestionId &&
                        a.IsCorrect);
                    if (correctExists)
                    {
                        return new ActionResponce
                        {
                            IsSuccess = false,
                            Message = "Only one correct answer is allowed per question."
                        };
                    }
                }

                var entity = new AnswerOptionData
                {
                    Text = data.Text,
                    IsCorrect = data.IsCorrect,
                    QuestionId = data.QuestionId
                };

                context.AnswerOptions.Add(entity);
                await context.SaveChangesAsync();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Answer option created."
            };
        }

        protected async Task<ActionResponce> UpdateAnswerOptionActionExecutionAsync(AnswerOptionDto data)
        {
            if (data.Id <= 0)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Answer option id is required."
                };
            }

            if (string.IsNullOrWhiteSpace(data.Text))
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Answer option text is required."
                };
            }

            using (var context = new QuizDbContext())
            {
                var entity = await context.AnswerOptions.FirstOrDefaultAsync(a => a.Id == data.Id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Answer option not found."
                    };
                }

                var questionExists = await context.Questions.AnyAsync(q => q.Id == data.QuestionId);
                if (!questionExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question not found."
                    };
                }

                var exists = await context.AnswerOptions.AnyAsync(a =>
                    a.Id != data.Id &&
                    a.QuestionId == data.QuestionId &&
                    a.Text == data.Text);
                if (exists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Answer option already exists for this question."
                    };
                }

                if (data.IsCorrect)
                {
                    var correctExists = await context.AnswerOptions.AnyAsync(a =>
                        a.Id != data.Id &&
                        a.QuestionId == data.QuestionId &&
                        a.IsCorrect);
                    if (correctExists)
                    {
                        return new ActionResponce
                        {
                            IsSuccess = false,
                            Message = "Only one correct answer is allowed per question."
                        };
                    }
                }

                entity.Text = data.Text;
                entity.IsCorrect = data.IsCorrect;
                entity.QuestionId = data.QuestionId;

                context.AnswerOptions.Update(entity);
                await context.SaveChangesAsync();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Answer option updated."
            };
        }

        protected async Task<ActionResponce> DeleteAnswerOptionActionExecutionAsync(int id)
        {
            using (var context = new QuizDbContext())
            {
                var entity = await context.AnswerOptions.FirstOrDefaultAsync(a => a.Id == id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Answer option not found."
                    };
                }

                context.AnswerOptions.Remove(entity);
                await context.SaveChangesAsync();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Answer option deleted."
            };
        }
    }
}
