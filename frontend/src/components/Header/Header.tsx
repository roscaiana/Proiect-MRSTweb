import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { formatNotificationDate, useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";
import { PUBLIC_PAGES, getSearchPages, type SitePage } from "../navigation/siteNavigation";
import "./Header.css";

type Props = {
    onOpenSidebar: () => void;
    isSidebarOpen: boolean;
};


function normalizeText(value: string): string {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getFirstSearchMatch(query: string, pages: SitePage[]): string | null {
    const trimmed = query.trim();
    if (!trimmed) {
        return null;
    }

    const normalizedQuery = normalizeText(trimmed);

    const byPath = pages.find((page) => page.path.toLowerCase() === trimmed.toLowerCase());
    if (byPath) {
        return byPath.path;
    }

    const byLabelOrKeyword = pages.find((page) => {
        const labelMatch = normalizeText(page.label).includes(normalizedQuery);
        const pathMatch = page.path.toLowerCase().includes(normalizedQuery);
        const keywordMatch = page.keywords.some((keyword) => normalizeText(keyword).includes(normalizedQuery));
        return labelMatch || pathMatch || keywordMatch;
    });

    return byLabelOrKeyword ? byLabelOrKeyword.path : null;
}

export default function Header({ onOpenSidebar, isSidebarOpen }: Props) {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const notificationRef = useRef<HTMLDivElement>(null);

    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({
        isAuthenticated,
        isAdmin,
        user,
    });

    const accountPath = isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/login";
    const accountLabel = isAuthenticated ? (isAdmin ? "Admin Panel" : "Profilul meu") : "Autentificare";
    const accountIcon = isAuthenticated ? "fas fa-gauge-high" : "fas fa-user-lock";

    const searchablePages = useMemo(
        () => getSearchPages(isAuthenticated, isAdmin),
        [isAuthenticated, isAdmin],
    );

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const matchedPath = getFirstSearchMatch(searchQuery, searchablePages);
        if (!matchedPath) {
            return;
        }

        navigate(matchedPath);
        setSearchQuery("");
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
        <header className={`main-header ${isSidebarOpen ? "is-blurred" : ""}`}>
            <div className="container flex-between">
                <div className="header-left">
                    <button
                        type="button"
                        className="sidebar-trigger"
                        onClick={onOpenSidebar}
                        aria-label="Open sidebar"
                        aria-controls="main-sidebar"
                        aria-expanded={isSidebarOpen}
                    >
                        <i className="fas fa-bars"></i>
                    </button>

                    <Link to="/" className="logo-area" aria-label={"Acas\u0103"}>
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
                        {PUBLIC_PAGES.map((page) => (
                            <li key={page.path}>
                                <NavLink to={page.path} end={page.path === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
                                    {page.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="header-actions">
                    <div className="header-main-actions">
                        <form className="header-search-form" onSubmit={handleSearchSubmit} role="search">
                            <i className="fas fa-search header-search-icon" aria-hidden="true"></i>
                            <input
                                className="header-search-input"
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder={"Caut\u0103 pagin\u0103..."}
                                aria-label={"Caut\u0103 pagin\u0103"}
                            />
                            <button type="submit" className="header-search-submit" aria-label={"Caut\u0103"}>
                                <i className="fas fa-arrow-right" aria-hidden="true"></i>
                            </button>
                        </form>

                        <Link to={accountPath} className="btn btn-primary header-auth-btn">
                            <i className={accountIcon}></i> {accountLabel}
                        </Link>
                    </div>

                    {isAuthenticated && (
                        <div className="header-secondary-actions">
                            <button
                                className="btn btn-outline btn-logout"
                                type="button"
                                onClick={handleLogout}
                            >
                                <i className="fas fa-right-from-bracket"></i> Deconectare
                            </button>

                            <div className="notification-wrapper" ref={notificationRef}>
                                <button
                                    className="btn btn-outline notification-btn"
                                    type="button"
                                    aria-label={"Notific\u0103ri"}
                                    onClick={() => setNotificationsOpen((prev) => !prev)}
                                >
                                    <i className="fas fa-bell"></i>
                                    {unreadCount > 0 && <span className="notification-dot"></span>}
                                </button>

                                {notificationsOpen && (
                                    <div className="notification-panel">
                                        <div className="notification-panel-header">
                                            <h4>{"Notific\u0103ri"}</h4>
                                            {unreadCount > 0 && (
                                                <button type="button" className="mark-read-btn" onClick={markAllAsRead}>
                                                    {"Marcheaz\u0103 citite"}
                                                </button>
                                            )}
                                        </div>

                                        <div className="notification-list">
                                            {notifications.length === 0 ? (
                                                <p className="notification-empty">{"Nu ai notific\u0103ri."}</p>
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
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

