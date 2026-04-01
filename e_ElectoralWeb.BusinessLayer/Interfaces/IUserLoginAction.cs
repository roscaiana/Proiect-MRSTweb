using e_ElectoralWeb.Domain.Models.User;

namespace e_ElectoralWeb.BusinessLayer.Interfaces
{
    public interface IUserLoginAction
    {
        public object UserLoginDataValidation(UserLoginDto udata);
    }
}