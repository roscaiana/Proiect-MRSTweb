using e_ElectoralWeb.Domain.Entities.Question;

namespace e_ElectoralWeb.DataAccessLayer.Context;

public class SessionDbContext
{
    public void Add(QuestionEntity questionEntity)
    {
        throw new NotImplementedException();
    }

    public object Questions { get; set; }
}