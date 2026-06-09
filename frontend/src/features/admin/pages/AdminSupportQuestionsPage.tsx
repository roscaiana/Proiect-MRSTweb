import React, { useEffect, useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import toast from "react-hot-toast";
import { supportQuestionService } from "../../../services";
import type { SupportQuestionDto, SupportQuestionInputDto } from "../../../services";

type SupportView = "list" | "form";

const CATEGORY_OPTIONS = [
    { value: "general", label: "General" },
    { value: "exam", label: "Examen și certificare" },
    { value: "technical", label: "Suport tehnic" },
];

const EMPTY_FORM: SupportQuestionInputDto = {
    category: "general",
    question: "",
    answer: "",
    sortOrder: 1,
    isPublished: true,
};

const getCategoryLabel = (category: string) =>
    CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;

const AdminSupportQuestionsPage: React.FC = () => {
    const [view, setView] = useState<SupportView>("list");
    const [questions, setQuestions] = useState<SupportQuestionDto[]>([]);
    const [formData, setFormData] = useState<SupportQuestionInputDto>(EMPTY_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [pendingDelete, setPendingDelete] = useState<SupportQuestionDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [fieldError, setFieldError] = useState("");

    const sortedQuestions = useMemo(
        () => [...questions].sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id),
        [questions],
    );

    const loadQuestions = async () => {
        try {
            setLoading(true);
            setLoadError("");
            const data = await supportQuestionService.getAllForAdmin();
            setQuestions(data);
        } catch {
            setLoadError("Întrebările de suport nu au putut fi încărcate din backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadQuestions();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setFormData({
            ...EMPTY_FORM,
            sortOrder: questions.length > 0 ? Math.max(...questions.map((item) => item.sortOrder)) + 1 : 1,
        });
        setFieldError("");
        setView("form");
    };

    const openEdit = (question: SupportQuestionDto) => {
        setEditingId(question.id);
        setFormData({
            category: question.category,
            question: question.question,
            answer: question.answer,
            sortOrder: question.sortOrder,
            isPublished: question.isPublished,
        });
        setFieldError("");
        setView("form");
    };

    const updateField = <TKey extends keyof SupportQuestionInputDto>(
        key: TKey,
        value: SupportQuestionInputDto[TKey],
    ) => {
        setFormData((current) => ({ ...current, [key]: value }));
    };

    const validate = () => {
        if (!formData.question.trim()) {
            return "Întrebarea este obligatorie.";
        }

        if (!formData.answer.trim()) {
            return "Răspunsul este obligatoriu.";
        }

        if (!formData.category.trim()) {
            return "Categoria este obligatorie.";
        }

        return "";
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationMessage = validate();
        if (validationMessage) {
            setFieldError(validationMessage);
            return;
        }

        const payload: SupportQuestionInputDto = {
            ...formData,
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            category: formData.category.trim(),
            sortOrder: Number(formData.sortOrder) || 0,
        };

        try {
            setSaving(true);
            setFieldError("");

            if (editingId) {
                const result = await supportQuestionService.update(editingId, payload);
                if (!result.isSuccess) {
                    throw new Error(result.message ?? "Actualizarea întrebării a eșuat.");
                }

                toast.success("Întrebarea a fost actualizată.");
            } else {
                const result = await supportQuestionService.create(payload);
                if (!result.isSuccess) {
                    throw new Error(result.message ?? "Crearea întrebării a eșuat.");
                }

                toast.success("Întrebarea a fost adăugată.");
            }

            await loadQuestions();
            setView("list");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Operația nu a putut fi finalizată.";
            setFieldError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!pendingDelete) return;

        try {
            await supportQuestionService.remove(pendingDelete.id);
            toast.success("Întrebarea a fost ștearsă.");
            setPendingDelete(null);
            await loadQuestions();
        } catch {
            toast.error("Întrebarea nu a putut fi ștearsă.");
        }
    };

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Suport</h2>
                <p>Administrează întrebările afișate pe pagina publică Suport.</p>
            </section>

            <div className="admin-topbar-actions" style={{ justifyContent: "center", marginBottom: 4 }}>
                <button
                    type="button"
                    className={`admin-btn admin-notifications-switch-btn ${view === "list" ? "primary" : "ghost"}`}
                    onClick={() => setView("list")}
                >
                    Lista întrebări
                </button>
                <button
                    type="button"
                    className={`admin-btn admin-notifications-switch-btn ${view === "form" ? "primary" : "ghost"}`}
                    onClick={openCreate}
                >
                    Adaugă întrebare
                </button>
            </div>

            {view === "list" && (
                <section className="admin-panel-card">
                    <div className="admin-card-header">
                        <h3>
                            <i className="fas fa-circle-question admin-card-header-icon"></i> Întrebări de suport
                        </h3>
                        <span className="admin-muted-text">Total: {questions.length}</span>
                    </div>

                    {loading && <p className="admin-muted-text">Se încarcă întrebările...</p>}

                    {loadError && (
                        <div className="admin-api-error" role="alert">
                            <div>
                                <strong>Suportul nu a fost încărcat.</strong>
                                <span>{loadError}</span>
                            </div>
                            <button type="button" className="admin-btn secondary" onClick={() => void loadQuestions()}>
                                Reîncarcă
                            </button>
                        </div>
                    )}

                    {!loading && !loadError && questions.length === 0 ? (
                        <p className="admin-muted-text">Nu există întrebări de suport. Adaugă prima întrebare.</p>
                    ) : null}

                    {!loading && !loadError && questions.length > 0 ? (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Întrebare</th>
                                        <th>Categorie</th>
                                        <th>Ordine</th>
                                        <th>Status</th>
                                        <th>Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedQuestions.map((question) => (
                                        <tr key={question.id}>
                                            <td>
                                                <strong>{question.question}</strong>
                                                <span>{question.answer}</span>
                                            </td>
                                            <td>{getCategoryLabel(question.category)}</td>
                                            <td>{question.sortOrder}</td>
                                            <td>
                                                <span className={`admin-pill ${question.isPublished ? "approved" : "pending"}`}>
                                                    {question.isPublished ? "Publicată" : "Ascunsă"}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                                    <button
                                                        type="button"
                                                        className="admin-btn ghost"
                                                        onClick={() => openEdit(question)}
                                                    >
                                                        <i className="fas fa-pen"></i> Editează
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-btn danger"
                                                        onClick={() => setPendingDelete(question)}
                                                        aria-label="Șterge întrebarea"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
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
                            {editingId ? "Editează întrebarea" : "Întrebare nouă"}
                        </h3>
                    </div>

                    <form className="admin-form-grid" onSubmit={handleSubmit}>
                        <label className="admin-field">
                            <span>Categorie</span>
                            <select
                                value={formData.category}
                                onChange={(event) => updateField("category", event.target.value)}
                            >
                                {CATEGORY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="admin-field">
                            <span>Ordine</span>
                            <input
                                type="number"
                                min="0"
                                value={formData.sortOrder}
                                onChange={(event) => updateField("sortOrder", Number(event.target.value))}
                            />
                        </label>

                        <label className="admin-field admin-field-full">
                            <span>Întrebare</span>
                            <input
                                type="text"
                                value={formData.question}
                                onChange={(event) => updateField("question", event.target.value)}
                                placeholder="Întrebarea afișată pe pagina Suport"
                            />
                        </label>

                        <label className="admin-field admin-field-full">
                            <span>Răspuns</span>
                            <textarea
                                rows={5}
                                value={formData.answer}
                                onChange={(event) => updateField("answer", event.target.value)}
                                placeholder="Răspunsul pentru utilizatori"
                            />
                        </label>

                        <label className="admin-checkbox-field admin-field-full">
                            <input
                                type="checkbox"
                                checked={formData.isPublished}
                                onChange={(event) => updateField("isPublished", event.target.checked)}
                            />
                            <span>Publică întrebarea pe pagina Suport</span>
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
                                {saving ? "Se salvează..." : editingId ? "Salvează modificările" : "Adaugă întrebarea"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Ștergere întrebare</DialogTitle>
                <DialogContent>
                    <p>Ești sigur că vrei să ștergi această întrebare de suport?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPendingDelete(null)}>Renunță</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
                        Șterge
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AdminSupportQuestionsPage;
