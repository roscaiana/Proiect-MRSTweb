using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Quiz;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [Route("api/[controller]")]
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
        [ProducesResponseType(typeof(List<QuizInfoDto>), StatusCodes.Status200OK)]
        public IActionResult GetAll()
        {
            var result = _quiz.GetAllQuizzesAction();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(QuizInfoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetById(int id)
        {
            var result = _quiz.GetQuizByIdAction(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(QuizInfoDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Create([FromBody] QuizCreateDto dto)
        {
            var result = _quiz.CreateQuizAction(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(QuizInfoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Update(int id, [FromBody] QuizUpdateDto dto)
        {
            var result = _quiz.UpdateQuizAction(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Delete(int id)
        {
            var deleted = _quiz.DeleteQuizAction(id);
            if (!deleted) return NotFound();
            return NoContent();
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
