import type { UseFormTrigger } from 'react-hook-form';
import type { AppointmentFormValues } from '../../schemas/appointmentSchema';

type UseAppointmentControllerValidationParams = {
    trigger: UseFormTrigger<AppointmentFormValues>;
};

export const useAppointmentControllerValidation = ({
    trigger,
}: UseAppointmentControllerValidationParams) => {
    const validateForm = async (): Promise<boolean> => {
        return await trigger();
    };

    return { validateForm };
};
