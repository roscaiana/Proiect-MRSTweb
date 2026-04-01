namespace e_ElectoralWeb.Domain.Models.Service;

public class ServiceResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public object? Data { get; set; }
    
}