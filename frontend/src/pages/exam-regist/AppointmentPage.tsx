import AppointmentStep5Confirm from './AppointmentStep5Confirm';
import AppointmentPageForm from './AppointmentPageForm';
import { useAppointmentPageController } from './useAppointmentPageController';
import './AppointmentPage.css';

export default function AppointmentPage() {
    const controller = useAppointmentPageController();

    if (controller.isSubmitted) {
        return (
            <AppointmentStep5Confirm
                submitMessage={controller.submitMessage}
                submittedAppointment={controller.submittedAppointment}
                formData={controller.formData}
                appointmentLocation={controller.examSettings.appointmentLocation}
                appointmentRoom={controller.examSettings.appointmentRoom}
                getDayName={controller.getDayName}
                formatDate={controller.formatDate}
                onNewAppointment={controller.handleNewAppointment}
            />
        );
    }

    return <AppointmentPageForm controller={controller} />;
}
