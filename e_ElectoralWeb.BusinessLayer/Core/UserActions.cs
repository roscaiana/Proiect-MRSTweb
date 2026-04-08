using e_ElectoralWeb.BusinessLayer.Configuration;
using e_ElectoralWeb.DataAccessLayer.Context;
using e_ElectoralWeb.Domain.Entities.User;
using e_ElectoralWeb.Domain.Models.Responses;
using e_ElectoralWeb.Domain.Models.User;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class UserDbActions
{
    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static (string FirstName, string LastName) SplitFullName(string fullName)
    {
        var parts = fullName
            .Trim()
            .Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);

        var firstName = parts.Length > 0 ? parts[0] : string.Empty;
        var lastName = parts.Length > 1 ? parts[1] : string.Empty;

        if (firstName.Length > 30)
        {
            firstName = firstName[..30];
        }

        if (lastName.Length > 30)
        {
            lastName = lastName[..30];
        }

        return (firstName, lastName);
    }

    private static UserDto MapToDto(UserData user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Email = user.Email,
            UserName = user.UserName,
            Phone = user.Phone,
            Role = user.Role.ToString(),
            RegisteredOn = user.RegisteredOn,
            Password = string.Empty,
            ConfirmPassword = string.Empty
        };
    }

    private static string BuildUniqueUserName(UserContext db, string email, int? excludeUserId = null)
    {
        var baseName = email.Split('@')[0].Trim();
        if (string.IsNullOrWhiteSpace(baseName))
        {
            baseName = "user";
        }

        if (baseName.Length < 4)
        {
            baseName = baseName.PadRight(4, '0');
        }

        if (baseName.Length > 30)
        {
            baseName = baseName[..30];
        }

        var candidate = baseName;
        var suffix = 1;

        while (db.Users.Any(u => u.UserName == candidate && (!excludeUserId.HasValue || u.Id != excludeUserId.Value)))
        {
            var suffixText = suffix.ToString();
            var maxBaseLength = 30 - suffixText.Length;
            var trimmedBase = baseName.Length > maxBaseLength ? baseName[..maxBaseLength] : baseName;
            candidate = $"{trimmedBase}{suffixText}";
            suffix++;
        }

        return candidate;
    }

    internal UserDto? UserLoginDataValidationExecution(UserLoginDto udata)
    {
        if (string.IsNullOrWhiteSpace(udata.Email) || string.IsNullOrWhiteSpace(udata.Password))
        {
            return null;
        }

        var email = NormalizeEmail(udata.Email);

        using var db = new UserContext();
        var user = db.Users.FirstOrDefault(x =>
            x.Email.ToLower() == email &&
            x.Password == udata.Password);

        return user == null ? null : MapToDto(user);
    }

    internal string UserTokenGeneration()
    {
        var token = new TokenService();
        return token.GenerateToken();
    }

    internal ActionResponce UserRegDataValidationAction(UserRegisterDto uReg)
    {
        if (string.IsNullOrWhiteSpace(uReg.FullName))
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "Full name is required."
            };
        }

        if (string.IsNullOrWhiteSpace(uReg.Email))
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "Email is required."
            };
        }

        if (string.IsNullOrWhiteSpace(uReg.Password))
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "Password is required."
            };
        }

        if (uReg.Password.Length < 6)
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "Password must have at least 6 characters."
            };
        }

        if (uReg.Password != uReg.ConfirmPassword)
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "Password and confirm password do not match."
            };
        }

        var normalizedEmail = NormalizeEmail(uReg.Email);
        var (firstName, lastName) = SplitFullName(uReg.FullName);
        if (string.IsNullOrWhiteSpace(firstName))
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "A valid full name is required."
            };
        }

        using var db = new UserContext();
        var existingUser = db.Users.FirstOrDefault(x => x.Email.ToLower() == normalizedEmail);
        if (existingUser != null)
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "Email already exists."
            };
        }

        var user = new UserData
        {
            FirstName = firstName,
            LastName = lastName,
            Email = normalizedEmail,
            Password = uReg.Password,
            UserName = BuildUniqueUserName(db, normalizedEmail),
            Phone = string.Empty,
            Role = UserRole.User,
            RegisteredOn = DateTime.UtcNow
        };

        db.Users.Add(user);
        db.SaveChanges();

        return new ActionResponce
        {
            IsSuccess = true,
            Message = "User registration successful."
        };
    }

    internal List<UserDto> GetAllUsersActionExecution()
    {
        using var db = new UserContext();
        return db.Users
            .OrderByDescending(u => u.RegisteredOn)
            .ToList()
            .Select(MapToDto)
            .ToList();
    }

    internal UserDto? GetUserByIdActionExecution(int id)
    {
        using var db = new UserContext();
        var user = db.Users.FirstOrDefault(u => u.Id == id);
        return user == null ? null : MapToDto(user);
    }

    internal ActionResponce UpdateUserActionExecution(UserDto data)
    {
        if (data.Id <= 0)
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "User id is required."
            };
        }

        using var db = new UserContext();
        var user = db.Users.FirstOrDefault(u => u.Id == data.Id);
        if (user == null)
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "User not found."
            };
        }

        if (!string.IsNullOrWhiteSpace(data.FullName))
        {
            var (firstName, lastName) = SplitFullName(data.FullName);
            if (string.IsNullOrWhiteSpace(firstName))
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "A valid full name is required."
                };
            }

            user.FirstName = firstName;
            user.LastName = lastName;
        }

        if (!string.IsNullOrWhiteSpace(data.Email))
        {
            var normalizedEmail = NormalizeEmail(data.Email);
            var emailUsed = db.Users.Any(u => u.Id != data.Id && u.Email.ToLower() == normalizedEmail);
            if (emailUsed)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Email already exists."
                };
            }

            user.Email = normalizedEmail;
        }

        if (!string.IsNullOrWhiteSpace(data.UserName))
        {
            var userName = data.UserName.Trim();
            if (userName.Length < 4 || userName.Length > 30)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Username must have between 4 and 30 characters."
                };
            }

            var userNameUsed = db.Users.Any(u => u.Id != data.Id && u.UserName == userName);
            if (userNameUsed)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Username already exists."
                };
            }

            user.UserName = userName;
        }
        else if (string.IsNullOrWhiteSpace(user.UserName))
        {
            user.UserName = BuildUniqueUserName(db, user.Email, user.Id);
        }

        if (!string.IsNullOrWhiteSpace(data.Phone))
        {
            var phone = data.Phone.Trim();
            if (phone.Length > 12)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Phone number is too long."
                };
            }

            user.Phone = phone;
        }

        if (!string.IsNullOrWhiteSpace(data.Role))
        {
            var roleParsed = Enum.TryParse<UserRole>(data.Role, true, out var role);
            if (!roleParsed)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Invalid role."
                };
            }

            user.Role = role;
        }

        if (!string.IsNullOrWhiteSpace(data.Password) || !string.IsNullOrWhiteSpace(data.ConfirmPassword))
        {
            if (data.Password != data.ConfirmPassword)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Password and confirm password do not match."
                };
            }

            if (string.IsNullOrWhiteSpace(data.Password) || data.Password.Length < 6)
            {
                return new ActionResponce
                {
                    IsSuccess = false,
                    Message = "Password must have at least 6 characters."
                };
            }

            user.Password = data.Password;
        }

        db.Users.Update(user);
        db.SaveChanges();

        return new ActionResponce
        {
            IsSuccess = true,
            Message = "User updated."
        };
    }

    internal ActionResponce DeleteUserActionExecution(int id)
    {
        using var db = new UserContext();
        var user = db.Users.FirstOrDefault(u => u.Id == id);
        if (user == null)
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "User not found."
            };
        }

        db.Users.Remove(user);
        db.SaveChanges();

        return new ActionResponce
        {
            IsSuccess = true,
            Message = "User deleted."
        };
    }
}
