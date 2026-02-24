import React, { useMemo, useState } from "react";
import { useAdminPanel } from "../hooks/useAdminPanel";

const formatDate = (value: string): string => {
    return new Date(value).toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const AdminUsersPage: React.FC = () => {
    const { state, toggleUserBlocked } = useAdminPanel();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");

    const filteredUsers = useMemo(() => {
        return state.users.filter((user) => {
            const matchesSearch =
                user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());
            const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : statusFilter === "active"
                    ? !user.isBlocked
                    : user.isBlocked;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [roleFilter, search, state.users, statusFilter]);

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Management utilizatori</h2>
                <p>Caută, filtrează și gestionează accesul utilizatorilor în platformă.</p>
            </section>

            <section className="admin-panel-card">
                <div className="admin-toolbar">
                    <label className="admin-field">
                        <span>Caută</span>
                        <input
                            type="text"
                            placeholder="Nume sau email"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </label>

                    <label className="admin-field">
                        <span>Rol</span>
                        <select
                            value={roleFilter}
                            onChange={(event) =>
                                setRoleFilter(event.target.value as "all" | "user" | "admin")
                            }
                        >
                            <option value="all">Toate rolurile</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>

                    <label className="admin-field">
                        <span>Status cont</span>
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value as "all" | "active" | "blocked")
                            }
                        >
                            <option value="all">Toate</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocate</option>
                        </select>
                    </label>
                </div>

                <p className="admin-muted-text">
                    Afișate {filteredUsers.length} din {state.users.length} conturi.
                </p>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Utilizator</th>
                                <th>Rol</th>
                                <th>Creat la</th>
                                <th>Ultima logare</th>
                                <th>Status</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <strong>{user.fullName}</strong>
                                        <p>{user.email}</p>
                                    </td>
                                    <td>{user.role}</td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "N/A"}</td>
                                    <td>
                                        <span className={`admin-pill ${user.isBlocked ? "rejected" : "approved"}`}>
                                            {user.isBlocked ? "blocat" : "activ"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`admin-text-btn ${user.isBlocked ? "" : "danger"}`}
                                            type="button"
                                            onClick={() => toggleUserBlocked(user.id)}
                                        >
                                            {user.isBlocked ? "Deblochează" : "Blochează"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminUsersPage;
