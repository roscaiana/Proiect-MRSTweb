using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.AnswerOption;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnswerOptionController : ControllerBase
    {
        private readonly IAnswerOptionAction _answerOption;

        public AnswerOptionController()
        {
            var bl = new BusinessLogic();
            _answerOption = bl.AnswerOptionAction();
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<AnswerOptionInfoDto>), StatusCodes.Status200OK)]
        public IActionResult GetAll()
        {
            var result = _answerOption.GetAllAnswerOptionsAction();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(AnswerOptionInfoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetById(int id)
        {
            var result = _answerOption.GetAnswerOptionByIdAction(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(AnswerOptionInfoDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Create([FromBody] AnswerOptionCreateDto dto)
        {
            var result = _answerOption.CreateAnswerOptionAction(dto);
            if (result == null) return BadRequest("Question not found.");
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(AnswerOptionInfoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Update(int id, [FromBody] AnswerOptionUpdateDto dto)
        {
            var result = _answerOption.UpdateAnswerOptionAction(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Delete(int id)
        {
            var deleted = _answerOption.DeleteAnswerOptionAction(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
