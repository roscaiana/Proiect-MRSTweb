import React, { useEffect, useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import toast from "react-hot-toast";
import AdminNewsRow from "../components/AdminNewsRow";
import { legislativeMaterialService } from "../../../services";
import type { LegislativeMaterialDto, LegislativeMaterialInputDto } from "../../../services";
import { formatDateShort } from "../../../utils/dateUtils";

type MaterialsView = "list" | "form";

const EMPTY_FORM: LegislativeMaterialInputDto = {
    title: "",
    description: "",
    category: "Cod electoral",
    sourceUrl: "",
    sortOrder: 1,
    isPublished: true,
    publishedAt: new Date().toISOString().slice(0, 10),
};

const CATEGORY_OPTIONS = [
    "Cod electoral",
    "Regulament",
    "Hotărâre CEC",
    "Ghid",
    "Alt material",
];

const AdminLegislativeMaterialsPage: React.FC = () => {
    const [view, setView] = useState<MaterialsView>("list");
    const [materials, setMaterials] = useState<LegislativeMaterialDto[]>([]);
    const [formData, setFormData] = useState<LegislativeMaterialInputDto>(EMPTY_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<LegislativeMaterialDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [fieldError, setFieldError] = useState("");

    const sortedMaterials = useMemo(
        () => [...materials].sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id),
        [materials],
    );

    const loadMaterials = async () => {
        try {
            setLoading(true);
            setLoadError("");
            const data = await legislativeMaterialService.getAllForAdmin();
            setMaterials(data);
        } catch {
            setLoadError("Materialele legislative nu au putut fi încărcate din backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadMaterials();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setFormData({
            ...EMPTY_FORM,
            sortOrder: materials.length > 0 ? Math.max(...materials.map((item) => item.sortOrder)) + 1 : 1,
            publishedAt: new Date().toISOString().slice(0, 10),
        });
        setFieldError("");
        setView("form");
    };

    const openEdit = (material: LegislativeMaterialDto) => {
        setEditingId(material.id);
        setFormData({
            title: material.title,
            description: material.description,
            category: material.category,
            sourceUrl: material.sourceUrl ?? "",
            sortOrder: material.sortOrder,
            isPublished: material.isPublished,
            publishedAt: material.publishedAt.slice(0, 10),
        });
        setFieldError("");
        setView("form");
    };

    const openDeleteDialog = (material: LegislativeMaterialDto) => {
        setPendingDelete(material);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setPendingDelete(null);
    };

    const updateField = <TKey extends keyof LegislativeMaterialInputDto>(
        key: TKey,
        value: LegislativeMaterialInputDto[TKey],
    ) => {
        setFormData((current) => ({ ...current, [key]: value }));
    };

    const validate = () => {
        if (!formData.title.trim()) return "Titlul este obligatoriu.";
        if (!formData.description.trim()) return "Descrierea este obligatorie.";
        if (!formData.category.trim()) return "Categoria este obligatorie.";
        if (!formData.publishedAt) return "Data publicării este obligatorie.";
        return "";
    };

    const handleDeleteConfirm = async () => {
        if (!pendingDelete) return;

        try {
            await legislativeMaterialService.remove(pendingDelete.id);
            toast.success("Materialul legislativ a fost șters.");
            closeDeleteDialog();
            await loadMaterials();
        } catch {
            toast.error("Materialul legislativ nu a putut fi șters.");
        }
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationMessage = validate();
        if (validationMessage) {
            setFieldError(validationMessage);
            return;
        }

        const input: LegislativeMaterialInputDto = {
            ...formData,
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category.trim(),
            sourceUrl: formData.sourceUrl?.trim() || undefined,
            sortOrder: Number(formData.sortOrder) || 0,
            publishedAt: new Date(formData.publishedAt).toISOString(),
        };

        try {
            setSaving(true);
            setFieldError("");

            if (editingId) {
                const result = await legislativeMaterialService.update(editingId, input);
                if (!result.isSuccess) throw new Error(result.message ?? "Actualizarea materialului a eșuat.");
                toast.success("Materialul legislativ a fost actualizat.");
            } else {
                const result = await legislativeMaterialService.create(input);
                if (!result.isSuccess) throw new Error(result.message ?? "Crearea materialului a eșuat.");
                toast.success("Materialul legislativ a fost publicat.");
            }

            await loadMaterials();
            setView("list");
        } catch (error) {
            setFieldError(error instanceof Error ? error.message : "Operația nu a putut fi finalizată.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Materiale legislative</h2>
                <p>Administrează materialele legislative afișate pe pagina publică.</p>
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
                        <span className="admin-muted-text">Total: {materials.length}</span>
                    </div>

                    {loading && <p className="admin-muted-text">Se încarcă materialele...</p>}

                    {loadError && (
                        <div className="admin-api-error" role="alert">
                            <div>
                                <strong>Materialele nu au fost încărcate.</strong>
                                <span>{loadError}</span>
                            </div>
                            <button type="button" className="admin-btn secondary" onClick={() => void loadMaterials()}>
                                Reîncarcă
                            </button>
                        </div>
                    )}

                    {!loading && !loadError && materials.length === 0 ? (
                        <p className="admin-muted-text">Nu există materiale legislative. Adaugă primul material.</p>
                    ) : null}

                    {!loading && !loadError && materials.length > 0 ? (
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
                                    {sortedMaterials.map((material) => (
                                        <AdminNewsRow
                                            key={material.id}
                                            title={material.title}
                                            description={`${material.description}${material.isPublished ? "" : " (ascuns)"}`}
                                            category={`${material.category} #${material.sortOrder}`}
                                            publishedAt={material.publishedAt}
                                            formatDate={formatDateShort}
                                            onEdit={() => openEdit(material)}
                                            onDelete={() => openDeleteDialog(material)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
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

                    <form className="admin-form-grid" onSubmit={onSubmit}>
                        <label className="admin-field admin-field-full">
                            <span>Titlu</span>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(event) => updateField("title", event.target.value)}
                                placeholder="Titlul materialului"
                            />
                        </label>

                        <label className="admin-field admin-field-full">
                            <span>Descriere</span>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(event) => updateField("description", event.target.value)}
                                placeholder="Conținutul materialului"
                            />
                        </label>

                        <label className="admin-field">
                            <span>Categorie</span>
                            <select value={formData.category} onChange={(event) => updateField("category", event.target.value)}>
                                {CATEGORY_OPTIONS.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="admin-field">
                            <span>Ordine</span>
                            <input
                                type="number"
                                min="1"
                                value={formData.sortOrder}
                                onChange={(event) => updateField("sortOrder", Number(event.target.value))}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Data publicării</span>
                            <input
                                type="date"
                                value={formData.publishedAt}
                                onChange={(event) => updateField("publishedAt", event.target.value)}
                            />
                        </label>

                        <label className="admin-field">
                            <span>Link document / sursă</span>
                            <input
                                type="url"
                                value={formData.sourceUrl ?? ""}
                                onChange={(event) => updateField("sourceUrl", event.target.value)}
                                placeholder="https://..."
                            />
                        </label>

                        <label className="admin-checkbox-field admin-field-full">
                            <input
                                type="checkbox"
                                checked={formData.isPublished}
                                onChange={(event) => updateField("isPublished", event.target.checked)}
                            />
                            <span>Publică materialul pe pagina publică</span>
                        </label>

                        {fieldError && (
                            <span className="admin-field-error admin-field-full" role="alert">
                                {fieldError}
                            </span>
                        )}

                        <div className="admin-form-actions">
                            <button type="button" className="admin-btn ghost" onClick={() => setView("list")}>
                                Anulează
                            </button>
                            <button type="submit" className="admin-btn primary" disabled={saving}>
                                {saving ? "Se salvează..." : editingId ? "Salvează modificările" : "Publică materialul"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Ștergere material</DialogTitle>
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
