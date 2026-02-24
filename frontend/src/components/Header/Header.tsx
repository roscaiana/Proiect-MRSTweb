import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { formatNotificationDate, useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";
import "./Header.css";

type Props = { onOpenSidebar: () => void };

export default function Header({ onOpenSidebar }: Props) {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({
        isAuthenticated,
        isAdmin,
        user,
    });

    const accountPath = isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/login";
    const accountLabel = isAuthenticated ? "Dashboard" : "Autentificare";
    const accountIcon = isAuthenticated ? "fas fa-gauge-high" : "fas fa-user-lock";

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    useEffect(() => {
        if (!notificationsOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (!notificationRef.current) {
                return;
            }

            if (!notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notificationsOpen]);

    return (
        <header className="main-header">
            <div className="container flex-between">
                <div className="header-left">
                    <button className="sidebar-trigger" onClick={onOpenSidebar} aria-label="Open sidebar">
                        <i className="fas fa-bars"></i>
                    </button>

                    <Link to="/" className="logo-area" aria-label="Acasă">
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
                    </Link>
                </div>

                <nav className="main-nav">
                    <ul>
                        <li>
                            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                                Acasă
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/tests" className={({ isActive }) => (isActive ? "active" : "")}>
                                Teste
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/appointment" className={({ isActive }) => (isActive ? "active" : "")}>
                                Înscriere
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/news" className={({ isActive }) => (isActive ? "active" : "")}>
                                Noutăți
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/support" className={({ isActive }) => (isActive ? "active" : "")}>
                                Suport
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
                                Contacte
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="header-actions">
                    <button className="btn btn-outline" type="button">
                        <i className="fas fa-search"></i>
                    </button>
                    <Link to={accountPath} className="btn btn-primary">
                        <i className={accountIcon}></i> {accountLabel}
                    </Link>
                    <button
                        className={`btn btn-outline btn-logout ${!isAuthenticated ? "is-hidden" : ""}`}
                        type="button"
                        onClick={handleLogout}
                        disabled={!isAuthenticated}
                    >
                        <i className="fas fa-right-from-bracket"></i> Deconectare
                    </button>

                    {isAuthenticated && (
                        <div className="notification-wrapper" ref={notificationRef}>
                            <button
                                className="btn btn-outline notification-btn"
                                type="button"
                                aria-label="Notificări"
                                onClick={() => setNotificationsOpen((prev) => !prev)}
                            >
                                <i className="fas fa-bell"></i>
                                {unreadCount > 0 && <span className="notification-dot"></span>}
                            </button>

                            {notificationsOpen && (
                                <div className="notification-panel">
                                    <div className="notification-panel-header">
                                        <h4>Notificări</h4>
                                        {unreadCount > 0 && (
                                            <button type="button" className="mark-read-btn" onClick={markAllAsRead}>
                                                Marchează citite
                                            </button>
                                        )}
                                    </div>

                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <p className="notification-empty">Nu ai notificări.</p>
                                        ) : (
                                            notifications.map((notification) => (
                                                <button
                                                    key={notification.id}
                                                    type="button"
                                                    className={`notification-item ${notification.read ? "" : "unread"}`}
                                                    onClick={() => {
                                                        markAsRead(notification.id);
                                                        setNotificationsOpen(false);
                                                        if (notification.link) {
                                                            navigate(notification.link);
                                                        }
                                                    }}
                                                >
                                                    <span className="notification-title">{notification.title}</span>
                                                    <span className="notification-message">{notification.message}</span>
                                                    <span className="notification-time">
                                                        {formatNotificationDate(notification.createdAt)}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
