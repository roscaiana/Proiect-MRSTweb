import { describe, it, expect } from 'vitest';
import {
    buildAppointmentSchema,
    type AppointmentValidationContext,
    type AppointmentFormValues,
} from '../schemas/appointmentSchema';
import type { ExamSettings } from '../features/admin/types';
import type { TimeSlot } from '../types/appointment';

const baseSettings: ExamSettings = {
    testDurationMinutes: 30,
    passingThreshold: 70,
    appointmentsPerDay: 10,
    appointmentLeadTimeHours: 0,
    maxReschedulesPerUser: 2,
    rejectionCooldownDays: 0,
    appointmentLocation: 'Chișinău',
    appointmentRoom: 'Sala 1',
    allowedWeekdays: [0, 1, 2, 3, 4, 5, 6],
    blockedDates: [],
    capacityOverrides: [],
    slotOverrides: [],
};

const baseSlot: TimeSlot = {
    id: 'slot-1',
    startTime: '09:00',
    endTime: '09:30',
    available: true,
};

const baseContext: AppointmentValidationContext = {
    examSettings: baseSettings,
    appointments: [],
    rescheduleSourceId: null,
    allowedWeekdayNames: 'orice zi',
    activeUserAppointments: [],
    userAppointments: [],
    lastRejectedUserAppointment: null,
    allAvailableSlots: [baseSlot],
    lastUnavailableSlotId: null,
};

const validData: AppointmentFormValues = {
    fullName: 'Ion Popescu',
    idOrPhone: '+37312345678',
    selectedDate: new Date('2030-01-10T10:00:00Z'),
    selectedSlot: baseSlot,
};

describe('appointmentSchema', () => {
    it('requires a selected date', () => {
        const schema = buildAppointmentSchema(baseContext);
        const result = schema.safeParse({ ...validData, selectedDate: null });

        expect(result.success).toBe(false);
        if (!result.success) {
            const hasDateError = result.error.issues.some((issue) => issue.path[0] === 'selectedDate');
            expect(hasDateError).toBe(true);
        }
    });

    it('accepts a valid appointment payload', () => {
        const schema = buildAppointmentSchema(baseContext);
        const result = schema.safeParse(validData);

        expect(result.success).toBe(true);
    });

    it('rejects unavailable slots', () => {
        const schema = buildAppointmentSchema({
            ...baseContext,
            allAvailableSlots: [],
            lastUnavailableSlotId: baseSlot.id,
        });
        const result = schema.safeParse(validData);

        expect(result.success).toBe(false);
        if (!result.success) {
            const hasSlotError = result.error.issues.some((issue) => issue.path[0] === 'selectedSlot');
            expect(hasSlotError).toBe(true);
        }
    });
});
