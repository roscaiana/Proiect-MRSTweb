import { describe, it, expect } from 'vitest';
import {
    adminNewsSchema,
    adminNotificationSchema,
    adminSettingsSchema,
    testFormSchema,
} from '../schemas/adminSchemas';

describe('adminSchemas', () => {
    it('rejects missing admin news title', () => {
        const result = adminNewsSchema.safeParse({
            title: '',
            description: 'Descriere',
            category: 'Certificare',
            image: 'cert',
            publishedAt: '2026-01-01',
        });

        expect(result.success).toBe(false);
    });

    it('requires target email when sending email notification', () => {
        const result = adminNotificationSchema.safeParse({
            target: 'email',
            targetEmail: '',
            title: 'Titlu',
            message: 'Mesaj',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            const hasTargetEmailError = result.error.issues.some((issue) => issue.path[0] === 'targetEmail');
            expect(hasTargetEmailError).toBe(true);
        }
    });

    it('coerces admin settings numeric fields', () => {
        const result = adminSettingsSchema.safeParse({
            testDurationMinutes: '30',
            passingThreshold: '70',
            appointmentsPerDay: '10',
            appointmentLeadTimeHours: '24',
            maxReschedulesPerUser: '2',
            rejectionCooldownDays: '7',
            appointmentLocation: 'Chișinău',
            appointmentRoom: 'Sala 1',
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.testDurationMinutes).toBe(30);
            expect(result.data.passingThreshold).toBe(70);
        }
    });

    it('rejects invalid test questions', () => {
        const result = testFormSchema.safeParse({
            title: 'Test',
            description: '',
            durationMinutes: 30,
            passingScore: 70,
            questions: [
                {
                    id: 'q1',
                    text: 'Întrebare',
                    options: ['a', 'b', 'c', 'd'],
                    correctAnswer: 10,
                },
            ],
        });

        expect(result.success).toBe(false);
    });
});
