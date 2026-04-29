using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Models.Question;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class QuestionActions
    {
        protected QuestionActions()
        {
        }

        protected List<QuestionDto> GetAllQuestionsActionExecution()
        {
            using var context = new QuestionContext();
            return context.Questions
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    QuizId = q.QuizId
                })
                .ToList();
        }

        protected QuestionDto? GetQuestionByIdActionExecution(int id)
        {
            using var context = new QuestionContext();
            return context.Questions
                .Where(q => q.Id == id)
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    QuizId = q.QuizId
                })
                .FirstOrDefault();
        }

        protected List<QuestionDto> GetQuestionsByQuizActionExecution(int quizId)
        {
            using var context = new QuestionContext();
            return context.Questions
                .Where(q => q.QuizId == quizId)
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    QuizId = q.QuizId
                })
                .ToList();
        }

        protected ActionResponce CreateQuestionActionExecution(QuestionDto data)
        {
            if (string.IsNullOrWhiteSpace(data.Text))
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Question text is required."
                };
            }

            using (var context = new QuestionContext())
            {
                var quizExists = context.Quizzes.Any(q => q.Id == data.QuizId);
                if (!quizExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz not found."
                    };
                }

                var exists = context.Questions.Any(q =>
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
                context.SaveChanges();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Question created."
            };
        }

        protected ActionResponce UpdateQuestionActionExecution(QuestionDto data)
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

            using (var context = new QuestionContext())
            {
                var entity = context.Questions.FirstOrDefault(q => q.Id == data.Id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question not found."
                    };
                }

                var quizExists = context.Quizzes.Any(q => q.Id == data.QuizId);
                if (!quizExists)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Quiz not found."
                    };
                }

                var exists = context.Questions.Any(q =>
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
                context.SaveChanges();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Question updated."
            };
        }

        protected ActionResponce DeleteQuestionActionExecution(int id)
        {
            using (var context = new QuestionContext())
            {
                var entity = context.Questions.FirstOrDefault(q => q.Id == id);
                if (entity == null)
                {
                    return new ActionResponce
                    {
                        IsSuccess = false,
                        Message = "Question not found."
                    };
                }

                var options = context.AnswerOptions.Where(a => a.QuestionId == entity.Id).ToList();
                if (options.Count > 0)
                {
                    context.AnswerOptions.RemoveRange(options);
                }

                context.Questions.Remove(entity);
                context.SaveChanges();
            }

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Question deleted."
            };
        }
    }
}
