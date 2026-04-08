using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Question;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [ApiController]
    [Route("api/question")]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionAction _questionAction;

        public QuestionController()
        {
            var bl = new BusinessLogic();
            _questionAction = bl.QuestionAction();
        }

        [HttpGet("getAll")]
        public IActionResult GetAll()
        {
            var questions = _questionAction.GetAllQuestionsAction();
            return Ok(questions);
        }

        [HttpGet]
        public IActionResult GetById([FromQuery] int id)
        {
            var result = _questionAction.GetQuestionByIdAction(id);
            return Ok(result);
        }

        [HttpGet("byQuiz")]
        public IActionResult GetByQuiz([FromQuery] int quizId)
        {
            var result = _questionAction.GetQuestionsByQuizAction(quizId);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] QuestionDto question)
        {
            var result = _questionAction.CreateQuestionAction(question);
            return Ok(result);
        }

        [HttpPut]
        public IActionResult Update([FromBody] QuestionDto question)
        {
            var result = _questionAction.UpdateQuestionAction(question);
            return Ok(result);
        }

        [HttpDelete]
        public IActionResult Delete([FromQuery] int id)
        {
            var result = _questionAction.DeleteQuestionAction(id);
            return Ok(result);
        }
    }
}
