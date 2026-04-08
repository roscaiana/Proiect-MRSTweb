using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Question;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionAction _question;

        public QuestionController()
        {
            var bl = new BusinessLogic();
            _question = bl.QuestionAction();
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<QuestionInfoDto>), StatusCodes.Status200OK)]
        public IActionResult GetAll()
        {
            var result = _question.GetAllQuestionsAction();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(QuestionInfoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetById(int id)
        {
            var result = _question.GetQuestionByIdAction(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(QuestionInfoDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Create([FromBody] QuestionCreateDto dto)
        {
            var result = _question.CreateQuestionAction(dto);
            if (result == null) return BadRequest("Quiz not found.");
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(QuestionInfoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Update(int id, [FromBody] QuestionUpdateDto dto)
        {
            var result = _question.UpdateQuestionAction(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Delete(int id)
        {
            var deleted = _question.DeleteQuestionAction(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
