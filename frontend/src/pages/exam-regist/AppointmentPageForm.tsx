import { CalendarCheck } from 'lucide-react';
import AppointmentStepperItem from './AppointmentStepperItem';
import AppointmentWizardActions from './AppointmentWizardActions';
import AppointmentWizardTabContent from './AppointmentWizardTabContent';
import type { AppointmentPageController } from './useAppointmentPageController';
import { WIZARD_TAB_LABELS } from './useAppointmentPageController';

type AppointmentPageFormProps = {
    controller: AppointmentPageController;
};

export default function AppointmentPageForm({ controller }: AppointmentPageFormProps) {
    const {
        activeTab,
        highestUnlockedTab,
        handleTabClick,
        rescheduleSourceAppointment,
        rescheduleSourceId,
        activeUserAppointments,
        handleSubmit,
        formData,
        formatDate,
        examSettings,
        selectedDateKey,
        remainingAppointmentsForDay,
        currentDayCapacity,
    } = controller;

    return (
        <div className="appointment-page appointment-page-form">
            <section className="appointment-hero-simple" aria-labelledby="appointment-page-title">
                <div className="appointment-hero-overlay appointment-hero-overlay-right" />
                <div className="appointment-hero-overlay appointment-hero-overlay-left" />
                <div className="container">
                    <div className="appointment-hero-simple-content">
                        <div className="page-hero-badge">
                            <span className="page-hero-badge-icon" aria-hidden="true">
                                <CalendarCheck />
                            </span>
                            <span className="uppercase">Înscriere examen</span>
                        </div>
                        <h1 id="appointment-page-title">
                            Înscriere <span className="appointment-hero-title-highlight">Examen</span>
                        </h1>
                        <p className="appointment-hero-subtitle">
                            Completează formularul în pași pentru a finaliza înscrierea.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container appointment-content-shell">
                <div className="appointment-content-panel">
                    <div className="appointment-stepper" aria-label="Pași programare" role="tablist">
                        {WIZARD_TAB_LABELS.map((label, index) => (
                            <AppointmentStepperItem
                                key={label}
                                label={label}
                                index={index}
                                activeTab={activeTab}
                                highestUnlockedTab={highestUnlockedTab}
                                onTabClick={handleTabClick}
                            />
                        ))}
                    </div>

                    {rescheduleSourceAppointment && (
                        <div className="appointment-inline-banner info">
                            Reprogramezi cererea <strong>{rescheduleSourceAppointment.appointmentCode || rescheduleSourceAppointment.id}</strong>
                            {' '}({formatDate(new Date(rescheduleSourceAppointment.date))}, {rescheduleSourceAppointment.slotStart}-{rescheduleSourceAppointment.slotEnd}).
                        </div>
                    )}
                    {!rescheduleSourceId && activeUserAppointments.length > 0 && (
                        <div className="appointment-inline-banner warning">
                            Ai deja o programare activă. Pentru o nouă dată/oră, folosește <strong>Reprogramează</strong> din dashboard.
                        </div>
                    )}

                    <form className="appointment-form" onSubmit={handleSubmit} autoComplete="off">
                        <div className="appointment-summary-card">
                            <div className="appointment-summary-header">
                                <h3>Rezumat programare</h3>
                                <span className={`summary-chip ${rescheduleSourceId ? 'reschedule' : ''}`}>
                                    {rescheduleSourceId ? 'Reprogramare' : 'Cerere nouă'}
                                </span>
                            </div>
                            <div className="appointment-summary-grid">
                                <div><span>Data</span><strong>{formData.selectedDate ? formatDate(formData.selectedDate) : 'Neselectată'}</strong></div>
                                <div><span>Interval</span><strong>{formData.selectedSlot ? `${formData.selectedSlot.startTime}-${formData.selectedSlot.endTime}` : 'Neselectat'}</strong></div>
                                <div><span>Locație</span><strong>{examSettings.appointmentLocation}</strong></div>
                                <div><span>Sală</span><strong>{examSettings.appointmentRoom}</strong></div>
                                <div><span>Lead time</span><strong>{examSettings.appointmentLeadTimeHours}h</strong></div>
                                <div><span>Capacitate/zi</span><strong>{selectedDateKey ? `${remainingAppointmentsForDay}/${currentDayCapacity} libere` : `${examSettings.appointmentsPerDay}/zi`}</strong></div>
                            </div>
                        </div>

                        <AppointmentWizardTabContent controller={controller} />
                        <AppointmentWizardActions controller={controller} />
                    </form>
                </div>
            </div>
        </div>
    );
}
