import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import AdminPanelNavLink from "./AdminPanelNavLink";
import "../styles/admin-panel.css";

const navItems = [
    { to: "/admin/overview", label: "Cont Admin", iconClass: "fas fa-chart-line" },
    { to: "/admin/tests", label: "Teste", iconClass: "fas fa-file-alt" },
    { to: "/admin/users", label: "Utilizatori", iconClass: "fas fa-users" },
    { to: "/admin/appointments", label: "Programări", iconClass: "fas fa-calendar-check" },
    { to: "/admin/notifications", label: "Notificări", iconClass: "fas fa-bell" },
    { to: "/admin/news", label: "Noutăți", iconClass: "fas fa-newspaper" },
];

const AdminPanelLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const openMobileSidebar = () => setIsMobileSidebarOpen(true);
    const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.classList.toggle("no-scroll", isMobileSidebarOpen);
        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [isMobileSidebarOpen]);

    return (
        <>
            <header className="admin-app-header">
                <div className="container admin-app-header-row">
                    <button
                        type="button"
                        className="admin-mobile-menu-btn"
                        onClick={openMobileSidebar}
                        aria-label="Deschide meniul"
                        aria-controls="admin-mobile-sidebar"
                        aria-expanded={isMobileSidebarOpen}
                    >
                        <i className="fas fa-bars" aria-hidden="true"></i>
                        <span>Meniu</span>
                    </button>

                    <Link to="/admin/overview" className="admin-app-logo" aria-label="Admin overview">
                        <div className="admin-app-logo-emblem">
                            <svg viewBox="0 0 100 100" className="svg-logo">
                                <defs>
                                    <linearGradient id="adminGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: "#f1c40f", stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: "#b7950b", stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                <path d="M50 5 L90 25 V75 L50 95 L10 75 V25 L50 5 Z" fill="#003366" stroke="white" strokeWidth="2" />
                                <path d="M50 20 L80 35 V65 L50 80 L20 65 V35 L50 20 Z" fill="none" stroke="url(#adminGoldGradient)" strokeWidth="3" />
                                <text x="50" y="62" textAnchor="middle" fill="white" fontSize="34" fontFamily="Inter, sans-serif" fontWeight="bold">
                                    E
                                </text>
                            </svg>
                        </div>
                        <div className="admin-app-logo-text">
                            <strong>e-Electoral</strong>
                            <span>Admin Workspace</span>
                        </div>
                    </Link>

                    <nav className="admin-app-header-nav" aria-label="Admin quick navigation">
                        {navItems.map((item) => (
                            <AdminPanelNavLink key={item.to} to={item.to} label={item.label} variant="header" />
                        ))}
                    </nav>

                    <div className="admin-app-header-actions">
                        <Link to="/" className="admin-btn ghost">
                            <i className="fas fa-up-right-from-square"></i> Vezi site
                        </Link>
                        <button type="button" className="admin-btn primary" onClick={handleLogout}>
                            <i className="fas fa-right-from-bracket"></i> Deconectare
                        </button>
                    </div>
                </div>
            </header>

            <button
                type="button"
                className={`admin-mobile-sidebar-overlay ${isMobileSidebarOpen ? "is-open" : ""}`}
                onClick={closeMobileSidebar}
                aria-label="Închide meniul"
            />

            <section className="admin-panel-page">
                <div className="admin-panel-shell">
                    <aside id="admin-mobile-sidebar" className={`admin-sidebar ${isMobileSidebarOpen ? "is-open" : ""}`}>
                        <div className="admin-sidebar-top">
                            <div className="admin-sidebar-top-row">
                                <div>
                                    <h1>Cont Admin</h1>
                                    <p>{user?.fullName || "Administrator"}</p>
                                </div>
                                <button
                                    type="button"
                                    className="admin-sidebar-close"
                                    onClick={closeMobileSidebar}
                                    aria-label="Închide meniul"
                                >
                                    <i className="fas fa-times" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>

                        <nav className="admin-nav">
                            {navItems.map((item) => (
                                <AdminPanelNavLink
                                    key={item.to}
                                    to={item.to}
                                    label={item.label}
                                    iconClass={item.iconClass}
                                    onClick={closeMobileSidebar}
                                    variant="sidebar"
                                />
                            ))}
                        </nav>

                        <div className="admin-sidebar-quick">
                            <h4>Acțiuni rapide</h4>
                            <div className="admin-sidebar-quick-actions">
                                <Link to="/" className="admin-btn ghost" onClick={closeMobileSidebar}>
                                    Site public
                                </Link>
                                <Link to="/support" className="admin-btn secondary" onClick={closeMobileSidebar}>
                                    Suport
                                </Link>
                            </div>
                        </div>
                    </aside>

                    <main className="admin-main-content">
                        <Outlet />
                    </main>
                </div>
            </section>
        </>
    );
};

export default AdminPanelLayout;
