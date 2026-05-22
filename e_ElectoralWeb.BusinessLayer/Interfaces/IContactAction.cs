using e_ElectoralWeb.Domain.Models.Contact;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Interfaces;

public interface IContactAction
{
    Task<ActionResponce> SendContactMessageAsync(ContactMessageDto data);
}
