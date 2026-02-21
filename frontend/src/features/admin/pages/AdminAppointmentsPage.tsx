import React, { useMemo, useState } from "react";
import { useAdminPanel } from "../hooks/useAdminPanel";
import type { AppointmentStatus } from "../types";

const formatDateTime = (value: string): string => {
    return new Date(value).toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const AdminAppointmentsPage: React.FC = () => {
    const { state, updateAppointmentStatus } = useAdminPanel();
    const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
    const [search, setSearch] = useState("");

    const filteredAppointments = useMemo(() => {
        return state.appointments.filter((appointment) => {
            const matchesStatus =
                statusFilter === "all" ? true : appointment.status === statusFilter;
            const matchesSearch =
                appointment.fullName.toLowerCase().includes(search.toLowerCase()) ||
                appointment.idOrPhone.toLowerCase().includes(search.toLowerCase()) ||
                (appointment.userEmail || "").toLowerCase().includes(search.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [search, state.appointments, statusFilter]);

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Programari examen</h2>
                <p>Revizuieste cererile si aproba sau respinge programarile candidatilor.</p>
            </section>

            <section className="admin-panel-card">
                <div className="admin-toolbar">
                    <label className="admin-field">
                        <span>Cauta candidat</span>
                        <input
                            type="text"
                            placeholder="Nume, email sau telefon"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </label>

                    <label className="admin-field">
                        <span>Status</span>
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as "all" | AppointmentStatus
                                )
                            }
                        >
                            <option value="all">Toate</option>
                            <option value="pending">In asteptare</option>
                            <option value="approved">Aprobate</option>
                            <option value="rejected">Respinse</option>
                        </select>
                    </label>
                </div>

                {filteredAppointments.length === 0 ? (
                    <p className="admin-muted-text">
                        Nu exista programari pentru filtrul selectat.
                    </p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Candidat</th>
                                    <th>Data examen</th>
                                    <th>Interval</th>
                                    <th>Status</th>
                                    <th>Actiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td>
                                            <strong>{appointment.fullName}</strong>
                                            <p>{appointment.userEmail || appointment.idOrPhone}</p>
                                        </td>
                                        <td>{formatDateTime(appointment.date)}</td>
                                        <td>
                                            {appointment.slotStart} - {appointment.slotEnd}
                                        </td>
                                        <td>
                                            <span className={`admin-pill ${appointment.status}`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-actions-row">
                                                <button
                                                    className="admin-text-btn"
                                                    type="button"
                                                    onClick={() =>
                                                        updateAppointmentStatus(
                                                            appointment.id,
                                                            "approved"
                                                        )
                                                    }
                                                    disabled={appointment.status === "approved"}
                                                >
                                                    Aproba
                                                </button>
                                                <button
                                                    className="admin-text-btn danger"
                                                    type="button"
                                                    onClick={() =>
                                                        updateAppointmentStatus(
                                                            appointment.id,
                                                            "rejected"
                                                        )
                                                    }
                                                    disabled={appointment.status === "rejected"}
                                                >
                                                    Respinge
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminAppointmentsPage;
