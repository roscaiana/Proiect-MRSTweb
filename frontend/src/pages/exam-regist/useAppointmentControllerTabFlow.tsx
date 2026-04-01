import { useEffect, useMemo } from 'react';
import type { UseFormTrigger } from 'react-hook-form';
import type { AppointmentFormData, FormErrors } from '../../types/appointment';
import { type AppointmentWizardTab } from './appointmentController.constants';
import type { AppointmentFormValues } from '../../schemas/appointmentSchema';

type UseAppointmentControllerTabFlowParams = {
    activeTab: AppointmentWizardTab;
    setActiveTab: (value: AppointmentWizardTab | ((prev: AppointmentWizardTab) => AppointmentWizardTab)) => void;
    formData: AppointmentFormData;
    errors: FormErrors;
    trigger: UseFormTrigger<AppointmentFormValues>;
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export const useAppointmentControllerTabFlow = ({
    activeTab,
    setActiveTab,
    formData,
    errors,
    trigger,
}: UseAppointmentControllerTabFlowParams) => {
    const activateTab = (tab: AppointmentWizardTab) => {
        setActiveTab(tab);
        scrollToTop();
    };

    const isStep1Complete = Boolean(formData.selectedDate) && !errors.date;
    const isStep2Complete = Boolean(formData.selectedSlot) && !errors.slot;
    const isStep3Complete =
        formData.fullName.trim().length > 0 &&
        formData.idOrPhone.trim().length > 0 &&
        !errors.fullName &&
        !errors.idOrPhone;

    const highestUnlockedTab = useMemo<AppointmentWizardTab>(() => {
        if (!isStep1Complete) return 1;
        if (!isStep2Complete) return 2;
        if (!isStep3Complete) return 3;
        return 4;
    }, [isStep1Complete, isStep2Complete, isStep3Complete]);

    const isCurrentTabComplete = useMemo(() => {
        if (activeTab === 1) return isStep1Complete;
        if (activeTab === 2) return isStep2Complete;
        if (activeTab === 3) return isStep3Complete;
        return true;
    }, [activeTab, isStep1Complete, isStep2Complete, isStep3Complete]);

    useEffect(() => {
        if (activeTab > highestUnlockedTab) setActiveTab(highestUnlockedTab);
    }, [activeTab, highestUnlockedTab, setActiveTab]);

    const handleTabClick = (stepNumber: number) => {
        const requestedStep = Math.min(4, Math.max(1, stepNumber)) as AppointmentWizardTab;
        if (requestedStep === activeTab || !isCurrentTabComplete) return;
        if (requestedStep <= highestUnlockedTab) activateTab(requestedStep);
    };

    const goToPreviousTab = () => {
        if (activeTab <= 1 || !isCurrentTabComplete) return;
        activateTab((activeTab - 1) as AppointmentWizardTab);
    };

    const goToNextTab = async () => {
        if (activeTab === 1) {
            const valid = await trigger('selectedDate');
            if (valid) activateTab(2);
            return;
        }
        if (activeTab === 2) {
            const valid = await trigger('selectedSlot');
            if (valid) activateTab(3);
            return;
        }
        if (activeTab === 3) {
            const valid = await trigger(['fullName', 'idOrPhone']);
            if (valid) activateTab(4);
        }
    };

    return {
        highestUnlockedTab,
        isCurrentTabComplete,
        canGoBack: activeTab > 1 && isCurrentTabComplete,
        canGoNext: activeTab < 4 && isCurrentTabComplete,
        handleTabClick,
        goToPreviousTab,
        goToNextTab,
    };
};
