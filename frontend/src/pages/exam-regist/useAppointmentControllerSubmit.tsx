import type { FormEvent } from 'react';
import type { AppointmentFormData, FormErrors } from '../../types/appointment';
import type { AdminAppointmentRecord, ExamSettings } from '../../features/admin/types';
import { notifyAppointmentCreated, notifyUser } from '../../utils/appEventNotifications';
import { formatAllowedWeekdayNames, formatDate, isAllowedDay } from '../../utils/dateUtils';
import { generateAppointmentCode, getAppointmentsForDate, getBlockedDateEntry, getDailyCapacity, isDateBlocked, isLeadTimeSatisfied, toDateKey } from '../../utils/appointmentScheduling';
import { readAppointments, readExamSettings, writeAppointments } from '../../features/admin/storage';
import { PHONE_NUMBER_PATTERN, type AppointmentWizardTab } from './appointmentController.constants';

type UseAppointmentControllerSubmitParams = {
    activeTab: AppointmentWizardTab;
    goToNextTab: () => void;
    validateForm: () => boolean;
    formData: AppointmentFormData;
    rescheduleSourceId: string | null;
    userEmail: string | undefined;
    setActiveTab: (value: AppointmentWizardTab) => void;
    setSubmitMessage: (value: string) => void;
    setIsSubmitting: (value: boolean) => void;
    setErrors: (value: FormErrors | ((prev: FormErrors) => FormErrors)) => void;
    setAppointments: (value: AdminAppointmentRecord[]) => void;
    setSubmittedAppointment: (value: AdminAppointmentRecord | null) => void;
    setIsSubmitted: (value: boolean) => void;
};

export const useAppointmentControllerSubmit = ({
    activeTab,
    goToNextTab,
    validateForm,
    formData,
    rescheduleSourceId,
    userEmail,
    setActiveTab,
    setSubmitMessage,
    setIsSubmitting,
    setErrors,
    setAppointments,
    setSubmittedAppointment,
    setIsSubmitted,
}: UseAppointmentControllerSubmitParams) => {
    const moveToInvalidStep = () => {
        if (!formData.selectedDate) setActiveTab(1);
        else if (!formData.selectedSlot) setActiveTab(2);
        else if (formData.fullName.trim().length < 3 || !PHONE_NUMBER_PATTERN.test(formData.idOrPhone.trim())) setActiveTab(3);
        else setActiveTab(4);
    };

    const runSubmitGuards = (
        latestSettings: ExamSettings,
        latestAppointments: AdminAppointmentRecord[],
        selectedDateKey: string,
        sourceAppointment: AdminAppointmentRecord | null,
    ) => {
        if (!formData.selectedDate || !formData.selectedSlot) return 'date';
        const sameDayAppointments = getAppointmentsForDate(latestAppointments, selectedDateKey, { activeOnly: true, excludeId: rescheduleSourceId || undefined });
        const dayCapacity = getDailyCapacity(latestSettings, selectedDateKey);
        if (!isAllowedDay(formData.selectedDate, latestSettings.allowedWeekdays)) return { date: `Sunt permise doar zilele ${formatAllowedWeekdayNames(latestSettings.allowedWeekdays)}.` };
        if (isDateBlocked(latestSettings, selectedDateKey)) {
            const blockedEntry = getBlockedDateEntry(latestSettings, selectedDateKey);
            return { date: blockedEntry?.note ? `Zi blocată: ${blockedEntry.note}` : 'Ziua selectată este blocată.' };
        }
        if (!isLeadTimeSatisfied(latestSettings, formData.selectedDate)) return { date: `Programarea trebuie făcută cu cel puțin ${latestSettings.appointmentLeadTimeHours} ore înainte.` };
        if (!rescheduleSourceId) {
            const latestActiveUserAppointment = latestAppointments.find((a) => a.userEmail?.trim().toLowerCase() === userEmail?.trim().toLowerCase() && (a.status === 'pending' || a.status === 'approved'));
            if (latestActiveUserAppointment) return { date: 'Ai deja o programare activă. Folosește anulare sau reprogramare din dashboard.' };
        }
        if (sourceAppointment && (sourceAppointment.rescheduleCount || 0) >= latestSettings.maxReschedulesPerUser) return { date: `Ai atins limita de ${latestSettings.maxReschedulesPerUser} reprogramări pentru această cerere.` };
        if (sameDayAppointments.length >= dayCapacity) return { date: `Între timp, limita zilnică de ${dayCapacity} programări a fost atinsă.` };
        const slotAlreadyTaken = sameDayAppointments.some((a) => a.slotStart === formData.selectedSlot?.startTime && a.slotEnd === formData.selectedSlot?.endTime);
        if (slotAlreadyTaken) return { slot: 'Intervalul ales a fost ocupat între timp. Alege alt interval.' };
        return null;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitMessage('');
        if (activeTab < 4) return goToNextTab();
        if (!validateForm()) return moveToInvalidStep();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const latestAppointments = readAppointments();
        const latestSettings = readExamSettings();
        if (!formData.selectedDate || !formData.selectedSlot) {
            setIsSubmitting(false);
            return;
        }
        const selectedDateKey = toDateKey(formData.selectedDate);
        const sourceAppointment = rescheduleSourceId ? latestAppointments.find((appointment) => appointment.id === rescheduleSourceId) || null : null;
        const guardError = runSubmitGuards(latestSettings, latestAppointments, selectedDateKey, sourceAppointment);
        if (guardError && typeof guardError === 'object') {
            setErrors((prev) => ({ ...prev, ...guardError }));
            setIsSubmitting(false);
            return;
        }

        const appointmentCode = generateAppointmentCode();
        const createdAt = new Date().toISOString();
        const newAppointment: AdminAppointmentRecord = { id: `appointment-${Date.now()}`, appointmentCode, fullName: formData.fullName.trim(), idOrPhone: formData.idOrPhone.trim(), userEmail, date: formData.selectedDate.toISOString(), slotStart: formData.selectedSlot.startTime, slotEnd: formData.selectedSlot.endTime, status: 'pending', statusReason: undefined, adminNote: undefined, previousAppointmentId: sourceAppointment?.id, rescheduleCount: sourceAppointment ? (sourceAppointment.rescheduleCount || 0) + 1 : 0, createdAt, updatedAt: createdAt };
        let nextAppointments = [newAppointment, ...latestAppointments];
        if (sourceAppointment) {
            nextAppointments = nextAppointments.map((appointment) => appointment.id === sourceAppointment.id ? { ...appointment, status: 'cancelled', cancelledBy: 'user', statusReason: 'Reprogramată de utilizator', updatedAt: createdAt } : appointment);
            notifyUser(userEmail, { title: 'Reprogramare inițiată', message: `Cererea veche ${sourceAppointment.appointmentCode || ''} a fost anulată și înlocuită cu ${appointmentCode}.`, link: '/dashboard', tag: `appointment-user-rescheduled-${sourceAppointment.id}-${appointmentCode}` });
        }

        writeAppointments(nextAppointments);
        setAppointments(nextAppointments);
        setSubmittedAppointment(newAppointment);
        notifyAppointmentCreated({ userEmail, appointmentCode, dateLabel: formatDate(formData.selectedDate), intervalLabel: `${formData.selectedSlot.startTime} - ${formData.selectedSlot.endTime}` });
        setSubmitMessage(sourceAppointment ? 'Programarea a fost reprogramată. Cererea nouă este în așteptare de confirmare.' : 'Programarea a fost înregistrată și este în așteptare de confirmare.');
        setIsSubmitting(false);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return { handleSubmit };
};
