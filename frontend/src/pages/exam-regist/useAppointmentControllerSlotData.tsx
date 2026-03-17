import { useEffect, useMemo } from 'react';
import { TIME_SLOTS, type AppointmentFormData, type FormErrors } from '../../types/appointment';
import type { AdminAppointmentRecord, ExamSettings } from '../../features/admin/types';
import {
    buildAvailableSlotsForDate,
    getAppointmentsForDate,
    getDailyCapacity,
    getNextEligibleDates,
} from '../../utils/appointmentScheduling';
import type { SlotFilter } from './AppointmentStep3Slots';

type UseAppointmentControllerSlotDataParams = {
    selectedDateKey: string;
    appointments: AdminAppointmentRecord[];
    examSettings: ExamSettings;
    rescheduleSourceId: string | null;
    slotFilter: SlotFilter;
    formData: AppointmentFormData;
    setFormData: (value: AppointmentFormData | ((prev: AppointmentFormData) => AppointmentFormData)) => void;
    setErrors: (value: FormErrors | ((prev: FormErrors) => FormErrors)) => void;
    maxDate: Date;
};

export const useAppointmentControllerSlotData = ({
    selectedDateKey,
    appointments,
    examSettings,
    rescheduleSourceId,
    slotFilter,
    formData,
    setFormData,
    setErrors,
    maxDate,
}: UseAppointmentControllerSlotDataParams) => {
    const selectedDayAppointments = useMemo(() => {
        if (!selectedDateKey) return [];
        return getAppointmentsForDate(appointments, selectedDateKey, {
            activeOnly: true,
            excludeId: rescheduleSourceId || undefined,
        });
    }, [appointments, selectedDateKey, rescheduleSourceId]);

    const currentDayCapacity = useMemo(() => {
        if (!selectedDateKey) return examSettings.appointmentsPerDay;
        return getDailyCapacity(examSettings, selectedDateKey);
    }, [examSettings, selectedDateKey]);

    const remainingAppointmentsForDay = useMemo(
        () => Math.max(0, currentDayCapacity - selectedDayAppointments.length),
        [currentDayCapacity, selectedDayAppointments.length]
    );

    const allAvailableSlots = useMemo(() => {
        if (!selectedDateKey) return TIME_SLOTS.map((slot) => ({ ...slot }));
        return buildAvailableSlotsForDate(examSettings, appointments, selectedDateKey, {
            excludeAppointmentId: rescheduleSourceId || undefined,
        });
    }, [appointments, examSettings, selectedDateKey, rescheduleSourceId]);

    const availableSlots = useMemo(() => {
        return allAvailableSlots.filter((slot) => {
            const hour = Number(slot.startTime.split(':')[0] || 0);
            if (slotFilter === 'midday') return hour < 14;
            if (slotFilter === 'afternoon') return hour >= 14;
            return true;
        });
    }, [allAvailableSlots, slotFilter]);

    const recommendedSlot = useMemo(() => allAvailableSlots.find((slot) => slot.available) || null, [allAvailableSlots]);
    const availabilityPreviewDays = useMemo(
        () => getNextEligibleDates(examSettings, appointments, { count: 12, startDate: new Date(), maxDate }),
        [appointments, examSettings, maxDate]
    );

    useEffect(() => {
        if (!formData.selectedSlot) return;
        const stillAvailable = allAvailableSlots.some((slot) => slot.id === formData.selectedSlot?.id && slot.available);
        if (!stillAvailable) {
            setFormData((prev) => ({ ...prev, selectedSlot: null }));
            setErrors((prev) => ({ ...prev, slot: 'Intervalul selectat nu mai este disponibil. Alege alt interval.' }));
        }
    }, [allAvailableSlots, formData.selectedSlot, setErrors, setFormData]);

    return {
        allAvailableSlots,
        availableSlots,
        recommendedSlot,
        availabilityPreviewDays,
        currentDayCapacity,
        remainingAppointmentsForDay,
    };
};
