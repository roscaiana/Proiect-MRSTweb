import type { MouseEvent } from "react";
import type { AdminAppointmentRecord, AppointmentStatus } from "../types";
import CompactDatePicker from "../../../components/CompactDatePicker/CompactDatePicker";
import AdminMultiSelect, { type AdminMultiSelectOption } from "./AdminMultiSelect";
import AdminSingleSelect, { type AdminSingleSelectOption } from "./AdminSingleSelect";
import AdminAppointmentTableRow from "./AdminAppointmentTableRow";

export type AppointmentSortBy = "updated_desc" | "exam_asc" | "exam_desc" | "name_asc";

const APPOINTMENT_STATUS_FILTER_OPTIONS: ReadonlyArray<AdminMultiSelectOption<AppointmentStatus>> = [
    { value: "pending", label: "În așteptare" },
    { value: "approved", label: "Aprobate" },
    { value: "rejected", label: "Respinse" },
    { value: "cancelled", label: "Anulate" },
];

const APPOINTMENT_SORT_OPTIONS: ReadonlyArray<AdminSingleSelectOption<AppointmentSortBy>> = [
    { value: "updated_desc", label: "Actualizate recent" },
    { value: "exam_asc", label: "Data examen (crescător)" },
    { value: "exam_desc", label: "Data examen (descrescător)" },
    { value: "name_asc", label: "Nume candidat (A-Z)" },
];

type AdminAppointmentsTableProps = {
    filteredAppointments: AdminAppointmentRecord[];
    allFilteredSelected: boolean;
    selectedAppointmentIds: string[];
    search: string;
    statusFilters: AppointmentStatus[];
    dateFilter: string;
    slotFilters: string[];
    slotOptions: string[];
    sortBy: AppointmentSortBy;
    csvUrl: string;
    csvFileName: string;
    onSearchChange: (value: string) => void;
    onStatusFiltersChange: (values: AppointmentStatus[]) => void;
    onDateFilterChange: (value: string) => void;
    onSlotFiltersChange: (values: string[]) => void;
    onSortChange: (value: AppointmentSortBy) => void;
    onToggleSelectAll: () => void;
    onToggleSelection: (id: string) => void;
    onBulkApprove: () => void;
    onBulkReject: () => void;
    onBulkCancel: () => void;
    onClearSelection: () => void;
    onExportCsv: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onReschedule: (id: string) => void;
    onCancel: (id: string) => void;
    formatDateLabel: (date: string) => string;
    formatDateTimeLabel: (value: string) => string;
    statusLabel: (status: AppointmentStatus) => string;
};

export default function AdminAppointmentsTable({
    filteredAppointments,
    allFilteredSelected,
    selectedAppointmentIds,
    search,
    statusFilters,
    dateFilter,
    slotFilters,
    slotOptions,
    sortBy,
    csvUrl,
    csvFileName,
    onSearchChange,
    onStatusFiltersChange,
    onDateFilterChange,
    onSlotFiltersChange,
    onSortChange,
    onToggleSelectAll,
    onToggleSelection,
    onBulkApprove,
    onBulkReject,
    onBulkCancel,
    onClearSelection,
    onExportCsv,
    onApprove,
    onReject,
    onReschedule,
    onCancel,
    formatDateLabel,
    formatDateTimeLabel,
    statusLabel,
}: AdminAppointmentsTableProps) {
    const handleExportClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (!csvUrl) {
            event.preventDefault();
        }
        onExportCsv();
    };

    return (
        <section className="admin-panel-card">
            <div className="admin-card-header">
                <h3><i className="fas fa-list admin-card-header-icon"></i> Programări</h3>
                <a
                    className={`admin-btn secondary${csvUrl ? "" : " is-disabled"}`}
                    href={csvUrl || undefined}
                    download={csvFileName}
                    onClick={handleExportClick}
                    aria-disabled={!csvUrl}
                >
                    Export CSV
                </a>
            </div>

            <div className="admin-toolbar admin-toolbar-appointments">
                <label className="admin-field">
                    <span>Caută candidat</span>
                    <input
                        type="text"
                        placeholder="Nume, email, telefon sau cod"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                    />
                </label>

                <label className="admin-field">
                    <span>Status</span>
                    <AdminMultiSelect
                        ariaLabel="Filtrare dupa status programari"
                        options={APPOINTMENT_STATUS_FILTER_OPTIONS}
                        selectedValues={statusFilters}
                        onChange={onStatusFiltersChange}
                        placeholder="Toate"
                    />
                </label>

                <label className="admin-field">
                    <span>Data</span>
                    <CompactDatePicker
                        value={dateFilter}
                        onChange={onDateFilterChange}
                        ariaLabel="Calendar filtrare programari"
                    />
                </label>

                <label className="admin-field">
                    <span>Interval</span>
                    <AdminMultiSelect
                        ariaLabel="Filtrare dupa interval programari"
                        options={slotOptions.map((value) => ({ value, label: value }))}
                        selectedValues={slotFilters}
                        onChange={onSlotFiltersChange}
                        placeholder="Toate intervalele"
                    />
                </label>

                <label className="admin-field">
                    <span>Sortare</span>
                    <AdminSingleSelect
                        ariaLabel="Sortare programari"
                        options={APPOINTMENT_SORT_OPTIONS}
                        value={sortBy}
                        onChange={onSortChange}
                    />
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
                        {filteredAppointments.filter(
                            (item) => item.status === "rejected" || item.status === "cancelled"
                        ).length}
                    </strong>
                </div>
            </div>

            <div className="admin-bulk-toolbar">
                <div className="admin-bulk-toolbar-left">
                    <label className="admin-bulk-select-toggle">
                        <input
                            type="checkbox"
                            checked={allFilteredSelected}
                            onChange={onToggleSelectAll}
                            disabled={filteredAppointments.length === 0}
                        />
                        <span>Selectează toate rezultatele filtrate</span>
                    </label>
                    <span className="admin-muted-text">{selectedAppointmentIds.length} selectate</span>
                </div>
                <div className="admin-bulk-toolbar-actions">
                    <button
                        type="button"
                        className="admin-btn secondary"
                        onClick={onBulkApprove}
                        disabled={selectedAppointmentIds.length === 0}
                    >
                        Aprobă selectate
                    </button>
                    <button
                        type="button"
                        className="admin-btn ghost"
                        onClick={onBulkReject}
                        disabled={selectedAppointmentIds.length === 0}
                    >
                        Respinge selectate
                    </button>
                    <button
                        type="button"
                        className="admin-btn ghost"
                        onClick={onBulkCancel}
                        disabled={selectedAppointmentIds.length === 0}
                    >
                        Anulează selectate
                    </button>
                    <button
                        type="button"
                        className="admin-btn ghost"
                        onClick={onClearSelection}
                        disabled={selectedAppointmentIds.length === 0}
                    >
                        Golește selecție
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
                                        onChange={onToggleSelectAll}
                                        aria-label="Selectează toate programările filtrate"
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
                                <AdminAppointmentTableRow
                                    key={appointment.id}
                                    appointment={appointment}
                                    isSelected={selectedAppointmentIds.includes(appointment.id)}
                                    onToggleSelection={onToggleSelection}
                                    onApprove={onApprove}
                                    onReject={onReject}
                                    onReschedule={onReschedule}
                                    onCancel={onCancel}
                                    formatDateLabel={formatDateLabel}
                                    formatDateTimeLabel={formatDateTimeLabel}
                                    statusLabel={statusLabel}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
