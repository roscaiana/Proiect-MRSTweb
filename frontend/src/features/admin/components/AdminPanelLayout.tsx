import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import "../styles/admin-panel.css";

const navItems = [
    { to: "/admin/overview", label: "Dashboard", iconClass: "fas fa-chart-line" },
    { to: "/admin/tests", label: "Teste", iconClass: "fas fa-file-alt" },
    { to: "/admin/users", label: "Utilizatori", iconClass: "fas fa-users" },
    { to: "/admin/appointments", label: "Programari", iconClass: "fas fa-calendar-check" },
    { to: "/admin/notifications", label: "Notificari", iconClass: "fas fa-bell" },
];

const AdminPanelLayout: React.FC = () => {
    const { user } = useAuth();

    return (
        <section className="admin-panel-page">
            <div className="admin-panel-shell">
                <aside className="admin-sidebar">
                    <div className="admin-sidebar-top">
                        <h1>Admin Panel</h1>
                        <p>{user?.fullName || "Administrator"}</p>
                    </div>

                    <nav className="admin-nav">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `admin-nav-item ${isActive ? "is-active" : ""}`
                                }
                            >
                                <i className={item.iconClass}></i>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <main className="admin-main-content">
                    <Outlet />
                </main>
            </div>
        </section>
    );
};

export default AdminPanelLayout;
