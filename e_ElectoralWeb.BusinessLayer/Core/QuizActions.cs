using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.Quiz;
using e_ElectoralWeb.Domain.Models.Quiz;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class QuizActions
    {
        private readonly QuizDbContext _context;

        public QuizActions(QuizDbContext context)
        {
            _context = context;
        }

        internal List<QuizInfoDto> GetAllQuizzesActionExecution()
        {
            var Quizzes = _context.Quizzes
                .Select(q => new QuizInfoDto()
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description
                })
                .ToList();

            return Quizzes;
        }

        internal QuizInfoDto? GetQuizByIdActionExecution(int id)
        {
            var quiz = _context.Quizzes
                .Where(q => q.Id == id)
                .Select(q => new QuizInfoDto()
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description
                })
                .FirstOrDefault();

            return quiz;
        }

        internal QuizInfoDto CreateQuizActionExecution(QuizCreateDto dto)
        {
            var entity = new QuizEntity()
            {
                Title = dto.Title,
                Description = dto.Description
            };

            _context.Quizzes.Add(entity);
            _context.SaveChanges();

            var result = new QuizInfoDto()
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description
            };

            return result;
        }

        internal QuizInfoDto? UpdateQuizActionExecution(int id, QuizUpdateDto dto)
        {
            var entity = _context.Quizzes.FirstOrDefault(q => q.Id == id);

            if (entity == null)
            {
                return null;
            }

            entity.Title = dto.Title;
            entity.Description = dto.Description;

            _context.SaveChanges();

            var result = new QuizInfoDto()
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description
            };

            return result;
        }

        internal bool DeleteQuizActionExecution(int id)
        {
            var entity = _context.Quizzes.FirstOrDefault(q => q.Id == id);

            if (entity == null)
            {
                return false;
            }

            _context.Quizzes.Remove(entity);
            _context.SaveChanges();

            return true;
        }
    }
}
