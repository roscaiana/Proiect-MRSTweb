import React, { useMemo, useState } from "react";
import AdminMultiSelect, { type AdminMultiSelectOption } from "../components/AdminMultiSelect";
import AdminUserRow from "../components/AdminUserRow";
import { useAdminPanel } from "../hooks/useAdminPanel";
import { formatDateShort } from "../../../utils/dateUtils";

type UserRoleFilter = "user" | "admin";
type UserStatusFilter = "active" | "blocked";

const USER_ROLE_OPTIONS: ReadonlyArray<AdminMultiSelectOption<UserRoleFilter>> = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
];

const USER_STATUS_OPTIONS: ReadonlyArray<AdminMultiSelectOption<UserStatusFilter>> = [
    { value: "active", label: "Active" },
    { value: "blocked", label: "Blocate" },
];

const AdminUsersPage: React.FC = () => {
    const { state, toggleUserBlocked } = useAdminPanel();
    const [search, setSearch] = useState("");
    const [roleFilters, setRoleFilters] = useState<UserRoleFilter[]>([]);
    const [statusFilters, setStatusFilters] = useState<UserStatusFilter[]>([]);

    const filteredUsers = useMemo(() => {
        return state.users.filter((user) => {
            const matchesSearch =
                user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());
            const matchesRole = roleFilters.length === 0 || roleFilters.includes(user.role);
            const statusKey: UserStatusFilter = user.isBlocked ? "blocked" : "active";
            const matchesStatus = statusFilters.length === 0 || statusFilters.includes(statusKey);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [roleFilters, search, state.users, statusFilters]);

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
                        <AdminMultiSelect
                            ariaLabel="Filtrare după rol utilizator"
                            options={USER_ROLE_OPTIONS}
                            selectedValues={roleFilters}
                            onChange={setRoleFilters}
                            placeholder="Toate rolurile"
                        />
                    </label>

                    <label className="admin-field">
                        <span>Status cont</span>
                        <AdminMultiSelect
                            ariaLabel="Filtrare după status cont"
                            options={USER_STATUS_OPTIONS}
                            selectedValues={statusFilters}
                            onChange={setStatusFilters}
                            placeholder="Toate"
                        />
                    </label>
                </div>

                <p className="admin-muted-text">Afișate {filteredUsers.length} din {state.users.length} conturi.</p>

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
                                <AdminUserRow
                                    key={user.id}
                                    id={user.id}
                                    fullName={user.fullName}
                                    email={user.email}
                                    role={user.role}
                                    createdAt={user.createdAt}
                                    lastLoginAt={user.lastLoginAt}
                                    isBlocked={user.isBlocked}
                                    formatDate={formatDateShort}
                                    onToggleBlocked={toggleUserBlocked}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminUsersPage;
