using e_ElectoralWeb.Domain.Entities.Question;

namespace e_ElectoralWeb.DataAccessLayer.Context;

public class SessionDbContext
{
    public void Add(QuestionEntity questionEntity)
    {
        Questions.Add(questionEntity);
    }

    public List<QuestionEntity> Questions { get; set; } = new();
}
