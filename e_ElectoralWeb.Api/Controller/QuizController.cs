using e_ElectoralWeb.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [Route("api/quiz")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizAction _quiz;

        public QuizController(IQuizAction quiz)
        {
            _quiz = quiz;
        }

        [HttpGet("getAll")]
        public IActionResult GetAllQuizzes()
        {
            var quizzes = _quiz.GetAllQuizzesAction();
            return Ok(quizzes);
        }
    }
}
