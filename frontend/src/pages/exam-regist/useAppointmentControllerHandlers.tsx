import type { UseFormClearErrors, UseFormReset, UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import type { AppointmentFormData, TimeSlot } from '../../types/appointment';
import type { AdminAppointmentRecord } from '../../features/admin/types';
import { clampMonth as clampMonthToRange, navigateMonth, startOfMonth } from '../../utils/calendarUtils';
import type { AppointmentWizardTab } from './appointmentController.constants';
import type { AppointmentFormValues } from '../../schemas/appointmentSchema';

type UseAppointmentControllerHandlersParams = {
    userFullName: string | undefined;
    clearDraft: () => void;
    formData: AppointmentFormData;
    setValue: UseFormSetValue<AppointmentFormValues>;
    trigger: UseFormTrigger<AppointmentFormValues>;
    clearErrors: UseFormClearErrors<AppointmentFormValues>;
    reset: UseFormReset<AppointmentFormValues>;
    setIsSubmitted: (value: boolean) => void;
    setSubmittedAppointment: (value: AdminAppointmentRecord | null) => void;
    setSubmitMessage: (value: string) => void;
    setRescheduleSourceId: (value: string | null) => void;
    setActiveTab: (value: AppointmentWizardTab) => void;
    minDate: Date;
    maxDate: Date;
    isCalendarOpen: boolean;
    setIsCalendarOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
    calendarMonth: Date;
    setCalendarMonth: (value: Date) => void;
    canNavigatePrevMonth: boolean;
    canNavigateNextMonth: boolean;
    allAvailableSlots: TimeSlot[];
    setLastUnavailableSlotId: (value: string | null) => void;
};

export const useAppointmentControllerHandlers = ({
    userFullName,
    clearDraft,
    formData,
    setValue,
    trigger,
    clearErrors,
    reset,
    setIsSubmitted,
    setSubmittedAppointment,
    setSubmitMessage,
    setRescheduleSourceId,
    setActiveTab,
    minDate,
    maxDate,
    isCalendarOpen,
    setIsCalendarOpen,
    calendarMonth,
    setCalendarMonth,
    canNavigatePrevMonth,
    canNavigateNextMonth,
    allAvailableSlots,
    setLastUnavailableSlotId,
}: UseAppointmentControllerHandlersParams) => {
    const handleDateValueChange = async (dateString: string) => {
        if (!dateString) {
            setValue('selectedDate', null, { shouldValidate: true });
            setValue('selectedSlot', null, { shouldValidate: true });
            setLastUnavailableSlotId(null);
            await trigger(['selectedDate', 'selectedSlot']);
            return;
        }

        const selectedDate = new Date(`${dateString}T00:00:00`);
        setValue('selectedDate', selectedDate, { shouldValidate: true });
        setValue('selectedSlot', null, { shouldValidate: true });
        setLastUnavailableSlotId(null);
        await trigger(['selectedDate', 'selectedSlot']);
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
        void handleDateValueChange(dateKey);
        setIsCalendarOpen(false);
    };
    const handleSlotSelect = async (slotId: string) => {
        const slot = allAvailableSlots.find((item) => item.id === slotId && item.available);
        if (!slot) return;
        setValue('selectedSlot', slot, { shouldValidate: true });
        setLastUnavailableSlotId(null);
        await trigger('selectedSlot');
    };
    const handleFullNameChange = async (value: string) => {
        setValue('fullName', value, { shouldValidate: true });
        await trigger('fullName');
    };
    const handleIdOrPhoneChange = async (value: string) => {
        setValue('idOrPhone', value, { shouldValidate: true });
        await trigger('idOrPhone');
    };
    const handleNewAppointment = () => {
        reset({ fullName: userFullName || '', idOrPhone: '', selectedDate: null, selectedSlot: null });
        clearErrors();
        setIsSubmitted(false);
        setSubmittedAppointment(null);
        setSubmitMessage('');
        setRescheduleSourceId(null);
        setActiveTab(1);
        setLastUnavailableSlotId(null);
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
