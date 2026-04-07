import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import AdminNewsRow from "../components/AdminNewsRow";
import AdminSingleSelect, { type AdminSingleSelectOption } from "../components/AdminSingleSelect";
import { useAdminPanel } from "../hooks/useAdminPanel";
import type { AdminNewsArticle, AdminNewsArticleInput } from "../types";
import { formatDateShort } from "../../../utils/dateUtils";
import { adminNewsSchema, type AdminNewsFormValues } from "../../../schemas/adminSchemas";

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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<AdminNewsArticle | null>(null);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AdminNewsFormValues>({
        resolver: zodResolver(adminNewsSchema),
        defaultValues: EMPTY_FORM,
    });

    const openCreate = () => {
        setEditingId(null);
        reset(EMPTY_FORM);
        setView("form");
    };

    const openEdit = (article: AdminNewsArticle) => {
        setEditingId(article.id);
        reset({
            title: article.title,
            description: article.description,
            category: article.category,
            image: article.image,
            publishedAt: article.publishedAt.slice(0, 10),
        });
        setView("form");
    };

    const openDeleteDialog = (article: AdminNewsArticle) => {
        setPendingDelete(article);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setPendingDelete(null);
    };

    const handleDeleteConfirm = () => {
        if (!pendingDelete) return;
        deleteNewsArticle(pendingDelete.id);
        toast.success("Știrea a fost ștearsă.");
        closeDeleteDialog();
    };

    const onSubmit = (data: AdminNewsFormValues) => {
        const input: AdminNewsArticleInput = {
            ...data,
            title: data.title.trim(),
            description: data.description.trim(),
            publishedAt: new Date(data.publishedAt).toISOString(),
        };

        if (editingId) {
            updateNewsArticle(editingId, input);
            toast.success("Noutatea a fost actualizată.");
        } else {
            createNewsArticle(input);
            toast.success("Noutatea a fost publicată.");
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
                    Lista noutăți
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
                                            title={article.title}
                                            description={article.description}
                                            category={article.category}
                                            publishedAt={article.publishedAt}
                                            formatDate={formatDateShort}
                                            onEdit={() => openEdit(article)}
                                            onDelete={() => openDeleteDialog(article)}
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

                    <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)}>
                        <label className="admin-field admin-field-full">
                            <span>Titlu</span>
                            <input
                                type="text"
                                {...register("title")}
                                placeholder="Titlul știrii"
                            />
                            {errors.title?.message && (
                                <span className="admin-field-error" role="alert">{errors.title.message}</span>
                            )}
                        </label>

                        <label className="admin-field admin-field-full">
                            <span>Descriere</span>
                            <textarea
                                rows={4}
                                {...register("description")}
                                placeholder="Conținutul știrii"
                            />
                            {errors.description?.message && (
                                <span className="admin-field-error" role="alert">{errors.description.message}</span>
                            )}
                        </label>

                        <label className="admin-field">
                            <span>Categorie</span>
                            <Controller
                                control={control}
                                name="category"
                                render={({ field }) => (
                                    <AdminSingleSelect
                                        ariaLabel="Selectare categorie"
                                        options={CATEGORY_OPTIONS}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.category?.message && (
                                <span className="admin-field-error" role="alert">{errors.category.message}</span>
                            )}
                        </label>

                        <label className="admin-field">
                            <span>Pictograma</span>
                            <Controller
                                control={control}
                                name="image"
                                render={({ field }) => (
                                    <AdminSingleSelect
                                        ariaLabel="Selectare pictograma"
                                        options={IMAGE_OPTIONS}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.image?.message && (
                                <span className="admin-field-error" role="alert">{errors.image.message}</span>
                            )}
                        </label>

                        <label className="admin-field">
                            <span>Data publicării</span>
                            <input
                                type="date"
                                {...register("publishedAt")}
                            />
                            {errors.publishedAt?.message && (
                                <span className="admin-field-error" role="alert">{errors.publishedAt.message}</span>
                            )}
                        </label>

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

            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Ștergere noutate</DialogTitle>
                <DialogContent>
                    <p>Ești sigur că vrei să ștergi această știre?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Renunță</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
                        Șterge
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AdminNewsPage;
