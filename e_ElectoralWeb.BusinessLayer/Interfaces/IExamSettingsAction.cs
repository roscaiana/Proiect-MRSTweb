using e_ElectoralWeb.Domain.Models.ExamSettings;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface IExamSettingsAction
{
    Task<ExamSettingsDto> GetAsync();
    Task<ActionResponce> UpdateAsync(ExamSettingsDto dto);
}
