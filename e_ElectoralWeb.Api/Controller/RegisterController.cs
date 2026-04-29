using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.User;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
   [Route("api/reg")]
    [ApiController]
    public class RegisterController : ControllerBase
    {
        private readonly IUserRegAction _userReg;

        public RegisterController()
        {
            var bl = new BusinessLogic();
            _userReg = bl.UserRegAction();
        }

        [HttpGet("getAll")]
        public IActionResult GetAll()
        {
            var users = _userReg.GetAllUsersAction();
            return Ok(users);
        }

        [HttpGet]
        public IActionResult GetById([FromQuery] int id)
        {
            var user = _userReg.GetUserByIdAction(id);
            return Ok(user);
        }

        [HttpPost]
        public IActionResult Register([FromBody] UserRegisterDto uRegData)
        {
            var data = _userReg.UserRegDataValidation(uRegData);
            return Ok(data);
        }

        [HttpPut]
        public IActionResult Update([FromBody] UserDto data)
        {
            var result = _userReg.UpdateUserAction(data);
            return Ok(result);
        }

        [HttpDelete]
        public IActionResult Delete([FromQuery] int id)
        {
            var result = _userReg.DeleteUserAction(id);
            return Ok(result);
        }
    }
}
