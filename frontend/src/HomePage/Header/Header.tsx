import "./Header.css";

type Props = { onOpenSidebar: () => void };

export default function Header({ onOpenSidebar }: Props) {
    const stopLink = (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault();

    return (
        <header className="main-header">
            <div className="container flex-between">
                <div className="header-left">
                    <button className="sidebar-trigger" onClick={onOpenSidebar} aria-label="Open sidebar">
                        <i className="fas fa-bars"></i>
                    </button>

                    <div className="logo-area">
                        <div className="logo-emblem">
                            <svg viewBox="0 0 100 100" className="svg-logo">
                                <defs>
                                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: "#f1c40f", stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: "#b7950b", stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                <path d="M50 5 L90 25 V75 L50 95 L10 75 V25 L50 5 Z" fill="#003366" stroke="white" strokeWidth="2" />
                                <path d="M50 20 L80 35 V65 L50 80 L20 65 V35 L50 20 Z" fill="none" stroke="url(#goldGradient)" strokeWidth="3" />
                                <text x="50" y="62" textAnchor="middle" fill="white" fontSize="34" fontFamily="Inter, sans-serif" fontWeight="bold">
                                   E
                                    </text>
                            </svg>
                        </div>

                        <div className="logo-text">
                            <h1>e-Electoral</h1>
                            <span className="tagline">Certificare & Integritate</span>
                        </div>
                    </div>
                </div>

                <nav className="main-nav">
                    <ul>
                        <li><a href="#" className="active" onClick={stopLink}>Acasă</a></li>
                        <li><a href="#" onClick={stopLink}>Teste</a></li>
                        <li><a href="#" onClick={stopLink}>Înscriere</a></li>
                        <li><a href="#" onClick={stopLink}>Despre</a></li>
                        <li><a href="#" onClick={stopLink}>Suport</a></li>
                        <li><a href="#" onClick={stopLink}>Contacte</a></li>
                    </ul>
                </nav>

                <div className="header-actions">
                    <button className="btn btn-outline" type="button">
                        <i className="fas fa-search"></i>
                    </button>
                    <button className="btn btn-primary" type="button">
                        <i className="fas fa-user-lock"></i> Autentificare
                    </button>
                </div>
            </div>
        </header>
    );

}