import type { AppointmentFormData, FormErrors, TimeSlot } from '../../types/appointment';
import type { AdminAppointmentRecord, ExamSettings } from '../../features/admin/types';
import {
    getAppointmentsForDate,
    getBlockedDateEntry,
    getDailyCapacity,
    isLeadTimeSatisfied,
    toDateKey,
} from '../../utils/appointmentScheduling';
import { isAllowedDay } from '../../utils/dateUtils';
import { clampMonth as clampMonthToRange, navigateMonth, startOfMonth } from '../../utils/calendarUtils';
import type { AppointmentWizardTab } from './appointmentController.constants';

type UseAppointmentControllerHandlersParams = {
    userFullName: string | undefined;
    clearDraft: () => void;
    formData: AppointmentFormData;
    setFormData: (value: AppointmentFormData | ((prev: AppointmentFormData) => AppointmentFormData)) => void;
    setErrors: (value: FormErrors | ((prev: FormErrors) => FormErrors)) => void;
    setIsSubmitted: (value: boolean) => void;
    setSubmittedAppointment: (value: AdminAppointmentRecord | null) => void;
    setSubmitMessage: (value: string) => void;
    setRescheduleSourceId: (value: string | null) => void;
    setActiveTab: (value: AppointmentWizardTab) => void;
    appointments: AdminAppointmentRecord[];
    examSettings: ExamSettings;
    rescheduleSourceId: string | null;
    allowedWeekdayNames: string;
    minDate: Date;
    maxDate: Date;
    isCalendarOpen: boolean;
    setIsCalendarOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
    calendarMonth: Date;
    setCalendarMonth: (value: Date) => void;
    canNavigatePrevMonth: boolean;
    canNavigateNextMonth: boolean;
    allAvailableSlots: TimeSlot[];
};

export const useAppointmentControllerHandlers = ({
    userFullName,
    clearDraft,
    formData,
    setFormData,
    setErrors,
    setIsSubmitted,
    setSubmittedAppointment,
    setSubmitMessage,
    setRescheduleSourceId,
    setActiveTab,
    appointments,
    examSettings,
    rescheduleSourceId,
    allowedWeekdayNames,
    minDate,
    maxDate,
    isCalendarOpen,
    setIsCalendarOpen,
    calendarMonth,
    setCalendarMonth,
    canNavigatePrevMonth,
    canNavigateNextMonth,
    allAvailableSlots,
}: UseAppointmentControllerHandlersParams) => {
    const handleDateValueChange = (dateString: string) => {
        if (!dateString) {
            setFormData((prev) => ({ ...prev, selectedDate: null, selectedSlot: null }));
            setErrors((prev) => ({ ...prev, date: undefined, slot: undefined }));
            return;
        }

        const selectedDate = new Date(`${dateString}T00:00:00`);
        const dateKey = toDateKey(selectedDate);
        const dayAppointments = getAppointmentsForDate(appointments, dateKey, {
            activeOnly: true,
            excludeId: rescheduleSourceId || undefined,
        });
        const dayCapacity = getDailyCapacity(examSettings, dateKey);
        const blockedEntry = getBlockedDateEntry(examSettings, dateKey);
        const isDayFullyBooked = dayAppointments.length >= dayCapacity;
        let dateError: string | undefined;
        let slotError: string | undefined;

        if (!isAllowedDay(selectedDate, examSettings.allowedWeekdays)) {
            dateError = `Vă rugăm să selectați ${allowedWeekdayNames}.`;
        } else if (blockedEntry) {
            dateError = blockedEntry.note
                ? `Ziua este blocată: ${blockedEntry.note}.`
                : 'Ziua selectată este blocată pentru programări.';
        } else if (!isLeadTimeSatisfied(examSettings, selectedDate)) {
            dateError = `Programarea trebuie făcută cu cel puțin ${examSettings.appointmentLeadTimeHours} ore înainte.`;
        } else if (isDayFullyBooked) {
            dateError = `Ziua selectată este complet rezervată (${dayCapacity}/${dayCapacity}).`;
            slotError = 'Nu mai sunt intervale disponibile pentru această zi.';
        }

        setFormData((prev) => ({ ...prev, selectedDate, selectedSlot: null }));
        setErrors((prev) => ({ ...prev, date: dateError, slot: slotError }));
    };

    const toggleCalendar = () => {
        if (!isCalendarOpen) {
            const monthSeed = formData.selectedDate || new Date();
            setCalendarMonth(clampMonthToRange(startOfMonth(monthSeed), minDate, maxDate));
        }
        setIsCalendarOpen((prev) => !prev);
    };

    const goToPreviousMonth = () => {
        if (canNavigatePrevMonth) setCalendarMonth(navigateMonth('prev', calendarMonth, minDate, maxDate));
    };
    const goToNextMonth = () => {
        if (canNavigateNextMonth) setCalendarMonth(navigateMonth('next', calendarMonth, minDate, maxDate));
    };
    const handleCalendarDaySelect = (dateKey: string) => {
        handleDateValueChange(dateKey);
        setIsCalendarOpen(false);
    };
    const handleSlotSelect = (slotId: string) => {
        const slot = allAvailableSlots.find((item) => item.id === slotId && item.available);
        if (!slot) return;
        setFormData((prev) => ({ ...prev, selectedSlot: slot }));
        setErrors((prev) => ({ ...prev, slot: undefined }));
    };
    const handleFullNameChange = (value: string) => {
        setFormData((prev) => ({ ...prev, fullName: value }));
        setErrors((prev) => ({ ...prev, fullName: undefined }));
    };
    const handleIdOrPhoneChange = (value: string) => {
        setFormData((prev) => ({ ...prev, idOrPhone: value }));
        setErrors((prev) => ({ ...prev, idOrPhone: undefined }));
    };
    const handleNewAppointment = () => {
        setFormData({ fullName: userFullName || '', idOrPhone: '', selectedDate: null, selectedSlot: null });
        setErrors({});
        setIsSubmitted(false);
        setSubmittedAppointment(null);
        setSubmitMessage('');
        setRescheduleSourceId(null);
        setActiveTab(1);
        clearDraft();
    };

    return {
        handleDateValueChange,
        toggleCalendar,
        goToPreviousMonth,
        goToNextMonth,
        handleCalendarDaySelect,
        handleSlotSelect,
        handleFullNameChange,
        handleIdOrPhoneChange,
        handleNewAppointment,
    };
};
