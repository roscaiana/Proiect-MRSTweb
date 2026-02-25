import React, { useEffect, useMemo, useState } from "react";
import TestForm from "../components/TestForm";
import { useAdminPanel } from "../hooks/useAdminPanel";
import type { AdminTest, ExamSettings } from "../types";

const AdminTestsPage: React.FC = () => {
    const { state, createTest, updateTest, deleteTest, updateSettings } = useAdminPanel();
    const [creating, setCreating] = useState(false);
    const [editingTestId, setEditingTestId] = useState<string | null>(null);
    const [settingsDraft, setSettingsDraft] = useState<ExamSettings>(state.settings);
    const [settingsMessage, setSettingsMessage] = useState("");

    useEffect(() => {
        setSettingsDraft(state.settings);
    }, [state.settings]);

    const editingTest = useMemo<AdminTest | undefined>(() => {
        if (!editingTestId) {
            return undefined;
        }

        return state.tests.find((test) => test.id === editingTestId);
    }, [editingTestId, state.tests]);

    const handleDeleteTest = (test: AdminTest) => {
        const confirmed = window.confirm(
            `Sigur vrei să ștergi testul "${test.title}"? Această acțiune nu poate fi anulată.`
        );

        if (!confirmed) {
            return;
        }

        deleteTest(test.id);
    };

    const handleSaveSettings = (event: React.FormEvent) => {
        event.preventDefault();
        if (
            settingsDraft.testDurationMinutes < 1 ||
            settingsDraft.testDurationMinutes > 180 ||
            settingsDraft.passingThreshold < 1 ||
            settingsDraft.passingThreshold > 100 ||
            settingsDraft.appointmentsPerDay < 1 ||
            settingsDraft.appointmentLeadTimeHours < 0 ||
            settingsDraft.appointmentLeadTimeHours > 720 ||
            settingsDraft.maxReschedulesPerUser < 0 ||
            settingsDraft.maxReschedulesPerUser > 20 ||
            settingsDraft.rejectionCooldownDays < 0 ||
            settingsDraft.rejectionCooldownDays > 365
        ) {
            setSettingsMessage("Valorile introduse sunt invalide.");
            return;
        }

        updateSettings(settingsDraft);
        setSettingsMessage("Setările au fost actualizate.");
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
                <form className="admin-inline-form" onSubmit={handleSaveSettings}>
                    <label className="admin-field">
                        <span>Durata test (minute)</span>
                        <input
                            type="number"
                            min={1}
                            max={180}
                            value={settingsDraft.testDurationMinutes}
                            onChange={(event) =>
                                setSettingsDraft((prev) => ({
                                    ...prev,
                                    testDurationMinutes: Number(event.target.value) || 0,
                                }))
                            }
                        />
                    </label>

                    <label className="admin-field">
                        <span>Prag promovare (%)</span>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={settingsDraft.passingThreshold}
                            onChange={(event) =>
                                setSettingsDraft((prev) => ({
                                    ...prev,
                                    passingThreshold: Number(event.target.value) || 0,
                                }))
                            }
                        />
                    </label>

                    <label className="admin-field">
                        <span>Programări/zi</span>
                        <input
                            type="number"
                            min={1}
                            max={500}
                            value={settingsDraft.appointmentsPerDay}
                            onChange={(event) =>
                                setSettingsDraft((prev) => ({
                                    ...prev,
                                    appointmentsPerDay: Number(event.target.value) || 0,
                                }))
                            }
                        />
                    </label>

                    <label className="admin-field">
                        <span>Lead time programare (ore)</span>
                        <input
                            type="number"
                            min={0}
                            max={720}
                            value={settingsDraft.appointmentLeadTimeHours}
                            onChange={(event) =>
                                setSettingsDraft((prev) => ({
                                    ...prev,
                                    appointmentLeadTimeHours: Number(event.target.value) || 0,
                                }))
                            }
                        />
                    </label>

                    <label className="admin-field">
                        <span>Max reprogramări / cerere</span>
                        <input
                            type="number"
                            min={0}
                            max={20}
                            value={settingsDraft.maxReschedulesPerUser}
                            onChange={(event) =>
                                setSettingsDraft((prev) => ({
                                    ...prev,
                                    maxReschedulesPerUser: Number(event.target.value) || 0,
                                }))
                            }
                        />
                    </label>

                    <label className="admin-field">
                        <span>Cooldown după respingere (zile)</span>
                        <input
                            type="number"
                            min={0}
                            max={365}
                            value={settingsDraft.rejectionCooldownDays}
                            onChange={(event) =>
                                setSettingsDraft((prev) => ({
                                    ...prev,
                                    rejectionCooldownDays: Number(event.target.value) || 0,
                                }))
                            }
                        />
                    </label>

                    <label className="admin-field">
                        <span>Locație examen</span>
                        <input
                            type="text"
                            value={settingsDraft.appointmentLocation}
                            onChange={(event) =>
                                setSettingsDraft((prev) => ({
                                    ...prev,
                                    appointmentLocation: event.target.value,
                                }))
                            }
                        />
                    </label>

                    <label className="admin-field">
                        <span>Sală</span>
                        <input
                            type="text"
                            value={settingsDraft.appointmentRoom}
                            onChange={(event) =>
                                setSettingsDraft((prev) => ({
                                    ...prev,
                                    appointmentRoom: event.target.value,
                                }))
                            }
                        />
                    </label>

                    <button className="admin-btn primary" type="submit">
                        Salvează setările
                    </button>
                </form>
                {settingsMessage && <p className="admin-muted-text">{settingsMessage}</p>}
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
                                <tr key={test.id}>
                                    <td>
                                        <strong>{test.title}</strong>
                                        <p>{test.description}</p>
                                    </td>
                                    <td>{test.questions.length}</td>
                                    <td>{test.durationMinutes} min</td>
                                    <td>{test.passingScore}%</td>
                                    <td>
                                        <div className="admin-actions-row">
                                            <button
                                                className="admin-text-btn"
                                                type="button"
                                                onClick={() => {
                                                    setEditingTestId(test.id);
                                                    setCreating(false);
                                                }}
                                            >
                                                Editează
                                            </button>
                                            <button
                                                className="admin-text-btn danger"
                                                type="button"
                                                onClick={() => handleDeleteTest(test)}
                                            >
                                                Șterge
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminTestsPage;
