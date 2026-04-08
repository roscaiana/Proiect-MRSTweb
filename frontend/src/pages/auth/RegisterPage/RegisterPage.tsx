import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { registerWithApi } from '../../../api/authService';
import { notifyAdmins } from '../../../utils/appEventNotifications';
import { registerSchema, type RegisterFormValues } from '../../../schemas/authSchemas';
import './RegisterPage.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState<string>('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        reValidateMode: 'onChange',
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setGeneralError('');
        setIsLoading(true);

        try {
            await registerWithApi(data);

            notifyAdmins({
                title: 'Cont nou creat',
                message: `${data.fullName} (${data.email}) și-a creat un cont nou.`,
                link: '/admin/users',
                tag: `admin-user-registered-${data.email.trim().toLowerCase()}`,
            });

            navigate('/login?registered=true');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Eroare la înregistrare';
            setGeneralError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const watchedEmail = watch('email');

    return (
        <div className="auth-page">
            <div className="auth-container">
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

                <div className="auth-card">
                    <div className="auth-card-header">
                        <h2>Înregistrare</h2>
                        <p>Creați un cont nou pentru a accesa platforma</p>
                    </div>

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

                    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label htmlFor="fullName">
                                Nume Complet <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                className={`text-input ${errors.fullName ? 'error' : ''}`}
                                placeholder="Ex: Ion Popescu"
                                {...register('fullName', { onChange: () => setGeneralError('') })}
                            />
                            {errors.fullName && (
                                <span className="error-message">{errors.fullName.message}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                className={`text-input ${errors.email ? 'error' : ''}`}
                                placeholder="utilizator@exemplu.com"
                                {...register('email', { onChange: () => setGeneralError('') })}
                            />
                            {errors.email && (
                                <span className="error-message">{errors.email.message}</span>
                            )}
                            {!errors.email && watchedEmail && (
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
                                    className={`text-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Minimum 6 caractere"
                                    {...register('password', { onChange: () => setGeneralError('') })}
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
                            {errors.password && (
                                <span className="error-message">{errors.password.message}</span>
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
                                    className={`text-input ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Reintroduceți parola"
                                    {...register('confirmPassword', { onChange: () => setGeneralError('') })}
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
                            {errors.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword.message}</span>
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

                    <div className="auth-footer">
                        <p>
                            Aveți deja un cont?{' '}
                            <Link to="/login" className="auth-link">
                                Autentificați-vă
                            </Link>
                        </p>
                    </div>
                </div>

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
