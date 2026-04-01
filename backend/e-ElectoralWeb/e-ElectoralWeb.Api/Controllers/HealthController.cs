using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controllers;
[ApiController,]
[Route("api/health")]
public class HealthController:ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Server is up to running!");
    }
}