import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppointmentControllerTabFlow } from '../pages/exam-regist/useAppointmentControllerTabFlow';
import type { AppointmentFormData, FormErrors } from '../types/appointment';
import type { AppointmentWizardTab } from '../pages/exam-regist/appointmentController.constants';

const baseFormData: AppointmentFormData = {
    fullName: 'Ion Popescu',
    idOrPhone: '+37312345678',
    selectedDate: new Date('2030-01-10T10:00:00Z'),
    selectedSlot: {
        id: 'slot-1',
        startTime: '09:00',
        endTime: '09:30',
        available: true,
    },
};

const noErrors: FormErrors = {};

describe('useAppointmentControllerTabFlow', () => {
    it('advances to the next tab when step 1 is valid', async () => {
        const setActiveTab = vi.fn();
        const trigger = vi.fn().mockResolvedValue(true);

        const { result } = renderHook(() =>
            useAppointmentControllerTabFlow({
                activeTab: 1 as AppointmentWizardTab,
                setActiveTab,
                formData: baseFormData,
                errors: noErrors,
                trigger,
            })
        );

        await act(async () => {
            await result.current.goToNextTab();
        });

        expect(trigger).toHaveBeenCalledWith('selectedDate');
        expect(setActiveTab).toHaveBeenCalledWith(2);
    });

    it('blocks manual tab change when current step is incomplete', () => {
        const setActiveTab = vi.fn();
        const trigger = vi.fn().mockResolvedValue(true);
        const incompleteFormData: AppointmentFormData = {
            ...baseFormData,
            selectedDate: null,
        };
        const errors: FormErrors = { date: 'Alege o dată' };

        const { result } = renderHook(() =>
            useAppointmentControllerTabFlow({
                activeTab: 1 as AppointmentWizardTab,
                setActiveTab,
                formData: incompleteFormData,
                errors,
                trigger,
            })
        );

        act(() => {
            result.current.handleTabClick(2);
        });

        expect(setActiveTab).not.toHaveBeenCalled();
    });
});
