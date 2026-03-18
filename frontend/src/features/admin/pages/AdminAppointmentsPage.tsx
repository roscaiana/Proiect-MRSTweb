import React, { useEffect, useMemo, useState } from "react";
import { useAdminPanel } from "../hooks/useAdminPanel";
import type { AppointmentStatus } from "../types";
import { appointmentStatusLabelFeminine } from "../../../utils/appointmentUtils";
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
import { isAllowedDay, formatDateShort } from "../../../utils/dateUtils";
import { notifyUser } from "../../../utils/appEventNotifications";
import AdminAppointmentPendingItem from "../components/AdminAppointmentPendingItem";
import AdminAppointmentHeatmapDay from "../components/AdminAppointmentHeatmapDay";
import AdminCalendarDayConfig from "../components/AdminCalendarDayConfig";
import AdminAppointmentsTable, { type AppointmentSortBy } from "../components/AdminAppointmentsTable";


const formatDateTimeLabel = (value: string): string => {
    return new Date(value).toLocaleString("ro-RO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const AdminAppointmentsPage: React.FC = () => {
    const { state, updateAppointmentStatus, updateAppointment, updateSettings } = useAdminPanel();
    const [statusFilters, setStatusFilters] = useState<AppointmentStatus[]>([]);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [slotFilters, setSlotFilters] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<AppointmentSortBy>("updated_desc");
    const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<string[]>([]);
    const [feedback, setFeedback] = useState("");
    const [csvUrl, setCsvUrl] = useState("");

    const [configDate, setConfigDate] = useState(() => toDateKey(new Date()));
    const [blockDate, setBlockDate] = useState(false);
    const [blockNote, setBlockNote] = useState("");
    const [overrideCapacity, setOverrideCapacity] = useState(false);
    const [capacityValue, setCapacityValue] = useState(0);
    const [overrideSlots, setOverrideSlots] = useState(false);
    const [slotDraftText, setSlotDraftText] = useState("");
    const [locationValue, setLocationValue] = useState(state.settings.appointmentLocation);
    const [roomValue, setRoomValue] = useState(state.settings.appointmentRoom);
    const [allowedWeekdaysDraft, setAllowedWeekdaysDraft] = useState<number[]>(state.settings.allowedWeekdays);

    useEffect(() => {
        setLocationValue(state.settings.appointmentLocation);
        setRoomValue(state.settings.appointmentRoom);
        setAllowedWeekdaysDraft(state.settings.allowedWeekdays);
    }, [state.settings.appointmentLocation, state.settings.appointmentRoom, state.settings.allowedWeekdays]);

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
        return Array.from(all).sort();
    }, [state.appointments]);

    useEffect(() => {
        setSlotFilters((prev) => prev.filter((slot) => slotOptions.includes(slot)));
    }, [slotOptions]);

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
                const matchesStatus =
                    statusFilters.length === 0 ? true : statusFilters.includes(appointment.status);
                const query = search.trim().toLowerCase();
                const matchesSearch =
                    !query ||
                    appointment.fullName.toLowerCase().includes(query) ||
                    appointment.idOrPhone.toLowerCase().includes(query) ||
                    (appointment.userEmail || "").toLowerCase().includes(query) ||
                    (appointment.appointmentCode || "").toLowerCase().includes(query);
                const matchesDate = !dateFilter || toDateKey(appointment.date) === dateFilter;
                const matchesSlot =
                    slotFilters.length === 0 ||
                    slotFilters.includes(`${appointment.slotStart}-${appointment.slotEnd}`);

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
    }, [dateFilter, search, slotFilters, sortBy, state.appointments, statusFilters]);

    const csvContent = useMemo(() => {
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

        return rows
            .map((row) =>
                row
                    .map((cell) => {
                        const text = String(cell ?? "");
                        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
                    })
                    .join(",")
            )
            .join("\n");
    }, [filteredAppointments]);

    useEffect(() => {
        if (!csvContent) {
            setCsvUrl("");
            return;
        }

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        setCsvUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [csvContent]);

    const csvFileName = `admin-programări-${new Date().toISOString().slice(0, 10)}.csv`;

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
            allowedWeekdays: allowedWeekdaysDraft.length > 0 ? allowedWeekdaysDraft : state.settings.allowedWeekdays,
            blockedDates: nextBlockedDates,
            capacityOverrides: nextCapacityOverrides,
            slotOverrides: nextSlotOverrides,
        });

        setFeedback(`Configurația pentru ${configDate} a fost salvată.`);
    };

    const handleExportCsv = () => {
        if (!csvUrl) {
            setFeedback("Export CSV indisponibil în acest context.");
            return;
        }
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
            setFeedback("Selectează cel puțin o programare.");
            return;
        }

        const eligibleAppointments = selectedAppointments.filter((appointment) => {
            if (action === "approve") {
                return appointment.status !== "approved" && appointment.status !== "cancelled";
            }
            return appointment.status !== "cancelled";
        });

        if (eligibleAppointments.length === 0) {
            setFeedback("Nicio programare selectată nu este eligibilă pentru acțiunea aleasă.");
            return;
        }

        const actionLabel =
            action === "approve" ? "aprobarea" : action === "reject" ? "respingerea" : "anularea";
        if (!window.confirm(`Confirmi ${actionLabel} pentru ${eligibleAppointments.length} programări?`)) {
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
            `${eligibleAppointments.length} programări au fost ${action === "approve" ? "aprobate" : action === "reject" ? "respinse" : "anulate"}.`
        );
    };

    const handleApprove = (appointmentId: string) => {
        if (!window.confirm("Confirmi aprobarea acestei programări?")) return;
        const adminNote = window.prompt("Nota admin (optional):", "") || "";
        updateAppointmentStatus(appointmentId, "approved", {
            reason: null,
            adminNote: adminNote.trim() || null,
        });
        setFeedback("Programarea a fost aprobată.");
    };

    const handleReject = (appointmentId: string) => {
        if (!window.confirm("Confirmi respingerea acestei programări?")) return;
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
        if (!window.confirm("Confirmi anularea acestei programări de către admin?")) return;
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
        if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDateValue) || !isAllowedDay(parseDateKey(nextDateValue), state.settings.allowedWeekdays)) {
            setFeedback("Data introdusă nu este validă (zi neeligibilă).");
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
                    <h3><i className="fas fa-clock admin-card-header-icon"></i> Coadă aprobare (pending)</h3>
                    <span className="admin-muted-text">{pendingQueue.length} afișate</span>
                </div>
                {pendingQueue.length === 0 ? (
                    <p className="admin-muted-text">Nu există cereri pending.</p>
                ) : (
                    <div className="admin-simple-list">
                        {pendingQueue.map((appointment) => (
                            <AdminAppointmentPendingItem
                                key={`pending-queue-${appointment.id}`}
                                appointment={appointment}
                                formatDateLabel={formatDateShort}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="admin-panel-card">
                <div className="admin-card-header">
                    <h3><i className="fas fa-chart-bar admin-card-header-icon"></i> Ocupare zile eligibile (preview)</h3>
                </div>
                <div className="admin-appointment-heatmap">
                    {occupancyPreview.map((day) => (
                        <AdminAppointmentHeatmapDay
                            key={day.dateKey}
                            day={day}
                            dateKey={day.dateKey}
                            isActive={configDate === day.dateKey}
                            onSelect={setConfigDate}
                        />
                    ))}
                </div>
            </section>

            <AdminCalendarDayConfig
                configDate={configDate}
                onConfigDateChange={setConfigDate}
                configDayCalendarRows={configDayCalendarRows}
                settings={state.settings}
                blockDate={blockDate}
                blockNote={blockNote}
                overrideCapacity={overrideCapacity}
                capacityValue={capacityValue}
                overrideSlots={overrideSlots}
                slotDraftText={slotDraftText}
                locationValue={locationValue}
                roomValue={roomValue}
                configDayAppointments={configDayAppointments}
                configDayCapacity={configDayCapacity}
                configDaySlots={configDaySlots}
                configDayBlockedEntry={configDayBlockedEntry}
                onBlockDateChange={setBlockDate}
                onBlockNoteChange={setBlockNote}
                onOverrideCapacityChange={setOverrideCapacity}
                onCapacityValueChange={setCapacityValue}
                onOverrideSlotsChange={setOverrideSlots}
                onSlotDraftTextChange={setSlotDraftText}
                onLocationValueChange={setLocationValue}
                onRoomValueChange={setRoomValue}
                allowedWeekdays={allowedWeekdaysDraft}
                onAllowedWeekdaysChange={setAllowedWeekdaysDraft}
                onSave={handleSaveDayConfig}
            />

            <AdminAppointmentsTable
                filteredAppointments={filteredAppointments}
                allFilteredSelected={allFilteredSelected}
                selectedAppointmentIds={selectedAppointmentIds}
                search={search}
                statusFilters={statusFilters}
                dateFilter={dateFilter}
                slotFilters={slotFilters}
                slotOptions={slotOptions}
                sortBy={sortBy}
                csvUrl={csvUrl}
                csvFileName={csvFileName}
                onSearchChange={setSearch}
                onStatusFiltersChange={setStatusFilters}
                onDateFilterChange={setDateFilter}
                onSlotFiltersChange={setSlotFilters}
                onSortChange={setSortBy}
                onToggleSelectAll={toggleSelectAllFiltered}
                onToggleSelection={toggleAppointmentSelection}
                onBulkApprove={() => applyBulkStatusAction("approve")}
                onBulkReject={() => applyBulkStatusAction("reject")}
                onBulkCancel={() => applyBulkStatusAction("cancel")}
                onClearSelection={() => setSelectedAppointmentIds([])}
                onExportCsv={handleExportCsv}
                onApprove={handleApprove}
                onReject={handleReject}
                onReschedule={handleReschedule}
                onCancel={handleCancelByAdmin}
                formatDateLabel={formatDateShort}
                formatDateTimeLabel={formatDateTimeLabel}
                statusLabel={appointmentStatusLabelFeminine}
            />
        </div>
    );
};

export default AdminAppointmentsPage;
