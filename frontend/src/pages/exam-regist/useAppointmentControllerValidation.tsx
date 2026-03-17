import type { AppointmentFormData, FormErrors } from '../../types/appointment';
import type { AdminAppointmentRecord, ExamSettings } from '../../features/admin/types';
import { getBlockedDateEntry, getDailyCapacity, getAppointmentsForDate, isDateBlocked, isLeadTimeSatisfied, toDateKey } from '../../utils/appointmentScheduling';
import { isAllowedDay } from '../../utils/dateUtils';
import { PHONE_NUMBER_PATTERN } from './appointmentController.constants';

type UseAppointmentControllerValidationParams = {
    formData: AppointmentFormData;
    examSettings: ExamSettings;
    appointments: AdminAppointmentRecord[];
    rescheduleSourceId: string | null;
    allowedWeekdayNames: string;
    activeUserAppointments: AdminAppointmentRecord[];
    userAppointments: AdminAppointmentRecord[];
    lastRejectedUserAppointment: AdminAppointmentRecord | null;
    allAvailableSlots: Array<{ id: string; available: boolean }>;
    setErrors: (value: FormErrors) => void;
};

export const useAppointmentControllerValidation = ({
    formData,
    examSettings,
    appointments,
    rescheduleSourceId,
    allowedWeekdayNames,
    activeUserAppointments,
    userAppointments,
    lastRejectedUserAppointment,
    allAvailableSlots,
    setErrors,
}: UseAppointmentControllerValidationParams) => {
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Numele complet este obligatoriu';
        else if (formData.fullName.trim().length < 3) newErrors.fullName = 'Numele trebuie să conțină cel puțin 3 caractere';

        if (!formData.idOrPhone.trim()) newErrors.idOrPhone = 'Numărul de telefon este obligatoriu';
        else if (!PHONE_NUMBER_PATTERN.test(formData.idOrPhone.trim())) newErrors.idOrPhone = 'Număr invalid. Folosește 9 cifre și prefix: 068, 069, 078 sau 079.';

        if (!formData.selectedDate) newErrors.date = 'Vă rugăm să selectați o dată';
        else {
            const selectedDateKey = toDateKey(formData.selectedDate);
            const dayAppointments = getAppointmentsForDate(appointments, selectedDateKey, { activeOnly: true, excludeId: rescheduleSourceId || undefined });
            const dayCapacity = getDailyCapacity(examSettings, selectedDateKey);

            if (!isAllowedDay(formData.selectedDate, examSettings.allowedWeekdays)) newErrors.date = `Vă rugăm să selectați ${allowedWeekdayNames}.`;
            else if (isDateBlocked(examSettings, selectedDateKey)) {
                const blockedEntry = getBlockedDateEntry(examSettings, selectedDateKey);
                newErrors.date = blockedEntry?.note ? `Ziua este blocată: ${blockedEntry.note}.` : 'Ziua selectată este blocată pentru programări.';
            } else if (!isLeadTimeSatisfied(examSettings, formData.selectedDate)) newErrors.date = `Programarea trebuie făcută cu cel puțin ${examSettings.appointmentLeadTimeHours} ore înainte.`;
            else if (dayAppointments.length >= dayCapacity) newErrors.date = `Limita zilnică de ${dayCapacity} programări a fost atinsă.`;
        }

        if (!rescheduleSourceId && activeUserAppointments.length > 0) newErrors.date = newErrors.date || 'Ai deja o programare activă. Anulează sau folosește reprogramarea din dashboard.';
        if (rescheduleSourceId) {
            const sourceAppointment = userAppointments.find((appointment) => appointment.id === rescheduleSourceId);
            if (!sourceAppointment) newErrors.date = newErrors.date || 'Programarea sursă pentru reprogramare nu a fost găsită.';
            else if ((sourceAppointment.rescheduleCount || 0) >= examSettings.maxReschedulesPerUser) newErrors.date = newErrors.date || `Ai atins limita de ${examSettings.maxReschedulesPerUser} reprogramări pentru această cerere.`;
        } else if (lastRejectedUserAppointment && examSettings.rejectionCooldownDays > 0) {
            const lastRejectedAt = new Date(lastRejectedUserAppointment.updatedAt || lastRejectedUserAppointment.createdAt);
            const cooldownUntil = new Date(lastRejectedAt.getTime() + examSettings.rejectionCooldownDays * 24 * 60 * 60 * 1000);
            if (cooldownUntil > new Date()) newErrors.date = newErrors.date || `Poți face o nouă programare după ${cooldownUntil.toLocaleDateString('ro-RO')} (cooldown ${examSettings.rejectionCooldownDays} zile).`;
        }

        if (!formData.selectedSlot) newErrors.slot = 'Vă rugăm să selectați un interval orar';
        else {
            const isSelectedSlotAvailable = allAvailableSlots.some((slot) => slot.id === formData.selectedSlot?.id && slot.available);
            if (!isSelectedSlotAvailable) newErrors.slot = 'Intervalul selectat nu mai este disponibil.';
            else if (formData.selectedDate) {
                const duplicateUserSameDay = activeUserAppointments.find((appointment) => appointment.id !== rescheduleSourceId && toDateKey(appointment.date) === toDateKey(formData.selectedDate as Date));
                if (duplicateUserSameDay) newErrors.date = newErrors.date || 'Ai deja o programare activă în aceeași zi. Folosește funcția de reprogramare.';
                const duplicateUserSameSlot = activeUserAppointments.find((appointment) => appointment.id !== rescheduleSourceId && toDateKey(appointment.date) === toDateKey(formData.selectedDate as Date) && appointment.slotStart === formData.selectedSlot?.startTime && appointment.slotEnd === formData.selectedSlot?.endTime);
                if (duplicateUserSameSlot) newErrors.slot = 'Ai deja o programare activă pe acest interval.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return { validateForm };
};
