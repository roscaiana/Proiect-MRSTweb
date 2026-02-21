import React, { useMemo, useState } from "react";
import { useAdminPanel } from "../hooks/useAdminPanel";
import type { NotificationTarget } from "../types";

const formatDateTime = (value: string): string => {
    return new Date(value).toLocaleString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const AdminNotificationsPage: React.FC = () => {
    const { state, sendNotification } = useAdminPanel();
    const [target, setTarget] = useState<NotificationTarget>("all");
    const [targetEmail, setTargetEmail] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [feedback, setFeedback] = useState("");

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

        const hasUser = state.users.some((user) => user.email === targetEmail.trim());
        const isDefaultAdmin = targetEmail.trim() === "admin@electoral.md";
        return hasUser || isDefaultAdmin ? 1 : 0;
    }, [state.users, target, targetEmail]);

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
        if (target === "email") {
            setTargetEmail("");
        }
    };

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Notificari</h2>
                <p>Trimite anunturi catre utilizatori si monitorizeaza istoricul mesajelor.</p>
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3>Trimite notificare</h3>
                    <span className="admin-muted-text">
                        Destinatari estimati: {estimatedRecipients}
                    </span>
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

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3>Istoric notificari</h3>
                </div>
                {state.sentNotifications.length === 0 ? (
                    <p className="admin-muted-text">Nu exista notificari trimise.</p>
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
                                {state.sentNotifications.map((log) => (
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
        </div>
    );
};

export default AdminNotificationsPage;
