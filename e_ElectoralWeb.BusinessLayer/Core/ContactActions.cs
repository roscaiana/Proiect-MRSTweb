using System.Net;
using System.Net.Mail;
using e_ElectoralWeb.Domain.Models.Contact;
using e_ElectoralWeb.Domain.Models.Responses;
using Microsoft.Extensions.Configuration;

namespace e_ElectoralWeb.BusinessLayer.Core;

public class ContactActions
{
    private sealed class MailSettings
    {
        public string SenderEmail { get; init; } = string.Empty;
        public string SenderName { get; init; } = string.Empty;
        public string RecipientEmail { get; init; } = string.Empty;
        public string SmtpHost { get; init; } = string.Empty;
        public int SmtpPort { get; init; }
        public string SmtpUsername { get; init; } = string.Empty;
        public string SmtpPassword { get; init; } = string.Empty;
        public bool EnableSsl { get; init; }
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        return new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
            .AddUserSecrets<ContactActions>(optional: true)
            .AddEnvironmentVariables()
            .Build();
    }

    private static MailSettings ReadMailSettings()
    {
        var configuration = BuildConfiguration();

        var senderEmail = configuration["MailSettings:SenderEmail"] ?? string.Empty;
        var senderName = configuration["MailSettings:SenderName"] ?? "e-Electoral";
        var recipientEmail = configuration["MailSettings:RecipientEmail"] ?? string.Empty;
        var smtpHost = configuration["MailSettings:SmtpHost"] ?? string.Empty;
        var smtpUsername = configuration["MailSettings:SmtpUsername"] ?? string.Empty;
        var smtpPassword = configuration["MailSettings:SmtpPassword"] ?? string.Empty;
        var enableSsl = bool.TryParse(configuration["MailSettings:EnableSsl"], out var parsedSsl) && parsedSsl;

        if (!int.TryParse(configuration["MailSettings:SmtpPort"], out var smtpPort))
        {
            smtpPort = 587;
        }

        return new MailSettings
        {
            SenderEmail = senderEmail,
            SenderName = senderName,
            RecipientEmail = recipientEmail,
            SmtpHost = smtpHost,
            SmtpPort = smtpPort,
            SmtpUsername = smtpUsername,
            SmtpPassword = smtpPassword,
            EnableSsl = enableSsl
        };
    }

    internal async Task<ActionResponce> SendContactMessageExecutionAsync(ContactMessageDto data)
    {
        if (string.IsNullOrWhiteSpace(data.Name) ||
            string.IsNullOrWhiteSpace(data.Email) ||
            string.IsNullOrWhiteSpace(data.Subject) ||
            string.IsNullOrWhiteSpace(data.Message))
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "All contact fields are required."
            };
        }

        var mailSettings = ReadMailSettings();

        if (string.IsNullOrWhiteSpace(mailSettings.SenderEmail) ||
            string.IsNullOrWhiteSpace(mailSettings.RecipientEmail) ||
            string.IsNullOrWhiteSpace(mailSettings.SmtpHost) ||
            string.IsNullOrWhiteSpace(mailSettings.SmtpUsername) ||
            string.IsNullOrWhiteSpace(mailSettings.SmtpPassword) ||
            string.Equals(mailSettings.SmtpPassword, "ADD_GMAIL_APP_PASSWORD_HERE", StringComparison.Ordinal))
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = "Mail settings are incomplete. Add the Gmail App Password through user-secrets before sending real emails."
            };
        }

        var subject = $"[e-Electoral Contact] {data.Subject.Trim()}";
        var body = $"""
                    Nume: {data.Name.Trim()}
                    Email: {data.Email.Trim()}

                    Mesaj:
                    {data.Message.Trim()}
                    """;

        using var message = new MailMessage
        {
            From = new MailAddress(mailSettings.SenderEmail, mailSettings.SenderName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        message.To.Add(mailSettings.RecipientEmail);
        message.ReplyToList.Add(new MailAddress(data.Email.Trim(), data.Name.Trim()));

        using var smtpClient = new SmtpClient(mailSettings.SmtpHost, mailSettings.SmtpPort)
        {
            EnableSsl = mailSettings.EnableSsl,
            Credentials = new NetworkCredential(mailSettings.SmtpUsername, mailSettings.SmtpPassword)
        };

        try
        {
            await smtpClient.SendMailAsync(message);

            return new ActionResponce
            {
                IsSuccess = true,
                Message = "Contact message sent successfully."
            };
        }
        catch (Exception ex)
        {
            return new ActionResponce
            {
                IsSuccess = false,
                Message = $"Contact message could not be sent. {ex.Message}"
            };
        }
    }
}
