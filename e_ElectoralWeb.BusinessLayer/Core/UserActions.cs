using e_ElectoralWeb.BusinessLayer.Configuration;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.User;
using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.User;

namespace e_ElectoralWeb.BusinessLayer.Core
{
    public class UserDbActions
    {
        public UserDbActions() { }
        internal bool UserLoginDataValidationExecution(UserLoginDto udata)
        {
            UserData? user;
            using (var db = new UserContext())
            {
                user = db.Users.
                    FirstOrDefault(x => 
                        x.UserName == udata.CredentialType && 
                        x.Password == udata.Password);
            }

            if (user != null)
            {
                return true;
            }

            return false;
        }
        internal string UserTokenGeneration(UserLoginDto udata)
        {

            var token = new TokenService();

            var userToken = token.GenerateToken();

            return userToken;
        }
        internal ActionResponce UserRegDataValidationAction(UserRegisterDto uReg)
        {
            UserData? user;
            using (var db = new UserContext())
            {
                user = db.Users.
                    FirstOrDefault(x =>
                        x.Email == uReg.Email);
            }

            if (user != null)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Email already exists."
                };
            }


            user = new UserData
            {
                FirstName = uReg.FirstName,
                LastName = uReg.LastName,
                Email = uReg.Email,
                Password = uReg.Password,
                UserName = "uReg.UserName",
                Phone = "uReg.Phone",
                Role = UserRole.User,
                RegisteredOn = DateTime.Now
            };

            using (var db = new UserContext())
            {
                db.Users.Add(user);
                db.SaveChanges();
            }

            return new ActionResponce()
            {
                IsSuccess = true,
                Message = "User registration successful."
            };
        }

    }
}
