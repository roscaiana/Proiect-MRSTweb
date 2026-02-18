import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();

    // Mock data from localStorage
    const getUsers = () => {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    };

    const getQuizHistory = () => {
        const history = localStorage.getItem('quizHistory');
        return history ? JSON.parse(history) : [];
    };

    const users = getUsers();
    const quizHistory = getQuizHistory();

    // Calculate stats
    const totalUsers = users.length + 1; // +1 for admin
    const testsToday = quizHistory.filter((q: any) => {
        const today = new Date().toDateString();
        const quizDate = new Date(q.completedAt).toDateString();
        return today === quizDate;
    }).length;

    const avgScore = quizHistory.length > 0
        ? Math.round(quizHistory.reduce((acc: number, q: any) => acc + q.score, 0) / quizHistory.length)
        : 0;

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="dashboard-container admin-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Panou de Control Administrator</h1>
                    <p>Bine ați revenit, {user?.fullName}</p>
                </div>
                <div className="admin-badge">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                    Administrator
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{totalUsers}</div>
                        <div className="stat-label">Utilizatori Înregistrați</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{testsToday}</div>
                        <div className="stat-label">Teste Astăzi</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon gold">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="20" x2="12" y2="10" />
                            <line x1="18" y1="20" x2="18" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="16" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{avgScore}%</div>
                        <div className="stat-label">Scor Mediu</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{quizHistory.length}</div>
                        <div className="stat-label">Total Teste</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* User Management */}
                <div className="dashboard-card users-table-card">
                    <div className="card-header">
                        <h2>Utilizatori Înregistrați</h2>
                        <span className="badge">{users.length} utilizatori</span>
                    </div>
                    <div className="table-container">
                        {users.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Nume</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Data Înregistrării</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.map((u: any, index: number) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-small">
                                                    {u.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                {u.fullName}
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className="role-badge">{u.role === 'admin' ? 'Administrator' : 'Candidat'}</span>
                                        </td>
                                        <td>{formatDate(u.createdAt)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <p>Nu există utilizatori înregistrați încă</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="dashboard-card activity-card">
                    <div className="card-header">
                        <h2>Activitate Recentă</h2>
                        <Link to="/tests" className="card-action">
                            Vezi toate →
                        </Link>
                    </div>
                    <div className="activity-list">
                        {quizHistory.length > 0 ? (
                            quizHistory.slice(0, 6).map((quiz: any, index: number) => (
                                <div key={index} className="activity-item">
                                    <div className={`activity-icon ${quiz.score >= 70 ? 'success' : 'warning'}`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    </div>
                                    <div className="activity-content">
                                        <p><strong>{quiz.userName || 'Utilizator'}</strong> a completat testul</p>
                                        <span className="activity-time">{formatDate(quiz.completedAt)}</span>
                                    </div>
                                    <div className={`activity-score ${quiz.score >= 70 ? 'passed' : 'failed'}`}>
                                        {quiz.score}%
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>Nu există activitate recentă</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Actions */}
                <div className="dashboard-card actions-card">
                    <div className="card-header">
                        <h2>Acțiuni Sistem</h2>
                    </div>
                    <div className="actions-list">
                        <button className="action-item" onClick={() => alert('Funcționalitate în dezvoltare')}>
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h4>Export Date</h4>
                                <p>Descarcă rapoarte în format CSV</p>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                        <button className="action-item" onClick={() => alert('Funcționalitate în dezvoltare')}>
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m-2-2l-4.2-4.2" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h4>Setări Sistem</h4>
                                <p>Configurează parametrii platformei</p>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

