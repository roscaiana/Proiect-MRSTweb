using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace e_ElectoralWeb.Domain.Models.User
{
    public class UserLoginDto
    {
        public string CredentialType { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
