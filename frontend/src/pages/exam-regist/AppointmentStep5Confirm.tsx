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
    return (
        <div className="appointment-page">
            <div className="container">
                <div className="success-card">
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
                            <span className="detail-value">{submittedAppointment?.appointmentCode || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value">În așteptare confirmare</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Candidat:</span>
                            <span className="detail-value">{formData.fullName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Data:</span>
                            <span className="detail-value">
                                {formData.selectedDate ? `${getDayName(formData.selectedDate)}, ${formatDate(formData.selectedDate)}` : "N/A"}
                            </span>                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Ora:</span>
                            <span className="detail-value">
                                {formData.selectedSlot && `${formData.selectedSlot.startTime} - ${formData.selectedSlot.endTime}`}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Locație:</span>
                            <span className="detail-value">{appointmentLocation}, {appointmentRoom}</span>
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
            </div>
        </div>
    );
}
