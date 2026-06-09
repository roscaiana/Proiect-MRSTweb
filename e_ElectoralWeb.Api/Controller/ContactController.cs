using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Contact;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller;

[Route("api/contact")]
[ApiController]
public class ContactController : ControllerBase
{
    private readonly IContactAction _contactAction;

    public ContactController(BusinessLogic bl)
    {
        _contactAction = bl.ContactAction();
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] ContactMessageDto data)
    {
        var result = await _contactAction.SendContactMessageAsync(data);
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
