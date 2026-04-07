using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using e_ElectoralWeb.Domain.Models.Question;
using e_ElectoralWeb.Domain.Models.Quiz;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IQuestionAction
    {
        List<QuestionInfoDto> GetAllQuestionsAction();
    }
}

