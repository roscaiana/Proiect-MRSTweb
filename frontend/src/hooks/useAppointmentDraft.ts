const APPOINTMENT_DRAFT_KEY = 'appointmentFormDraft';
const APPOINTMENT_RESCHEDULE_KEY = 'appointmentRescheduleDraft';

export function useAppointmentDraft() {
    const getRescheduleSourceId = (): string | null => {
        try {
            const raw = localStorage.getItem(APPOINTMENT_RESCHEDULE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as { appointmentId?: string };
            return parsed.appointmentId || null;
        } catch {
            return null;
        }
    };

    const clearDraft = (): void => {
        localStorage.removeItem(APPOINTMENT_DRAFT_KEY);
        localStorage.removeItem(APPOINTMENT_RESCHEDULE_KEY);
    };

    return { getRescheduleSourceId, clearDraft };
}
