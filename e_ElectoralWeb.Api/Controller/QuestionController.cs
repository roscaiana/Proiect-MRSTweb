using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Question;
using Microsoft.AspNetCore.Authorization;
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

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var questions = await _questionAction.GetAllQuestionsActionAsync();
                return Ok(questions);
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
                var result = await _questionAction.GetQuestionByIdActionAsync(id);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [AllowAnonymous]
        [HttpGet("byQuiz")]
        public async Task<IActionResult> GetByQuiz([FromQuery] int quizId)
        {
            try
            {
                var result = await _questionAction.GetQuestionsByQuizActionAsync(quizId);
                return Ok(result);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] QuestionDto question)
        {
            try
            {
                var result = await _questionAction.CreateQuestionActionAsync(question);
                if (!result.IsSuccess) return BadRequest(result.Message);
                return CreatedAtAction(nameof(GetById), new { id = question.Id }, result);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] QuestionDto question)
        {
            try
            {
                question.Id = id;
                var result = await _questionAction.UpdateQuestionActionAsync(question);
                if (!result.IsSuccess)
                {
                    var message = result.Message ?? "Question update failed.";
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
                var result = await _questionAction.DeleteQuestionActionAsync(id);
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
