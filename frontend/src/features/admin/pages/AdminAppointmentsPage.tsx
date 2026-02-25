import React, { useEffect, useMemo, useState } from "react";
import { useAdminPanel } from "../hooks/useAdminPanel";
import type { AppointmentStatus } from "../types";
import { TIME_SLOTS } from "../../../types/appointment";
import {
    buildAvailableSlotsForDate,
    getAppointmentsForDate,
    getBlockedDateEntry,
    getDailyCapacity,
    getNextEligibleDates,
    parseDateKey,
    toDateKey,
} from "../../../utils/appointmentScheduling";
import { isAllowedDay } from "../../../utils/dateUtils";
import { notifyUser } from "../../../utils/appEventNotifications";

const formatDateLabel = (value: string): string => {
    return new Date(value).toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTimeLabel = (value: string): string => {
    return new Date(value).toLocaleString("ro-RO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const statusLabel = (status: AppointmentStatus): string => {
    if (status === "pending") return "În așteptare";
    if (status === "approved") return "Aprobată";
    if (status === "rejected") return "Respinsă";
    return "Anulată";
};

const AdminAppointmentsPage: React.FC = () => {
    const { state, updateAppointmentStatus, updateAppointment, updateSettings } = useAdminPanel();
    const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [slotFilter, setSlotFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"updated_desc" | "exam_asc" | "exam_desc" | "name_asc">("updated_desc");
    const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<string[]>([]);
    const [feedback, setFeedback] = useState("");

    const [configDate, setConfigDate] = useState(() => toDateKey(new Date()));
    const [blockDate, setBlockDate] = useState(false);
    const [blockNote, setBlockNote] = useState("");
    const [overrideCapacity, setOverrideCapacity] = useState(false);
    const [capacityValue, setCapacityValue] = useState(0);
    const [overrideSlots, setOverrideSlots] = useState(false);
    const [slotDraftText, setSlotDraftText] = useState("");
    const [locationValue, setLocationValue] = useState(state.settings.appointmentLocation);
    const [roomValue, setRoomValue] = useState(state.settings.appointmentRoom);

    useEffect(() => {
        setLocationValue(state.settings.appointmentLocation);
        setRoomValue(state.settings.appointmentRoom);
    }, [state.settings.appointmentLocation, state.settings.appointmentRoom]);

    useEffect(() => {
        const blocked = state.settings.blockedDates.find((item) => item.date === configDate);
        const capacityOverride = state.settings.capacityOverrides.find((item) => item.date === configDate);
        const slotOverride = state.settings.slotOverrides.find((item) => item.date === configDate);
        setBlockDate(Boolean(blocked));
        setBlockNote(blocked?.note || "");
        setOverrideCapacity(Boolean(capacityOverride));
        setCapacityValue(capacityOverride?.appointmentsPerDay || state.settings.appointmentsPerDay);
        setOverrideSlots(Boolean(slotOverride && slotOverride.slots.length > 0));
        setSlotDraftText(
            slotOverride?.slots
                .map((slot) => `${slot.startTime}-${slot.endTime}`)
                .join("\n") || ""
        );
    }, [configDate, state.settings]);

    useEffect(() => {
        if (!feedback) return;
        const timer = window.setTimeout(() => setFeedback(""), 3500);
        return () => window.clearTimeout(timer);
    }, [feedback]);

    const slotOptions = useMemo(() => {
        const all = new Set<string>(TIME_SLOTS.map((slot) => `${slot.startTime}-${slot.endTime}`));
        state.appointments.forEach((appointment) => all.add(`${appointment.slotStart}-${appointment.slotEnd}`));
        return ["all", ...Array.from(all).sort()];
    }, [state.appointments]);

    const occupancyPreview = useMemo(
        () => getNextEligibleDates(state.settings, state.appointments, { count: 16 }),
        [state.settings, state.appointments]
    );

    const configDayBlockedEntry = useMemo(
        () => getBlockedDateEntry(state.settings, configDate),
        [configDate, state.settings]
    );

    const configDayCapacity = useMemo(
        () => getDailyCapacity(state.settings, configDate),
        [configDate, state.settings]
    );

    const configDayAppointments = useMemo(
        () => getAppointmentsForDate(state.appointments, configDate, { activeOnly: true }),
        [configDate, state.appointments]
    );

    const configDaySlots = useMemo(
        () => buildAvailableSlotsForDate(state.settings, state.appointments, configDate),
        [configDate, state.appointments, state.settings]
    );

    const pendingQueue = useMemo(
        () =>
            state.appointments
                .filter((appointment) => appointment.status === "pending")
                .sort((a, b) => {
                    const examDateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                    if (examDateCompare !== 0) return examDateCompare;
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                })
                .slice(0, 8),
        [state.appointments]
    );

    const configDayCalendarRows = useMemo(() => {
        const activeBySlot = new Map(
            configDayAppointments.map((appointment) => [`${appointment.slotStart}-${appointment.slotEnd}`, appointment])
        );

        return configDaySlots.map((slot) => {
            const key = `${slot.startTime}-${slot.endTime}`;
            const occupiedAppointment = activeBySlot.get(key);
            return {
                key,
                slot,
                occupiedAppointment,
            };
        });
    }, [configDayAppointments, configDaySlots]);

    const filteredAppointments = useMemo(() => {
        return [...state.appointments]
            .filter((appointment) => {
                const matchesStatus = statusFilter === "all" ? true : appointment.status === statusFilter;
                const query = search.trim().toLowerCase();
                const matchesSearch =
                    !query ||
                    appointment.fullName.toLowerCase().includes(query) ||
                    appointment.idOrPhone.toLowerCase().includes(query) ||
                    (appointment.userEmail || "").toLowerCase().includes(query) ||
                    (appointment.appointmentCode || "").toLowerCase().includes(query);
                const matchesDate = !dateFilter || toDateKey(appointment.date) === dateFilter;
                const matchesSlot =
                    slotFilter === "all" || `${appointment.slotStart}-${appointment.slotEnd}` === slotFilter;

                return matchesStatus && matchesSearch && matchesDate && matchesSlot;
            })
            .sort((a, b) => {
                if (sortBy === "exam_asc") {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                }

                if (sortBy === "exam_desc") {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                }

                if (sortBy === "name_asc") {
                    return a.fullName.localeCompare(b.fullName, "ro");
                }

                const aTime = new Date(a.updatedAt || a.createdAt).getTime();
                const bTime = new Date(b.updatedAt || b.createdAt).getTime();
                return bTime - aTime;
            });
    }, [dateFilter, search, slotFilter, sortBy, state.appointments, statusFilter]);

    useEffect(() => {
        const availableIds = new Set(filteredAppointments.map((appointment) => appointment.id));
        setSelectedAppointmentIds((prev) => prev.filter((id) => availableIds.has(id)));
    }, [filteredAppointments]);

    const selectedAppointments = useMemo(
        () => filteredAppointments.filter((appointment) => selectedAppointmentIds.includes(appointment.id)),
        [filteredAppointments, selectedAppointmentIds]
    );

    const allFilteredSelected =
        filteredAppointments.length > 0 &&
        filteredAppointments.every((appointment) => selectedAppointmentIds.includes(appointment.id));

    const handleSaveDayConfig = () => {
        if (!configDate) {
            setFeedback("Selectează o dată pentru configurare.");
            return;
        }

        const nextBlockedDates = blockDate
            ? [
                  ...state.settings.blockedDates.filter((item) => item.date !== configDate),
                  { date: configDate, note: blockNote.trim() || undefined },
              ].sort((a, b) => a.date.localeCompare(b.date))
            : state.settings.blockedDates.filter((item) => item.date !== configDate);

        const nextCapacityOverrides = overrideCapacity
            ? [
                  ...state.settings.capacityOverrides.filter((item) => item.date !== configDate),
                  { date: configDate, appointmentsPerDay: Math.max(1, Number(capacityValue) || 1) },
              ].sort((a, b) => a.date.localeCompare(b.date))
            : state.settings.capacityOverrides.filter((item) => item.date !== configDate);

        const nextSlotOverrides = (() => {
            if (!overrideSlots) {
                return state.settings.slotOverrides.filter((item) => item.date !== configDate);
            }

            const parsedLines = slotDraftText
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean);

            if (parsedLines.length === 0) {
                setFeedback("Adaugă cel puțin un slot valid sau dezactivează override sloturi.");
                return null;
            }

            const slots = parsedLines.map((line, index) => {
                const match = line.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
                if (!match) return null;
                const startTime = match[1];
                const endTime = match[2];
                if (startTime >= endTime) return null;
                return {
                    id: `slot-${configDate}-${index + 1}`,
                    startTime,
                    endTime,
                    available: true,
                };
            });

            if (slots.some((slot) => !slot)) {
                setFeedback("Format slot invalid. Folosește linii de forma HH:MM-HH:MM.");
                return null;
            }

            const deduped = Array.from(
                new Map(
                    (slots as Array<{ id: string; startTime: string; endTime: string; available: boolean }>).map((slot) => [
                        `${slot.startTime}-${slot.endTime}`,
                        slot,
                    ])
                ).values()
            ).sort((a, b) => `${a.startTime}-${a.endTime}`.localeCompare(`${b.startTime}-${b.endTime}`));

            return [
                ...state.settings.slotOverrides.filter((item) => item.date !== configDate),
                { date: configDate, slots: deduped },
            ].sort((a, b) => a.date.localeCompare(b.date));
        })();

        if (nextSlotOverrides === null) {
            return;
        }

        updateSettings({
            ...state.settings,
            appointmentLocation: locationValue.trim() || state.settings.appointmentLocation,
            appointmentRoom: roomValue.trim() || state.settings.appointmentRoom,
            blockedDates: nextBlockedDates,
            capacityOverrides: nextCapacityOverrides,
            slotOverrides: nextSlotOverrides,
        });

        setFeedback(`Configurația pentru ${configDate} a fost salvată.`);
    };

    const handleExportCsv = () => {
        const rows = [
            ["Cod", "Nume", "Email", "Telefon", "Data", "Interval", "Status", "Motiv", "Nota admin"],
            ...filteredAppointments.map((appointment) => [
                appointment.appointmentCode || "",
                appointment.fullName,
                appointment.userEmail || "",
                appointment.idOrPhone,
                toDateKey(appointment.date),
                `${appointment.slotStart}-${appointment.slotEnd}`,
                appointment.status,
                appointment.statusReason || "",
                appointment.adminNote || "",
            ]),
        ];

        const csv = rows
            .map((row) =>
                row
                    .map((cell) => {
                        const text = String(cell ?? "");
                        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
                    })
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `admin-programări-${new Date().toISOString().slice(0, 10)}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
        setFeedback("Export CSV generat.");
    };

    const toggleSelectAllFiltered = () => {
        if (allFilteredSelected) {
            setSelectedAppointmentIds([]);
            return;
        }

        setSelectedAppointmentIds(filteredAppointments.map((appointment) => appointment.id));
    };

    const toggleAppointmentSelection = (appointmentId: string) => {
        setSelectedAppointmentIds((prev) =>
            prev.includes(appointmentId) ? prev.filter((id) => id !== appointmentId) : [...prev, appointmentId]
        );
    };

    const applyBulkStatusAction = (action: "approve" | "reject" | "cancel") => {
        if (selectedAppointments.length === 0) {
            setFeedback("Selecteaza cel putin o programare.");
            return;
        }

        const eligibleAppointments = selectedAppointments.filter((appointment) => {
            if (action === "approve") {
                return appointment.status !== "approved" && appointment.status !== "cancelled";
            }
            return appointment.status !== "cancelled";
        });

        if (eligibleAppointments.length === 0) {
            setFeedback("Nicio programare selectata nu este eligibila pentru actiunea aleasa.");
            return;
        }

        const actionLabel =
            action === "approve" ? "aprobarea" : action === "reject" ? "respingerea" : "anularea";
        if (!window.confirm(`Confirmi ${actionLabel} pentru ${eligibleAppointments.length} programari?`)) {
            return;
        }

        let reason: string | null = null;
        let adminNote: string | null = null;

        if (action === "reject") {
            reason = (window.prompt("Motivul respingerii (vizibil utilizatorului):", "") || "").trim() || null;
            if (!reason) {
                setFeedback("Respingerea bulk necesita un motiv.");
                return;
            }
            adminNote = (window.prompt("Nota interna admin (optional):", "") || "").trim() || null;
        }

        if (action === "cancel") {
            reason = (window.prompt("Motiv anulare (vizibil utilizatorului, optional):", "") || "").trim() || null;
        }

        if (action === "approve") {
            adminNote = (window.prompt("Nota admin (optional, aplicata tuturor):", "") || "").trim() || null;
        }

        eligibleAppointments.forEach((appointment) => {
            if (action === "approve") {
                updateAppointmentStatus(appointment.id, "approved", { reason: null, adminNote });
                return;
            }

            if (action === "reject") {
                updateAppointmentStatus(appointment.id, "rejected", { reason, adminNote });
                return;
            }

            updateAppointmentStatus(appointment.id, "cancelled", { reason, cancelledBy: "admin" });
        });

        setSelectedAppointmentIds([]);
        setFeedback(
            `${eligibleAppointments.length} programari au fost ${action === "approve" ? "aprobate" : action === "reject" ? "respinse" : "anulate"}.`
        );
    };

    const handleApprove = (appointmentId: string) => {
        if (!window.confirm("Confirmi aprobarea acestei programari?")) return;
        const adminNote = window.prompt("Nota admin (optional):", "") || "";
        updateAppointmentStatus(appointmentId, "approved", {
            reason: null,
            adminNote: adminNote.trim() || null,
        });
        setFeedback("Programarea a fost aprobată.");
    };

    const handleReject = (appointmentId: string) => {
        if (!window.confirm("Confirmi respingerea acestei programari?")) return;
        const reason = window.prompt("Motivul respingerii (vizibil utilizatorului):", "");
        if (!reason || !reason.trim()) {
            setFeedback("Respingerea necesită un motiv.");
            return;
        }

        const adminNote = window.prompt("Nota interna admin (optional):", "") || "";
        updateAppointmentStatus(appointmentId, "rejected", {
            reason: reason.trim(),
            adminNote: adminNote.trim() || null,
        });
        setFeedback("Programarea a fost respinsă.");
    };

    const handleCancelByAdmin = (appointmentId: string) => {
        if (!window.confirm("Confirmi anularea acestei programari de catre admin?")) return;
        const reason = window.prompt("Motiv anulare (vizibil utilizatorului):", "") || "";
        updateAppointmentStatus(appointmentId, "cancelled", {
            reason: reason.trim() || null,
            cancelledBy: "admin",
        });
        setFeedback("Programarea a fost anulată de admin.");
    };

    const handleReschedule = (appointmentId: string) => {
        const appointment = state.appointments.find((item) => item.id === appointmentId);
        if (!appointment) return;
        if (!window.confirm("Confirmi reprogramarea acestei cereri?")) return;

        const nextDateValue = window.prompt("Data nouă (YYYY-MM-DD):", toDateKey(appointment.date)) || "";
        if (!nextDateValue) return;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDateValue) || !isAllowedDay(parseDateKey(nextDateValue))) {
            setFeedback("Data introdusă nu este validă (Luni/Miercuri/Vineri).");
            return;
        }
        if (getBlockedDateEntry(state.settings, nextDateValue)) {
            setFeedback("Ziua selectată este blocată.");
            return;
        }

        const slotOptionsForDay = buildAvailableSlotsForDate(state.settings, state.appointments, nextDateValue, {
            excludeAppointmentId: appointmentId,
        });
        const suggested = slotOptionsForDay.find((slot) => slot.available);

        const availableIntervals = slotOptionsForDay
            .filter((slot) => slot.available)
            .map((slot) => `${slot.startTime}-${slot.endTime}`)
            .join(", ");

        const nextIntervalValue =
            window.prompt(
                `Interval nou (HH:MM-HH:MM). Intervale disponibile: ${availableIntervals || "niciunul"}`,
                suggested ? `${suggested.startTime}-${suggested.endTime}` : ""
            ) || "";

        if (!nextIntervalValue) return;

        const [slotStart, slotEnd] = nextIntervalValue.split("-");
        const validSlot = slotOptionsForDay.find(
            (slot) => slot.startTime === slotStart && slot.endTime === slotEnd && slot.available
        );
        if (!validSlot) {
            setFeedback("Intervalul introdus nu este disponibil.");
            return;
        }

        updateAppointment(appointmentId, {
            date: new Date(`${nextDateValue}T00:00:00`).toISOString(),
            slotStart: validSlot.startTime,
            slotEnd: validSlot.endTime,
            rescheduleCount: (appointment.rescheduleCount || 0) + 1,
            previousAppointmentId: appointment.previousAppointmentId || appointment.id,
            status: appointment.status === "rejected" || appointment.status === "cancelled" ? "pending" : appointment.status,
            statusReason: undefined,
            updatedAt: new Date().toISOString(),
        });

        notifyUser(appointment.userEmail, {
            title: "Programare reprogramată",
            message: `Programarea ${appointment.appointmentCode || ""} a fost mutată la ${nextDateValue}, ${validSlot.startTime}-${validSlot.endTime}.`,
            link: "/dashboard",
            tag: `admin-reschedule-${appointmentId}-${nextDateValue}-${validSlot.id}`,
        });

        setFeedback("Programarea a fost reprogramată.");
    };

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Programări examen</h2>
                <p>Revizuiește cererile, gestionează ocuparea zilelor și aplică reguli per zi.</p>
            </section>

            {feedback && (
                <div className="admin-feedback-banner" role="status">
                    {feedback}
                </div>
            )}

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-clock admin-card-header-icon"></i> Coada aprobare (pending)</h3>
                    <span className="admin-muted-text">{pendingQueue.length} afisate</span>
                </div>
                {pendingQueue.length === 0 ? (
                    <p className="admin-muted-text">Nu exista cereri pending.</p>
                ) : (
                    <div className="admin-simple-list">
                        {pendingQueue.map((appointment) => (
                            <div className="admin-simple-item" key={`pending-queue-${appointment.id}`}>
                                <div>
                                    <strong>{appointment.fullName}</strong>
                                    <p>
                                        {formatDateLabel(appointment.date)} · {appointment.slotStart}-{appointment.slotEnd}
                                    </p>
                                    <p>{appointment.appointmentCode || "Fara cod"}</p>
                                </div>
                                <div className="admin-actions-row admin-actions-row-wrap">
                                    <button className="admin-text-btn" type="button" onClick={() => handleApprove(appointment.id)}>
                                        Aproba
                                    </button>
                                    <button className="admin-text-btn danger" type="button" onClick={() => handleReject(appointment.id)}>
                                        Respinge
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-table-cells admin-card-header-icon"></i> Calendar zi (sloturi)</h3>
                    <span className="admin-muted-text">{configDate}</span>
                </div>
                {configDayCalendarRows.length === 0 ? (
                    <p className="admin-muted-text">Nu exista sloturi configurate pentru ziua selectata.</p>
                ) : (
                    <div className="admin-day-calendar-list">
                        {configDayCalendarRows.map(({ key, slot, occupiedAppointment }) => (
                            <div key={key} className={`admin-day-calendar-item ${occupiedAppointment ? "occupied" : "free"}`}>
                                <div className="admin-day-calendar-slot">
                                    <strong>{slot.startTime} - {slot.endTime}</strong>
                                    <span>{occupiedAppointment ? "ocupat" : "liber"}</span>
                                </div>
                                <div className="admin-day-calendar-content">
                                    {occupiedAppointment ? (
                                        <>
                                            <strong>{occupiedAppointment.fullName}</strong>
                                            <p>{occupiedAppointment.userEmail || occupiedAppointment.idOrPhone}</p>
                                            <p>
                                                {occupiedAppointment.appointmentCode || "Fara cod"} · {statusLabel(occupiedAppointment.status)}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="admin-muted-text">Slot disponibil</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-chart-bar admin-card-header-icon"></i> Ocupare zile eligibile (preview)</h3>
                </div>
                <div className="admin-appointment-heatmap">
                    {occupancyPreview.map((day) => {
                        const ratio = day.capacity > 0 ? day.occupied / day.capacity : 0;
                        const levelClass = day.blocked
                            ? "blocked"
                            : day.remaining === 0
                              ? "full"
                              : ratio >= 0.8
                                ? "high"
                                : ratio > 0
                                  ? "medium"
                                  : "low";

                        return (
                            <button
                                key={day.dateKey}
                                type="button"
                                className={`admin-appointment-heatmap-day ${levelClass} ${configDate === day.dateKey ? "active" : ""}`}
                                onClick={() => setConfigDate(day.dateKey)}
                                title={
                                    day.blocked
                                        ? `Blocată${day.blockedNote ? `: ${day.blockedNote}` : ""}`
                                        : `${day.occupied}/${day.capacity} ocupate`
                                }
                            >
                                <strong>
                                    {new Date(day.date).toLocaleDateString("ro-RO", {
                                        day: "2-digit",
                                        month: "2-digit",
                                    })}
                                </strong>
                                <span>{day.blocked ? "blocată" : `${day.remaining} lib.`}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-gear admin-card-header-icon"></i> Configurare zi / reguli programare</h3>
                    <button className="admin-btn secondary" type="button" onClick={handleSaveDayConfig}>
                        Salvează
                    </button>
                </div>

                <div className="admin-form-grid admin-appointments-config-grid">
                    <label className="admin-field">
                        <span>Data configurare</span>
                        <input type="date" value={configDate} onChange={(event) => setConfigDate(event.target.value)} />
                    </label>

                    <label className="admin-field">
                        <span>Locație examen</span>
                        <input
                            type="text"
                            value={locationValue}
                            onChange={(event) => setLocationValue(event.target.value)}
                        />
                    </label>

                    <label className="admin-field">
                        <span>Sală</span>
                        <input type="text" value={roomValue} onChange={(event) => setRoomValue(event.target.value)} />
                    </label>

                    <label className="admin-field">
                        <span>Override capacitate zi</span>
                        <div className="admin-inline-checkbox">
                            <input
                                type="checkbox"
                                checked={overrideCapacity}
                                onChange={(event) => setOverrideCapacity(event.target.checked)}
                            />
                            <span>Activ</span>
                        </div>
                        <input
                            type="number"
                            min={1}
                            value={capacityValue}
                            disabled={!overrideCapacity}
                            onChange={(event) => setCapacityValue(Number(event.target.value) || 1)}
                        />
                        <small className="admin-field-hint">Default: {state.settings.appointmentsPerDay}</small>
                    </label>

                    <label className="admin-field admin-field-full">
                        <span>Zi blocată</span>
                        <div className="admin-inline-checkbox">
                            <input
                                type="checkbox"
                                checked={blockDate}
                                onChange={(event) => setBlockDate(event.target.checked)}
                            />
                            <span>Blocare zi {configDate}</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Motiv (optional)"
                            value={blockNote}
                            disabled={!blockDate}
                            onChange={(event) => setBlockNote(event.target.value)}
                        />
                    </label>

                    <label className="admin-field admin-field-full">
                        <span>Override sloturi pentru zi</span>
                        <div className="admin-inline-checkbox">
                            <input
                                type="checkbox"
                                checked={overrideSlots}
                                onChange={(event) => setOverrideSlots(event.target.checked)}
                            />
                            <span>Folosește sloturi custom pentru {configDate}</span>
                        </div>
                        <textarea
                            rows={5}
                            disabled={!overrideSlots}
                            value={slotDraftText}
                            onChange={(event) => setSlotDraftText(event.target.value)}
                            placeholder={"08:00-08:30\n09:00-09:30\n14:00-14:30"}
                        />
                        <small className="admin-field-hint">
                            Câte un slot pe linie, format HH:MM-HH:MM. Dacă este dezactivat, se folosesc sloturile implicite.
                        </small>
                    </label>
                </div>

                <div className="admin-appointments-day-summary">
                    <div className="admin-summary-chip">
                        <span>Data</span>
                        <strong>{configDate}</strong>
                    </div>
                    <div className="admin-summary-chip">
                        <span>Zi</span>
                        <strong>
                            {parseDateKey(configDate).toLocaleDateString("ro-RO", { weekday: "long" })}
                        </strong>
                    </div>
                    <div className="admin-summary-chip">
                        <span>Ocupare</span>
                        <strong>
                            {configDayAppointments.length}/{configDayCapacity}
                        </strong>
                    </div>
                    <div className="admin-summary-chip">
                        <span>Sloturi libere</span>
                        <strong>
                            {configDaySlots.filter((slot) => slot.available).length}/{configDaySlots.length}
                        </strong>
                    </div>
                    <div className={`admin-summary-chip ${configDayBlockedEntry ? "danger" : ""}`}>
                        <span>Status zi</span>
                        <strong>{configDayBlockedEntry ? "Blocată" : "Activă"}</strong>
                    </div>
                </div>
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-list admin-card-header-icon"></i> Programări</h3>
                    <button className="admin-btn secondary" type="button" onClick={handleExportCsv}>
                        Export CSV
                    </button>
                </div>

                <div className="admin-toolbar admin-toolbar-appointments">
                    <label className="admin-field">
                        <span>Caută candidat</span>
                        <input
                            type="text"
                            placeholder="Nume, email, telefon sau cod"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </label>

                    <label className="admin-field">
                        <span>Status</span>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value as "all" | AppointmentStatus)}
                        >
                            <option value="all">Toate</option>
                            <option value="pending">În așteptare</option>
                            <option value="approved">Aprobate</option>
                            <option value="rejected">Respinse</option>
                            <option value="cancelled">Anulate</option>
                        </select>
                    </label>

                    <label className="admin-field">
                        <span>Data</span>
                        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
                    </label>

                    <label className="admin-field">
                        <span>Interval</span>
                        <select value={slotFilter} onChange={(event) => setSlotFilter(event.target.value)}>
                            {slotOptions.map((value) => (
                                <option key={value} value={value}>
                                    {value === "all" ? "Toate intervalele" : value}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="admin-field">
                        <span>Sortare</span>
                        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                            <option value="updated_desc">Actualizate recent</option>
                            <option value="exam_asc">Data examen (crescator)</option>
                            <option value="exam_desc">Data examen (descrescator)</option>
                            <option value="name_asc">Nume candidat (A-Z)</option>
                        </select>
                    </label>
                </div>

                <div className="admin-appointments-stats">
                    <div className="admin-summary-chip">
                        <span>Total rezultate</span>
                        <strong>{filteredAppointments.length}</strong>
                    </div>
                    <div className="admin-summary-chip">
                        <span>În așteptare</span>
                        <strong>{filteredAppointments.filter((item) => item.status === "pending").length}</strong>
                    </div>
                    <div className="admin-summary-chip">
                        <span>Aprobate</span>
                        <strong>{filteredAppointments.filter((item) => item.status === "approved").length}</strong>
                    </div>
                    <div className="admin-summary-chip">
                        <span>Respinse/Anulate</span>
                        <strong>
                            {
                                filteredAppointments.filter(
                                    (item) => item.status === "rejected" || item.status === "cancelled"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className="admin-bulk-toolbar">
                    <div className="admin-bulk-toolbar-left">
                        <label className="admin-bulk-select-toggle">
                            <input
                                type="checkbox"
                                checked={allFilteredSelected}
                                onChange={toggleSelectAllFiltered}
                                disabled={filteredAppointments.length === 0}
                            />
                            <span>Selecteaza toate rezultatele filtrate</span>
                        </label>
                        <span className="admin-muted-text">{selectedAppointmentIds.length} selectate</span>
                    </div>
                    <div className="admin-bulk-toolbar-actions">
                        <button
                            type="button"
                            className="admin-btn secondary"
                            onClick={() => applyBulkStatusAction("approve")}
                            disabled={selectedAppointmentIds.length === 0}
                        >
                            Aproba selectate
                        </button>
                        <button
                            type="button"
                            className="admin-btn ghost"
                            onClick={() => applyBulkStatusAction("reject")}
                            disabled={selectedAppointmentIds.length === 0}
                        >
                            Respinge selectate
                        </button>
                        <button
                            type="button"
                            className="admin-btn ghost"
                            onClick={() => applyBulkStatusAction("cancel")}
                            disabled={selectedAppointmentIds.length === 0}
                        >
                            Anuleaza selectate
                        </button>
                        <button
                            type="button"
                            className="admin-btn ghost"
                            onClick={() => setSelectedAppointmentIds([])}
                            disabled={selectedAppointmentIds.length === 0}
                        >
                            Goleste selectie
                        </button>
                    </div>
                </div>

                {filteredAppointments.length === 0 ? (
                    <p className="admin-muted-text">Nu există programări pentru filtrul selectat.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="admin-table-checkbox-col">
                                        <input
                                            type="checkbox"
                                            checked={allFilteredSelected}
                                            onChange={toggleSelectAllFiltered}
                                            aria-label="Selecteaza toate programarile filtrate"
                                        />
                                    </th>
                                    <th>Candidat</th>
                                    <th>Cod / Meta</th>
                                    <th>Data examen</th>
                                    <th>Interval</th>
                                    <th>Status</th>
                                    <th>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td className="admin-table-checkbox-col">
                                            <input
                                                type="checkbox"
                                                checked={selectedAppointmentIds.includes(appointment.id)}
                                                onChange={() => toggleAppointmentSelection(appointment.id)}
                                                aria-label={`Selecteaza programarea ${appointment.fullName}`}
                                            />
                                        </td>
                                        <td>
                                            <strong>{appointment.fullName}</strong>
                                            <p>{appointment.userEmail || appointment.idOrPhone}</p>
                                            {appointment.userEmail && <p>{appointment.idOrPhone}</p>}
                                            <p>Creat: {formatDateTimeLabel(appointment.createdAt)}</p>
                                        </td>

                                        <td className="admin-appointment-meta-cell">
                                            <p>
                                                <strong>{appointment.appointmentCode || "Fără cod"}</strong>
                                            </p>
                                            <p>Actualizat: {formatDateTimeLabel(appointment.updatedAt || appointment.createdAt)}</p>
                                            {typeof appointment.rescheduleCount === "number" && (
                                                <p>Reprogramări: {appointment.rescheduleCount}</p>
                                            )}
                                            {appointment.cancelledBy && <p>Anulată de: {appointment.cancelledBy}</p>}
                                        </td>

                                        <td>{formatDateLabel(appointment.date)}</td>

                                        <td>
                                            {appointment.slotStart} - {appointment.slotEnd}
                                        </td>

                                        <td>
                                            <span className={`admin-pill ${appointment.status}`}>
                                                {statusLabel(appointment.status)}
                                            </span>
                                            {appointment.statusReason && (
                                                <p className="admin-appointment-status-note">
                                                    Motiv: {appointment.statusReason}
                                                </p>
                                            )}
                                            {appointment.adminNote && (
                                                <p className="admin-appointment-status-note">
                                                    Nota admin: {appointment.adminNote}
                                                </p>
                                            )}
                                        </td>

                                        <td>
                                            <div className="admin-actions-row admin-actions-row-wrap">
                                                <button
                                                    className="admin-text-btn"
                                                    type="button"
                                                    onClick={() => handleApprove(appointment.id)}
                                                    disabled={
                                                        appointment.status === "approved" || appointment.status === "cancelled"
                                                    }
                                                >
                                                    Aprobă
                                                </button>
                                                <button
                                                    className="admin-text-btn danger"
                                                    type="button"
                                                    onClick={() => handleReject(appointment.id)}
                                                    disabled={appointment.status === "cancelled"}
                                                >
                                                    Respinge
                                                </button>
                                                <button
                                                    className="admin-text-btn"
                                                    type="button"
                                                    onClick={() => handleReschedule(appointment.id)}
                                                    disabled={appointment.status === "cancelled"}
                                                >
                                                    Reprogramează
                                                </button>
                                                <button
                                                    className="admin-text-btn danger"
                                                    type="button"
                                                    onClick={() => handleCancelByAdmin(appointment.id)}
                                                    disabled={appointment.status === "cancelled"}
                                                >
                                                    Anulează
                                                </button>
                                            </div>
                                        </td>
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

export default AdminAppointmentsPage;
