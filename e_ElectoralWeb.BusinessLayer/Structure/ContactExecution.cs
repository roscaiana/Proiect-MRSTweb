using e_ElectoralWeb.BusinessLayer.Core;
using e_ElectoralWeb.BusinessLayer.Interfaces;
using e_ElectoralWeb.Domain.Models.Contact;
using e_ElectoralWeb.Domain.Models.Responses;

namespace e_ElectoralWeb.BusinessLayer.Structure;

public class ContactExecution : ContactActions, IContactAction
{
    public Task<ActionResponce> SendContactMessageAsync(ContactMessageDto data)
    {
        return SendContactMessageExecutionAsync(data);
    }
}
