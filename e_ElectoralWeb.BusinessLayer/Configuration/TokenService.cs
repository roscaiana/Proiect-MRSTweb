
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace e_ElectoralWeb.BusinessLayer.Configuration
{
    public class TokenService
    {
        public TokenService() { }

        public string GenerateToken()
        {
            // Implement token generation logic here
            return Guid.NewGuid().ToString(); // Example token generation using GUID
        }
    }
}