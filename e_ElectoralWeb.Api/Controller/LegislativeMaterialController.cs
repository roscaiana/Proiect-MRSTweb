using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.LegislativeMaterial;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller;

[Route("api/legislativematerials")]
[ApiController]
public class LegislativeMaterialController : ControllerBase
{
    private readonly ILegislativeMaterialAction _legislativeMaterialAction;

    public LegislativeMaterialController(BusinessLogic bl)
    {
        _legislativeMaterialAction = bl.LegislativeMaterialAction();
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPublished()
    {
        try
        {
            var result = await _legislativeMaterialAction.GetPublishedLegislativeMaterialsActionAsync();
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
            var result = await _legislativeMaterialAction.GetAllLegislativeMaterialsActionAsync();
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
            var result = await _legislativeMaterialAction.GetLegislativeMaterialByIdActionAsync(id);
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
    public async Task<IActionResult> Create([FromBody] LegislativeMaterialDto dto)
    {
        try
        {
            var result = await _legislativeMaterialAction.CreateLegislativeMaterialActionAsync(dto);
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
    public async Task<IActionResult> Update(int id, [FromBody] LegislativeMaterialDto dto)
    {
        try
        {
            dto.Id = id;
            var result = await _legislativeMaterialAction.UpdateLegislativeMaterialActionAsync(dto);
            if (!result.IsSuccess)
            {
                var message = result.Message ?? "Legislative material update failed.";
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
            var result = await _legislativeMaterialAction.DeleteLegislativeMaterialActionAsync(id);
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
