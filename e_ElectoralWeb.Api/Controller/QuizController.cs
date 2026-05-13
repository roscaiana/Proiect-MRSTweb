using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Quiz;
using Microsoft.AspNetCore.Authorization;
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

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _quiz.GetAllQuizzesActionAsync();
                return Ok(result);
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
                var result = await _quiz.GetQuizByIdActionAsync(id);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] QuizDto dto)
        {
            try
            {
                var result = await _quiz.CreateQuizActionAsync(dto);
                if (!result.IsSuccess) return BadRequest(result.Message);
                return CreatedAtAction(nameof(GetById), new { id = dto.Id }, result);
            }
            catch (Exception)
            {
                return DatabaseError();
            }
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] QuizDto dto)
        {
            try
            {
                dto.Id = id;
                var result = await _quiz.UpdateQuizActionAsync(dto);
                if (!result.IsSuccess)
                {
                    var message = result.Message ?? "Quiz update failed.";
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
                var result = await _quiz.DeleteQuizActionAsync(id);
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
