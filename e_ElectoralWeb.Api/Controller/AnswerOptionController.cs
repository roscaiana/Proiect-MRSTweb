using e_ElectoralWeb.BusinessLayer;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.AnswerOption;
using Microsoft.AspNetCore.Mvc;

namespace e_ElectoralWeb.Api.Controller
{
    [ApiController]
    [Route("api/answeroption")]
    public class AnswerOptionController : ControllerBase
    {
        private readonly IAnswerOptionAction _answerOptionAction;

        public AnswerOptionController()
        {
            var bl = new BusinessLogic();
            _answerOptionAction = bl.AnswerOptionAction();
        }

        [HttpGet("getAll")]
        public IActionResult GetAll()
        {
            var data = _answerOptionAction.GetAllAnswerOptionsAction();
            return Ok(data);
        }

        [HttpGet]
        public IActionResult GetById([FromQuery] int id)
        {
            var result = _answerOptionAction.GetAnswerOptionByIdAction(id);
            return Ok(result);
        }

        [HttpGet("byQuestion")]
        public IActionResult GetByQuestion([FromQuery] int questionId)
        {
            var result = _answerOptionAction.GetAnswerOptionsByQuestionAction(questionId);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] AnswerOptionDto answerOption)
        {
            var result = _answerOptionAction.CreateAnswerOptionAction(answerOption);
            return Ok(result);
        }

        [HttpPut]
        public IActionResult Update([FromBody] AnswerOptionDto answerOption)
        {
            var result = _answerOptionAction.UpdateAnswerOptionAction(answerOption);
            return Ok(result);
        }

        [HttpDelete]
        public IActionResult Delete([FromQuery] int id)
        {
            var result = _answerOptionAction.DeleteAnswerOptionAction(id);
            return Ok(result);
        }
    }
}
