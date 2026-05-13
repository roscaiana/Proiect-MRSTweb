using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.AnswerOption;
using Microsoft.AspNetCore.Authorization;
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

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var data = await _answerOptionAction.GetAllAnswerOptionsActionAsync();
                return Ok(data);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _answerOptionAction.GetAnswerOptionByIdActionAsync(id);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [AllowAnonymous]
        [HttpGet("byQuestion")]
        public async Task<IActionResult> GetByQuestion([FromQuery] int questionId)
        {
            try
            {
                var result = await _answerOptionAction.GetAnswerOptionsByQuestionActionAsync(questionId);
                return Ok(result);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AnswerOptionDto answerOption)
        {
            try
            {
                var result = await _answerOptionAction.CreateAnswerOptionActionAsync(answerOption);
                if (!result.IsSuccess) return BadRequest(result.Message);
                return CreatedAtAction(nameof(GetById), new { id = answerOption.Id }, result);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AnswerOptionDto answerOption)
        {
            try
            {
                answerOption.Id = id;
                var result = await _answerOptionAction.UpdateAnswerOptionActionAsync(answerOption);
                if (!result.IsSuccess)
                {
                    var message = result.Message ?? "Answer option update failed.";
                    if (message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                    {
                        return NotFound(message);
                    }

                    return BadRequest(message);
                }

                return Ok(result);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _answerOptionAction.DeleteAnswerOptionActionAsync(id);
                if (!result.IsSuccess) return NotFound(result.Message);
                return NoContent();
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        private IActionResult DatabaseError()
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Database error.");
        }
    }
}
