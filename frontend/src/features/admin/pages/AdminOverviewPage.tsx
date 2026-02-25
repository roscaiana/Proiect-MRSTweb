import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminStatCard from "../components/AdminStatCard";
import { useAdminPanel } from "../hooks/useAdminPanel";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../hooks/useNotifications";

const DAY_MS = 24 * 60 * 60 * 1000;

const formatShortDate = (value: string): string => {
    return new Date(value).toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const periodLabel = (days: 1 | 7 | 30): string => {
    if (days === 1) return "azi";
    if (days === 7) return "ultimele 7 zile";
    return "ultimele 30 zile";
};

const AdminOverviewPage: React.FC = () => {
    const { state } = useAdminPanel();
    const { user, isAuthenticated, isAdmin } = useAuth();
    const { unreadCount } = useNotifications({ isAuthenticated, isAdmin, user });
    const [periodDays, setPeriodDays] = useState<1 | 7 | 30>(7);

    const now = new Date();
    const periodStart = useMemo(() => new Date(now.getTime() - periodDays * DAY_MS), [now, periodDays]);

    const appointmentsInPeriod = useMemo(
        () => state.appointments.filter((appointment) => new Date(appointment.createdAt) >= periodStart),
        [state.appointments, periodStart]
    );

    const quizHistoryInPeriod = useMemo(
        () => state.quizHistory.filter((result) => new Date(result.completedAt) >= periodStart),
        [periodStart, state.quizHistory]
    );

    const activeUsersInPeriod = useMemo(() => {
        return state.users.filter((userRecord) => {
            if (userRecord.isBlocked || !userRecord.lastLoginAt) {
                return false;
            }
            return new Date(userRecord.lastLoginAt) >= periodStart;
        }).length;
    }, [periodStart, state.users]);

    const newUsersInPeriod = useMemo(
        () => state.users.filter((userRecord) => userRecord.role === "user" && new Date(userRecord.createdAt) >= periodStart).length,
        [periodStart, state.users]
    );

    const passRateInPeriod = useMemo(() => {
        if (quizHistoryInPeriod.length === 0) {
            return 0;
        }

        const passed = quizHistoryInPeriod.filter(
            (result) => result.score >= state.settings.passingThreshold
        ).length;

        return Math.round((passed / quizHistoryInPeriod.length) * 100);
    }, [quizHistoryInPeriod, state.settings.passingThreshold]);

    const userCancelledInPeriod = useMemo(
        () =>
            state.appointments.filter(
                (appointment) =>
                    appointment.status === "cancelled" &&
                    appointment.cancelledBy === "user" &&
                    new Date(appointment.updatedAt || appointment.createdAt) >= periodStart
            ).length,
        [periodStart, state.appointments]
    );

    const pendingAppointments = useMemo(
        () => state.appointments.filter((appointment) => appointment.status === "pending"),
        [state.appointments]
    );

    const pendingQueue = useMemo(
        () =>
            [...pendingAppointments]
                .sort((a, b) => {
                    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                    if (dateCompare !== 0) return dateCompare;
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                })
                .slice(0, 6),
        [pendingAppointments]
    );

    const recentAppointments = useMemo(
        () =>
            [...state.appointments]
                .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
                .slice(0, 6),
        [state.appointments]
    );

    const recentSentNotifications = useMemo(() => state.sentNotifications.slice(0, 6), [state.sentNotifications]);

    const newUsersLast24h = useMemo(
        () =>
            state.users.filter(
                (userRecord) => userRecord.role === "user" && new Date(userRecord.createdAt) >= new Date(now.getTime() - DAY_MS)
            ).length,
        [now, state.users]
    );

    const pendingToday = useMemo(() => {
        const todayKey = now.toDateString();
        return pendingAppointments.filter((appointment) => new Date(appointment.date).toDateString() === todayKey).length;
    }, [now, pendingAppointments]);

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Statistici generale</h2>
                <p>Monitorizarea activității platformei și a indicatorilor principali.</p>
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3>
                        <i className="fas fa-chart-pie admin-card-header-icon"></i>
                        KPI pe interval
                    </h3>
                    <div className="admin-topbar-actions" role="tablist" aria-label="Filtru interval KPI">
                        {[1, 7, 30].map((days) => (
                            <button
                                key={days}
                                type="button"
                                role="tab"
                                aria-selected={periodDays === days}
                                className={`admin-btn ${periodDays === days ? "primary" : "ghost"}`}
                                onClick={() => setPeriodDays(days as 1 | 7 | 30)}
                            >
                                {days === 1 ? "Azi" : `${days} zile`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="admin-stat-grid">
                    <AdminStatCard
                        title={`Utilizatori activi (${periodLabel(periodDays)})`}
                        value={String(activeUsersInPeriod)}
                        hint={`${state.users.length} utilizatori total`}
                        iconClass="fas fa-user-check"
                        color="blue"
                    />
                    <AdminStatCard
                        title={`Conturi noi (${periodLabel(periodDays)})`}
                        value={String(newUsersInPeriod)}
                        hint="Conturi noi de tip user"
                        iconClass="fas fa-user-plus"
                        color="green"
                    />
                    <AdminStatCard
                        title={`Programări noi (${periodLabel(periodDays)})`}
                        value={String(appointmentsInPeriod.length)}
                        hint={`Pending acum: ${pendingAppointments.length}`}
                        iconClass="fas fa-calendar-plus"
                        color="purple"
                    />
                    <AdminStatCard
                        title={`Rata promovare (${periodLabel(periodDays)})`}
                        value={`${passRateInPeriod}%`}
                        hint={`Prag curent: ${state.settings.passingThreshold}%`}
                        iconClass="fas fa-award"
                        color="gold"
                    />
                    <AdminStatCard
                        title={`Anulări user (${periodLabel(periodDays)})`}
                        value={String(userCancelledInPeriod)}
                        hint="Anulări făcute din dashboard user"
                        iconClass="fas fa-user-xmark"
                        color="red"
                    />
                    <AdminStatCard
                        title="Notificări admin necitite"
                        value={String(unreadCount)}
                        hint="Clopoțelul din header admin"
                        iconClass="fas fa-bell"
                        color="teal"
                    />
                </div>
            </section>

            <section className="admin-grid-two">
                <article className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-inbox admin-card-header-icon"></i> Inbox de lucru</h3>
                        <Link to="/admin/appointments" className="admin-btn ghost admin-link-btn">
                            Vezi coada
                        </Link>
                    </div>
                    <div className="admin-simple-list">
                        <div className="admin-simple-item">
                            <div>
                                <strong>Programări pending</strong>
                                <p>Cereri care așteaptă aprobare/respingere</p>
                            </div>
                            <span className="admin-pill pending">{pendingAppointments.length}</span>
                        </div>
                        <div className="admin-simple-item">
                            <div>
                                <strong>Pending pentru azi</strong>
                                <p>Programări din ziua curentă aflate în așteptare</p>
                            </div>
                            <span className="admin-pill pending">{pendingToday}</span>
                        </div>
                        <div className="admin-simple-item">
                            <div>
                                <strong>Anulări de utilizator (7 zile)</strong>
                                <p>Necesită verificare și eventuale sloturi realocate</p>
                            </div>
                            <span className="admin-pill cancelled">{
                                state.appointments.filter((a) => a.status === "cancelled" && a.cancelledBy === "user" && new Date(a.updatedAt || a.createdAt) >= new Date(now.getTime() - 7 * DAY_MS)).length
                            }</span>
                        </div>
                        <div className="admin-simple-item">
                            <div>
                                <strong>Conturi noi (24h)</strong>
                                <p>Verifică activitatea și nevoile de suport</p>
                            </div>
                            <span className="admin-pill neutral">{newUsersLast24h}</span>
                        </div>
                        <div className="admin-simple-item">
                            <div>
                                <strong>Notificări admin necitite</strong>
                                <p>Actualizări generate de acțiuni user/admin</p>
                            </div>
                            <span className="admin-pill neutral">{unreadCount}</span>
                        </div>
                    </div>
                </article>

                <article className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-bolt admin-card-header-icon"></i> Acțiuni rapide</h3>
                    </div>
                    <div className="admin-quick-actions-grid">
                        <Link to="/admin/tests" className="admin-btn secondary admin-link-btn">
                            <i className="fas fa-file-circle-plus"></i> Creează test
                        </Link>
                        <Link to="/admin/appointments" className="admin-btn secondary admin-link-btn">
                            <i className="fas fa-calendar-check"></i> Gestionează programări
                        </Link>
                        <Link to="/admin/notifications" className="admin-btn secondary admin-link-btn">
                            <i className="fas fa-bell"></i> Trimite notificare
                        </Link>
                        <Link to="/admin/users" className="admin-btn secondary admin-link-btn">
                            <i className="fas fa-users"></i> Vezi utilizatori
                        </Link>
                    </div>
                </article>
            </section>

            <section className="admin-grid-two">
                <article className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-clock admin-card-header-icon"></i> Coada aprobare (pending)</h3>
                        <Link to="/admin/appointments" className="admin-btn ghost admin-link-btn">
                            Deschide programări
                        </Link>
                    </div>
                    {pendingQueue.length === 0 ? (
                        <p className="admin-muted-text">Nu există programări pending.</p>
                    ) : (
                        <div className="admin-simple-list">
                            {pendingQueue.map((appointment) => (
                                <div className="admin-simple-item" key={appointment.id}>
                                    <div>
                                        <strong>{appointment.fullName}</strong>
                                        <p>
                                            {formatShortDate(appointment.date)} | {appointment.slotStart}-{appointment.slotEnd}
                                        </p>
                                        <p>{appointment.appointmentCode || "Fără cod"}</p>
                                    </div>
                                    <span className="admin-pill pending">pending</span>
                                </div>
                            ))}
                        </div>
                    )}
                </article>

                <article className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-paper-plane admin-card-header-icon"></i> Notificări trimise recent</h3>
                        <Link to="/admin/notifications" className="admin-btn ghost admin-link-btn">
                            Vezi istoric
                        </Link>
                    </div>
                    {recentSentNotifications.length === 0 ? (
                        <p className="admin-muted-text">Nu ai trimis notificări încă.</p>
                    ) : (
                        <div className="admin-simple-list">
                            {recentSentNotifications.map((log) => (
                                <div className="admin-simple-item" key={log.id}>
                                    <div>
                                        <strong>{log.title}</strong>
                                        <p>{formatShortDate(log.sentAt)} | {log.recipientCount} destinatari</p>
                                    </div>
                                    <span className="admin-pill neutral">{log.target}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                        <h3><i className="fas fa-calendar-days admin-card-header-icon"></i> Programări recente</h3>
                </div>
                {recentAppointments.length === 0 ? (
                    <p className="admin-muted-text">Nu există programări înregistrate.</p>
                ) : (
                    <div className="admin-simple-list">
                        {recentAppointments.map((appointment) => (
                            <div className="admin-simple-item" key={appointment.id}>
                                <div>
                                    <strong>{appointment.fullName}</strong>
                                    <p>{formatShortDate(appointment.date)} | {appointment.slotStart}-{appointment.slotEnd}</p>
                                </div>
                                <span className={`admin-pill ${appointment.status}`}>{appointment.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminOverviewPage;

