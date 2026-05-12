using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.User;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class UserAuthAction : UserDbActions, IUserLoginAction
    {
        public UserAuthAction() { }

        public ActionResponce UserLoginDataValidation(UserLoginDto udata)
        {
            var user = UserLoginDataValidationExecution(udata);
            if (user != null)
            {
                var token = UserTokenGeneration(user);
                return new ActionResponce
                {
                    IsSuccess = true,
                    Data = new AuthResponseDto
                    {
                        UserId = user.Id,
                        Email = user.Email,
                        UserName = user.UserName,
                        Role = user.Role.ToString(),
                        Token = token
                    }
                };
            }

            return new ActionResponce
            {
                IsSuccess = false,
                Message = "Invalid credentials."
            };
        }
    }
}
