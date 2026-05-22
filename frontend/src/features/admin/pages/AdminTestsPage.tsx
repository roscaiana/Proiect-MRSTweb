import React, { useEffect, useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import AdminTestRow from "../components/AdminTestRow";
import TestForm from "../components/TestForm";
import { useAdminPanel } from "../hooks/useAdminPanel";
import type { AdminTest, ExamSettings } from "../types";
import { adminSettingsSchema, type AdminSettingsFormValues } from "../../../schemas/adminSchemas";
import { quizService } from "../../../services/quizService";
import type { QuizInfoDto } from "../../../services/types";

const AdminTestsPage: React.FC = () => {
    const { state, updateSettings } = useAdminPanel();
    const [creating, setCreating] = useState(false);
    const [editingTestId, setEditingTestId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<AdminTest | null>(null);
    const [apiTests, setApiTests] = useState<AdminTest[]>([]);
    const [loadingTests, setLoadingTests] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AdminSettingsFormValues>({
        resolver: zodResolver(adminSettingsSchema),
        defaultValues: {
            testQuestionCount: state.settings.testQuestionCount,
            testDurationMinutes: state.settings.testDurationMinutes,
            passingThreshold: state.settings.passingThreshold,
        },
    });

    useEffect(() => {
        reset({
            testQuestionCount: state.settings.testQuestionCount,
            testDurationMinutes: state.settings.testDurationMinutes,
            passingThreshold: state.settings.passingThreshold,
        });
    }, [reset, state.settings]);

    const mapQuizToAdminTest = (quiz: QuizInfoDto): AdminTest => {
        const now = new Date().toISOString();

        return {
            id: String(quiz.id),
            title: quiz.title,
            description: quiz.description ?? "",
            durationMinutes: state.settings.testDurationMinutes,
            passingScore: state.settings.passingThreshold,
            questions: [],
            createdAt: now,
            updatedAt: now,
        };
    };

    const loadApiTests = async () => {
        setLoadingTests(true);

        try {
            const quizzes = await quizService.getAll();
            setApiTests(quizzes.map(mapQuizToAdminTest));
        } catch {
            setApiTests([]);
            toast.error("Testele nu au putut fi încărcate din API.");
        } finally {
            setLoadingTests(false);
        }
    };

    useEffect(() => {
        void loadApiTests();
    }, []);

    const editingTest = useMemo<AdminTest | undefined>(() => {
        if (!editingTestId) {
            return undefined;
        }

        return apiTests.find((test) => test.id === editingTestId);
    }, [apiTests, editingTestId]);

    const openDeleteDialog = (test: AdminTest) => {
        setPendingDelete(test);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setPendingDelete(null);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;

        await quizService.remove(Number(pendingDelete.id));
        await loadApiTests();

        toast.success("Testul a fost șters.");
        closeDeleteDialog();
    };

    const handleSaveSettings = (data: AdminSettingsFormValues) => {
        const nextSettings: ExamSettings = {
            ...state.settings,
            ...data,
        };
        updateSettings(nextSettings);
        toast.success("Setările testului au fost actualizate.");
    };

    const handleSettingsInvalid = () => {
        toast.error("Valorile introduse sunt invalide.");
    };

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Management teste</h2>
                <p>Administrează testele disponibile și parametrii globali ai evaluării.</p>
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-sliders admin-card-header-icon"></i> Setări test</h3>
                </div>
                <form className="admin-inline-form" onSubmit={handleSubmit(handleSaveSettings, handleSettingsInvalid)} noValidate>
                    <label className="admin-field">
                        <span>Număr întrebări</span>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            {...register("testQuestionCount", { valueAsNumber: true })}
                        />
                        {errors.testQuestionCount?.message && (
                            <span className="admin-field-error" role="alert">{errors.testQuestionCount.message}</span>
                        )}
                    </label>

                    <label className="admin-field">
                        <span>Durata test (minute)</span>
                        <input
                            type="number"
                            min={1}
                            max={180}
                            {...register("testDurationMinutes", { valueAsNumber: true })}
                        />
                        {errors.testDurationMinutes?.message && (
                            <span className="admin-field-error" role="alert">{errors.testDurationMinutes.message}</span>
                        )}
                    </label>

                    <label className="admin-field">
                        <span>Prag promovare (%)</span>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            {...register("passingThreshold", { valueAsNumber: true })}
                        />
                        {errors.passingThreshold?.message && (
                            <span className="admin-field-error" role="alert">{errors.passingThreshold.message}</span>
                        )}
                    </label>

                    <button className="admin-btn primary" type="submit">
                        Salvează setările
                    </button>
                </form>
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-file-alt admin-card-header-icon"></i> Teste disponibile</h3>
                    <button
                        className="admin-btn secondary"
                        type="button"
                        onClick={() => {
                            setCreating((prev) => !prev);
                            setEditingTestId(null);
                        }}
                    >
                        {creating ? "Închide formular" : "Test nou"}
                    </button>
                </div>

                {creating && (
                    <TestForm
                        mode="create"
                        onCancel={() => setCreating(false)}
                        onSubmit={async (payload) => {
                            await quizService.create({
                                title: payload.title,
                                description: payload.description,
                            });
                            await loadApiTests();

                            setCreating(false);
                        }}
                    />
                )}

                {editingTest && (
                    <TestForm
                        mode="edit"
                        initialValue={editingTest}
                        onCancel={() => setEditingTestId(null)}
                        onSubmit={async (payload) => {
                            await quizService.update(Number(editingTest.id), {
                                title: payload.title,
                                description: payload.description,
                            });
                            await loadApiTests();

                            setEditingTestId(null);
                        }}
                    />
                )}

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Titlu</th>
                                <th>Întrebări</th>
                                <th>Durata</th>
                                <th>Prag</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingTests && (
                                <tr>
                                    <td colSpan={5}>Se încarcă testele...</td>
                                </tr>
                            )}
                            {!loadingTests && apiTests.map((test) => (
                                <AdminTestRow
                                    key={test.id}
                                    test={{
                                        ...test,
                                        durationMinutes: state.settings.testDurationMinutes,
                                        passingScore: state.settings.passingThreshold,
                                        questions: new Array(state.settings.testQuestionCount).fill(null).map((_, index) => ({
                                            id: `placeholder-${index + 1}`,
                                            text: "",
                                            options: [],
                                            correctAnswer: 0,
                                        })),
                                    }}
                                    onEdit={(testId) => {
                                        setEditingTestId(testId);
                                        setCreating(false);
                                    }}
                                    onDelete={openDeleteDialog}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Ștergere test</DialogTitle>
                <DialogContent>
                    <p>
                        Sigur vrei să ștergi testul {pendingDelete?.title ? `"${pendingDelete.title}"` : ""}? Această acțiune nu poate fi anulată.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Renunță</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete}>
                        Șterge
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AdminTestsPage;
