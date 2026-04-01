using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Models.Question;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class QuestionActions
    {
        private readonly QuizDbContext _context;

        public QuestionActions(QuizDbContext context)
        {
            _context = context;
        }

        internal List<QuestionInfoDto> GetAllQuestionsActionExecution()
        {
            var questions = _context.Questions
                .Select(q => new QuestionInfoDto()
                {
                    Id = q.Id,
                    Text = q.Text,
                    QuizId = q.QuizId
                })
                .ToList();

            return questions;
        }

        internal QuestionInfoDto? GetQuestionByIdActionExecution(int id)
        {
            var question = _context.Questions
                .Where(q => q.Id == id)
                .Select(q => new QuestionInfoDto()
                {
                    Id = q.Id,
                    Text = q.Text,
                    QuizId = q.QuizId
                })
                .FirstOrDefault();

            return question;
        }

        internal QuestionInfoDto? CreateQuestionActionExecution(QuestionCreateDto dto)
        {
            var quizExists = _context.Quizzes.Any(q => q.Id == dto.QuizId);
            if (!quizExists)
            {
                return null;
            }

            var entity = new QuestionEntity()
            {
                Text = dto.Text,
                QuizId = dto.QuizId
            };

            _context.Questions.Add(entity);
            _context.SaveChanges();

            var result = new QuestionInfoDto()
            {
                Id = entity.Id,
                Text = entity.Text,
                QuizId = entity.QuizId
            };

            return result;
        }

        internal QuestionInfoDto? UpdateQuestionActionExecution(int id, QuestionUpdateDto dto)
        {
            var entity = _context.Questions.FirstOrDefault(q => q.Id == id);

            if (entity == null)
            {
                return null;
            }

            var quizExists = _context.Quizzes.Any(q => q.Id == dto.QuizId);
            if (!quizExists)
            {
                return null;
            }

            entity.Text = dto.Text;
            entity.QuizId = dto.QuizId;

            _context.SaveChanges();

            var result = new QuestionInfoDto()
            {
                Id = entity.Id,
                Text = entity.Text,
                QuizId = entity.QuizId
            };

            return result;
        }

        internal bool DeleteQuestionActionExecution(int id)
        {
            var entity = _context.Questions.FirstOrDefault(q => q.Id == id);

            if (entity == null)
            {
                return false;
            }

            _context.Questions.Remove(entity);
            _context.SaveChanges();

            return true;
        }
    }
}