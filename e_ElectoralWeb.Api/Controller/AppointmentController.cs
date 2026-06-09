using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Appointment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace e_ElectoralWeb.Api.Controller;

[ApiController]
[Route("api/appointment")]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentAction _appointmentAction;

    public AppointmentController(BusinessLogic bl)
    {
        _appointmentAction = bl.AppointmentAction();
    }

    [Authorize(Roles = "User,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AppointmentCreateDto dto)
    {
        try
        {
            var result = await _appointmentAction.CreateAppointmentAsync(dto);
            if (!result.IsSuccess) return BadRequest(result);
            return Created(string.Empty, result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var results = await _appointmentAction.GetAllAppointmentsAsync();
            return Ok(results);
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
            var results = await _appointmentAction.GetAppointmentsByUserAsync(userId);
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
            var result = await _appointmentAction.GetAppointmentByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] AppointmentStatusUpdateDto dto)
    {
        try
        {
            var result = await _appointmentAction.UpdateAppointmentStatusAsync(id, dto);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AppointmentDto dto)
    {
        try
        {
            var result = await _appointmentAction.UpdateAppointmentAsync(id, dto);
            if (!result.IsSuccess) return BadRequest(result);
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
