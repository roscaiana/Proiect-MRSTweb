using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.User;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [Route("api/session")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserLoginAction _userAction;

        public AuthController()
        {
            var bl = new BusinessLogic();
            _userAction = bl.UserLoginAction();
        }

        [HttpPost("auth")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Auth([FromBody] UserLoginDto udata)
        {
            var data = _userAction.UserLoginDataValidation(udata);
            return Ok(data);
        }
    }
}
