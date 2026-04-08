using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.User;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserLoginAction _userAction;
        private readonly IUserRegAction _userReg;

        public AuthController()
        {
            var bl = new BusinessLogic();
            _userAction = bl.UserLoginAction();
            _userReg = bl.UserRegAction();
        }

        [HttpPost]
        public IActionResult Auth([FromBody] UserLoginDto udata)
        {
            var data = _userAction.UserLoginDataValidation(udata);
            return Ok(data);
        }

        [HttpGet("getAll")]
        public IActionResult GetAllUsers()
        {
            var users = _userReg.GetAllUsersAction();
            return Ok(users);
        }

        [HttpGet]
        public IActionResult GetUserById([FromQuery] int id)
        {
            var user = _userReg.GetUserByIdAction(id);
            return Ok(user);
        }

        [HttpPut]
        public IActionResult UpdateUser([FromBody] UserDto data)
        {
            var result = _userReg.UpdateUserAction(data);
            return Ok(result);
        }

        [HttpDelete]
        public IActionResult DeleteUser([FromQuery] int id)
        {
            var result = _userReg.DeleteUserAction(id);
            return Ok(result);
        }
    }
}
