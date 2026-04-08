using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Responses;
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

        [HttpPost]
        [ProducesResponseType(typeof(ActionResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Register([FromBody] UserRegisterDto uRegData)
        {
            var data = _userReg.UserRegDataValidation(uRegData);
            return Ok(data);
        }
    }
}
