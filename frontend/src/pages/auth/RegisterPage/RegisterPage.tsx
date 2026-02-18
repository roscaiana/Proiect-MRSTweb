import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterData, AuthError } from '../../../types/user';
import { validateRegistration, mockRegister } from '../../../utils/authUtils';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState<RegisterData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<AuthError[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError('');

        // Validate form
        const validationErrors = validateRegistration(formData);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors([]);

        try {
            // Mock register
            await mockRegister(formData);

            // Redirect to login with success message
            navigate('/login?registered=true');
        } catch (error: any) {
            setGeneralError(error.message || 'Eroare la înregistrare');
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (field: string): string | undefined => {
        return errors.find(e => e.field === field)?.message;
    };

    const updateField = (field: keyof RegisterData, value: string) => {
        setFormData({ ...formData, [field]: value });
        setErrors(errors.filter(err => err.field !== field));
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Logo Section */}
                <div className="auth-header">
                    <Link to="/" className="auth-logo">
                        <div className="hexagon">
                            <span className="logo-letter">E</span>
                        </div>
                        <div className="auth-logo-text">
                            <h1>e-Electoral</h1>
                            <p>CERTIFICARE & INTEGRITATE</p>
                        </div>
                    </Link>
                </div>

                {/* Register Card */}
                <div className="auth-card">
                    <div className="auth-card-header">
                        <h2>Înregistrare</h2>
                        <p>Creați un cont nou pentru a accesa platforma</p>
                    </div>

                    {/* General Error */}
                    {generalError && (
                        <div className="alert alert-error">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {generalError}
                        </div>
                    )}

                    {/* Register Form */}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="fullName">
                                Nume Complet <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                className={`text-input ${getFieldError('fullName') ? 'error' : ''}`}
                                placeholder="Ex: Ion Popescu"
                                value={formData.fullName}
                                onChange={(e) => updateField('fullName', e.target.value)}
                            />
                            {getFieldError('fullName') && (
                                <span className="error-message">{getFieldError('fullName')}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                className={`text-input ${getFieldError('email') ? 'error' : ''}`}
                                placeholder="utilizator@exemplu.com"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                            />
                            {getFieldError('email') && (
                                <span className="error-message">{getFieldError('email')}</span>
                            )}
                            {!getFieldError('email') && formData.email && (
                                <span className="input-hint">
                                    Asigurați-vă că formatul este corect (ex: nume@domeniu.com)
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Parolă <span className="required">*</span>
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className={`text-input ${getFieldError('password') ? 'error' : ''}`}
                                    placeholder="Minimum 6 caractere"
                                    value={formData.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {getFieldError('password') && (
                                <span className="error-message">{getFieldError('password')}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                Confirmă Parola <span className="required">*</span>
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className={`text-input ${getFieldError('confirmPassword') ? 'error' : ''}`}
                                    placeholder="Reintroduceți parola"
                                    value={formData.confirmPassword}
                                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? "Ascunde parola" : "Arată parola"}
                                >
                                    {showConfirmPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {getFieldError('confirmPassword') && (
                                <span className="error-message">{getFieldError('confirmPassword')}</span>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Se înregistrează...
                                    </>
                                ) : (
                                    <>
                                        Înregistrare
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="8.5" cy="7" r="4" />
                                            <line x1="20" y1="8" x2="20" y2="14" />
                                            <line x1="23" y1="11" x2="17" y2="11" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Login Link */}
                    <div className="auth-footer">
                        <p>
                            Aveți deja un cont?{' '}
                            <Link to="/login" className="auth-link">
                                Autentificați-vă
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="auth-back">
                    <Link to="/" className="back-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Înapoi la pagina principală
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
