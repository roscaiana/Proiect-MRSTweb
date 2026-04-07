using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.User;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class UserRegActionExecution : UserDbActions, IUserRegAction
    {
        public ActionResponse UserRegDataValidation(UserRegisterDto uReg)
        {
            return UserRegDataValidationAction(uReg);
        }
    }
}