import type { FormEvent } from 'react';
import type { AppointmentFormData } from '../../types/appointment';
import type { AdminAppointmentRecord, AppointmentStatus } from '../../features/admin/types';
import { notifyAppointmentCreated, notifyUser } from '../../utils/appEventNotifications';
import { formatAllowedWeekdayNames, formatDate } from '../../utils/dateUtils';
import { buildAvailableSlotsForDate, generateAppointmentCode, toDateKey } from '../../utils/appointmentScheduling';
import { readAppointments, readExamSettings, writeAppointments } from '../../features/admin/storage';
import type { AppointmentWizardTab } from './appointmentController.constants';
import type { AppointmentValidationContext } from '../../schemas/appointmentSchema';
import { appointmentService } from '../../services/appointmentService';
import type { AppointmentDto } from '../../services/types';

type UseAppointmentControllerSubmitParams = {
    activeTab: AppointmentWizardTab;
    goToNextTab: () => void;
    validateForm: () => Promise<boolean>;
    formData: AppointmentFormData;
    rescheduleSourceId: string | null;
    userEmail: string | undefined;
    userId: string | undefined;
    setActiveTab: (value: AppointmentWizardTab) => void;
    setSubmitMessage: (value: string) => void;
    setIsSubmitting: (value: boolean) => void;
    setAppointments: (value: AdminAppointmentRecord[]) => void;
    setSubmittedAppointment: (value: AdminAppointmentRecord | null) => void;
    setIsSubmitted: (value: boolean) => void;
    setValidationContext: (context: AppointmentValidationContext) => void;
    lastUnavailableSlotId: string | null;
};

const mapAppointmentDtoToRecord = (dto: AppointmentDto): AdminAppointmentRecord => ({
    id: String(dto.id),
    fullName: dto.fullName,
    idOrPhone: dto.idOrPhone,
    userEmail: dto.userEmail || undefined,
    date: dto.date,
    slotStart: dto.slotStart,
    slotEnd: dto.slotEnd,
    status: dto.status as AppointmentStatus,
    statusReason: dto.statusReason ?? undefined,
    adminNote: dto.adminNote ?? undefined,
    cancelledBy: (dto.cancelledBy as 'user' | 'admin') ?? undefined,
    rescheduleCount: dto.rescheduleCount,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? undefined,
});

export const useAppointmentControllerSubmit = ({
    activeTab,
    goToNextTab,
    validateForm,
    formData,
    rescheduleSourceId,
    userEmail,
    userId,
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

        // Keep all appointments from localStorage for slot-capacity checks (cross-user).
        const latestAppointments = readAppointments();
        const latestSettings = readExamSettings();
        const normalizedEmail = userEmail?.trim().toLowerCase();

        // Fetch this user's own appointments from backend for accurate quota / active-check.
        let userAppointments: AdminAppointmentRecord[];
        const numericUserId = userId ? parseInt(userId, 10) : null;
        if (numericUserId && !isNaN(numericUserId)) {
            try {
                const dtos = await appointmentService.getByUser(numericUserId);
                userAppointments = dtos.map(mapAppointmentDtoToRecord);
            } catch {
                userAppointments = normalizedEmail
                    ? latestAppointments.filter((a) => a.userEmail?.trim().toLowerCase() === normalizedEmail)
                    : [];
            }
        } else {
            userAppointments = normalizedEmail
                ? latestAppointments.filter((a) => a.userEmail?.trim().toLowerCase() === normalizedEmail)
                : [];
        }

        const activeUserAppointments = userAppointments.filter(
            (a) => a.status === 'pending' || a.status === 'approved'
        );
        const lastRejectedUserAppointment =
            [...userAppointments]
                .filter((a) => a.status === 'rejected')
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

        if (!formData.selectedDate || !formData.selectedSlot) {
            setIsSubmitting(false);
            return;
        }

        const sourceAppointment = rescheduleSourceId
            ? latestAppointments.find((appointment) => appointment.id === rescheduleSourceId) || null
            : null;

        const appointmentCode = generateAppointmentCode();
        const createdAt = new Date().toISOString();

        try {
            const result = await appointmentService.create({
                fullName: formData.fullName.trim(),
                idOrPhone: formData.idOrPhone.trim(),
                userEmail: userEmail ?? '',
                userId: userId ? parseInt(userId, 10) : undefined,
                date: formData.selectedDate.toISOString(),
                slotStart: formData.selectedSlot.startTime,
                slotEnd: formData.selectedSlot.endTime,
            });

            if (!result.isSuccess) {
                setSubmitMessage(result.message || 'A apărut o eroare la înregistrarea programării. Vă rugăm încercați din nou.');
                setIsSubmitting(false);
                return;
            }

            const backendId = result.data != null ? String(result.data as number) : `appointment-${Date.now()}`;

            const newAppointment: AdminAppointmentRecord = {
                id: backendId,
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
                              status: 'cancelled' as const,
                              cancelledBy: 'user' as const,
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
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setSubmitMessage('A apărut o eroare la înregistrarea programării. Vă rugăm încercați din nou.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return { handleSubmit };
};
