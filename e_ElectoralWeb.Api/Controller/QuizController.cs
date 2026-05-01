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

        [HttpGet]
        public IActionResult GetAll()
        {
            var result = _quiz.GetAllQuizzesAction();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var result = _quiz.GetQuizByIdAction(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] QuizDto dto)
        {
            var result = _quiz.CreateQuizAction(dto);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] QuizDto dto)
        {
            dto.Id = id;
            var result = _quiz.UpdateQuizAction(dto);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _quiz.DeleteQuizAction(id);
            if (!result.IsSuccess) return NotFound(result.Message);
            return NoContent();
        }
    }
}
