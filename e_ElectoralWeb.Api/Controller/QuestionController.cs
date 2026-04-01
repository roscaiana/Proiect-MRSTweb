using e_ElectoralWeb.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionAction _questionAction;

        public QuestionController(IQuestionAction questionAction)
        {
            _questionAction = questionAction;
        }

        [HttpGet("getAll")]
        public IActionResult GetAll()
        {
            var questions = _questionAction.GetAllQuestionsAction();
            return Ok(questions);
        }
    }
}
