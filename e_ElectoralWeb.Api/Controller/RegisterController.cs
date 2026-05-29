using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
   [Route("api/reg")]
    [ApiController]
    [Authorize]
    public class RegisterController : ControllerBase
    {
        private readonly IUserRegAction _userReg;

        public RegisterController()
        {
            var bl = new BusinessLogic();
            _userReg = bl.UserRegAction();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("getAll")]
        public IActionResult GetAll()
        {
            var users = _userReg.GetAllUsersAction();
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public IActionResult GetById([FromQuery] int id)
        {
            var user = _userReg.GetUserByIdAction(id);
            return Ok(user);
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Register([FromBody] UserRegisterDto uRegData)
        {
            var data = _userReg.UserRegDataValidation(uRegData);
            return Ok(data);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public IActionResult Update([FromBody] UserDto data)
        {
            var result = _userReg.UpdateUserAction(data);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/toggle-block")]
        public IActionResult ToggleBlock(int id)
        {
            var result = _userReg.ToggleUserBlockedAction(id);
            if (!result.IsSuccess)
            {
                return NotFound(result.Message);
            }

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete]
        public IActionResult Delete([FromQuery] int id)
        {
            var result = _userReg.DeleteUserAction(id);
            return Ok(result);
        }
    }
}
