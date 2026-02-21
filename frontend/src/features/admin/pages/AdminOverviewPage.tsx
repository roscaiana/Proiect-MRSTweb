import React, { useMemo } from "react";
import AdminStatCard from "../components/AdminStatCard";
import { useAdminPanel } from "../hooks/useAdminPanel";

const formatShortDate = (value: string): string => {
    return new Date(value).toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const AdminOverviewPage: React.FC = () => {
    const { state } = useAdminPanel();
    const now = new Date();
    const today = now.toDateString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeUsers = useMemo(() => {
        return state.users.filter((user) => {
            if (user.isBlocked || !user.lastLoginAt) {
                return false;
            }
            return new Date(user.lastLoginAt) >= thirtyDaysAgo;
        }).length;
    }, [state.users, thirtyDaysAgo]);

    const passRate = useMemo(() => {
        if (state.quizHistory.length === 0) {
            return 0;
        }

        const passed = state.quizHistory.filter(
            (result) => result.score >= state.settings.passingThreshold
        ).length;

        return Math.round((passed / state.quizHistory.length) * 100);
    }, [state.quizHistory, state.settings.passingThreshold]);

    const appointmentsToday = useMemo(() => {
        return state.appointments.filter(
            (appointment) => new Date(appointment.date).toDateString() === today
        ).length;
    }, [state.appointments, today]);

    const appointmentsPerDay = useMemo(() => {
        if (state.appointments.length === 0) {
            return 0;
        }

        const uniqueDays = new Set(
            state.appointments.map((appointment) =>
                new Date(appointment.date).toDateString()
            )
        ).size;

        if (uniqueDays === 0) {
            return 0;
        }

        return Number((state.appointments.length / uniqueDays).toFixed(1));
    }, [state.appointments]);

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Statistici generale</h2>
                <p>Monitorizeaza activitatea platformei si indicatorii principali.</p>
            </section>

            <section className="admin-stat-grid">
                <AdminStatCard
                    title="Utilizatori activi (30 zile)"
                    value={String(activeUsers)}
                    hint={`${state.users.length} utilizatori in total`}
                    iconClass="fas fa-user-check"
                />
                <AdminStatCard
                    title="Rata de promovare"
                    value={`${passRate}%`}
                    hint={`Prag curent: ${state.settings.passingThreshold}%`}
                    iconClass="fas fa-award"
                />
                <AdminStatCard
                    title="Programari astazi"
                    value={String(appointmentsToday)}
                    hint={`Maxim setat: ${state.settings.appointmentsPerDay}/zi`}
                    iconClass="fas fa-calendar-day"
                />
                <AdminStatCard
                    title="Media programarilor/zi"
                    value={String(appointmentsPerDay)}
                    hint={`${state.appointments.length} programari totale`}
                    iconClass="fas fa-chart-bar"
                />
            </section>

            <section className="admin-grid-two">
                <article className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3>Programari recente</h3>
                    </div>
                    {state.appointments.length === 0 ? (
                        <p className="admin-muted-text">Nu exista programari inregistrate.</p>
                    ) : (
                        <div className="admin-simple-list">
                            {state.appointments.slice(0, 6).map((appointment) => (
                                <div className="admin-simple-item" key={appointment.id}>
                                    <div>
                                        <strong>{appointment.fullName}</strong>
                                        <p>
                                            {formatShortDate(appointment.date)} · {appointment.slotStart}-
                                            {appointment.slotEnd}
                                        </p>
                                    </div>
                                    <span className={`admin-pill ${appointment.status}`}>
                                        {appointment.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </article>

                <article className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3>Notificari trimise</h3>
                    </div>
                    {state.sentNotifications.length === 0 ? (
                        <p className="admin-muted-text">Nu ai trimis notificari inca.</p>
                    ) : (
                        <div className="admin-simple-list">
                            {state.sentNotifications.slice(0, 6).map((log) => (
                                <div className="admin-simple-item" key={log.id}>
                                    <div>
                                        <strong>{log.title}</strong>
                                        <p>
                                            {formatShortDate(log.sentAt)} · {log.recipientCount} destinatari
                                        </p>
                                    </div>
                                    <span className="admin-pill neutral">{log.target}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            </section>
        </div>
    );
};

export default AdminOverviewPage;
