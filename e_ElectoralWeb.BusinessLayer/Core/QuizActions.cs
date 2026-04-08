using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.Domain.Models.Quiz;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class QuizActions
    {
        internal List<QuizInfoDto> GetAllQuizzesActionExecution()
        {
            using var db = new QuizDbContext();
            return db.Quizzes
                .Select(q => new QuizInfoDto { Id = q.Id, Title = q.Title, Description = q.Description })
                .ToList();
        }

        internal QuizInfoDto? GetQuizByIdActionExecution(int id)
        {
            using var db = new QuizDbContext();
            return db.Quizzes
                .Where(q => q.Id == id)
                .Select(q => new QuizInfoDto { Id = q.Id, Title = q.Title, Description = q.Description })
                .FirstOrDefault();
        }

        internal QuizInfoDto CreateQuizActionExecution(QuizCreateDto dto)
        {
            using var db = new QuizDbContext();
            var entity = new QuizEntity { Title = dto.Title, Description = dto.Description };
            db.Quizzes.Add(entity);
            db.SaveChanges();
            return new QuizInfoDto { Id = entity.Id, Title = entity.Title, Description = entity.Description };
        }

        internal QuizInfoDto? UpdateQuizActionExecution(int id, QuizUpdateDto dto)
        {
            using var db = new QuizDbContext();
            var entity = db.Quizzes.FirstOrDefault(q => q.Id == id);
            if (entity == null) return null;

            entity.Title = dto.Title;
            entity.Description = dto.Description;
            db.SaveChanges();
            return new QuizInfoDto { Id = entity.Id, Title = entity.Title, Description = entity.Description };
        }

        internal bool DeleteQuizActionExecution(int id)
        {
            using var db = new QuizDbContext();
            var entity = db.Quizzes.FirstOrDefault(q => q.Id == id);
            if (entity == null) return false;

            db.Quizzes.Remove(entity);
            db.SaveChanges();
            return true;
        }
    }
}
