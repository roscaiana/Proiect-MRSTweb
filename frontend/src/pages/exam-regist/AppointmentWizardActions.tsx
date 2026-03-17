import type { AppointmentPageController } from './useAppointmentPageController';

type AppointmentWizardActionsProps = {
    controller: AppointmentPageController;
};

export default function AppointmentWizardActions({ controller }: AppointmentWizardActionsProps) {
    const { activeTab, canGoBack, canGoNext, isSubmitting, rescheduleSourceId, goToPreviousTab } = controller;

    return (
        <div className="form-actions wizard-actions">
            {activeTab > 1 && (
                <button type="button" className="btn-back" onClick={goToPreviousTab} disabled={!canGoBack}>
                    Înapoi
                </button>
            )}

            <button type="submit" className="btn-submit" disabled={activeTab < 4 ? !canGoNext : isSubmitting}>
                {activeTab === 4 && isSubmitting ? (
                    <>
                        <span className="spinner"></span>
                        Se procesează...
                    </>
                ) : (
                    <>
                        {activeTab < 4 ? 'Continuă' : (rescheduleSourceId ? 'Trimite Reprogramarea' : 'Confirmă Programarea')}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </>
                )}
            </button>
        </div>
    );
}
