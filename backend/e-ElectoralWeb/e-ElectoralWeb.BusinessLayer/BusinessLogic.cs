using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;

namespace e_ElectoralWeb.BusinessLayer;

public class BusinessLogic
{
    public BusinessLogic(){}

    public IQuestionLogic GetQuestionLogic()
    {
        return new QuestionLogic();
    }
    
}
