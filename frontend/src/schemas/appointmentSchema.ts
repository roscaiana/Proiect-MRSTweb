import { z } from 'zod';
import type { AdminAppointmentRecord, ExamSettings } from '../features/admin/types';
import type { TimeSlot } from '../types/appointment';
import {
    getAppointmentsForDate,
    getBlockedDateEntry,
    getDailyCapacity,
    isDateBlocked,
    isLeadTimeSatisfied,
    toDateKey,
} from '../utils/appointmentScheduling';
import { isAllowedDay } from '../utils/dateUtils';
import { PHONE_NUMBER_PATTERN } from '../pages/exam-regist/appointmentController.constants';

export type AppointmentValidationContext = {
    examSettings: ExamSettings;
    appointments: AdminAppointmentRecord[];
    rescheduleSourceId: string | null;
    allowedWeekdayNames: string;
    activeUserAppointments: AdminAppointmentRecord[];
    userAppointments: AdminAppointmentRecord[];
    lastRejectedUserAppointment: AdminAppointmentRecord | null;
    allAvailableSlots: TimeSlot[];
    lastUnavailableSlotId?: string | null;
};

const baseSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, 'Numele complet este obligatoriu')
        .min(3, 'Numele trebuie să conțină cel puțin 3 caractere'),
    idOrPhone: z
        .string()
        .trim()
        .min(1, 'Numărul de telefon este obligatoriu')
        .regex(PHONE_NUMBER_PATTERN, 'Număr invalid. Folosește formatul +373 urmat de 8 cifre.'),
    selectedDate: z.date().nullable(),
    selectedSlot: z
        .object({
            id: z.string(),
            startTime: z.string(),
            endTime: z.string(),
            available: z.boolean().optional(),
        })
        .nullable(),
});

export type AppointmentFormValues = z.infer<typeof baseSchema>;

export const buildAppointmentSchema = (context: AppointmentValidationContext) =>
    baseSchema.superRefine((data, ctx) => {
        let dateMessage: string | undefined;
        let slotMessage: string | undefined;

        if (!data.selectedDate) {
            dateMessage = 'Vă rugăm să selectați o dată';
        } else {
            const selectedDateKey = toDateKey(data.selectedDate);
            const dayAppointments = getAppointmentsForDate(context.appointments, selectedDateKey, {
                activeOnly: true,
                excludeId: context.rescheduleSourceId || undefined,
            });
            const dayCapacity = getDailyCapacity(context.examSettings, selectedDateKey);

            if (!isAllowedDay(data.selectedDate, context.examSettings.allowedWeekdays)) {
                dateMessage = `Vă rugăm să selectați ${context.allowedWeekdayNames}.`;
            } else if (isDateBlocked(context.examSettings, selectedDateKey)) {
                const blockedEntry = getBlockedDateEntry(context.examSettings, selectedDateKey);
                dateMessage = blockedEntry?.note
                    ? `Ziua este blocată: ${blockedEntry.note}.`
                    : 'Ziua selectată este blocată pentru programări.';
            } else if (!isLeadTimeSatisfied(context.examSettings, data.selectedDate)) {
                dateMessage = `Programarea trebuie făcută cu cel puțin ${context.examSettings.appointmentLeadTimeHours} ore înainte.`;
            } else if (dayAppointments.length >= dayCapacity) {
                dateMessage = `Limita zilnică de ${dayCapacity} programări a fost atinsă.`;
            }
        }

        if (!dateMessage && !context.rescheduleSourceId && context.activeUserAppointments.length > 0) {
            dateMessage = 'Ai deja o programare activă. Anulează sau folosește reprogramarea din dashboard.';
        }

        if (context.rescheduleSourceId) {
            const sourceAppointment = context.userAppointments.find(
                (appointment) => appointment.id === context.rescheduleSourceId
            );
            if (!dateMessage && !sourceAppointment) {
                dateMessage = 'Programarea sursă pentru reprogramare nu a fost găsită.';
            } else if (
                !dateMessage &&
                sourceAppointment &&
                (sourceAppointment.rescheduleCount || 0) >= context.examSettings.maxReschedulesPerUser
            ) {
                dateMessage = `Ai atins limita de ${context.examSettings.maxReschedulesPerUser} reprogramări pentru această cerere.`;
            }
        } else if (!dateMessage && context.lastRejectedUserAppointment && context.examSettings.rejectionCooldownDays > 0) {
            const lastRejectedAt = new Date(
                context.lastRejectedUserAppointment.updatedAt || context.lastRejectedUserAppointment.createdAt
            );
            const cooldownUntil = new Date(
                lastRejectedAt.getTime() + context.examSettings.rejectionCooldownDays * 24 * 60 * 60 * 1000
            );
            if (cooldownUntil > new Date()) {
                dateMessage = `Poți face o nouă programare după ${cooldownUntil.toLocaleDateString('ro-RO')} (cooldown ${context.examSettings.rejectionCooldownDays} zile).`;
            }
        }

        if (!data.selectedSlot) {
            slotMessage = context.lastUnavailableSlotId
                ? 'Intervalul selectat nu mai este disponibil.'
                : 'Vă rugăm să selectați un interval orar';
        } else {
            const isSelectedSlotAvailable = context.allAvailableSlots.some(
                (slot) => slot.id === data.selectedSlot?.id && slot.available
            );
            if (!isSelectedSlotAvailable) {
                slotMessage = 'Intervalul selectat nu mai este disponibil.';
            } else if (data.selectedDate) {
                const selectedDateKey = toDateKey(data.selectedDate);
                const duplicateUserSameDay = context.activeUserAppointments.find(
                    (appointment) =>
                        appointment.id !== context.rescheduleSourceId &&
                        toDateKey(appointment.date) === selectedDateKey
                );
                if (!dateMessage && duplicateUserSameDay) {
                    dateMessage = 'Ai deja o programare activă în aceeași zi. Folosește funcția de reprogramare.';
                }
                const duplicateUserSameSlot = context.activeUserAppointments.find(
                    (appointment) =>
                        appointment.id !== context.rescheduleSourceId &&
                        toDateKey(appointment.date) === selectedDateKey &&
                        appointment.slotStart === data.selectedSlot?.startTime &&
                        appointment.slotEnd === data.selectedSlot?.endTime
                );
                if (!slotMessage && duplicateUserSameSlot) {
                    slotMessage = 'Ai deja o programare activă pe acest interval.';
                }
            }
        }

        if (dateMessage) {
            ctx.addIssue({ path: ['selectedDate'], message: dateMessage, code: z.ZodIssueCode.custom });
        }

        if (slotMessage) {
            ctx.addIssue({ path: ['selectedSlot'], message: slotMessage, code: z.ZodIssueCode.custom });
        }
    });

