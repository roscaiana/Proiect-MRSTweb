import React, { useMemo, useState } from "react";
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

type MaterialsView = "list" | "form";

const LEGISLATIVE_CATEGORY = "Legislativ";

const IMAGE_OPTIONS: ReadonlyArray<AdminSingleSelectOption<string>> = [
    { value: "law", label: "Lege (law)" },
    { value: "cert", label: "Certificat (cert)" },
    { value: "users", label: "Utilizatori (users)" },
    { value: "calendar", label: "Calendar (calendar)" },
    { value: "web", label: "Platformă (web)" },
    { value: "globe", label: "Internațional (globe)" },
];

const EMPTY_FORM: AdminNewsArticleInput = {
    title: "",
    description: "",
    category: LEGISLATIVE_CATEGORY,
    image: "law",
    publishedAt: new Date().toISOString().slice(0, 10),
};

const AdminLegislativeMaterialsPage: React.FC = () => {
    const { state, createNewsArticle, updateNewsArticle, deleteNewsArticle } = useAdminPanel();
    const [view, setView] = useState<MaterialsView>("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<AdminNewsArticle | null>(null);

    const legislativeArticles = useMemo(
        () => state.news.filter((article) => article.category === LEGISLATIVE_CATEGORY),
        [state.news],
    );

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
            category: LEGISLATIVE_CATEGORY,
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
        toast.success("Materialul legislativ a fost șters.");
        closeDeleteDialog();
    };

    const onSubmit = (data: AdminNewsFormValues) => {
        const input: AdminNewsArticleInput = {
            ...data,
            title: data.title.trim(),
            description: data.description.trim(),
            category: LEGISLATIVE_CATEGORY,
            publishedAt: new Date(data.publishedAt).toISOString(),
        };

        if (editingId) {
            updateNewsArticle(editingId, input);
            toast.success("Materialul legislativ a fost actualizat.");
        } else {
            createNewsArticle(input);
            toast.success("Materialul legislativ a fost publicat.");
        }

        setView("list");
    };

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Materiale legislative</h2>
                <p>Administrează conținutul afișat pe pagina publică Materiale legislative.</p>
            </section>

            <div className="admin-topbar-actions" style={{ justifyContent: "center", marginBottom: 4 }}>
                <button
                    type="button"
                    className={`admin-btn admin-notifications-switch-btn ${view === "list" ? "primary" : "ghost"}`}
                    onClick={() => setView("list")}
                >
                    Lista materiale
                </button>
                <button
                    type="button"
                    className={`admin-btn admin-notifications-switch-btn ${view === "form" ? "primary" : "ghost"}`}
                    onClick={openCreate}
                >
                    Adaugă material
                </button>
            </div>

            {view === "list" && (
                <section className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3><i className="fas fa-book-open admin-card-header-icon"></i> Materiale publicate</h3>
                        <span className="admin-muted-text">Total: {legislativeArticles.length}</span>
                    </div>

                    {legislativeArticles.length === 0 ? (
                        <p className="admin-muted-text">Nu există materiale legislative. Adaugă primul material.</p>
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
                                    {legislativeArticles.map((article) => (
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
                            {editingId ? "Editează materialul" : "Material legislativ nou"}
                        </h3>
                    </div>

                    <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)}>
                        <input type="hidden" {...register("category")} value={LEGISLATIVE_CATEGORY} />

                        <label className="admin-field admin-field-full">
                            <span>Titlu</span>
                            <input type="text" {...register("title")} placeholder="Titlul materialului" />
                            {errors.title?.message && (
                                <span className="admin-field-error" role="alert">{errors.title.message}</span>
                            )}
                        </label>

                        <label className="admin-field admin-field-full">
                            <span>Descriere</span>
                            <textarea rows={4} {...register("description")} placeholder="Conținutul materialului" />
                            {errors.description?.message && (
                                <span className="admin-field-error" role="alert">{errors.description.message}</span>
                            )}
                        </label>

                        <label className="admin-field">
                            <span>Pictogramă</span>
                            <Controller
                                control={control}
                                name="image"
                                render={({ field }) => (
                                    <AdminSingleSelect
                                        ariaLabel="Selectare pictogramă"
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
                            <input type="date" {...register("publishedAt")} />
                            {errors.publishedAt?.message && (
                                <span className="admin-field-error" role="alert">{errors.publishedAt.message}</span>
                            )}
                        </label>

                        <div className="admin-form-actions">
                            <button type="button" className="admin-btn ghost" onClick={() => setView("list")}>
                                Anulează
                            </button>
                            <button type="submit" className="admin-btn primary">
                                {editingId ? "Salvează modificările" : "Publică materialul"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Stergere material</DialogTitle>
                <DialogContent>
                    <p>Ești sigur că vrei să ștergi acest material legislativ?</p>
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

export default AdminLegislativeMaterialsPage;
