import type { AdminAppointmentRecord } from '../../features/admin/types';
import type { AppointmentFormData } from '../../types/appointment';

type AppointmentStep5ConfirmProps = {
    submitMessage: string;
    submittedAppointment: AdminAppointmentRecord | null;
    formData: AppointmentFormData;
    appointmentLocation: string;
    appointmentRoom: string;
    getDayName: (date: Date) => string;
    formatDate: (date: Date) => string;
    onNewAppointment: () => void;
};

export default function AppointmentStep5Confirm({
    submitMessage,
    submittedAppointment,
    formData,
    appointmentLocation,
    appointmentRoom,
    getDayName,
    formatDate,
    onNewAppointment,
}: AppointmentStep5ConfirmProps) {
    const confirmationDate =
        formData.selectedDate ?? (submittedAppointment ? new Date(submittedAppointment.date) : null);
    const confirmationInterval = formData.selectedSlot
        ? `${formData.selectedSlot.startTime} - ${formData.selectedSlot.endTime}`
        : submittedAppointment
            ? `${submittedAppointment.slotStart} - ${submittedAppointment.slotEnd}`
            : "";
    const confirmationCode = submittedAppointment?.appointmentCode || "N/A";
    const confirmationStatus = "În așteptare confirmare";
    const confirmationLocation = `${appointmentLocation}, ${appointmentRoom}`;

    return (
        <div className="appointment-page">
            <div className="container">
                <div className="success-card screen-only">
                    <div className="success-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#FFCC00" strokeWidth="2" />
                            <path d="M8 12l2 2 4-4" stroke="#FFCC00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2>Programare Confirmată!</h2>
                    <p className="success-message">
                        {submitMessage || 'Programarea dumneavoastră pentru examenul de certificare a fost înregistrată cu succes.'}
                    </p>
                    <div className="appointment-details">
                        <div className="detail-row">
                            <span className="detail-label">Cod programare:</span>
                            <span className="detail-value">{confirmationCode}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value">{confirmationStatus}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Candidat:</span>
                            <span className="detail-value">{formData.fullName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Data:</span>
                            <span className="detail-value">
                                {confirmationDate
                                    ? `${getDayName(confirmationDate)}, ${formatDate(confirmationDate)}`
                                    : "N/A"}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Ora:</span>
                            <span className="detail-value">
                                {confirmationInterval || "N/A"}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Locație:</span>
                            <span className="detail-value">{confirmationLocation}</span>
                        </div>
                    </div>
                    <div className="appointment-next-steps">
                        <h4>Pași următori</h4>
                        <ul>
                            <li>Verifică dashboard-ul pentru aprobarea sau respingerea cererii.</li>
                            <li>Poți anula sau reprograma cererea direct din dashboard (în limitele permise).</li>
                            <li>Vei primi notificări în aplicație la schimbarea statusului.</li>
                        </ul>
                    </div>
                    <div className="success-actions">
                        <button className="success-btn success-btn-primary" onClick={onNewAppointment}>
                            Programare Nouă
                        </button>
                        <button className="success-btn success-btn-secondary" onClick={() => window.print()}>
                            Printează Confirmare
                        </button>
                    </div>
                    <p className="success-note">
                        <strong>Notă:</strong> Vă rugăm să vă prezentați cu 15 minute înainte de ora programării
                        cu actul de identitate. Dacă apar schimbări, statusul se actualizează în dashboard.
                    </p>
                </div>

                <div className="print-sheet print-only" aria-hidden="true">
                    <div className="print-header">
                        <div className="print-brand">
                            <div className="print-logo">E</div>
                            <div>
                                <div className="print-title">e-Electoral</div>
                                <div className="print-subtitle">Confirmare programare examen</div>
                            </div>
                        </div>
                        <div className="print-meta">
                            <div><span>Cod:</span> <strong>{confirmationCode}</strong></div>
                            <div><span>Status:</span> <strong>{confirmationStatus}</strong></div>
                        </div>
                    </div>

                    <div className="print-details">
                        <div className="print-row">
                            <span>Candidat</span>
                            <strong>{formData.fullName}</strong>
                        </div>
                        <div className="print-row">
                            <span>Data</span>
                            <strong>
                                {confirmationDate
                                    ? `${getDayName(confirmationDate)}, ${formatDate(confirmationDate)}`
                                    : "N/A"}
                            </strong>
                        </div>
                        <div className="print-row">
                            <span>Ora</span>
                            <strong>{confirmationInterval || "N/A"}</strong>
                        </div>
                        <div className="print-row">
                            <span>Locație</span>
                            <strong>{confirmationLocation}</strong>
                        </div>
                    </div>

                    <div className="print-note">
                        <strong>Notă:</strong> Vă rugăm să vă prezentați cu 15 minute înainte de ora programării,
                        cu actul de identitate.
                    </div>
                </div>
            </div>
        </div>
    );
}
