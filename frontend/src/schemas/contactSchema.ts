import { z } from 'zod';

export const contactSchema = z.object({
    name: z.string().trim().min(1, 'Numele este obligatoriu'),
    email: z.string().trim().min(1, 'Email-ul este obligatoriu').email('Adresa de email este invalidă'),
    subject: z.string().trim().min(1, 'Subiectul este obligatoriu'),
    message: z.string().trim().min(10, 'Mesajul trebuie să de minim 10 caractere'),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

