import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './UserDashboard.css';

const UserDashboard: React.FC = () => {
    const { user } = useAuth();

    // Mock quiz history from localStorage
    const getQuizHistory = () => {
        const history = localStorage.getItem('quizHistory');
        return history ? JSON.parse(history) : [];
    };

    const quizHistory = getQuizHistory();

    // Format date
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

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard Utilizator</h1>
                <p>Bine ați revenit, {user?.fullName}!</p>
            </div>

            <div className="dashboard-grid">
                {/* Profile Card */}
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

                {/* Stats Card */}
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
                            <div className="stat-value">{quizHistory.length}</div>
                            <div className="stat-label">Teste Completate</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">
                                {quizHistory.length > 0
                                    ? Math.round(quizHistory.reduce((acc: number, q: any) => acc + q.score, 0) / quizHistory.length)
                                    : 0}%
                            </div>
                            <div className="stat-label">Scor Mediu</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">
                                {quizHistory.filter((q: any) => q.score >= 70).length}
                            </div>
                            <div className="stat-label">Teste Promovate</div>
                        </div>
                    </div>
                </div>

                {/* Quiz History */}
                <div className="dashboard-card history-card">
                    <div className="card-header">
                        <h2>Istoricul Testelor</h2>
                        <Link to="/tests" className="card-action">
                            Vezi toate →
                        </Link>
                    </div>
                    <div className="history-list">
                        {quizHistory.length > 0 ? (
                            quizHistory.slice(0, 5).map((quiz: any, index: number) => (
                                <div key={index} className="history-item">
                                    <div className="history-icon">
                                        {quiz.score >= 70 ? (
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
                                    <div className={`history-score ${quiz.score >= 70 ? 'passed' : 'failed'}`}>
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
                </div>

                {/* Quick Actions */}
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

