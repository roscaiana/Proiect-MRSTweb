using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Quiz;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [Route("api/quiz")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizAction _quiz;

        public QuizController()
        {
            var bl = new BusinessLogic();
            _quiz = bl.QuizAction();
        }

        [HttpGet("getAll")]
        public IActionResult GetAllQuizzes()
        {
            var quizzes = _quiz.GetAllQuizzesAction();
            return Ok(quizzes);
        }

        [HttpGet]
        public IActionResult GetById([FromQuery] int id)
        {
            var quiz = _quiz.GetQuizByIdAction(id);
            return Ok(quiz);
        }

        [HttpPost]
        public IActionResult Create([FromBody] QuizDto quiz)
        {
            var result = _quiz.CreateQuizAction(quiz);
            return Ok(result);
        }

        [HttpPut]
        public IActionResult Update([FromBody] QuizDto quiz)
        {
            var result = _quiz.UpdateQuizAction(quiz);
            return Ok(result);
        }

        [HttpDelete]
        public IActionResult Delete([FromQuery] int id)
        {
            var result = _quiz.DeleteQuizAction(id);
            return Ok(result);
        }
    }
}
