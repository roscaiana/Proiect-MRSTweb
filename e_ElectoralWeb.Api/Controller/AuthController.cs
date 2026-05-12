using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserLoginAction _userAction;
        private readonly IUserRegAction _userRegAction;

        public AuthController()
        {
            var bl = new BusinessLogic();
            _userAction = bl.UserLoginAction();
            _userRegAction = bl.UserRegAction();
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDto udata)
        {
            var data = _userAction.UserLoginDataValidation(udata);
            if (!data.IsSuccess)
            {
                return Unauthorized(data.Message);
            }

            return Ok(data);
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegisterDto uRegData)
        {
            var data = _userRegAction.UserRegDataValidation(uRegData);
            if (!data.IsSuccess)
            {
                return BadRequest(data.Message);
            }

            return StatusCode(StatusCodes.Status201Created, data);
        }
    }
}
