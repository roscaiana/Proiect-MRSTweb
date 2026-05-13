using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.QuizResult;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

    [Authorize(Roles = "User,Manager,Admin")]
    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] QuizResultSubmitDto dto)
    {
        try
        {
            var result = await _quizResultAction.SubmitQuizResultActionAsync(dto);
            if (!result.IsSuccess) return BadRequest(result);
            return Created(string.Empty, result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpGet("byUser")]
    public async Task<IActionResult> GetByUser([FromQuery] int userId)
    {
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

    [Authorize(Roles = "Manager,Admin")]
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
