using e_ElectoralWeb.DataAccessLayer.Context;
using Microsoft.Extensions.Options;
using e_ElectoralWeb.Domain.Entities.Question;
using e_ElectoralWeb.Domain.Models.Question;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class QuestionActions {
    
    public bool CreateQuestionAction(QuestionCreateDto question)
    {
        var questionEntity = new QuestionEntity()
        {
            Id = question.Id,
            Text = question.Text
        };
        
        using (var context = new QuestionDbContext())
        {
            try
            {
                context.Add(questionEntity);
                context.SaveChanges();
                return true;
            }
            catch (Exeption e)
            {
                return false;
            }
        }
       
    }

    public QuestioninfoDto? GetQuestionByIdAction(int Id)
    {
        var QuestioninfoDto = context.Questions.Find(Id);
        if (QuestionEntity == null)
            return null;

        var QuestioninfoDto = new QuestioninfoDto()
        {
            Id = QuestionEntity.Id,
            Text = QuestionEntity.Text,
            OptionA = QuestionEntity.OptionA,
            OptionB = QuestionEntity.OptionB,
            OptionC =QuestionEntity.OptionC,
            OptionD = QuestionEntity.OptionD,
            CorrectAnswer =QuestionEntity.CorrectAnswer,
        };
        return QuestioninfoDto;

    }

    public List<QuestioninfoDto>? GetQuestionsListAction()
    {
        var questionList = context.Questions.Select(QuestionEntity);
    };
}
