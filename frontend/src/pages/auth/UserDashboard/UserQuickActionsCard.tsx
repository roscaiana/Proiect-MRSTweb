import { Link } from "react-router-dom";

export default function UserQuickActionsCard() {
    return (
        <div className="dashboard-card actions-card">
            <div className="card-header">
                <h2>Acțiuni rapide</h2>
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
                        <h4>Teste de certificare</h4>
                        <p>Exersează cunoștințele tale</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
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
                        <h4>Programare examen</h4>
                        <p>Rezervă un loc pentru examen</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
            </div>
        </div>
    );
}
