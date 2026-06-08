using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.QuizResult;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace e_ElectoralWeb.Api.Controller;

[ApiController]
[Route("api/quizresult")]
public class QuizResultController : ControllerBase
{
    private readonly IQuizResultAction _quizResultAction;

    public QuizResultController()
    {
        var bl = new BusinessLogic();
        _quizResultAction = bl.QuizResultAction();
    }

    [AllowAnonymous]
    [HttpPost("check-answer")]
    public async Task<IActionResult> CheckAnswer([FromBody] QuizAnswerCheckRequestDto dto)
    {
        try
        {
            var result = await _quizResultAction.CheckAnswerActionAsync(dto);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [AllowAnonymous]
    [HttpPost("evaluate")]
    public async Task<IActionResult> Evaluate([FromBody] QuizEvaluationRequestDto dto)
    {
        try
        {
            var result = await _quizResultAction.EvaluateQuizActionAsync(dto);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "User,Admin")]
    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] QuizResultSubmitDto dto)
    {
        try
        {
            var roleClaim = User.Claims.FirstOrDefault(c =>
                c.Type == ClaimTypes.Role ||
                c.Type == "role" ||
                c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            if (roleClaim == "User")
            {
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
                if (!int.TryParse(userIdClaim, out var tokenUserId) || tokenUserId != dto.UserId)
                {
                    return Forbid();
                }
            }

            var result = await _quizResultAction.SubmitQuizResultActionAsync(dto);
            if (!result.IsSuccess) return BadRequest(result);
            return Created(string.Empty, result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "User,Admin")]
    [HttpGet("byUser")]
    public async Task<IActionResult> GetByUser([FromQuery] int userId)
    {
        var roleClaim = User.Claims.FirstOrDefault(c =>
            c.Type == ClaimTypes.Role ||
            c.Type == "role" ||
            c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        if (roleClaim == "User")
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            if (!int.TryParse(userIdClaim, out var tokenUserId) || tokenUserId != userId)
            {
                return Forbid();
            }
        }

        try
        {
            var results = await _quizResultAction.GetQuizResultsByUserActionAsync(userId);
            return Ok(results);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var result = await _quizResultAction.GetQuizResultByIdActionAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
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
