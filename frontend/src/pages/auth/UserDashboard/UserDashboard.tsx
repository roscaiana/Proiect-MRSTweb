import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { readAppointments, readExamSettings, readQuizHistory, STORAGE_KEYS, writeAppointments } from '../../../features/admin/storage';
import type { AdminAppointmentRecord } from '../../../features/admin/types';
import { notifyUser } from '../../../utils/appEventNotifications';
import './UserDashboard.css';

const APPOINTMENT_RESCHEDULE_KEY = 'appointmentRescheduleDraft';

const UserDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quizHistory, setQuizHistory] = useState(() => readQuizHistory());
    const [examSettings, setExamSettings] = useState(() => readExamSettings());
    const [passThreshold, setPassThreshold] = useState(() => readExamSettings().passingThreshold);
    const [appointments, setAppointments] = useState(() => readAppointments());

    useEffect(() => {
        const refreshDashboardData = () => {
            setQuizHistory(readQuizHistory());
            const settings = readExamSettings();
            setExamSettings(settings);
            setPassThreshold(settings.passingThreshold);
            setAppointments(readAppointments());
        };

        const handleStorage = (event: StorageEvent) => {
            if (
                event.key === STORAGE_KEYS.quizHistory ||
                event.key === STORAGE_KEYS.settings ||
                event.key === STORAGE_KEYS.appointments
            ) {
                refreshDashboardData();
            }
        };

        const handleAppStorageUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<{ key?: string }>;
            const key = customEvent.detail?.key;
            if (
                key === STORAGE_KEYS.quizHistory ||
                key === STORAGE_KEYS.settings ||
                key === STORAGE_KEYS.appointments
            ) {
                refreshDashboardData();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('app-storage-updated', handleAppStorageUpdated as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('app-storage-updated', handleAppStorageUpdated as EventListener);
        };
    }, []);

    const userQuizHistory = useMemo(() => {
        if (!user?.email) {
            return [];
        }

        return quizHistory.filter((entry) => entry.userEmail === user.email);
    }, [quizHistory, user?.email]);

    const sortedUserQuizHistory = useMemo(() => {
        return [...userQuizHistory].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }, [userQuizHistory]);

    const recentAttempts = useMemo(() => sortedUserQuizHistory.slice(0, 5), [sortedUserQuizHistory]);
    const trendAttempts = useMemo(() => [...sortedUserQuizHistory].slice(0, 8).reverse(), [sortedUserQuizHistory]);

    const userAppointments = useMemo(() => {
        if (!user?.email) {
            return [];
        }

        return appointments
            .filter((appointment) => appointment.userEmail === user.email)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [appointments, user?.email]);

    const appointmentStatusLabel = (status: string) => {
        if (status === 'approved') return 'Aprobat';
        if (status === 'rejected') return 'Respins';
        if (status === 'cancelled') return 'Anulat';
        return 'In asteptare';
    };

    const canCancelAppointment = (status: string) => status === 'pending' || status === 'approved';
    const canRescheduleAppointment = (appointment: any) =>
        (appointment.status === 'pending' || appointment.status === 'approved') &&
        (appointment.rescheduleCount || 0) < examSettings.maxReschedulesPerUser;

    const handleCancelAppointment = (appointmentId: string) => {
        const target = appointments.find((appointment) => appointment.id === appointmentId);
        if (!target) {
            return;
        }

        const updatedAt = new Date().toISOString();
        const nextAppointments: AdminAppointmentRecord[] = appointments.map((appointment) =>
            appointment.id === appointmentId
                ? {
                      ...appointment,
                      status: 'cancelled',
                      cancelledBy: 'user',
                      statusReason: 'Anulată din dashboard de utilizator',
                      updatedAt,
                  }
                : appointment
        );

        writeAppointments(nextAppointments);
        setAppointments(nextAppointments);
        notifyUser(user?.email, {
            title: 'Programare anulată',
            message: `Programarea ${target.appointmentCode || ''} a fost anulată din dashboard.`,
            link: '/dashboard',
            tag: `appointment-cancelled-user-${appointmentId}-${updatedAt}`,
        });
    };

    const handleRescheduleAppointment = (appointmentId: string) => {
        localStorage.setItem(
            APPOINTMENT_RESCHEDULE_KEY,
            JSON.stringify({ appointmentId, createdAt: new Date().toISOString() })
        );
        navigate(`/appointment?reschedule=${encodeURIComponent(appointmentId)}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTrendDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    const trendAverageScore = useMemo(() => {
        if (trendAttempts.length === 0) {
            return 0;
        }

        return Math.round(trendAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / trendAttempts.length);
    }, [trendAttempts]);

    const trendDelta = useMemo(() => {
        if (trendAttempts.length < 2) {
            return null;
        }

        const firstScore = trendAttempts[0].score;
        const lastScore = trendAttempts[trendAttempts.length - 1].score;
        return lastScore - firstScore;
    }, [trendAttempts]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard Utilizator</h1>
                <p>Bine ați revenit, {user?.fullName}!</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card profile-card">
                    <div className="card-header">
                        <h2>Profilul Meu</h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="profile-info">
                        <div className="profile-avatar">
                            <span>{user?.fullName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="profile-details">
                            <h3>{user?.fullName}</h3>
                            <p className="profile-email">{user?.email}</p>
                            <p className="profile-role">
                                <span className="role-badge">Candidat</span>
                            </p>
                            <p className="profile-date">
                                Înregistrat: {user?.createdAt ? formatDate(user.createdAt.toString()) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card stats-card">
                    <div className="card-header">
                        <h2>Statistici</h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="20" x2="12" y2="10" />
                            <line x1="18" y1="20" x2="18" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="16" />
                        </svg>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{userQuizHistory.length}</div>
                            <div className="stat-label">Teste Completate</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">
                                {sortedUserQuizHistory.length > 0
                                    ? Math.round(sortedUserQuizHistory.reduce((acc: number, q: any) => acc + q.score, 0) / sortedUserQuizHistory.length)
                                    : 0}%
                            </div>
                            <div className="stat-label">Scor Mediu</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">
                                {sortedUserQuizHistory.filter((q: any) => q.score >= passThreshold).length}
                            </div>
                            <div className="stat-label">Teste Promovate</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card history-card">
                    <div className="card-header">
                        <h2>Istoricul Testelor</h2>
                        <Link to="/tests" className="card-action">
                            Vezi toate →
                        </Link>
                    </div>
                    <div className="history-list">
                        {recentAttempts.length > 0 ? (
                            recentAttempts.map((quiz: any, index: number) => (
                                <div key={index} className="history-item">
                                    <div className="history-icon">
                                        {quiz.score >= passThreshold ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="15" y1="9" x2="9" y2="15" />
                                                <line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="history-content">
                                        <h4>{quiz.categoryTitle || 'Test'}</h4>
                                        <p>{formatDate(quiz.completedAt)}</p>
                                    </div>
                                    <div className={`history-score ${quiz.score >= passThreshold ? 'passed' : 'failed'}`}>
                                        {quiz.score}%
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                                <p>Nu ați completat încă niciun test</p>
                                <Link to="/tests" className="btn-primary">
                                    Începe un Test
                                </Link>
                            </div>
                        )}
                    </div>
                    {trendAttempts.length > 0 && (
                        <div className="dashboard-history-trend">
                            <div className="dashboard-history-trend-header">
                                <div>
                                    <h3>Evolutie in timp</h3>
                                    <p className="dashboard-history-trend-subtitle">Ultimele {trendAttempts.length} incercari</p>
                                </div>
                                <div className="dashboard-trend-summary">
                                    <span className="dashboard-trend-chip">Medie {trendAverageScore}%</span>
                                    {trendDelta !== null && (
                                        <span className={`dashboard-trend-chip delta ${trendDelta >= 0 ? 'up' : 'down'}`}>
                                            {trendDelta >= 0 ? '+' : ''}{trendDelta}%
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="dashboard-trend-chart">
                                {trendAttempts.map((attempt, index) => (
                                    <div
                                        key={`${attempt.completedAt}-trend-${index}`}
                                        className="dashboard-trend-column"
                                        title={`${attempt.categoryTitle || 'Test'} • ${attempt.score}% • ${formatDate(attempt.completedAt)}`}
                                    >
                                        <span className={`dashboard-trend-score ${attempt.score >= passThreshold ? 'passed' : 'failed'}`}>
                                            {attempt.score}%
                                        </span>
                                        <div className="dashboard-trend-bar-rail" aria-hidden="true">
                                            <div
                                                className={`dashboard-trend-fill ${attempt.score >= passThreshold ? 'passed' : 'failed'}`}
                                                style={{ height: `${Math.max(6, Math.min(100, attempt.score))}%` }}
                                            />
                                        </div>
                                        <span className="dashboard-trend-date">{formatTrendDate(attempt.completedAt)}</span>
                                        <span className="dashboard-trend-label">{attempt.categoryTitle || 'Test'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="dashboard-card appointments-card">
                    <div className="card-header">
                        <h2>Programarile Mele</h2>
                    </div>
                    <div className="history-list">
                        {userAppointments.length > 0 ? (
                            userAppointments.slice(0, 4).map((appointment) => (
                                <div key={appointment.id} className="history-item">
                                    <div className="history-content">
                                        <h4>{formatDate(appointment.date)}</h4>
                                        <p>
                                            Interval: {appointment.slotStart} - {appointment.slotEnd}
                                        </p>
                                        {appointment.appointmentCode && <p>Cod: {appointment.appointmentCode}</p>}
                                        {appointment.statusReason && (
                                            <p className={`appointment-reason ${appointment.status}`}>
                                                Motiv: {appointment.statusReason}
                                            </p>
                                        )}
                                        {appointment.adminNote && (
                                            <p className="appointment-admin-note">
                                                Notă admin: {appointment.adminNote}
                                            </p>
                                        )}
                                        <div className="appointment-item-actions">
                                            <button
                                                type="button"
                                                className="dashboard-mini-btn"
                                                disabled={!canRescheduleAppointment(appointment)}
                                                onClick={() => handleRescheduleAppointment(appointment.id)}
                                                title={
                                                    canRescheduleAppointment(appointment)
                                                        ? 'Reprogramează'
                                                        : `Limita de ${examSettings.maxReschedulesPerUser} reprogramări a fost atinsă`
                                                }
                                            >
                                                Reprogramează
                                            </button>
                                            <button
                                                type="button"
                                                className="dashboard-mini-btn danger"
                                                disabled={!canCancelAppointment(appointment.status)}
                                                onClick={() => handleCancelAppointment(appointment.id)}
                                            >
                                                Anulează
                                            </button>
                                        </div>
                                    </div>
                                    <div className={`appointment-status ${appointment.status}`}>
                                        {appointmentStatusLabel(appointment.status)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>Nu ai programari inregistrate.</p>
                                <Link to="/appointment" className="btn-primary">
                                    Creeaza programare
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-card actions-card">
                    <div className="card-header">
                        <h2>Acțiuni Rapide</h2>
                    </div>
                    <div className="actions-list">
                        <Link to="/tests" className="action-item">
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h4>Teste de Certificare</h4>
                                <p>Exersează cunoștințele tale</p>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                        <Link to="/appointment" className="action-item">
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h4>Programare Examen</h4>
                                <p>Rezervă un loc pentru examen</p>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

