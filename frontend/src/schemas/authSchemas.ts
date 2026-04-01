import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().trim().min(1, 'Email-ul este obligatoriu').email('Format de email invalid'),
    password: z.string().min(1, 'Parola este obligatorie'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        fullName: z.string().trim().min(3, 'Numele trebuie să conțină cel puțin 3 caractere'),
        email: z
            .string()
            .trim()
            .min(1, 'Email-ul este obligatoriu')
            .email('Format de email invalid (ex: utilizator@exemplu.com)'),
        password: z.string().min(6, 'Parola trebuie să conțină cel puțin 6 caractere'),
        confirmPassword: z.string().min(1, 'Confirmarea parolei este obligatorie'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Parolele nu coincid',
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;

