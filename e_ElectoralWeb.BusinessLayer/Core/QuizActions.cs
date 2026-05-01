using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.Domain.Models.Quiz;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class QuizActions
    {
        protected QuizActions()
        {
        }

        protected List<QuizDto> GetAllQuizzesActionExecution()
        {
            using var context = new QuizDbContext();
            return context.Quizzes
                .Select(q => new QuizDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description
                })
                .ToList();
        }

        protected QuizDto? GetQuizByIdActionExecution(int id)
        {
            using var context = new QuizDbContext();
            return context.Quizzes
                .Where(q => q.Id == id)
                .Select(q => new QuizDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description
                })
                .FirstOrDefault();
        }

        protected ActionResponce CreateQuizActionExecution(QuizDto data)
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
                var titleExists = context.Quizzes.Any(q => q.Title == data.Title);
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
                context.SaveChanges();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Quiz created."
            };
        }

        protected ActionResponce UpdateQuizActionExecution(QuizDto data)
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
                var entity = context.Quizzes.FirstOrDefault(q => q.Id == data.Id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz not found."
                    };
                }

                var titleExists = context.Quizzes.Any(q =>
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
                context.SaveChanges();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Quiz updated."
            };
        }

        protected ActionResponce DeleteQuizActionExecution(int id)
        {
            using (var context = new QuizDbContext())
            {
                var entity = context.Quizzes.FirstOrDefault(q => q.Id == id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz not found."
                    };
                }

                var questionIds = context.Questions
                    .Where(q => q.QuizId == entity.Id)
                    .Select(q => q.Id)
                    .ToList();

                if (questionIds.Count > 0)
                {
                    var options = context.AnswerOptions.Where(a => questionIds.Contains(a.QuestionId)).ToList();
                    if (options.Count > 0)
                    {
                        context.AnswerOptions.RemoveRange(options);
                    }

                    var questions = context.Questions.Where(q => questionIds.Contains(q.Id)).ToList();
                    context.Questions.RemoveRange(questions);
                }

                context.Quizzes.Remove(entity);
                context.SaveChanges();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Quiz deleted."
            };
        }
    }
}
