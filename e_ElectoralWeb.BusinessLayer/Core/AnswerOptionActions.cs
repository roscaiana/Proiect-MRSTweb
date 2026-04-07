using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.AnswerOption;
using e_ElectoralWeb.Domain.Models.AnswerOption;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class AnswerOptionActions
    {
        private readonly QuizDbContext _context;

        public AnswerOptionActions(QuizDbContext context)
        {
            _context = context;
        }

        internal List<AnswerOptionInfoDto> GetAllAnswerOptionsActionExecution()
        {
            var answerOptions = _context.AnswerOptions
                .Select(a => new AnswerOptionInfoDto()
                {
                    Id = a.Id,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect,
                    QuestionId = a.QuestionId
                })
                .ToList();

            return answerOptions;
        }

        internal AnswerOptionInfoDto? GetAnswerOptionByIdActionExecution(int id)
        {
            var answerOption = _context.AnswerOptions
                .Where(a => a.Id == id)
                .Select(a => new AnswerOptionInfoDto()
                {
                    Id = a.Id,
                    Text = a.Text,
                    IsCorrect = a.IsCorrect,
                    QuestionId = a.QuestionId
                })
                .FirstOrDefault();

            return answerOption;
        }

        internal AnswerOptionInfoDto? CreateAnswerOptionActionExecution(AnswerOptionCreateDto dto)
        {
            var questionExists = _context.Questions.Any(q => q.Id == dto.QuestionId);

            if (!questionExists)
            {
                return null;
            }

            var entity = new AnswerOptionEntity()
            {
                Text = dto.Text,
                IsCorrect = dto.IsCorrect,
                QuestionId = dto.QuestionId
            };

            _context.AnswerOptions.Add(entity);
            _context.SaveChanges();

            var result = new AnswerOptionInfoDto()
            {
                Id = entity.Id,
                Text = entity.Text,
                IsCorrect = entity.IsCorrect,
                QuestionId = entity.QuestionId
            };

            return result;
        }

        internal AnswerOptionInfoDto? UpdateAnswerOptionActionExecution(int id, AnswerOptionUpdateDto dto)
        {
            var entity = _context.AnswerOptions.FirstOrDefault(a => a.Id == id);

            if (entity == null)
            {
                return null;
            }

            var questionExists = _context.Questions.Any(q => q.Id == dto.QuestionId);

            if (!questionExists)
            {
                return null;
            }

            entity.Text = dto.Text;
            entity.IsCorrect = dto.IsCorrect;
            entity.QuestionId = dto.QuestionId;

            _context.SaveChanges();

            var result = new AnswerOptionInfoDto()
            {
                Id = entity.Id,
                Text = entity.Text,
                IsCorrect = entity.IsCorrect,
                QuestionId = entity.QuestionId
            };

            return result;
        }

        internal bool DeleteAnswerOptionActionExecution(int id)
        {
            var entity = _context.AnswerOptions.FirstOrDefault(a => a.Id == id);

            if (entity == null)
            {
                return false;
            }

            _context.AnswerOptions.Remove(entity);
            _context.SaveChanges();

            return true;
        }
    }
}