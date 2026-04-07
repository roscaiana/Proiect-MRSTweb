import { useEffect, useMemo } from 'react';
import type { UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import { TIME_SLOTS, type AppointmentFormData } from '../../types/appointment';
import type { AdminAppointmentRecord, ExamSettings } from '../../features/admin/types';
import {
    buildAvailableSlotsForDate,
    getAppointmentsForDate,
    getDailyCapacity,
    getNextEligibleDates,
} from '../../utils/appointmentScheduling';
import type { SlotFilter } from './AppointmentStep3Slots';
import type { AppointmentFormValues } from '../../schemas/appointmentSchema';

type UseAppointmentControllerSlotDataParams = {
    selectedDateKey: string;
    appointments: AdminAppointmentRecord[];
    examSettings: ExamSettings;
    rescheduleSourceId: string | null;
    slotFilter: SlotFilter;
    formData: AppointmentFormData;
    setValue: UseFormSetValue<AppointmentFormValues>;
    trigger: UseFormTrigger<AppointmentFormValues>;
    maxDate: Date;
    setLastUnavailableSlotId: (value: string | null) => void;
};

export const useAppointmentControllerSlotData = ({
    selectedDateKey,
    appointments,
    examSettings,
    rescheduleSourceId,
    slotFilter,
    formData,
    setValue,
    trigger,
    maxDate,
    setLastUnavailableSlotId,
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
            setLastUnavailableSlotId(formData.selectedSlot.id);
            setValue('selectedSlot', null, { shouldValidate: true });
            void trigger('selectedSlot');
        }
    }, [allAvailableSlots, formData.selectedSlot, setLastUnavailableSlotId, setValue, trigger]);

    return {
        allAvailableSlots,
        availableSlots,
        recommendedSlot,
        availabilityPreviewDays,
        currentDayCapacity,
        remainingAppointmentsForDay,
    };
};
