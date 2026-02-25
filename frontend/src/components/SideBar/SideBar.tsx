import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PUBLIC_PAGES } from "../navigation/siteNavigation";
import "./SideBar.css";

type Props = {
    open: boolean;
    onClose: () => void;
};

type SidebarLink = {
    to: string;
    icon: string;
    label: string;
};

export default function Sidebar({ open, onClose }: Props) {
    const { isAuthenticated, isAdmin } = useAuth();

    const primaryLinks: SidebarLink[] = isAdmin
        ? [
            { to: '/', icon: 'fas fa-home', label: 'Acasă' },
            { to: '/news', icon: 'fas fa-newspaper', label: 'Noutăți' },
            { to: '/support', icon: 'fas fa-life-ring', label: 'Suport' },
            { to: '/contact', icon: 'fas fa-address-book', label: 'Contacte' },
            { to: '/admin', icon: 'fas fa-shield-halved', label: 'Admin Panel' },
        ]
        : [
            { to: '/', icon: 'fas fa-home', label: 'Acasă' },
            { to: '/tests', icon: 'fas fa-clipboard-check', label: 'Teste' },
            { to: '/appointment', icon: 'fas fa-user-plus', label: 'Înscriere' },
            { to: '/support', icon: 'fas fa-book-open', label: 'Resurse' },
            { to: '/news', icon: 'fas fa-newspaper', label: 'Noutăți' },
            { to: '/contact', icon: 'fas fa-address-book', label: 'Contacte' },
        ];

    const accountLinks: SidebarLink[] = isAuthenticated
        ? isAdmin
            ? [{ to: '/admin', icon: 'fas fa-gauge-high', label: 'Panou Admin' }]
            : [{ to: '/dashboard', icon: 'fas fa-user', label: 'Dashboard' }]
        : [
            { to: '/login', icon: 'fas fa-sign-in-alt', label: 'Autentificare' },
            { to: '/register', icon: 'fas fa-user-plus', label: 'Înregistrare' },
        ];

    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const accountTitle = isAuthenticated ? "Contul Meu" : "Autentificare";

    const handleLogout = () => {
        logout();
        onClose();
        navigate("/");
    };

    return (
        <>
            <nav className={`sidebar ${open ? "active" : ""}`} id="main-sidebar" aria-hidden={!open}>
                <div className="sidebar-header">
                    <Link to="/" className="logo-area white-text" onClick={onClose} aria-label={"Acas\u0103"}>
                        <div className="logo-emblem" style={{ width: 40, height: 40 }}>
                            <svg viewBox="0 0 100 100" className="svg-logo">
                                <defs>
                                    <linearGradient id="goldGradientSidebarFix" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#f1c40f', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#b7950b', stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                <path d="M50 5 L90 25 V75 L50 95 L10 75 V25 L50 5 Z" fill="#003366" stroke="white" strokeWidth="2" />
                                <path d="M50 20 L80 35 V65 L50 80 L20 65 V35 L50 20 Z" fill="none" stroke="url(#goldGradientSidebarFix)" strokeWidth="3" />
                                <text x="50" y="62" textAnchor="middle" fill="white" fontSize="34" fontFamily="Inter, sans-serif" fontWeight="bold">
                                    E
                                </text>
                            </svg>
                        </div>
                        <h2>e-Electoral</h2>
                    </Link>

                    <button className="close-sidebar" onClick={onClose} aria-label="Close sidebar">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-section">
                        <h4>{"Naviga\u021Bie"}</h4>
                        <ul>
                            {PUBLIC_PAGES.map((page) => (
                                <li key={page.path}>
                                    <NavLink
                                        to={page.path}
                                        end={page.path === "/"}
                                        onClick={onClose}
                                        className={({ isActive }) => (isActive ? "active" : "")}
                                    >
                                        <i className={page.icon}></i>
                                        {page.label}
                                    </NavLink>
                                </li>
                            ))}
                            {primaryLinks.map((link) => (
                                <li key={`${link.to}-${link.label}`}>
                                    <Link to={link.to} onClick={onClose}>
                                        <i className={link.icon}></i> {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sidebar-section">
                        <h4>{accountTitle}</h4>
                        <ul>
                            {accountLinks.map((link) => (
                                <li key={`${link.to}-${link.label}`}>
                                    <Link to={link.to} onClick={onClose}>
                                        <i className={link.icon}></i> {link.label}
                                    </Link>
                                </li>
                            ))}
                            {!isAuthenticated ? (
                                <li>
                                    <NavLink to="/login" onClick={onClose} className={({ isActive }) => (isActive ? "active" : "")}>
                                        <i className="fas fa-right-to-bracket"></i>
                                        Autentificare
                                    </NavLink>
                                </li>
                            ) : (
                                <li>
                                    <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
                                        <i className="fas fa-right-from-bracket"></i>
                                        Deconectare
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <p>{"\u00A9 2026 e-Electoral"}</p>
                </div>
            </nav>

            <div className={`sidebar-overlay ${open ? 'active' : ''}`} onClick={onClose}></div>
        </>
    );
}
