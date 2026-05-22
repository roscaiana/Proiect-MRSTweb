import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminMultiSelect, { type AdminMultiSelectOption } from "../components/AdminMultiSelect";
import AdminUserRow from "../components/AdminUserRow";
import { formatDateShort } from "../../../utils/dateUtils";
import type { AdminUserRecord } from "../types";
import { userService } from "../../../services";
import type { UserInfoDto } from "../../../services/types";

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

const mapUserToAdminRecord = (user: UserInfoDto): AdminUserRecord => ({
    id: String(user.id),
    email: user.email,
    fullName: user.fullName?.trim() || user.userName || "Utilizator",
    nickname: user.userName,
    phoneNumber: user.phone || undefined,
    role: user.role.toLowerCase() === "admin" ? "admin" : "user",
    createdAt: user.registeredOn,
    isBlocked: Boolean(user.isBlocked),
    lastLoginAt: undefined,
});

const AdminUsersPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [roleFilters, setRoleFilters] = useState<UserRoleFilter[]>([]);
    const [statusFilters, setStatusFilters] = useState<UserStatusFilter[]>([]);
    const [users, setUsers] = useState<AdminUserRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            setLoadError(null);

            try {
                const data = await userService.getAll();
                setUsers(data.map(mapUserToAdminRecord));
            } catch {
                setUsers([]);
                setLoadError("Lista de utilizatori nu a putut fi încărcată.");
                toast.error("Lista de utilizatori nu a putut fi încărcată.");
            } finally {
                setLoading(false);
            }
        };

        void loadUsers();
    }, []);

    const handleToggleBlocked = async (userId: string) => {
        try {
            const response = await userService.toggleBlocked(Number(userId));
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === userId ? { ...user, isBlocked: !user.isBlocked } : user,
                ),
            );
            toast.success(response.message || "Starea utilizatorului a fost actualizată.");
        } catch {
            toast.error("Nu s-a putut actualiza starea utilizatorului.");
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const normalizedSearch = search.toLowerCase();
            const matchesSearch =
                user.fullName.toLowerCase().includes(normalizedSearch) ||
                user.email.toLowerCase().includes(normalizedSearch);
            const matchesRole = roleFilters.length === 0 || roleFilters.includes(user.role);
            const statusKey: UserStatusFilter = user.isBlocked ? "blocked" : "active";
            const matchesStatus = statusFilters.length === 0 || statusFilters.includes(statusKey);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [roleFilters, search, statusFilters, users]);

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Management utilizatori</h2>
                <p>Caută, filtrează și consultă conturile existente în platformă.</p>
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

                <p className="admin-muted-text">Afișate {filteredUsers.length} din {users.length} conturi.</p>

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
                            {loading && (
                                <tr>
                                    <td colSpan={6}>Se încarcă utilizatorii...</td>
                                </tr>
                            )}
                            {!loading && loadError && (
                                <tr>
                                    <td colSpan={6}>{loadError}</td>
                                </tr>
                            )}
                            {!loading && !loadError && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6}>Nu există utilizatori care să corespundă filtrelor curente.</td>
                                </tr>
                            )}
                            {!loading && !loadError && filteredUsers.map((user) => (
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
                                    onToggleBlocked={handleToggleBlocked}
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
