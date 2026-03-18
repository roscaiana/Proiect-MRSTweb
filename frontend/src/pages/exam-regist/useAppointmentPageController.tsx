import { formatDate, getDayName, getMonthName } from '../../utils/dateUtils';
import { useAppointmentControllerCalendarData } from './useAppointmentControllerCalendarData';
import { useAppointmentControllerCalendarEffects } from './useAppointmentControllerCalendarEffects';
import { useAppointmentControllerHandlers } from './useAppointmentControllerHandlers';
import { useAppointmentControllerSlotData } from './useAppointmentControllerSlotData';
import { useAppointmentControllerState } from './useAppointmentControllerState';
import { useAppointmentControllerSubmit } from './useAppointmentControllerSubmit';
import { useAppointmentControllerTabFlow } from './useAppointmentControllerTabFlow';
import { useAppointmentControllerUserData } from './useAppointmentControllerUserData';
import { useAppointmentControllerValidation } from './useAppointmentControllerValidation';
import { PHONE_NUMBER_PATTERN } from './appointmentController.constants';
export { WIZARD_TAB_LABELS, type AppointmentWizardTab } from './appointmentController.constants';
export const useAppointmentPageController = () => {
    const state = useAppointmentControllerState();
    const { user, clearDraft } = state;
    useAppointmentControllerCalendarEffects({
        formData: state.formData,
        minDate: state.minDate,
        maxDate: state.maxDate,
        isCalendarOpen: state.isCalendarOpen,
        calendarPickerRef: state.calendarPickerRef,
        setCalendarMonth: state.setCalendarMonth,
        setIsCalendarOpen: state.setIsCalendarOpen,
    });
    const userData = useAppointmentControllerUserData({
        userEmail: user?.email,
        appointments: state.appointments,
        rescheduleSourceId: state.rescheduleSourceId,
    });
    const calendarData = useAppointmentControllerCalendarData({
        selectedDate: state.formData.selectedDate,
        calendarMonth: state.calendarMonth,
        minDate: state.minDate,
        maxDate: state.maxDate,
        appointments: state.appointments,
        examSettings: state.examSettings,
        rescheduleSourceId: state.rescheduleSourceId,
    });
    const slotData = useAppointmentControllerSlotData({
        selectedDateKey: calendarData.selectedDateKey,
        appointments: state.appointments,
        examSettings: state.examSettings,
        rescheduleSourceId: state.rescheduleSourceId,
        slotFilter: state.slotFilter,
        formData: state.formData,
        setFormData: state.setFormData,
        setErrors: state.setErrors,
        maxDate: state.maxDate,
    });
    const tabFlow = useAppointmentControllerTabFlow({
        activeTab: state.activeTab,
        setActiveTab: state.setActiveTab,
        formData: state.formData,
        errors: state.errors,
        setErrors: state.setErrors,
    });
    const handlers = useAppointmentControllerHandlers({
        userFullName: user?.fullName,
        clearDraft,
        formData: state.formData,
        setFormData: state.setFormData,
        setErrors: state.setErrors,
        setIsSubmitted: state.setIsSubmitted,
        setSubmittedAppointment: state.setSubmittedAppointment,
        setSubmitMessage: state.setSubmitMessage,
        setRescheduleSourceId: state.setRescheduleSourceId,
        setActiveTab: state.setActiveTab,
        appointments: state.appointments,
        examSettings: state.examSettings,
        rescheduleSourceId: state.rescheduleSourceId,
        allowedWeekdayNames: calendarData.allowedWeekdayNames,
        minDate: state.minDate,
        maxDate: state.maxDate,
        isCalendarOpen: state.isCalendarOpen,
        setIsCalendarOpen: state.setIsCalendarOpen,
        calendarMonth: state.calendarMonth,
        setCalendarMonth: state.setCalendarMonth,
        canNavigatePrevMonth: calendarData.canNavigatePrevMonth,
        canNavigateNextMonth: calendarData.canNavigateNextMonth,
        allAvailableSlots: slotData.allAvailableSlots,
    });
    const { validateForm } = useAppointmentControllerValidation({
        formData: state.formData,
        examSettings: state.examSettings,
        appointments: state.appointments,
        rescheduleSourceId: state.rescheduleSourceId,
        allowedWeekdayNames: calendarData.allowedWeekdayNames,
        activeUserAppointments: userData.activeUserAppointments,
        userAppointments: userData.userAppointments,
        lastRejectedUserAppointment: userData.lastRejectedUserAppointment,
        allAvailableSlots: slotData.allAvailableSlots,
        setErrors: state.setErrors,
    });
    const { handleSubmit } = useAppointmentControllerSubmit({
        activeTab: state.activeTab,
        goToNextTab: tabFlow.goToNextTab,
        validateForm,
        formData: state.formData,
        rescheduleSourceId: state.rescheduleSourceId,
        userEmail: user?.email,
        setActiveTab: state.setActiveTab,
        setSubmitMessage: state.setSubmitMessage,
        setIsSubmitting: state.setIsSubmitting,
        setErrors: state.setErrors,
        setAppointments: state.setAppointments,
        setSubmittedAppointment: state.setSubmittedAppointment,
        setIsSubmitted: state.setIsSubmitted,
    });

    const isPhoneValid = PHONE_NUMBER_PATTERN.test(state.formData.idOrPhone.trim());

    return {
        activeTab: state.activeTab,
        highestUnlockedTab: tabFlow.highestUnlockedTab,
        canGoBack: tabFlow.canGoBack,
        canGoNext: tabFlow.canGoNext,
        isSubmitted: state.isSubmitted,
        isSubmitting: state.isSubmitting,
        submitMessage: state.submitMessage,
        submittedAppointment: state.submittedAppointment,
        formData: state.formData,
        isPhoneValid,
        errors: state.errors,
        examSettings: state.examSettings,
        rescheduleSourceId: state.rescheduleSourceId,
        rescheduleSourceAppointment: userData.rescheduleSourceAppointment,
        activeUserAppointments: userData.activeUserAppointments,
        selectedDateKey: calendarData.selectedDateKey,
        remainingAppointmentsForDay: slotData.remainingAppointmentsForDay,
        currentDayCapacity: slotData.currentDayCapacity,
        isCalendarOpen: state.isCalendarOpen,
        calendarPickerRef: state.calendarPickerRef,
        calendarMonth: state.calendarMonth,
        canNavigatePrevMonth: calendarData.canNavigatePrevMonth,
        canNavigateNextMonth: calendarData.canNavigateNextMonth,
        calendarDays: calendarData.calendarDays,
        selectedDateLabel: calendarData.selectedDateLabel,
        selectedBlockedEntry: calendarData.selectedBlockedEntry,
        availabilityPreviewDays: slotData.availabilityPreviewDays,
        minDate: state.minDate,
        maxDate: state.maxDate,
        allowedWeekdayNames: calendarData.allowedWeekdayNames,
        availableSlots: slotData.availableSlots,
        slotFilter: state.slotFilter,
        recommendedSlot: slotData.recommendedSlot,
        handleSubmit,
        handleTabClick: tabFlow.handleTabClick,
        goToPreviousTab: tabFlow.goToPreviousTab,
        goToNextTab: tabFlow.goToNextTab,
        setSlotFilter: state.setSlotFilter,
        getMonthName, getDayName, formatDate,
        ...handlers,
    };
};
export type AppointmentPageController = ReturnType<typeof useAppointmentPageController>;
