import { useEffect, useMemo } from 'react';
import type { AppointmentFormData, FormErrors } from '../../types/appointment';
import { PHONE_NUMBER_PATTERN, type AppointmentWizardTab } from './appointmentController.constants';

type UseAppointmentControllerTabFlowParams = {
    activeTab: AppointmentWizardTab;
    setActiveTab: (value: AppointmentWizardTab | ((prev: AppointmentWizardTab) => AppointmentWizardTab)) => void;
    formData: AppointmentFormData;
    errors: FormErrors;
    setErrors: (value: FormErrors | ((prev: FormErrors) => FormErrors)) => void;
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export const useAppointmentControllerTabFlow = ({
    activeTab,
    setActiveTab,
    formData,
    errors,
    setErrors,
}: UseAppointmentControllerTabFlowParams) => {
    const activateTab = (tab: AppointmentWizardTab) => {
        setActiveTab(tab);
        scrollToTop();
    };

    const isStep1Complete = Boolean(formData.selectedDate) && !errors.date;
    const isStep2Complete = Boolean(formData.selectedSlot) && !errors.slot;
    const isStep3Complete =
        formData.fullName.trim().length >= 3 &&
        PHONE_NUMBER_PATTERN.test(formData.idOrPhone.trim()) &&
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

    const goToNextTab = () => {
        if (activeTab === 1) {
            if (!formData.selectedDate) setErrors((prev) => ({ ...prev, date: 'Vă rugăm să selectați o dată.' }));
            if (formData.selectedDate && !errors.date) activateTab(2);
            return;
        }
        if (activeTab === 2) {
            if (!formData.selectedSlot) setErrors((prev) => ({ ...prev, slot: 'Vă rugăm să selectați un interval orar.' }));
            if (formData.selectedSlot && !errors.slot) activateTab(3);
            return;
        }
        if (activeTab === 3) {
            const personalInfoErrors: FormErrors = {};
            if (!formData.fullName.trim()) personalInfoErrors.fullName = 'Numele complet este obligatoriu';
            else if (formData.fullName.trim().length < 3) personalInfoErrors.fullName = 'Numele trebuie să conțină cel puțin 3 caractere';
            if (!formData.idOrPhone.trim()) personalInfoErrors.idOrPhone = 'Numărul de telefon este obligatoriu';
            else if (!PHONE_NUMBER_PATTERN.test(formData.idOrPhone.trim())) personalInfoErrors.idOrPhone = 'Număr invalid. Folosește 9 cifre și prefix: 068, 069, 078 sau 079.';
            if (Object.keys(personalInfoErrors).length > 0) setErrors((prev) => ({ ...prev, ...personalInfoErrors }));
            else {
                setErrors((prev) => ({ ...prev, fullName: undefined, idOrPhone: undefined }));
                activateTab(4);
            }
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
