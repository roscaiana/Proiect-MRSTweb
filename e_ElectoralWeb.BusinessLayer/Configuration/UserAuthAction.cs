using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

            var isValid = UserLoginDataValidationExecution(udata);
            if (isValid)
            {
                var token = UserTokenGeneration(udata);
                return new
                {
                    IsSuccess = true,
                    Token = token
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
