using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.User;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class UserAuthAction : UserDbActions, IUserLoginAction
    {
        public UserAuthAction() { }

        public object UserLoginDataValidation(UserLoginDto udata)
        {
            var user = UserLoginDataValidationExecution(udata);
            if (user != null)
            {
                var token = UserTokenGeneration();
                return new
                {
                    IsSuccess = true,
                    Token = token,
                    User = user
                };
            }

            return new
            {
                IsSuccess = false,
                Message = "Invalid credentials."
            };
        }
    }
}
