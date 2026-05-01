using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.QuizResult;
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

    [HttpPost("submit")]
    public IActionResult Submit([FromBody] QuizResultSubmitDto dto)
    {
        var result = _quizResultAction.SubmitQuizResultAction(dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("byUser")]
    public IActionResult GetByUser([FromQuery] int userId)
    {
        var results = _quizResultAction.GetQuizResultsByUserAction(userId);
        return Ok(results);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var result = _quizResultAction.GetQuizResultByIdAction(id);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
