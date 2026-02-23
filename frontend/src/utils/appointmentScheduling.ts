import type { AdminAppointmentRecord, AppointmentStatus, ExamSettings } from "../features/admin/types";
import type { TimeSlot } from "../types/appointment";
import { TIME_SLOTS } from "../types/appointment";
import { isAllowedDay } from "./dateUtils";

export const NON_OCCUPYING_APPOINTMENT_STATUSES: AppointmentStatus[] = ["rejected", "cancelled"];

const isOccupyingStatus = (status: AppointmentStatus): boolean =>
    !NON_OCCUPYING_APPOINTMENT_STATUSES.includes(status);

export const toDateKey = (value: Date | string): string => {
    const date = typeof value === "string" ? new Date(value) : value;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey: string): Date => new Date(`${dateKey}T00:00:00`);

export const isSameCalendarDay = (first: Date | string, second: Date | string): boolean =>
    toDateKey(first) === toDateKey(second);

export const getBlockedDateEntry = (settings: ExamSettings, dateKey: string) =>
    settings.blockedDates.find((item) => item.date === dateKey);

export const isDateBlocked = (settings: ExamSettings, dateKey: string): boolean =>
    Boolean(getBlockedDateEntry(settings, dateKey));

export const getDailyCapacity = (settings: ExamSettings, dateKey: string): number => {
    const override = settings.capacityOverrides.find((item) => item.date === dateKey);
    return override?.appointmentsPerDay ?? settings.appointmentsPerDay;
};

export const getSlotTemplateForDate = (settings: ExamSettings, dateKey: string): TimeSlot[] => {
    const override = settings.slotOverrides.find((item) => item.date === dateKey);
    if (!override || override.slots.length === 0) {
        return TIME_SLOTS.map((slot) => ({ ...slot }));
    }

    return override.slots.map((slot, index) => ({
        id: slot.id || `slot-${index + 1}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: slot.available ?? true,
    }));
};

export const getAppointmentsForDate = (
    appointments: AdminAppointmentRecord[],
    dateKey: string,
    options?: { activeOnly?: boolean; excludeId?: string }
): AdminAppointmentRecord[] => {
    const activeOnly = options?.activeOnly ?? false;

    return appointments.filter((appointment) => {
        if (options?.excludeId && appointment.id === options.excludeId) {
            return false;
        }
        if (!isSameCalendarDay(appointment.date, dateKey)) {
            return false;
        }
        if (activeOnly && !isOccupyingStatus(appointment.status)) {
            return false;
        }
        return true;
    });
};

export const buildAvailableSlotsForDate = (
    settings: ExamSettings,
    appointments: AdminAppointmentRecord[],
    dateKey: string,
    options?: { excludeAppointmentId?: string }
): TimeSlot[] => {
    const capacity = getDailyCapacity(settings, dateKey);
    const dayAppointments = getAppointmentsForDate(appointments, dateKey, {
        activeOnly: true,
        excludeId: options?.excludeAppointmentId,
    });
    const occupiedSlots = new Set(dayAppointments.map((a) => `${a.slotStart}-${a.slotEnd}`));
    const dateBlocked = isDateBlocked(settings, dateKey);
    const capacityReached = dayAppointments.length >= capacity;

    return getSlotTemplateForDate(settings, dateKey).map((slot) => ({
        ...slot,
        available:
            !dateBlocked &&
            !capacityReached &&
            (slot.available ?? true) &&
            !occupiedSlots.has(`${slot.startTime}-${slot.endTime}`),
    }));
};

export const isLeadTimeSatisfied = (
    settings: ExamSettings,
    examDate: Date,
    now = new Date()
): boolean => {
    const diffMs = examDate.getTime() - now.getTime();
    return diffMs >= settings.appointmentLeadTimeHours * 60 * 60 * 1000;
};

export const getNextEligibleDates = (
    settings: ExamSettings,
    appointments: AdminAppointmentRecord[],
    options?: {
        startDate?: Date;
        count?: number;
        maxDate?: Date;
    }
): Array<{
    date: Date;
    dateKey: string;
    blocked: boolean;
    blockedNote?: string;
    capacity: number;
    occupied: number;
    remaining: number;
}> => {
    const startDate = options?.startDate ? new Date(options.startDate) : new Date();
    const maxDate = options?.maxDate ? new Date(options.maxDate) : new Date(startDate.getTime() + 180 * 24 * 60 * 60 * 1000);
    const count = options?.count ?? 14;

    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);

    const results: Array<{
        date: Date;
        dateKey: string;
        blocked: boolean;
        blockedNote?: string;
        capacity: number;
        occupied: number;
        remaining: number;
    }> = [];

    while (cursor <= maxDate && results.length < count) {
        if (isAllowedDay(cursor)) {
            const dateKey = toDateKey(cursor);
            const capacity = getDailyCapacity(settings, dateKey);
            const occupied = getAppointmentsForDate(appointments, dateKey, { activeOnly: true }).length;
            const blockedEntry = getBlockedDateEntry(settings, dateKey);

            results.push({
                date: new Date(cursor),
                dateKey,
                blocked: Boolean(blockedEntry),
                blockedNote: blockedEntry?.note,
                capacity,
                occupied,
                remaining: Math.max(0, capacity - occupied),
            });
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return results;
};

export const generateAppointmentCode = (): string =>
    `AP-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;

