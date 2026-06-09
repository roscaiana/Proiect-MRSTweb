using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Models.ExamSettings;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class ExamSettingsExecution : ExamSettingsActions, IExamSettingsAction
{
    public ExamSettingsExecution(QuizDbContext context) : base(context)
    {
    }

    public Task<ExamSettingsDto> GetAsync()
        => GetActionExecutionAsync();

    public Task<ActionResponce> UpdateAsync(ExamSettingsDto dto)
        => UpdateActionExecutionAsync(dto);
}
