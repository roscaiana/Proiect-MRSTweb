using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.AnswerOption;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [ApiController]
    [Route("api/answeroption")]
    public class AnswerOptionController : ControllerBase
    {
        private readonly IAnswerOptionAction _answerOptionAction;

        public AnswerOptionController()
        {
            var bl = new BusinessLogic();
            _answerOptionAction = bl.AnswerOptionAction();
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var data = _answerOptionAction.GetAllAnswerOptionsAction();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var result = _answerOptionAction.GetAnswerOptionByIdAction(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("byQuestion")]
        public IActionResult GetByQuestion([FromQuery] int questionId)
        {
            var result = _answerOptionAction.GetAnswerOptionsByQuestionAction(questionId);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] AnswerOptionDto answerOption)
        {
            var result = _answerOptionAction.CreateAnswerOptionAction(answerOption);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] AnswerOptionDto answerOption)
        {
            answerOption.Id = id;
            var result = _answerOptionAction.UpdateAnswerOptionAction(answerOption);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var result = _answerOptionAction.DeleteAnswerOptionAction(id);
            if (!result.IsSuccess) return NotFound(result.Message);
            return NoContent();
        }
    }
}
