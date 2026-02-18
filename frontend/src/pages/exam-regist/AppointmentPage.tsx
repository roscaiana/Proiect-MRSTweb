import React, { useState, useMemo } from 'react';
import { AppointmentFormData, FormErrors, TIME_SLOTS } from '../../types/appointment';
import {
    isAllowedDay,
    //getNextAvailableDate,
    formatDate,
    formatDateForInput,
    getDayName,
    getMonthName
} from '../../utils/dateUtils';
import './AppointmentPage.css';

const AppointmentPage: React.FC = () => {
    const [formData, setFormData] = useState<AppointmentFormData>({
        fullName: '',
        idOrPhone: '',
        selectedDate: null,
        selectedSlot: null
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get minimum selectable date (Jan 1st, 2026)
    const minDate = useMemo(() => {
        // Set strictly to 2026
        const date = new Date(2026, 0, 1); // January 1st, 2026
        return date;
    }, []);

    // Get maximum selectable date (Dec 31st, 2050)
    const maxDate = useMemo(() => {
        const date = new Date(2050, 11, 31); // December 31st, 2050
        return date;
    }, []);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value;
        if (!dateString) {
            setFormData({ ...formData, selectedDate: null });
            return;
        }

        const selectedDate = new Date(dateString + 'T00:00:00');

        if (isAllowedDay(selectedDate)) {
            setFormData({ ...formData, selectedDate });
            setErrors({ ...errors, date: undefined });
        } else {
            setErrors({ ...errors, date: 'Vă rugăm să selectați Luni, Miercuri sau Vineri' });
        }
    };

    const handleSlotSelect = (slotId: string) => {
        const slot = TIME_SLOTS.find(s => s.id === slotId);
        if (slot) {
            setFormData({ ...formData, selectedSlot: slot });
            setErrors({ ...errors, slot: undefined });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Numele complet este obligatoriu';
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Numele trebuie să conțină cel puțin 3 caractere';
        }

        if (!formData.idOrPhone.trim()) {
            newErrors.idOrPhone = 'IDNP sau Telefonul este obligatoriu';
        } else if (formData.idOrPhone.trim().length < 6) {
            newErrors.idOrPhone = 'Introduceți un număr de telefon valid';
        }

        if (!formData.selectedDate) {
            newErrors.date = 'Vă rugăm să selectați o dată';
        }

        if (!formData.selectedSlot) {
            newErrors.slot = 'Vă rugăm să selectați un interval orar';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNewAppointment = () => {
        setFormData({
            fullName: '',
            idOrPhone: '',
            selectedDate: null,
            selectedSlot: null
        });
        setErrors({});
        setIsSubmitted(false);
    };

    if (isSubmitted) {
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
                            Programarea dumneavoastră pentru examenul de certificare a fost înregistrată cu succes.
                        </p>
                        <div className="appointment-details">
                            <div className="detail-row">
                                <span className="detail-label">Candidat:</span>
                                <span className="detail-value">{formData.fullName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Data:</span>
                                <span className="detail-value">
                  {formData.selectedDate && `${getDayName(formData.selectedDate)}, ${formatDate(formData.selectedDate)}`}
                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Ora:</span>
                                <span className="detail-value">
                  {formData.selectedSlot && `${formData.selectedSlot.startTime} - ${formData.selectedSlot.endTime}`}
                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Locație:</span>
                                <span className="detail-value">Centrul de Instruire Continuă, Sala A-12</span>
                            </div>
                        </div>
                        <div className="success-actions">
                            <button className="success-btn success-btn-primary" onClick={handleNewAppointment}>
                                Programare Nouă
                            </button>
                            <button className="success-btn success-btn-secondary" onClick={() => window.print()}>
                                Printează Confirmare
                            </button>
                        </div>
                        <p className="success-note">
                            <strong>Notă:</strong> Un email de confirmare a fost trimis la adresa dumneavoastră.
                            Vă rugăm să vă prezentați cu 15 minute înainte de ora programării cu actul de identitate.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="appointment-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <h1>Înscriere la Examen</h1>
                    <p className="page-subtitle">
                        Programați-vă pentru examenul de certificare electorală. Alegeți data și intervalul orar care vi se potrivește.
                    </p>
                </div>

                {/* Appointment Form */}
                <form className="appointment-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Date Selection Card */}
                        <div className="form-card">
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <h3>Selectați Data</h3>
                            <p className="card-description">
                                Puteți programa examenul doar în zilele de <strong>Luni, Miercuri și Vineri</strong>.
                            </p>

                            <div className="form-group">
                                <label htmlFor="examDate">
                                    Alege Data <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="examDate"
                                    className={`date-input ${errors.date ? 'error' : ''}`}
                                    min={formatDateForInput(minDate)}
                                    max={formatDateForInput(maxDate)}
                                    onChange={handleDateChange}
                                    value={formData.selectedDate ? formatDateForInput(formData.selectedDate) : ''}
                                />
                                {errors.date && <span className="error-message">{errors.date}</span>}
                                {formData.selectedDate && (
                                    <div className="selected-date-display">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        {getDayName(formData.selectedDate)}, {formData.selectedDate.getDate()} {getMonthName(formData.selectedDate)} {formData.selectedDate.getFullYear()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Time Slot Selection Card */}
                        <div className="form-card">
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <h3>Selectați Intervalul Orar</h3>
                            <p className="card-description">
                                Alegeți intervalul orar care vi se potrivește pentru examen.
                            </p>

                            <div className="time-slots">
                                {TIME_SLOTS.map((slot) => (
                                    <button
                                        key={slot.id}
                                        type="button"
                                        className={`time-slot ${formData.selectedSlot?.id === slot.id ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                                        onClick={() => handleSlotSelect(slot.id)}
                                        disabled={!slot.available}
                                    >
                                        <div className="slot-time">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            <span>{slot.startTime} - {slot.endTime}</span>
                                        </div>
                                        {formData.selectedSlot?.id === slot.id && (
                                            <div className="check-icon">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {errors.slot && <span className="error-message">{errors.slot}</span>}
                        </div>

                        {/* Personal Information Card */}
                        <div className="form-card full-width">
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <h3>Informații Personale</h3>
                            <p className="card-description">
                                Introduceți datele dumneavoastră personale pentru confirmare.
                            </p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName">
                                        Nume Complet <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        className={`text-input ${errors.fullName ? 'error' : ''}`}
                                        placeholder="Ex: Ion Popescu"
                                        value={formData.fullName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, fullName: e.target.value });
                                            setErrors({ ...errors, fullName: undefined });
                                        }}
                                    />
                                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="idOrPhone">
                                        Număr de Telefon <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="idOrPhone"
                                        className={`text-input ${errors.idOrPhone ? 'error' : ''}`}
                                        placeholder="Ex: +373 69 123 456"
                                        value={formData.idOrPhone}
                                        onChange={(e) => {
                                            setFormData({ ...formData, idOrPhone: e.target.value });
                                            setErrors({ ...errors, idOrPhone: undefined });
                                        }}
                                    />
                                    {errors.idOrPhone && <span className="error-message">{errors.idOrPhone}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Information */}
                    <div className="info-box">
                        <div className="info-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </div>
                        <div className="info-content">
                            <h4>Informații Importante</h4>
                            <ul>
                                <li>Examenul durează aproximativ 30 minute</li>
                                <li>Vă rugăm să vă prezentați cu 15 minute înainte de ora programării</li>
                                <li>Este necesar să aveți actul de identitate asupra dumneavoastră</li>
                                <li>Veți primi un email de confirmare după înregistrare</li>
                            </ul>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner"></span>
                                    Se procesează...
                                </>
                            ) : (
                                <>
                                    Confirmă Programarea
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentPage;



