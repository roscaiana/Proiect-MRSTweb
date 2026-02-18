import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCredentials, AuthError } from '../../../types/user';
import { validateLogin, mockLogin } from '../../../utils/authUtils';
import { useAuth } from '../../../context/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState<AuthCredentials>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<AuthError[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError('');

        // Validate form
        const validationErrors = validateLogin(credentials);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors([]);

        try {
            // Mock login
            const user = await mockLogin(credentials, isAdmin);

            // Use AuthContext to store auth state
            const mockToken = `token-${Date.now()}`;
            login(user, mockToken);

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            setGeneralError(error.message || 'Eroare la autentificare');
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (field: string): string | undefined => {
        return errors.find(e => e.field === field)?.message;
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

                {/* Login Card */}
                <div className="auth-card">
                    <div className="auth-card-header">
                        <h2>Autentificare</h2>
                        <p>Conectați-vă la contul dumneavoastră</p>
                    </div>

                    {/* User Type Toggle */}
                    <div className="user-type-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${!isAdmin ? 'active' : ''}`}
                            onClick={() => setIsAdmin(false)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Candidat
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${isAdmin ? 'active' : ''}`}
                            onClick={() => setIsAdmin(true)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                            Administrator
                        </button>
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

                    {/* Login Form */}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                className={`text-input ${getFieldError('email') ? 'error' : ''}`}
                                placeholder="utilizator@exemplu.com"
                                value={credentials.email}
                                onChange={(e) => {
                                    setCredentials({ ...credentials, email: e.target.value });
                                    setErrors(errors.filter(err => err.field !== 'email'));
                                }}
                            />
                            {getFieldError('email') && (
                                <span className="error-message">{getFieldError('email')}</span>
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
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => {
                                        setCredentials({ ...credentials, password: e.target.value });
                                        setErrors(errors.filter(err => err.field !== 'password'));
                                    }}
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

                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Se autentifică...
                                    </>
                                ) : (
                                    <>
                                        Autentificare
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Register Link */}
                    <div className="auth-footer">
                        <p>
                            Nu aveți un cont?{' '}
                            <Link to="/register" className="auth-link">
                                Înregistrați-vă
                            </Link>
                        </p>
                    </div>

                    {/* Admin Hint */}
                    {isAdmin && (
                        <div className="auth-hint">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span>Credențiale admin: admin@electoral.md / admin123</span>
                        </div>
                    )}
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

export default LoginPage;
