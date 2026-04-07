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

const AdminTestsPage: React.FC = () => {
    const { state, createTest, updateTest, deleteTest, updateSettings } = useAdminPanel();
    const [creating, setCreating] = useState(false);
    const [editingTestId, setEditingTestId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<AdminTest | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AdminSettingsFormValues>({
        resolver: zodResolver(adminSettingsSchema),
        defaultValues: {
            testDurationMinutes: state.settings.testDurationMinutes,
            passingThreshold: state.settings.passingThreshold,
            appointmentsPerDay: state.settings.appointmentsPerDay,
            appointmentLeadTimeHours: state.settings.appointmentLeadTimeHours,
            maxReschedulesPerUser: state.settings.maxReschedulesPerUser,
            rejectionCooldownDays: state.settings.rejectionCooldownDays,
            appointmentLocation: state.settings.appointmentLocation,
            appointmentRoom: state.settings.appointmentRoom,
        },
    });

    useEffect(() => {
        reset({
            testDurationMinutes: state.settings.testDurationMinutes,
            passingThreshold: state.settings.passingThreshold,
            appointmentsPerDay: state.settings.appointmentsPerDay,
            appointmentLeadTimeHours: state.settings.appointmentLeadTimeHours,
            maxReschedulesPerUser: state.settings.maxReschedulesPerUser,
            rejectionCooldownDays: state.settings.rejectionCooldownDays,
            appointmentLocation: state.settings.appointmentLocation,
            appointmentRoom: state.settings.appointmentRoom,
        });
    }, [reset, state.settings]);

    const editingTest = useMemo<AdminTest | undefined>(() => {
        if (!editingTestId) {
            return undefined;
        }

        return state.tests.find((test) => test.id === editingTestId);
    }, [editingTestId, state.tests]);

    const openDeleteDialog = (test: AdminTest) => {
        setPendingDelete(test);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setPendingDelete(null);
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        deleteTest(pendingDelete.id);
        toast.success("Testul a fost șters.");
        closeDeleteDialog();
    };

    const handleSaveSettings = (data: AdminSettingsFormValues) => {
        const nextSettings: ExamSettings = {
            ...state.settings,
            ...data,
        };
        updateSettings(nextSettings);
        toast.success("Setările au fost actualizate.");
    };

    const handleSettingsInvalid = () => {
        toast.error("Valorile introduse sunt invalide.");
    };

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Management teste</h2>
                <p>Creează, editează și șterge teste. Ajustează parametrii globali ai examenului.</p>
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-sliders admin-card-header-icon"></i> Setări globale examen</h3>
                </div>
                <form className="admin-inline-form" onSubmit={handleSubmit(handleSaveSettings, handleSettingsInvalid)} noValidate>
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

                    <label className="admin-field">
                        <span>Programări/zi</span>
                        <input
                            type="number"
                            min={1}
                            max={500}
                            {...register("appointmentsPerDay", { valueAsNumber: true })}
                        />
                        {errors.appointmentsPerDay?.message && (
                            <span className="admin-field-error" role="alert">{errors.appointmentsPerDay.message}</span>
                        )}
                    </label>

                    <label className="admin-field">
                        <span>Lead time programare (ore)</span>
                        <input
                            type="number"
                            min={0}
                            max={720}
                            {...register("appointmentLeadTimeHours", { valueAsNumber: true })}
                        />
                        {errors.appointmentLeadTimeHours?.message && (
                            <span className="admin-field-error" role="alert">{errors.appointmentLeadTimeHours.message}</span>
                        )}
                    </label>

                    <label className="admin-field">
                        <span>Max reprogramări / cerere</span>
                        <input
                            type="number"
                            min={0}
                            max={20}
                            {...register("maxReschedulesPerUser", { valueAsNumber: true })}
                        />
                        {errors.maxReschedulesPerUser?.message && (
                            <span className="admin-field-error" role="alert">{errors.maxReschedulesPerUser.message}</span>
                        )}
                    </label>

                    <label className="admin-field">
                        <span>Cooldown după respingere (zile)</span>
                        <input
                            type="number"
                            min={0}
                            max={365}
                            {...register("rejectionCooldownDays", { valueAsNumber: true })}
                        />
                        {errors.rejectionCooldownDays?.message && (
                            <span className="admin-field-error" role="alert">{errors.rejectionCooldownDays.message}</span>
                        )}
                    </label>

                    <label className="admin-field">
                        <span>Locație examen</span>
                        <input
                            type="text"
                            {...register("appointmentLocation")}
                        />
                    </label>

                    <label className="admin-field">
                        <span>Sală</span>
                        <input
                            type="text"
                            {...register("appointmentRoom")}
                        />
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
                        onSubmit={(payload) => {
                            createTest(payload);
                            setCreating(false);
                        }}
                    />
                )}

                {editingTest && (
                    <TestForm
                        mode="edit"
                        initialValue={editingTest}
                        onCancel={() => setEditingTestId(null)}
                        onSubmit={(payload) => {
                            updateTest(editingTest.id, payload);
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
                            {state.tests.map((test) => (
                                <AdminTestRow
                                    key={test.id}
                                    test={test}
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
