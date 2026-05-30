using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.News;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller;

[Route("api/news")]
[ApiController]
public class NewsController : ControllerBase
{
    private readonly INewsAction _news;

    public NewsController()
    {
        var bl = new BusinessLogic();
        _news = bl.NewsAction();
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var result = await _news.GetAllNewsActionAsync();
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
            var result = await _news.GetNewsByIdActionAsync(id);
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
    public async Task<IActionResult> Create([FromBody] NewsDto dto)
    {
        try
        {
            var result = await _news.CreateNewsActionAsync(dto);
            if (!result.IsSuccess) return BadRequest(result.Message);
            return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
        }
        catch (Exception)
        {
            return DatabaseError();
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] NewsDto dto)
    {
        try
        {
            dto.Id = id;
            var result = await _news.UpdateNewsActionAsync(dto);
            if (!result.IsSuccess)
            {
                var message = result.Message ?? "News update failed.";
                if (message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                    return NotFound(message);
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
            var result = await _news.DeleteNewsActionAsync(id);
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
