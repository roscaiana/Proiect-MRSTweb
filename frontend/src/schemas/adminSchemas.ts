import { z } from 'zod';

export const adminNewsSchema = z.object({
    title: z.string().trim().min(1, 'Titlul este obligatoriu.'),
    description: z.string().trim().min(1, 'Descrierea este obligatorie.'),
    category: z.string().min(1, 'Categoria este obligatorie.'),
    image: z.string().min(1, 'Pictograma este obligatorie.'),
    publishedAt: z.string().min(1, 'Data publicării este obligatorie.'),
});

export type AdminNewsFormValues = z.infer<typeof adminNewsSchema>;

export const adminNotificationSchema = z
    .object({
        target: z.enum(['all', 'users', 'admins', 'email']),
        targetEmail: z.string().trim().optional().or(z.literal('')),
        title: z.string().trim().min(1, 'Completează titlul notificării.'),
        message: z.string().trim().min(1, 'Completează mesajul notificării.'),
    })
    .superRefine((data, ctx) => {
        if (data.target === 'email' && !data.targetEmail?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['targetEmail'],
                message: 'Adaugă emailul destinatarului.',
            });
        }
    });

export type AdminNotificationFormValues = z.infer<typeof adminNotificationSchema>;

export const adminSettingsSchema = z.object({
    testDurationMinutes: z
        .coerce
        .number()
        .int()
        .min(1, 'Durata testului trebuie să fie între 1 și 180 minute.')
        .max(180, 'Durata testului trebuie să fie între 1 și 180 minute.'),
    passingThreshold: z
        .coerce
        .number()
        .int()
        .min(1, 'Pragul de promovare trebuie să fie între 1 și 100.')
        .max(100, 'Pragul de promovare trebuie să fie între 1 și 100.'),
    appointmentsPerDay: z
        .coerce
        .number()
        .int()
        .min(1, 'Programările pe zi trebuie să fie între 1 și 500.')
        .max(500, 'Programările pe zi trebuie să fie între 1 și 500.'),
    appointmentLeadTimeHours: z
        .coerce
        .number()
        .int()
        .min(0, 'Lead time programare trebuie să fie între 0 și 720 ore.')
        .max(720, 'Lead time programare trebuie să fie între 0 și 720 ore.'),
    maxReschedulesPerUser: z
        .coerce
        .number()
        .int()
        .min(0, 'Max reprogramări per utilizator trebuie să fie între 0 și 20.')
        .max(20, 'Max reprogramări per utilizator trebuie să fie între 0 și 20.'),
    rejectionCooldownDays: z
        .coerce
        .number()
        .int()
        .min(0, 'Cooldown după respingere trebuie să fie între 0 și 365 zile.')
        .max(365, 'Cooldown după respingere trebuie să fie între 0 și 365 zile.'),
    appointmentLocation: z.string(),
    appointmentRoom: z.string(),
});

export type AdminSettingsFormValues = z.infer<typeof adminSettingsSchema>;

const questionSchema = z
    .object({
        id: z.string().optional(),
        text: z.string().trim().min(1, 'Întrebarea trebuie să aibă text completat.'),
        options: z.array(z.string().trim().min(1, 'Completează toate opțiunile.')).length(4, 'Sunt necesare 4 opțiuni.'),
        correctAnswer: z.coerce.number().int().min(0, 'Selectează varianta corectă.'),
    })
    .superRefine((question, ctx) => {
        if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
            ctx.addIssue({
                path: ['correctAnswer'],
                code: z.ZodIssueCode.custom,
                message: 'Selectează varianta corectă.',
            });
        }
    });

export const testFormSchema = z.object({
    title: z.string().trim().min(1, 'Titlul testului este obligatoriu.'),
    description: z.string(),
    durationMinutes: z
        .coerce
        .number()
        .int()
        .min(1, 'Durata testului trebuie să fie între 1 și 180 minute.')
        .max(180, 'Durata testului trebuie să fie între 1 și 180 minute.'),
    passingScore: z
        .coerce
        .number()
        .int()
        .min(1, 'Pragul de promovare trebuie să fie între 1 și 100.')
        .max(100, 'Pragul de promovare trebuie să fie între 1 și 100.'),
    questions: z.array(questionSchema).min(1, 'Adaugă cel puțin o întrebare.'),
});

export type TestFormValues = z.infer<typeof testFormSchema>;
