import React, { useMemo, useState } from "react";
import { useAdminPanel } from "../hooks/useAdminPanel";
import type { NotificationTarget } from "../types";

type NotificationsView = "compose" | "history";

type NotificationTemplate = {
    key: string;
    label: string;
    target: NotificationTarget;
    title: string;
    message: string;
};

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
    {
        key: "maintenance",
        label: "Mentenanta platforma",
        target: "all",
        title: "Mentenanta programata",
        message: "Platforma va avea o scurta mentenanta. Unele functii pot fi temporar indisponibile.",
    },
    {
        key: "new-test",
        label: "Test nou disponibil",
        target: "users",
        title: "Test nou disponibil",
        message: "A fost adaugat un test nou in platforma. Intra in sectiunea Teste pentru a-l parcurge.",
    },
    {
        key: "appointments-reminder",
        label: "Reminder programari",
        target: "users",
        title: "Verifica programarile tale",
        message: "Consulta dashboard-ul pentru statusul programarii si eventuale actualizari.",
    },
    {
        key: "admin-alert",
        label: "Alerta interna admin",
        target: "admins",
        title: "Alerta pentru administratori",
        message: "Verificati panoul admin pentru cereri pending si notificari noi.",
    },
];

const formatDateTime = (value: string): string => {
    return new Date(value).toLocaleString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const toInputDate = (value?: string): string => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
};

