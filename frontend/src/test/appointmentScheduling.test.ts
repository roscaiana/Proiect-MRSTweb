import { describe, expect, it } from 'vitest';
import type { AdminAppointmentRecord, ExamSettings } from '../features/admin/types';
import { buildAvailableSlotsForDate } from '../utils/appointmentScheduling';

const baseSettings: ExamSettings = {
    testQuestionCount: 30,
    testDurationMinutes: 30,
    passingThreshold: 70,
    appointmentsPerDay: 30,
    appointmentLeadTimeHours: 0,
    maxReschedulesPerUser: 1,
    rejectionCooldownDays: 0,
    appointmentLocation: 'CICDE',
    appointmentRoom: 'Sala 1',
    allowedWeekdays: [1, 2, 3, 4, 5],
    blockedDates: [],
    capacityOverrides: [],
    slotOverrides: [],
};

const appointment: AdminAppointmentRecord = {
    id: 'appointment-1',
    fullName: 'Test User',
    idOrPhone: '+37360000000',
    date: '2026-05-25',
    slotStart: '12:00',
    slotEnd: '12:30',
    status: 'pending',
    createdAt: '2026-05-22T10:00:00.000Z',
};

describe('appointmentScheduling', () => {
    it('keeps a used interval available while the daily capacity still has free places', () => {
        const slots = buildAvailableSlotsForDate(baseSettings, [appointment], '2026-05-25');

        expect(slots.find((slot) => slot.id === 'slot1')?.available).toBe(true);
    });

    it('closes all intervals when the daily capacity is reached', () => {
        const fullDayAppointments = Array.from({ length: 30 }, (_, index) => ({
            ...appointment,
            id: `appointment-${index + 1}`,
        }));

        const slots = buildAvailableSlotsForDate(baseSettings, fullDayAppointments, '2026-05-25');

        expect(slots.every((slot) => !slot.available)).toBe(true);
    });
});
