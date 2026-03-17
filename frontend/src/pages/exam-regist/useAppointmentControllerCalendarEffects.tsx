import { useEffect } from 'react';
import type { RefObject } from 'react';
import { clampMonth as clampMonthToRange, startOfMonth } from '../../utils/calendarUtils';
import type { AppointmentFormData } from '../../types/appointment';

type UseAppointmentControllerCalendarEffectsParams = {
    formData: AppointmentFormData;
    minDate: Date;
    maxDate: Date;
    isCalendarOpen: boolean;
    calendarPickerRef: RefObject<HTMLDivElement | null>;
    setCalendarMonth: (value: Date) => void;
    setIsCalendarOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
};

export const useAppointmentControllerCalendarEffects = ({
    formData,
    minDate,
    maxDate,
    isCalendarOpen,
    calendarPickerRef,
    setCalendarMonth,
    setIsCalendarOpen,
}: UseAppointmentControllerCalendarEffectsParams) => {
    useEffect(() => {
        if (!formData.selectedDate) return;
        setCalendarMonth(clampMonthToRange(startOfMonth(formData.selectedDate), minDate, maxDate));
    }, [formData.selectedDate, minDate, maxDate, setCalendarMonth]);

    useEffect(() => {
        if (!isCalendarOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (!calendarPickerRef.current) return;
            if (event.target instanceof Node && !calendarPickerRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsCalendarOpen(false);
        };

        window.addEventListener('mousedown', handleOutsideClick);
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isCalendarOpen, calendarPickerRef, setIsCalendarOpen]);
};