const AdminNotificationsPage: React.FC = () => {
    const { state, sendNotification } = useAdminPanel();
    const [activeView, setActiveView] = useState<NotificationsView>("compose");
    const [target, setTarget] = useState<NotificationTarget>("all");
    const [targetEmail, setTargetEmail] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [feedback, setFeedback] = useState("");
    const [selectedTemplateKey, setSelectedTemplateKey] = useState("");

    const [historyTargetFilter, setHistoryTargetFilter] = useState<"all" | NotificationTarget>("all");
    const [historySearch, setHistorySearch] = useState("");
    const [historyFrom, setHistoryFrom] = useState("");
    const [historyTo, setHistoryTo] = useState("");

    const estimatedRecipients = useMemo(() => {
        if (target === "all") {
            return state.users.length + 1;
        }

        if (target === "users") {
            return state.users.filter((user) => user.role === "user").length;
        }

        if (target === "admins") {
            return state.users.filter((user) => user.role === "admin").length + 1;
        }

        if (!targetEmail.trim()) {
            return 0;
        }

        const normalizedTargetEmail = targetEmail.trim().toLowerCase();
        const hasUser = state.users.some((user) => user.email.trim().toLowerCase() === normalizedTargetEmail);
        const isDefaultAdmin = normalizedTargetEmail === "admin@electoral.md";
        return hasUser || isDefaultAdmin ? 1 : 0;
    }, [state.users, target, targetEmail]);

    const filteredHistory = useMemo(() => {
        const query = historySearch.trim().toLowerCase();
        const fromDate = historyFrom ? new Date(`${historyFrom}T00:00:00`) : null;
        const toDate = historyTo ? new Date(`${historyTo}T23:59:59`) : null;

        return state.sentNotifications.filter((log) => {
            const matchesTarget = historyTargetFilter === "all" || log.target === historyTargetFilter;
            const matchesQuery =
                !query ||
                log.title.toLowerCase().includes(query) ||
                log.message.toLowerCase().includes(query) ||
                (log.targetEmail || "").toLowerCase().includes(query);

            const sentAt = new Date(log.sentAt);
            const matchesFrom = !fromDate || sentAt >= fromDate;
            const matchesTo = !toDate || sentAt <= toDate;

            return matchesTarget && matchesQuery && matchesFrom && matchesTo;
        });
    }, [historyFrom, historySearch, historyTargetFilter, historyTo, state.sentNotifications]);

    const applySelectedTemplate = () => {
        const template = NOTIFICATION_TEMPLATES.find((item) => item.key === selectedTemplateKey);
        if (!template) {
            return;
        }

        setTarget(template.target);
        setTitle(template.title);
        setMessage(template.message);
        if (template.target !== "email") {
            setTargetEmail("");
        }
        setFeedback(`Template aplicat: ${template.label}`);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!title.trim() || !message.trim()) {
            setFeedback("Completeaza titlul si mesajul notificarii.");
            return;
        }

        if (target === "email" && !targetEmail.trim()) {
            setFeedback("Adauga emailul destinatarului.");
            return;
        }

        const sentCount = sendNotification({
            target,
            title: title.trim(),
            message: message.trim(),
            targetEmail: target === "email" ? targetEmail.trim() : undefined,
        });

        setFeedback(`Notificare trimisa catre ${sentCount} destinatar(i).`);
        setTitle("");
        setMessage("");
        setSelectedTemplateKey("");
        if (target === "email") {
            setTargetEmail("");
        }
        setActiveView("history");
        setHistoryFrom(toInputDate(new Date().toISOString()));
    };

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Notificari</h2>
                <p>Trimite anunturi catre utilizatori si monitorizeaza istoricul mesajelor.</p>
            </section>

            <div
                className="admin-topbar-actions"
                role="tablist"
                aria-label="Vizualizare notificari admin"
                style={{ justifyContent: "center", marginBottom: 4 }}
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeView === "compose"}
                    className={`admin-btn admin-notifications-switch-btn ${activeView === "compose" ? "primary" : "ghost"}`}
                    onClick={() => setActiveView("compose")}
                >
                    Trimite notificare
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeView === "history"}
                    className={`admin-btn admin-notifications-switch-btn ${activeView === "history" ? "primary" : "ghost"}`}
                    onClick={() => setActiveView("history")}
                >
                    Istoric notificari
                </button>
            </div>

            {activeView === "compose" && (
                <section className="admin-panel-card" role="tabpanel" aria-label="Trimite notificare">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-paper-plane admin-card-header-icon"></i> Trimite notificare</h3>
                        <span className="admin-muted-text">Destinatari estimati: {estimatedRecipients}</span>
                    </div>

                    <div className="admin-toolbar admin-notifications-compose-toolbar">
                        <label className="admin-field">
                            <span>Template rapid</span>
                            <select
                                value={selectedTemplateKey}
                                onChange={(event) => setSelectedTemplateKey(event.target.value)}
                            >
                                <option value="">Fara template</option>
                                {NOTIFICATION_TEMPLATES.map((template) => (
                                    <option key={template.key} value={template.key}>
                                        {template.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className="admin-field admin-notifications-template-actions">
                            <span>Actiune</span>
                            <button
                                type="button"
                                className="admin-btn ghost"
                                onClick={applySelectedTemplate}
                                disabled={!selectedTemplateKey}
                            >
                                Aplica template
                            </button>
                        </div>
                    </div>

                    <form className="admin-form-grid" onSubmit={handleSubmit}>
                        <label className="admin-field">
                            <span>Target</span>
                            <select
                                value={target}
                                onChange={(event) => setTarget(event.target.value as NotificationTarget)}
                            >
                                <option value="all">Toata platforma</option>
                                <option value="users">Doar utilizatori</option>
                                <option value="admins">Doar administratori</option>
                                <option value="email">Email specific</option>
                            </select>
                        </label>

                        {target === "email" && (
                            <label className="admin-field">
                                <span>Email destinatar</span>
                                <input
                                    type="email"
                                    value={targetEmail}
                                    onChange={(event) => setTargetEmail(event.target.value)}
                                    placeholder="utilizator@email.com"
                                />
                            </label>
                        )}

                        <label className="admin-field admin-field-full">
                            <span>Titlu</span>
                            <input
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Titlu notificare"
                            />
                        </label>

                        <label className="admin-field admin-field-full">
                            <span>Mesaj</span>
                            <textarea
                                rows={4}
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="Mesajul care va fi trimis"
                            />
                        </label>

                        <div className="admin-form-actions">
                            <button className="admin-btn primary" type="submit">
                                Trimite notificarea
                            </button>
                        </div>
                    </form>
                    {feedback && <p className="admin-muted-text">{feedback}</p>}
                </section>
            )}

            {activeView === "history" && (
                <section className="admin-panel-card" role="tabpanel" aria-label="Istoric notificari">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-clock-rotate-left admin-card-header-icon"></i> Istoric notificari</h3>
                        <span className="admin-muted-text">Rezultate: {filteredHistory.length}</span>
                    </div>

                    <div className="admin-toolbar admin-notifications-history-toolbar">
                        <label className="admin-field">
                            <span>Cautare</span>
                            <input
                                type="text"
                                value={historySearch}
                                onChange={(event) => setHistorySearch(event.target.value)}
                                placeholder="Titlu, mesaj, email"
                            />
                        </label>
                        <label className="admin-field">
                            <span>Target</span>
                            <select
                                value={historyTargetFilter}
                                onChange={(event) => setHistoryTargetFilter(event.target.value as "all" | NotificationTarget)}
                            >
                                <option value="all">all (platforma)</option>
                                <option value="users">users</option>
                                <option value="admins">admins</option>
                                <option value="email">email</option>
                            </select>
                        </label>
                        <label className="admin-field">
                            <span>De la</span>
                            <input type="date" value={historyFrom} onChange={(event) => setHistoryFrom(event.target.value)} />
                        </label>
                        <label className="admin-field">
                            <span>Pana la</span>
                            <input type="date" value={historyTo} onChange={(event) => setHistoryTo(event.target.value)} />
                        </label>
                    </div>

                    {filteredHistory.length === 0 ? (
                        <p className="admin-muted-text">Nu exista notificari trimise pentru filtrul selectat.</p>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Titlu</th>
                                        <th>Target</th>
                                        <th>Destinatari</th>
                                        <th>Trimisa la</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((log) => (
                                        <tr key={log.id}>
                                            <td>
                                                <strong>{log.title}</strong>
                                                <p>{log.message}</p>
                                            </td>
                                            <td>{log.targetEmail || log.target}</td>
                                            <td>{log.recipientCount}</td>
                                            <td>{formatDateTime(log.sentAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default AdminNotificationsPage;
