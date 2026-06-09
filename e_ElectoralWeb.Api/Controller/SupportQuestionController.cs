using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.SupportQuestion;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller;

[Route("api/supportquestions")]
[ApiController]
public class SupportQuestionController : ControllerBase
{
    private readonly ISupportQuestionAction _supportQuestionAction;

    public SupportQuestionController(BusinessLogic bl)
    {
        _supportQuestionAction = bl.SupportQuestionAction();
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPublished()
    {
        try
        {
            var result = await _supportQuestionAction.GetPublishedSupportQuestionsActionAsync();
            return Ok(result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public async Task<IActionResult> GetAllForAdmin()
    {
        try
        {
            var result = await _supportQuestionAction.GetAllSupportQuestionsActionAsync();
            return Ok(result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var result = await _supportQuestionAction.GetSupportQuestionByIdActionAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SupportQuestionDto dto)
    {
        try
        {
            var result = await _supportQuestionAction.CreateSupportQuestionActionAsync(dto);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SupportQuestionDto dto)
    {
        try
        {
            dto.Id = id;
            var result = await _supportQuestionAction.UpdateSupportQuestionActionAsync(dto);
            if (!result.IsSuccess)
            {
                var message = result.Message ?? "Support question update failed.";
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
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _supportQuestionAction.DeleteSupportQuestionActionAsync(id);
            if (!result.IsSuccess) return NotFound(result.Message);
            return NoContent();
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    private IActionResult DatabaseError()
        => StatusCode(StatusCodes.Status500InternalServerError, "Database error.");
}
