using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Models.AnswerOption;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class AnswerOptionActions
    {
        protected AnswerOptionActions()
        {
        }

        protected List<AnswerOptionDto> GetAllAnswerOptionsActionExecution()
        {
            using var context = new AnswerOptionContext();
            return context.AnswerOptions
                .Select(a => new AnswerOptionDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect,
                    QuestionId = a.QuestionId
                })
                .ToList();
        }

        protected AnswerOptionDto? GetAnswerOptionByIdActionExecution(int id)
        {
            using var context = new AnswerOptionContext();
            return context.AnswerOptions
                .Where(a => a.Id == id)
                .Select(a => new AnswerOptionDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect,
                    QuestionId = a.QuestionId
                })
                .FirstOrDefault();
        }

        protected List<AnswerOptionDto> GetAnswerOptionsByQuestionActionExecution(int questionId)
        {
            using var context = new AnswerOptionContext();
            return context.AnswerOptions
                .Where(a => a.QuestionId == questionId)
                .Select(a => new AnswerOptionDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect,
                    QuestionId = a.QuestionId
                })
                .ToList();
        }

        protected ActionResponce CreateAnswerOptionActionExecution(AnswerOptionDto data)
        {
            if (string.IsNullOrWhiteSpace(data.Text))
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Answer option text is required."
                };
            }

            using (var context = new AnswerOptionContext())
            {
                var questionExists = context.Questions.Any(q => q.Id == data.QuestionId);
                if (!questionExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question not found."
                    };
                }

                var exists = context.AnswerOptions.Any(a =>
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
                    var correctExists = context.AnswerOptions.Any(a =>
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
                context.SaveChanges();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Answer option created."
            };
        }

        protected ActionResponce UpdateAnswerOptionActionExecution(AnswerOptionDto data)
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

            using (var context = new AnswerOptionContext())
            {
                var entity = context.AnswerOptions.FirstOrDefault(a => a.Id == data.Id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Answer option not found."
                    };
                }

                var questionExists = context.Questions.Any(q => q.Id == data.QuestionId);
                if (!questionExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question not found."
                    };
                }

                var exists = context.AnswerOptions.Any(a =>
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
                    var correctExists = context.AnswerOptions.Any(a =>
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
                context.SaveChanges();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Answer option updated."
            };
        }

        protected ActionResponce DeleteAnswerOptionActionExecution(int id)
        {
            using (var context = new AnswerOptionContext())
            {
                var entity = context.AnswerOptions.FirstOrDefault(a => a.Id == id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Answer option not found."
                    };
                }

                context.AnswerOptions.Remove(entity);
                context.SaveChanges();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Answer option deleted."
            };
        }
    }
}
