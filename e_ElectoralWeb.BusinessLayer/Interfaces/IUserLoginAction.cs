using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.User;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface IUserLoginAction
{
    ActionResponce UserLoginDataValidation(UserLoginDto udata);
}
