import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";
import { HEADER_AUTH_PAGES, PUBLIC_PAGES, getSearchPages, type SitePage } from "../navigation/siteNavigation";
import { normalizeTextForSearch } from "../../utils/textUtils";
import HeaderNavItem from "./HeaderNavItem";
import NotificationListItem from "./NotificationListItem";
import "./Header.css";

type Props = {
    onOpenSidebar: () => void;
    isSidebarOpen: boolean;
};

function getFirstSearchMatch(query: string, pages: SitePage[]): string | null {
    const trimmed = query.trim();
    if (!trimmed) {
        return null;
    }

    const normalizedQuery = normalizeTextForSearch(trimmed);

    const byPath = pages.find((page) => page.path.toLowerCase() === trimmed.toLowerCase());
    if (byPath) {
        return byPath.path;
    }

    const byLabelOrKeyword = pages.find((page) => {
        const labelMatch = normalizeTextForSearch(page.label).includes(normalizedQuery);
        const pathMatch = page.path.toLowerCase().includes(normalizedQuery);
        const keywordMatch = page.keywords.some((keyword) => normalizeTextForSearch(keyword).includes(normalizedQuery));
        return labelMatch || pathMatch || keywordMatch;
    });

    return byLabelOrKeyword ? byLabelOrKeyword.path : null;
}

export default function Header({ onOpenSidebar, isSidebarOpen }: Props) {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLFormElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({
        isAuthenticated,
        isAdmin,
        user,
    });

    const accountPath = isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/login";
    const accountLabel = isAuthenticated ? (isAdmin ? "Cont Admin" : "Profilul meu") : "Autentificare";
    const accountIcon = isAuthenticated ? "fas fa-gauge-high" : "fas fa-user-lock";

    const searchablePages = useMemo(() => getSearchPages(isAuthenticated, isAdmin), [isAuthenticated, isAdmin]);

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
        setSearchOpen(false);
    };

    const handleSearchToggle = () => {
        setSearchOpen((prev) => !prev);
        if (searchOpen) {
            setSearchQuery("");
        }
    };

    useEffect(() => {
        if (!searchOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
                setSearchQuery("");
            }
        };

        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, [searchOpen]);

    useLayoutEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

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

        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, [notificationsOpen]);

    const navPages = isAuthenticated ? HEADER_AUTH_PAGES : PUBLIC_PAGES;

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
                        {navPages.map((page) => (
                            <HeaderNavItem key={page.path} page={page} />
                        ))}
                    </ul>
                </nav>

                <div className="header-actions">
                    <div className="header-main-actions">
                        <div className="header-search-wrap">
                            <form
                                ref={searchRef}
                                className={`header-search-form${searchOpen ? " is-open" : ""}`}
                                onSubmit={handleSearchSubmit}
                                role="search"
                            >
                                <button
                                    type="button"
                                    className="header-search-toggle"
                                    onClick={handleSearchToggle}
                                    aria-label="Caută pagină"
                                    aria-expanded={searchOpen}
                                >
                                    <i className="fas fa-search" aria-hidden="true"></i>
                                </button>
                                <input
                                    ref={searchInputRef}
                                    className="header-search-input"
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Caută pagină..."
                                    aria-label="Caută pagină"
                                    tabIndex={searchOpen ? 0 : -1}
                                />
                                <button
                                    type="submit"
                                    className="header-search-submit"
                                    aria-label="Caută"
                                    tabIndex={searchOpen ? 0 : -1}
                                >
                                    <i className="fas fa-arrow-right" aria-hidden="true"></i>
                                </button>
                            </form>
                        </div>

                        <Link to={accountPath} className="btn btn-primary header-auth-btn">
                            <i className={accountIcon}></i> {accountLabel}
                        </Link>
                    </div>

                    {isAuthenticated && (
                        <div className="header-secondary-actions">
                            <button className="btn btn-outline btn-logout" type="button" onClick={handleLogout}>
                                <i className="fas fa-right-from-bracket"></i> Deconectare
                            </button>

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
                                                    <NotificationListItem
                                                        key={notification.id}
                                                        notification={notification}
                                                        onSelect={(selectedNotification) => {
                                                            markAsRead(selectedNotification.id);
                                                            setNotificationsOpen(false);
                                                            if (selectedNotification.link) {
                                                                navigate(selectedNotification.link);
                                                            }
                                                        }}
                                                    />
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
