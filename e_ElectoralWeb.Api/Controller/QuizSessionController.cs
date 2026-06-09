using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.QuizSession;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace e_ElectoralWeb.Api.Controller;

[ApiController]
[Route("api/quizsession")]
public class QuizSessionController : ControllerBase
{
    private readonly IQuizSessionAction _quizSessionAction;

    public QuizSessionController()
    {
        var bl = new BusinessLogic();
        _quizSessionAction = bl.QuizSessionAction();
    }

    [AllowAnonymous]
    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] QuizSessionStartRequestDto dto)
    {
        try
        {
            var userId = GetUserId();
            if (string.Equals(dto.Mode, "exam", StringComparison.OrdinalIgnoreCase) && !userId.HasValue)
            {
                return Unauthorized("Pentru examen trebuie să fii autentificat.");
            }

            var result = await _quizSessionAction.StartSessionActionAsync(dto, userId);
            if (!result.IsSuccess) return BadRequest(result);
            return Created(string.Empty, result);
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Database error.");
        }
    }

    private int? GetUserId()
    {
        var raw = User.Claims.FirstOrDefault(c => c.Type == "userId" || c.Type == ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(raw, out var userId) ? userId : null;
    }
}
