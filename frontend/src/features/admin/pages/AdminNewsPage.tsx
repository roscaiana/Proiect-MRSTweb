import React, { useState } from "react";
import AdminNewsRow from "../components/AdminNewsRow";
import AdminSingleSelect, { type AdminSingleSelectOption } from "../components/AdminSingleSelect";
import { useAdminPanel } from "../hooks/useAdminPanel";
import type { AdminNewsArticle, AdminNewsArticleInput } from "../types";
import { formatDateShort } from "../../../utils/dateUtils";

type NewsView = "list" | "form";

const CATEGORY_OPTIONS: ReadonlyArray<AdminSingleSelectOption<string>> = [
    { value: "Certificare", label: "Certificare" },
    { value: "Instruiri", label: "Instruiri" },
    { value: "Legislativ", label: "Legislativ" },
    { value: "Evenimente", label: "Evenimente" },
    { value: "Platformă", label: "Platformă" },
    { value: "Extern", label: "Extern" },
];

const IMAGE_OPTIONS: ReadonlyArray<AdminSingleSelectOption<string>> = [
    { value: "cert", label: "Certificat (cert)" },
    { value: "users", label: "Utilizatori (users)" },
    { value: "law", label: "Lege (law)" },
    { value: "calendar", label: "Calendar (calendar)" },
    { value: "web", label: "Platformă (web)" },
    { value: "globe", label: "Internațional (globe)" },
];

const EMPTY_FORM: AdminNewsArticleInput = {
    title: "",
    description: "",
    category: "Certificare",
    image: "cert",
    publishedAt: new Date().toISOString().slice(0, 10),
};


const AdminNewsPage: React.FC = () => {
    const { state, createNewsArticle, updateNewsArticle, deleteNewsArticle } = useAdminPanel();
    const [view, setView] = useState<NewsView>("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<AdminNewsArticleInput>(EMPTY_FORM);
    const [error, setError] = useState("");

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setError("");
        setView("form");
    };

    const openEdit = (article: AdminNewsArticle) => {
        setEditingId(article.id);
        setForm({
            title: article.title,
            description: article.description,
            category: article.category,
            image: article.image,
            publishedAt: article.publishedAt.slice(0, 10),
        });
        setError("");
        setView("form");
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("Ești sigur că vrei să ștergi această știre?")) {
            return;
        }
        deleteNewsArticle(id);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!form.title.trim()) {
            setError("Titlul este obligatoriu.");
            return;
        }
        if (!form.description.trim()) {
            setError("Descrierea este obligatorie.");
            return;
        }
        if (!form.publishedAt) {
            setError("Data publicării este obligatorie.");
            return;
        }

        const input: AdminNewsArticleInput = {
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
            publishedAt: new Date(form.publishedAt).toISOString(),
        };

        if (editingId) {
            updateNewsArticle(editingId, input);
        } else {
            createNewsArticle(input);
        }

        setView("list");
    };

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Noutăți</h2>
                <p>Gestionează articolele de știri afișate pe pagina publică Noutăți.</p>
            </section>

            <div className="admin-topbar-actions" style={{ justifyContent: "center", marginBottom: 4 }}>
                <button
                    type="button"
                    className={`admin-btn admin-notifications-switch-btn ${view === "list" ? "primary" : "ghost"}`}
                    onClick={() => setView("list")}
                >
                    Listă noutăți
                </button>
                <button
                    type="button"
                    className={`admin-btn admin-notifications-switch-btn ${view === "form" ? "primary" : "ghost"}`}
                    onClick={openCreate}
                >
                    Adaugă noutate
                </button>
            </div>

            {view === "list" && (
                <section className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-newspaper admin-card-header-icon"></i> Noutăți publicate</h3>
                        <span className="admin-muted-text">Total: {state.news.length}</span>
                    </div>

                    {state.news.length === 0 ? (
                        <p className="admin-muted-text">Nu există noutăți. Adaugă prima știre.</p>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Titlu</th>
                                        <th>Categorie</th>
                                        <th>Data publicării</th>
                                        <th>Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.news.map((article) => (
                                        <AdminNewsRow
                                            key={article.id}
                                            id={article.id}
                                            title={article.title}
                                            description={article.description}
                                            category={article.category}
                                            publishedAt={article.publishedAt}
                                            formatDate={formatDateShort}
                                            onEdit={() => openEdit(article)}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {view === "form" && (
                <section className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3>
                            <i className={`fas fa-${editingId ? "pen" : "plus"} admin-card-header-icon`}></i>
                            {editingId ? "Editează noutatea" : "Noutate nouă"}
                        </h3>
                    </div>

                    <form className="admin-form-grid" onSubmit={handleSubmit}>
                        <label className="admin-field admin-field-full">
                            <span>Titlu</span>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="Titlul știrii"
                            />
                        </label>

                        <label className="admin-field admin-field-full">
                            <span>Descriere</span>
                            <textarea
                                rows={4}
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Conținutul știrii"
                            />
                        </label>

                        <label className="admin-field">
                            <span>Categorie</span>
                            <AdminSingleSelect
                                ariaLabel="Selectare categorie"
                                options={CATEGORY_OPTIONS}
                                value={form.category}
                                onChange={(val) => setForm((f) => ({ ...f, category: val }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Pictogramă</span>
                            <AdminSingleSelect
                                ariaLabel="Selectare pictogramă"
                                options={IMAGE_OPTIONS}
                                value={form.image}
                                onChange={(val) => setForm((f) => ({ ...f, image: val }))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Data publicării</span>
                            <input
                                type="date"
                                value={form.publishedAt}
                                onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                            />
                        </label>

                        {error && <p className="admin-muted-text" style={{ color: "#ef4444" }}>{error}</p>}

                        <div className="admin-form-actions">
                            <button type="button" className="admin-btn ghost" onClick={() => setView("list")}>
                                Anulează
                            </button>
                            <button type="submit" className="admin-btn primary">
                                {editingId ? "Salvează modificările" : "Publică noutatea"}
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </div>
    );
};

export default AdminNewsPage;
