using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.User;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class UserRegActionExecution : UserDbActions, IUserRegAction
    {
        public UserRegActionExecution(QuizDbContext context) : base(context)
        {
        }

        public ActionResponce UserRegDataValidation(UserRegisterDto uReg)
        {
            return UserRegDataValidationAction(uReg);
        }

        public List<UserDto> GetAllUsersAction()
        {
            return GetAllUsersActionExecution();
        }

        public UserDto? GetUserByIdAction(int id)
        {
            return GetUserByIdActionExecution(id);
        }

    public ActionResponce UpdateUserAction(UserDto data)
    {
        return UpdateUserActionExecution(data);
    }

    public ActionResponce UpdateOwnProfileAction(int userId, UserProfileUpdateDto data)
    {
        return UpdateOwnProfileActionExecution(userId, data);
    }

    public ActionResponce ToggleUserBlockedAction(int id)
    {
        return ToggleUserBlockedActionExecution(id);
    }

    public ActionResponce DeleteUserAction(int id)
    {
        return DeleteUserActionExecution(id);
    }
}
}
