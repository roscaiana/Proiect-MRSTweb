using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.ExamSettings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller;

[Route("api/examsettings")]
[ApiController]
public class ExamSettingsController : ControllerBase
{
    private readonly IExamSettingsAction _examSettings;

    public ExamSettingsController()
    {
        var bl = new BusinessLogic();
        _examSettings = bl.ExamSettingsAction();
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var result = await _examSettings.GetAsync();
            return Ok(result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ExamSettingsDto dto)
    {
        try
        {
            var result = await _examSettings.UpdateAsync(dto);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    private IActionResult DatabaseError()
        => StatusCode(StatusCodes.Status500InternalServerError, "Database error.");
}
