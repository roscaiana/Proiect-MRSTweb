using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.User;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IUserRegAction
    {
        ActionResponce UserRegDataValidation(UserRegisterDto uReg);
        List<UserDto> GetAllUsersAction();
        UserDto? GetUserByIdAction(int id);
        ActionResponce UpdateUserAction(UserDto data);
        ActionResponce DeleteUserAction(int id);
    }
}
