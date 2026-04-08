using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Models.Question;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class QuestionActions
    {
        internal List<QuestionInfoDto> GetAllQuestionsActionExecution()
        {
            using var db = new QuizDbContext();
            return db.Questions
                .Select(q => new QuestionInfoDto { Id = q.Id, Text = q.Text, QuizId = q.QuizId })
                .ToList();
        }

        internal QuestionInfoDto? GetQuestionByIdActionExecution(int id)
        {
            using var db = new QuizDbContext();
            return db.Questions
                .Where(q => q.Id == id)
                .Select(q => new QuestionInfoDto { Id = q.Id, Text = q.Text, QuizId = q.QuizId })
                .FirstOrDefault();
        }

        internal QuestionInfoDto? CreateQuestionActionExecution(QuestionCreateDto dto)
        {
            using var db = new QuizDbContext();
            if (!db.Quizzes.Any(q => q.Id == dto.QuizId)) return null;

            var entity = new QuestionEntity { Text = dto.Text, QuizId = dto.QuizId };
            db.Questions.Add(entity);
            db.SaveChanges();
            return new QuestionInfoDto { Id = entity.Id, Text = entity.Text, QuizId = entity.QuizId };
        }

        internal QuestionInfoDto? UpdateQuestionActionExecution(int id, QuestionUpdateDto dto)
        {
            using var db = new QuizDbContext();
            var entity = db.Questions.FirstOrDefault(q => q.Id == id);
            if (entity == null) return null;
            if (!db.Quizzes.Any(q => q.Id == dto.QuizId)) return null;

            entity.Text = dto.Text;
            entity.QuizId = dto.QuizId;
            db.SaveChanges();
            return new QuestionInfoDto { Id = entity.Id, Text = entity.Text, QuizId = entity.QuizId };
        }

        internal bool DeleteQuestionActionExecution(int id)
        {
            using var db = new QuizDbContext();
            var entity = db.Questions.FirstOrDefault(q => q.Id == id);
            if (entity == null) return false;

            db.Questions.Remove(entity);
            db.SaveChanges();
            return true;
        }
    }
}
