import { z } from 'zod';
import type { User } from '../types/user';

const PHONE_REGEX = /^[0-9+\s()-]{6,20}$/;

const normalizeComparableEmail = (value: string): string => value.trim().toLowerCase();
const optionalTrimmedString = z.string().trim().optional().or(z.literal(''));

const baseUpdateProfileSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, 'Numele este obligatoriu')
        .min(3, 'Numele trebuie să conțină cel puțin 3 caractere'),
    nickname: optionalTrimmedString,
    email: z.string().trim().min(1, 'Email-ul este obligatoriu').email('Format de email invalid'),
    phoneNumber: optionalTrimmedString.refine((value) => !value || PHONE_REGEX.test(value), {
        message: 'Număr de telefon invalid',
    }),
    avatarDataUrl: optionalTrimmedString,
});

export type UpdateProfileFormValues = z.infer<typeof baseUpdateProfileSchema>;

export const buildUpdateProfileSchema = (currentEmail: string, users: User[], reservedEmail?: string) =>
    baseUpdateProfileSchema.superRefine((data, ctx) => {
        const normalizedEmail = normalizeComparableEmail(data.email);
        const normalizedCurrentEmail = normalizeComparableEmail(currentEmail);
        const normalizedReserved = reservedEmail ? normalizeComparableEmail(reservedEmail) : null;

        if (normalizedReserved && normalizedEmail === normalizedReserved && normalizedCurrentEmail !== normalizedReserved) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: 'Acest email este rezervat' });
        }

        const duplicate = users.find(
            (candidate) =>
                normalizeComparableEmail(candidate.email) === normalizedEmail &&
                normalizeComparableEmail(candidate.email) !== normalizedCurrentEmail
        );

        if (duplicate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['email'],
                message: 'Acest email este deja utilizat de alt cont',
            });
        }
    });
