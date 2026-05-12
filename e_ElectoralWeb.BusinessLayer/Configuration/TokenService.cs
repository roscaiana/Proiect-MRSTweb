using e_ElectoralWeb.Domain.Entities.User;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace e_ElectoralWeb.BusinessLayer.Configuration;

public class TokenService
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly string _secretKey;
    private readonly int _expireMinutes;

    public TokenService()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
            .Build();

        _issuer = configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer is missing.");
        _audience = configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience is missing.");
        _secretKey = configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("Jwt:SecretKey is missing.");

        if (!int.TryParse(configuration["Jwt:ExpireMinutes"], out _expireMinutes))
        {
            throw new InvalidOperationException("Jwt:ExpireMinutes is invalid.");
        }

        if (_secretKey.Length < 32)
        {
            throw new InvalidOperationException("Jwt:SecretKey must have at least 32 characters.");
        }
    }

    public string GenerateToken(UserData user)
    {
        var claims = new List<Claim>
        {
            new("userId", user.Id.ToString()),
            new("email", user.Email),
            new("username", user.UserName),
            new("role", user.Role.ToString()),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(ClaimTypes.Email, user.Email)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var signingCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var jwtToken = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expireMinutes),
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(jwtToken);
    }
}
