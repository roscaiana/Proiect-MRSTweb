import React, { useMemo } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { useAdminPanel } from "../hooks/useAdminPanel";
import { appointmentStatusLabelFeminine } from "../../../utils/appointmentUtils";
import { getNextEligibleDates, toDateKey } from "../../../utils/appointmentScheduling";
import { formatDateShort } from "../../../utils/dateUtils";
import AdminAppointmentPendingItem from "../components/AdminAppointmentPendingItem";
import AdminAppointmentHeatmapDay from "../components/AdminAppointmentHeatmapDay";
import AdminCalendarDayConfig from "../components/AdminCalendarDayConfig";
import AdminAppointmentsTable from "../components/AdminAppointmentsTable";
import { useAdminAppointmentsConfig } from "../hooks/useAdminAppointmentsConfig";
import { useAdminAppointmentsFilters } from "../hooks/useAdminAppointmentsFilters";
import { useAdminAppointmentsActions } from "../hooks/useAdminAppointmentsActions";

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

    const {
        statusFilters,
        setStatusFilters,
        search,
        setSearch,
        dateFilter,
        setDateFilter,
        slotFilters,
        setSlotFilters,
        sortBy,
        setSortBy,
        selectedAppointmentIds,
        setSelectedAppointmentIds,
        slotOptions,
        filteredAppointments,
        selectedAppointments,
        allFilteredSelected,
        toggleSelectAllFiltered,
        toggleAppointmentSelection,
    } = useAdminAppointmentsFilters(state.appointments);

    const {
        configDate,
        setConfigDate,
        blockDate,
        setBlockDate,
        blockNote,
        setBlockNote,
        overrideCapacity,
        setOverrideCapacity,
        capacityValue,
        setCapacityValue,
        overrideSlots,
        setOverrideSlots,
        slotDraftText,
        setSlotDraftText,
        locationValue,
        setLocationValue,
        roomValue,
        setRoomValue,
        allowedWeekdaysDraft,
        setAllowedWeekdaysDraft,
        configDayBlockedEntry,
        configDayCapacity,
        configDayAppointments,
        configDaySlots,
        configDayCalendarRows,
        handleSaveDayConfig,
    } = useAdminAppointmentsConfig({
        settings: state.settings,
        appointments: state.appointments,
        updateSettings,
    });

    const {
        bulkDialogOpen,
        bulkAction,
        bulkTargetIds,
        bulkReason,
        setBulkReason,
        bulkAdminNote,
        setBulkAdminNote,
        singleDialogOpen,
        singleAction,
        singleReason,
        setSingleReason,
        singleAdminNote,
        setSingleAdminNote,
        singleAppointment,
        rescheduleDialogOpen,
        rescheduleDate,
        setRescheduleDate,
        rescheduleInterval,
        setRescheduleInterval,
        availableIntervalsLabel,
        closeBulkDialog,
        closeSingleDialog,
        closeRescheduleDialog,
        applyBulkStatusAction,
        handleConfirmBulkAction,
        handleApprove,
        handleReject,
        handleCancelByAdmin,
        handleConfirmSingleAction,
        handleReschedule,
        handleConfirmReschedule,
    } = useAdminAppointmentsActions({
        appointments: state.appointments,
        settings: state.settings,
        selectedAppointments,
        setSelectedAppointmentIds,
        updateAppointmentStatus,
        updateAppointment,
    });

    const occupancyPreview = useMemo(
        () => getNextEligibleDates(state.settings, state.appointments, { count: 16 }),
        [state.settings, state.appointments]
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
        const anchor = globalThis["document"]?.createElement("a");
        if (!anchor) {
            URL.revokeObjectURL(url);
            toast.error("Export CSV indisponibil în acest context.");
            return;
        }
        anchor.href = url;
        anchor.download = `admin-programări-${new Date().toISOString().slice(0, 10)}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
        toast.success("Export CSV generat.");
    };

    const actionDialogTitle =
        singleAction === "approve"
            ? "Aprobare programare"
            : singleAction === "reject"
                ? "Respingere programare"
                : "Anulare programare";
    const bulkDialogTitle =
        bulkAction === "approve"
            ? "Aprobare programări"
            : bulkAction === "reject"
                ? "Respingere programări"
                : "Anulare programări";

    return (
        <div className="admin-page-content">
            <section className="admin-page-header">
                <h2>Programări examen</h2>
                <p>Revizuiește cererile, gestionează ocuparea zilelor și aplică reguli per zi.</p>
            </section>

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

            <Dialog open={bulkDialogOpen} onClose={closeBulkDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{bulkDialogTitle}</DialogTitle>
                <DialogContent>
                    <p>
                        Confirmi {bulkAction === "approve" ? "aprobarea" : bulkAction === "reject" ? "respingerea" : "anularea"} pentru {bulkTargetIds.length} programări?
                    </p>
                    {bulkAction === "reject" && (
                        <>
                            <TextField
                                label="Motiv respingere"
                                value={bulkReason}
                                onChange={(event) => setBulkReason(event.target.value)}
                                fullWidth
                                required
                                margin="dense"
                            />
                            <TextField
                                label="Nota internă (optional)"
                                value={bulkAdminNote}
                                onChange={(event) => setBulkAdminNote(event.target.value)}
                                fullWidth
                                margin="dense"
                            />
                        </>
                    )}
                    {bulkAction === "cancel" && (
                        <TextField
                            label="Motiv anulare (optional)"
                            value={bulkReason}
                            onChange={(event) => setBulkReason(event.target.value)}
                            fullWidth
                            margin="dense"
                        />
                    )}
                    {bulkAction === "approve" && (
                        <TextField
                            label="Nota admin (optional)"
                            value={bulkAdminNote}
                            onChange={(event) => setBulkAdminNote(event.target.value)}
                            fullWidth
                            margin="dense"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeBulkDialog}>Renunță</Button>
                    <Button variant="contained" onClick={handleConfirmBulkAction}>
                        Confirmă
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={singleDialogOpen} onClose={closeSingleDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{actionDialogTitle}</DialogTitle>
                <DialogContent>
                    <p>
                        Confirmi {singleAction === "approve" ? "aprobarea" : singleAction === "reject" ? "respingerea" : "anularea"} acestei programări
                        {singleAppointment?.appointmentCode ? ` (${singleAppointment.appointmentCode})` : ""}?
                    </p>
                    {singleAction === "reject" && (
                        <>
                            <TextField
                                label="Motiv respingere"
                                value={singleReason}
                                onChange={(event) => setSingleReason(event.target.value)}
                                fullWidth
                                required
                                margin="dense"
                            />
                            <TextField
                                label="Nota internă (optional)"
                                value={singleAdminNote}
                                onChange={(event) => setSingleAdminNote(event.target.value)}
                                fullWidth
                                margin="dense"
                            />
                        </>
                    )}
                    {singleAction === "cancel" && (
                        <TextField
                            label="Motiv anulare (optional)"
                            value={singleReason}
                            onChange={(event) => setSingleReason(event.target.value)}
                            fullWidth
                            margin="dense"
                        />
                    )}
                    {singleAction === "approve" && (
                        <TextField
                            label="Nota admin (optional)"
                            value={singleAdminNote}
                            onChange={(event) => setSingleAdminNote(event.target.value)}
                            fullWidth
                            margin="dense"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeSingleDialog}>Renunță</Button>
                    <Button variant="contained" onClick={handleConfirmSingleAction}>
                        Confirmă
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={rescheduleDialogOpen} onClose={closeRescheduleDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Reprogramează cererea</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Data nouă"
                        type="date"
                        value={rescheduleDate}
                        onChange={(event) => setRescheduleDate(event.target.value)}
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Interval (HH:MM-HH:MM)"
                        value={rescheduleInterval}
                        onChange={(event) => setRescheduleInterval(event.target.value)}
                        fullWidth
                        margin="dense"
                        helperText={`Intervale disponibile: ${availableIntervalsLabel || "niciunul"}`}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRescheduleDialog}>Renunță</Button>
                    <Button variant="contained" onClick={handleConfirmReschedule}>
                        Confirmă
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AdminAppointmentsPage;