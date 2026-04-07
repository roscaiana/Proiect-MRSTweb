using e_ElectoralWeb.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnswerOptionController : ControllerBase
    {
        private readonly IAnswerOptionAction _answerOptionAction;

        public AnswerOptionController(IAnswerOptionAction answerOptionAction)
        {
            _answerOptionAction = answerOptionAction;
        }

        [HttpGet("getAll")]
        public IActionResult GetAll()
        {
            var data = _answerOptionAction.GetAllAnswerOptionsAction();
            return Ok(data);
        }
    }
}
