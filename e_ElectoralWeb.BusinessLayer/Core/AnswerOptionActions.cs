using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Models.AnswerOption;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class AnswerOptionActions
    {
        internal List<AnswerOptionInfoDto> GetAllAnswerOptionsActionExecution()
        {
            using var db = new QuizDbContext();
            return db.AnswerOptions
                .Select(a => new AnswerOptionInfoDto { Id = a.Id, Text = a.Text, IsCorrect = a.IsCorrect, QuestionId = a.QuestionId })
                .ToList();
        }

        internal AnswerOptionInfoDto? GetAnswerOptionByIdActionExecution(int id)
        {
            using var db = new QuizDbContext();
            return db.AnswerOptions
                .Where(a => a.Id == id)
                .Select(a => new AnswerOptionInfoDto { Id = a.Id, Text = a.Text, IsCorrect = a.IsCorrect, QuestionId = a.QuestionId })
                .FirstOrDefault();
        }

        internal AnswerOptionInfoDto? CreateAnswerOptionActionExecution(AnswerOptionCreateDto dto)
        {
            using var db = new QuizDbContext();
            if (!db.Questions.Any(q => q.Id == dto.QuestionId)) return null;

            var entity = new AnswerOptionEntity { Text = dto.Text, IsCorrect = dto.IsCorrect, QuestionId = dto.QuestionId };
            db.AnswerOptions.Add(entity);
            db.SaveChanges();
            return new AnswerOptionInfoDto { Id = entity.Id, Text = entity.Text, IsCorrect = entity.IsCorrect, QuestionId = entity.QuestionId };
        }

        internal AnswerOptionInfoDto? UpdateAnswerOptionActionExecution(int id, AnswerOptionUpdateDto dto)
        {
            using var db = new QuizDbContext();
            var entity = db.AnswerOptions.FirstOrDefault(a => a.Id == id);
            if (entity == null) return null;
            if (!db.Questions.Any(q => q.Id == dto.QuestionId)) return null;

            entity.Text = dto.Text;
            entity.IsCorrect = dto.IsCorrect;
            entity.QuestionId = dto.QuestionId;
            db.SaveChanges();
            return new AnswerOptionInfoDto { Id = entity.Id, Text = entity.Text, IsCorrect = entity.IsCorrect, QuestionId = entity.QuestionId };
        }

        internal bool DeleteAnswerOptionActionExecution(int id)
        {
            using var db = new QuizDbContext();
            var entity = db.AnswerOptions.FirstOrDefault(a => a.Id == id);
            if (entity == null) return false;

            db.AnswerOptions.Remove(entity);
            db.SaveChanges();
            return true;
        }
    }
}
