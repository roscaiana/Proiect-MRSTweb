import "./Sidebar.css";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
    const block = (e: React.MouseEvent) => e.preventDefault();

    return (
        <>
            <nav className={`sidebar ${open ? "active" : ""}`}>
                <div className="sidebar-header">
                    <div className="logo-area white-text">
                        <div className="logo-emblem sidebar-logo">
                            <svg viewBox="0 0 100 100" className="svg-logo">
                                <defs>
                                    <linearGradient id="goldGradientSidebarFix" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: "#f1c40f", stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: "#b7950b", stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                <path d="M50 5 L90 25 V75 L50 95 L10 75 V25 L50 5 Z" fill="#003366" stroke="white" strokeWidth="2" />
                                <path d="M50 20 L80 35 V65 L50 80 L20 65 V35 L50 20 Z" fill="none" stroke="url(#goldGradientSidebarFix)" strokeWidth="3" />
                                <text x="50" y="60" textAnchor="middle" fill="white" fontSize="34" fontFamily="Georgia, serif" fontWeight="bold">
                                    E
                                </text>
                            </svg>
                        </div>
                        <h2>e-Electoral</h2>
                    </div>

                    <button className="close-sidebar" type="button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-section">
                        <h4>Navigație</h4>
                        <ul>
                            <li><a href="#" onClick={block}><i className="fas fa-home"></i> Acasă</a></li>
                            <li><a href="#" onClick={block}><i className="fas fa-clipboard-check"></i> Teste</a></li>
                            <li><a href="#" onClick={block}><i className="fas fa-user-plus"></i> Înscriere</a></li>
                            <li><a href="#" onClick={block}><i className="fas fa-book-open"></i> Resurse</a></li>
                        </ul>
                    </div>

                    <div className="sidebar-section">
                        <h4>Contul Meu</h4>
                        <ul>
                            <li><a href="#" onClick={block}><i className="fas fa-headset"></i> Suport</a></li>
                            <li><a href="#" onClick={block}><i className="fas fa-sign-out-alt"></i> Deconectare</a></li>
                        </ul>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <p>© 2026 e-Electoral</p>
                </div>
            </nav>

            <div className={`sidebar-overlay ${open ? "active" : ""}`} onClick={onClose} />
        </>
    );
}