import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PUBLIC_PAGES } from "../navigation/siteNavigation";
import SidebarAccountItem from "./SidebarAccountItem";
import SidebarNavItem from "./SidebarNavItem";
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
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const accountLabel = isAdmin ? "Cont Admin" : "Contul Meu";
    const infoLinks: SidebarLink[] = [
        { to: "/materiale-legislative", icon: "fas fa-scale-balanced", label: "Materiale legislative" },
    ];

    const accountLinks: SidebarLink[] = isAuthenticated
        ? [{ to: isAdmin ? "/admin" : "/dashboard", icon: "fas fa-user", label: accountLabel }]
        : [
            { to: "/login", icon: "fas fa-sign-in-alt", label: "Autentificare" },
            { to: "/register", icon: "fas fa-user-plus", label: "Înregistrare" },
        ];

    const navigate = useNavigate();
    const accountTitle = isAuthenticated ? accountLabel : "Autentificare";
    const navigationLinks = PUBLIC_PAGES.flatMap((page) => (page.path === "/tests" ? [page, ...infoLinks] : [page]));

    const handleLogout = () => {
        logout();
        onClose();
        navigate("/");
    };

    return (
        <>
            <nav className={`sidebar ${open ? "active" : ""}`} id="main-sidebar" aria-hidden={!open}>
                <div className="sidebar-header">
                    <Link to="/" className="logo-area white-text" onClick={onClose} aria-label="Acasă">
                        <div className="logo-emblem" style={{ width: 40, height: 40 }}>
                            <svg viewBox="0 0 100 100" className="svg-logo">
                                <defs>
                                    <linearGradient id="goldGradientSidebarFix" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: "#f1c40f", stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: "#b7950b", stopOpacity: 1 }} />
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
                        <h4>Navigație</h4>
                        <ul>
                            {navigationLinks.map((link) =>
                                "to" in link ? (
                                    <SidebarAccountItem
                                        key={`${link.to}-${link.label}`}
                                        to={link.to}
                                        icon={link.icon}
                                        label={link.label}
                                        onClose={onClose}
                                    />
                                ) : (
                                    <SidebarNavItem key={link.path} page={link} onClose={onClose} />
                                )
                            )}
                        </ul>
                    </div>

                    <div className="sidebar-section">
                        <h4>{accountTitle}</h4>
                        <ul>
                            {accountLinks.map((link) => (
                                <SidebarAccountItem
                                    key={`${link.to}-${link.label}`}
                                    to={link.to}
                                    icon={link.icon}
                                    label={link.label}
                                    onClose={onClose}
                                />
                            ))}
                            {isAuthenticated ? (
                                <li>
                                    <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
                                        <i className="fas fa-right-from-bracket"></i>
                                        Deconectare
                                    </button>
                                </li>
                            ) : null}
                        </ul>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <p>© 2026 e-Electoral</p>
                </div>
            </nav>

            <div className={`sidebar-overlay ${open ? "active" : ""}`} onClick={onClose}></div>
        </>
    );
}
