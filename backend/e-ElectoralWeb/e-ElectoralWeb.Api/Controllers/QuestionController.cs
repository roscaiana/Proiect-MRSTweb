using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controllers;
[ApiController]
[Route("api/questions")]
public class QuestionController:ControllerBase
{
    private readonly IQuestionLogic questionLogic;

    public QuestionController()
    {
        var bl = new BusinessLogic();
        questionLogic = bl.GetQuestionLogic();
    }
}
