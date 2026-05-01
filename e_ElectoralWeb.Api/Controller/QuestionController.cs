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

        [HttpGet]
        public IActionResult GetAll()
        {
            var questions = _questionAction.GetAllQuestionsAction();
            return Ok(questions);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var result = _questionAction.GetQuestionByIdAction(id);
            if (result == null) return NotFound();
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
            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] QuestionDto question)
        {
            question.Id = id;
            var result = _questionAction.UpdateQuestionAction(question);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _questionAction.DeleteQuestionAction(id);
            if (!result.IsSuccess) return NotFound(result.Message);
            return NoContent();
        }
    }
}
