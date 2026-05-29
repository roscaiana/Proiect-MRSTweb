namespace e_ElectoralWeb.Domain.Models.User;

public class UserProfileUpdateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Nickname { get; set; }
    public string? AvatarDataUrl { get; set; }
}
