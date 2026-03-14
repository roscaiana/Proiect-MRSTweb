import React, { useMemo, useState } from "react";
import CompactDatePicker from "../../../components/CompactDatePicker/CompactDatePicker";
import AdminMultiSelect, { type AdminMultiSelectOption } from "../components/AdminMultiSelect";
import AdminNotificationHistoryRow from "../components/AdminNotificationHistoryRow";
import AdminSingleSelect, { type AdminSingleSelectOption } from "../components/AdminSingleSelect";
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
        label: "Mentenanță platformă",
        target: "all",
        title: "Mentenanță programată",
        message: "Platforma va avea o scurtă mentenanță. Unele funcții pot fi temporar indisponibile.",
    },
    {
        key: "new-test",
        label: "Test nou disponibil",
        target: "users",
        title: "Test nou disponibil",
        message: "A fost adăugat un test nou în platformă. Intră în secțiunea Teste pentru a-l parcurge.",
    },
    {
        key: "appointments-reminder",
        label: "Reminder programări",
        target: "users",
        title: "Verifică programările tale",
        message: "Consultă dashboard-ul pentru statusul programării și eventuale actualizări.",
    },
    {
        key: "admin-alert",
        label: "Alertă internă admin",
        target: "admins",
        title: "Alerta pentru administratori",
        message: "Verificați panoul admin pentru cereri pending și notificări noi.",
    },
];

const NOTIFICATION_TARGET_FILTER_OPTIONS: ReadonlyArray<AdminMultiSelectOption<NotificationTarget>> = [
    { value: "all", label: "all (platforma)" },
    { value: "users", label: "users" },
    { value: "admins", label: "admins" },
    { value: "email", label: "email" },
];

const NOTIFICATION_TEMPLATE_OPTIONS: ReadonlyArray<AdminSingleSelectOption<string>> = [
    { value: "", label: "Fără template" },
    ...NOTIFICATION_TEMPLATES.map((template) => ({
        value: template.key,
        label: template.label,
    })),
];

const NOTIFICATION_TARGET_COMPOSE_OPTIONS: ReadonlyArray<AdminSingleSelectOption<NotificationTarget>> = [
    { value: "all", label: "Toată platforma" },
    { value: "users", label: "Doar utilizatori" },
    { value: "admins", label: "Doar administratori" },
    { value: "email", label: "Email specific" },
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
    const [historyTargetFilters, setHistoryTargetFilters] = useState<NotificationTarget[]>([]);
    const [historySearch, setHistorySearch] = useState("");
    const [historyFrom, setHistoryFrom] = useState("");
    const [historyTo, setHistoryTo] = useState("");

    const estimatedRecipients = useMemo(() => {
        if (target === "all") return state.users.length + 1;
        if (target === "users") return state.users.filter((user) => user.role === "user").length;
        if (target === "admins") return state.users.filter((user) => user.role === "admin").length + 1;
        if (!targetEmail.trim()) return 0;

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
            const matchesTarget = historyTargetFilters.length === 0 || historyTargetFilters.includes(log.target);
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
    }, [historyFrom, historySearch, historyTargetFilters, historyTo, state.sentNotifications]);

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
            setFeedback("Completează titlul și mesajul notificării.");
            return;
        }

        if (target === "email" && !targetEmail.trim()) {
            setFeedback("Adaugă emailul destinatarului.");
            return;
        }

        const sentCount = sendNotification({
            target,
            title: title.trim(),
            message: message.trim(),
            targetEmail: target === "email" ? targetEmail.trim() : undefined,
        });

        setFeedback(`Notificare trimisă către ${sentCount} destinatar(i).`);
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
                <h2>Notificări</h2>
                <p>Trimite anunțuri către utilizatori și monitorizează istoricul mesajelor.</p>
            </section>

            <div className="admin-topbar-actions" role="tablist" aria-label="Vizualizare notificări admin" style={{ justifyContent: "center", marginBottom: 4 }}>
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
                    Istoric notificări
                </button>
            </div>

            {activeView === "compose" && (
                <section className="admin-panel-card" role="tabpanel" aria-label="Trimite notificare">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-paper-plane admin-card-header-icon"></i> Trimite notificare</h3>
                        <span className="admin-muted-text">Destinatari estimați: {estimatedRecipients}</span>
                    </div>

                    <div className="admin-toolbar admin-notifications-compose-toolbar">
                        <label className="admin-field">
                            <span>Template rapid</span>
                            <AdminSingleSelect
                                ariaLabel="Selectare template notificare"
                                options={NOTIFICATION_TEMPLATE_OPTIONS}
                                value={selectedTemplateKey}
                                onChange={setSelectedTemplateKey}
                                placeholder="Fără template"
                            />
                        </label>
                        <div className="admin-field admin-notifications-template-actions">
                            <span>Acțiune</span>
                            <button
                                type="button"
                                className="admin-btn ghost"
                                onClick={applySelectedTemplate}
                                disabled={!selectedTemplateKey}
                            >
                                Aplică template
                            </button>
                        </div>
                    </div>

                    <form className="admin-form-grid" onSubmit={handleSubmit}>
                        <label className="admin-field">
                            <span>Target</span>
                            <AdminSingleSelect
                                ariaLabel="Selectare target notificare"
                                options={NOTIFICATION_TARGET_COMPOSE_OPTIONS}
                                value={target}
                                onChange={setTarget}
                            />
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
                <section className="admin-panel-card" role="tabpanel" aria-label="Istoric notificări">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-clock-rotate-left admin-card-header-icon"></i> Istoric notificări</h3>
                        <span className="admin-muted-text">Rezultate: {filteredHistory.length}</span>
                    </div>

                    <div className="admin-toolbar admin-notifications-history-toolbar">
                        <label className="admin-field">
                            <span>Căutare</span>
                            <input
                                type="text"
                                value={historySearch}
                                onChange={(event) => setHistorySearch(event.target.value)}
                                placeholder="Titlu, mesaj, email"
                            />
                        </label>
                        <label className="admin-field">
                            <span>Target</span>
                            <AdminMultiSelect
                                ariaLabel="Filtrare istoric notificari dupa target"
                                options={NOTIFICATION_TARGET_FILTER_OPTIONS}
                                selectedValues={historyTargetFilters}
                                onChange={setHistoryTargetFilters}
                                placeholder="Toate target-urile"
                            />
                        </label>
                        <label className="admin-field">
                            <span>De la</span>
                            <CompactDatePicker value={historyFrom} onChange={setHistoryFrom} ariaLabel="Calendar filtrare notificari de la" />
                        </label>
                        <label className="admin-field">
                            <span>Până la</span>
                            <CompactDatePicker value={historyTo} onChange={setHistoryTo} ariaLabel="Calendar filtrare notificari pana la" />
                        </label>
                    </div>

                    {filteredHistory.length === 0 ? (
                        <p className="admin-muted-text">Nu există notificări trimise pentru filtrul selectat.</p>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Titlu</th>
                                        <th>Target</th>
                                        <th>Destinatari</th>
                                        <th>Trimisă la</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((log) => (
                                        <AdminNotificationHistoryRow
                                            key={log.id}
                                            id={log.id}
                                            title={log.title}
                                            message={log.message}
                                            target={log.target}
                                            targetEmail={log.targetEmail}
                                            recipientCount={log.recipientCount}
                                            sentAt={log.sentAt}
                                            formatDateTime={formatDateTime}
                                        />
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
