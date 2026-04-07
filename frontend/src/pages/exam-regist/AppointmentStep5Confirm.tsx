import { useState } from 'react';
import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import toast from 'react-hot-toast';
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

type AppointmentPdfProps = {
    confirmationCode: string;
    confirmationStatus: string;
    candidateName: string;
    confirmationDateLabel: string;
    confirmationTimeLabel: string;
    confirmationLocation: string;
};

const pdfStyles = StyleSheet.create({
    page: {
        paddingTop: 32,
        paddingHorizontal: 36,
        paddingBottom: 40,
        fontSize: 12,
        color: '#0f172a',
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 12,
        marginBottom: 16,
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#003366',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 700,
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
    },
    subtitle: {
        fontSize: 11,
        color: '#475569',
        marginTop: 2,
    },
    meta: {
        textAlign: 'right',
    },
    metaRow: {
        marginBottom: 4,
    },
    metaLabel: {
        color: '#64748b',
    },
    metaValue: {
        fontWeight: 700,
    },
    details: {
        borderWidth: 1,
        borderColor: '#d7deea',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 6,
    },
    detailLabel: {
        color: '#64748b',
        fontWeight: 600,
    },
    detailValue: {
        fontWeight: 700,
    },
    note: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        color: '#1f2937',
        fontSize: 11,
        lineHeight: 1.4,
    },
    noteLabel: {
        fontWeight: 700,
    },
});

const AppointmentConfirmationPdf = ({
    confirmationCode,
    confirmationStatus,
    candidateName,
    confirmationDateLabel,
    confirmationTimeLabel,
    confirmationLocation,
}: AppointmentPdfProps) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.header}>
                <View style={pdfStyles.brand}>
                    <View style={pdfStyles.logo}>
                        <Text style={pdfStyles.logoText}>E</Text>
                    </View>
                    <View>
                        <Text style={pdfStyles.title}>e-Electoral</Text>
                        <Text style={pdfStyles.subtitle}>Confirmare programare examen</Text>
                    </View>
                </View>
                <View style={pdfStyles.meta}>
                    <Text style={pdfStyles.metaRow}>
                        <Text style={pdfStyles.metaLabel}>Cod: </Text>
                        <Text style={pdfStyles.metaValue}>{confirmationCode}</Text>
                    </Text>
                    <Text>
                        <Text style={pdfStyles.metaLabel}>Status: </Text>
                        <Text style={pdfStyles.metaValue}>{confirmationStatus}</Text>
                    </Text>
                </View>
            </View>

            <View style={pdfStyles.details}>
                <View style={pdfStyles.detailRow}>
                    <Text style={pdfStyles.detailLabel}>Candidat</Text>
                    <Text style={pdfStyles.detailValue}>{candidateName}</Text>
                </View>
                <View style={pdfStyles.detailRow}>
                    <Text style={pdfStyles.detailLabel}>Data</Text>
                    <Text style={pdfStyles.detailValue}>{confirmationDateLabel}</Text>
                </View>
                <View style={pdfStyles.detailRow}>
                    <Text style={pdfStyles.detailLabel}>Ora</Text>
                    <Text style={pdfStyles.detailValue}>{confirmationTimeLabel}</Text>
                </View>
                <View style={[pdfStyles.detailRow, { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={pdfStyles.detailLabel}>Locație</Text>
                    <Text style={pdfStyles.detailValue}>{confirmationLocation}</Text>
                </View>
            </View>

            <View style={pdfStyles.note}>
                <Text>
                    <Text style={pdfStyles.noteLabel}>Notă:</Text> Vă rugăm să vă prezentați cu 15 minute înainte de ora
                    programării, cu actul de identitate.
                </Text>
            </View>
        </Page>
    </Document>
);

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
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
    const confirmationDateLabel = confirmationDate
        ? `${getDayName(confirmationDate)}, ${formatDate(confirmationDate)}`
        : "N/A";
    const confirmationTimeLabel = confirmationInterval || "N/A";
    const candidateName = formData.fullName || "N/A";

    const handleDownloadPdf = async () => {
        if (isGeneratingPdf) {
            return;
        }

        setIsGeneratingPdf(true);

        try {
            const blob = await pdf(
                <AppointmentConfirmationPdf
                    confirmationCode={confirmationCode}
                    confirmationStatus={confirmationStatus}
                    candidateName={candidateName}
                    confirmationDateLabel={confirmationDateLabel}
                    confirmationTimeLabel={confirmationTimeLabel}
                    confirmationLocation={confirmationLocation}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            const safeCode = confirmationCode.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
            anchor.download = `confirmare-programare-${safeCode || 'programare'}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            toast.error('Nu s-a putut genera PDF-ul. Reîncearcă.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

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
                        {submitMessage || "Programarea dumneavoastră pentru examenul de certificare a fost înregistrată cu succes."}
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
                            <span className="detail-value">{candidateName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Data:</span>
                            <span className="detail-value">{confirmationDateLabel}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Ora:</span>
                            <span className="detail-value">{confirmationTimeLabel}</span>
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
                        <button
                            className="success-btn success-btn-secondary"
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                        >
                            {isGeneratingPdf ? "Se generează PDF..." : "Descarcă PDF"}
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
                            <strong>{candidateName}</strong>
                        </div>
                        <div className="print-row">
                            <span>Data</span>
                            <strong>{confirmationDateLabel}</strong>
                        </div>
                        <div className="print-row">
                            <span>Ora</span>
                            <strong>{confirmationTimeLabel}</strong>
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
