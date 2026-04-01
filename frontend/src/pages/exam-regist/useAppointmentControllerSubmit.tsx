import type { FormEvent } from 'react';
import type { AppointmentFormData } from '../../types/appointment';
import type { AdminAppointmentRecord } from '../../features/admin/types';
import { notifyAppointmentCreated, notifyUser } from '../../utils/appEventNotifications';
import { formatAllowedWeekdayNames, formatDate } from '../../utils/dateUtils';
import { buildAvailableSlotsForDate, generateAppointmentCode, toDateKey } from '../../utils/appointmentScheduling';
import { readAppointments, readExamSettings, writeAppointments } from '../../features/admin/storage';
import type { AppointmentWizardTab } from './appointmentController.constants';
import type { AppointmentValidationContext } from '../../schemas/appointmentSchema';

type UseAppointmentControllerSubmitParams = {
    activeTab: AppointmentWizardTab;
    goToNextTab: () => void;
    validateForm: () => Promise<boolean>;
    formData: AppointmentFormData;
    rescheduleSourceId: string | null;
    userEmail: string | undefined;
    setActiveTab: (value: AppointmentWizardTab) => void;
    setSubmitMessage: (value: string) => void;
    setIsSubmitting: (value: boolean) => void;
    setAppointments: (value: AdminAppointmentRecord[]) => void;
    setSubmittedAppointment: (value: AdminAppointmentRecord | null) => void;
    setIsSubmitted: (value: boolean) => void;
    setValidationContext: (context: AppointmentValidationContext) => void;
    lastUnavailableSlotId: string | null;
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
    setAppointments,
    setSubmittedAppointment,
    setIsSubmitted,
    setValidationContext,
    lastUnavailableSlotId,
}: UseAppointmentControllerSubmitParams) => {
    const moveToInvalidStep = () => {
        if (!formData.selectedDate) setActiveTab(1);
        else if (!formData.selectedSlot) setActiveTab(2);
        else if (!formData.fullName.trim() || !formData.idOrPhone.trim()) setActiveTab(3);
        else setActiveTab(4);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitMessage('');
        if (activeTab < 4) return goToNextTab();

        const latestAppointments = readAppointments();
        const latestSettings = readExamSettings();
        const normalizedEmail = userEmail?.trim().toLowerCase();
        const userAppointments = normalizedEmail
            ? latestAppointments.filter((appointment) => appointment.userEmail?.trim().toLowerCase() === normalizedEmail)
            : [];
        const activeUserAppointments = userAppointments.filter(
            (appointment) => appointment.status === 'pending' || appointment.status === 'approved'
        );
        const lastRejectedUserAppointment =
            [...userAppointments]
                .filter((appointment) => appointment.status === 'rejected')
                .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0] ||
            null;

        const selectedDateKey = formData.selectedDate ? toDateKey(formData.selectedDate) : '';
        const allAvailableSlots =
            formData.selectedDate && selectedDateKey
                ? buildAvailableSlotsForDate(latestSettings, latestAppointments, selectedDateKey, {
                      excludeAppointmentId: rescheduleSourceId || undefined,
                  })
                : [];

        setValidationContext({
            examSettings: latestSettings,
            appointments: latestAppointments,
            rescheduleSourceId,
            allowedWeekdayNames: formatAllowedWeekdayNames(latestSettings.allowedWeekdays),
            activeUserAppointments,
            userAppointments,
            lastRejectedUserAppointment,
            allAvailableSlots,
            lastUnavailableSlotId,
        });

        const isValid = await validateForm();
        if (!isValid) return moveToInvalidStep();

        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (!formData.selectedDate || !formData.selectedSlot) {
            setIsSubmitting(false);
            return;
        }

        const sourceAppointment = rescheduleSourceId
            ? latestAppointments.find((appointment) => appointment.id === rescheduleSourceId) || null
            : null;

        const appointmentCode = generateAppointmentCode();
        const createdAt = new Date().toISOString();
        const newAppointment: AdminAppointmentRecord = {
            id: `appointment-${Date.now()}`,
            appointmentCode,
            fullName: formData.fullName.trim(),
            idOrPhone: formData.idOrPhone.trim(),
            userEmail,
            date: formData.selectedDate.toISOString(),
            slotStart: formData.selectedSlot.startTime,
            slotEnd: formData.selectedSlot.endTime,
            status: 'pending',
            statusReason: undefined,
            adminNote: undefined,
            previousAppointmentId: sourceAppointment?.id,
            rescheduleCount: sourceAppointment ? (sourceAppointment.rescheduleCount || 0) + 1 : 0,
            createdAt,
            updatedAt: createdAt,
        };

        let nextAppointments = [newAppointment, ...latestAppointments];
        if (sourceAppointment) {
            nextAppointments = nextAppointments.map((appointment) =>
                appointment.id === sourceAppointment.id
                    ? {
                          ...appointment,
                          status: 'cancelled',
                          cancelledBy: 'user',
                          statusReason: 'Reprogramată de utilizator',
                          updatedAt: createdAt,
                      }
                    : appointment
            );
            notifyUser(userEmail, {
                title: 'Reprogramare inițiată',
                message: `Cererea veche ${sourceAppointment.appointmentCode || ''} a fost anulată și înlocuită cu ${appointmentCode}.`,
                link: '/dashboard',
                tag: `appointment-user-rescheduled-${sourceAppointment.id}-${appointmentCode}`,
            });
        }

        writeAppointments(nextAppointments);
        setAppointments(nextAppointments);
        setSubmittedAppointment(newAppointment);
        notifyAppointmentCreated({
            userEmail,
            appointmentCode,
            dateLabel: formatDate(formData.selectedDate),
            intervalLabel: `${formData.selectedSlot.startTime} - ${formData.selectedSlot.endTime}`,
        });
        setSubmitMessage(
            sourceAppointment
                ? 'Programarea a fost reprogramată. Cererea nouă este în așteptare de confirmare.'
                : 'Programarea a fost înregistrată și este în așteptare de confirmare.'
        );
        setIsSubmitting(false);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return { handleSubmit };
};
