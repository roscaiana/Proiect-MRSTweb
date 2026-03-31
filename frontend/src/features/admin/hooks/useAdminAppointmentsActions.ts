import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";
import type { AdminAppointmentRecord, ExamSettings } from "../types";
import type { AdminPanelContextValue } from "../context/adminPanelTypes";
import { notifyUser } from "../../../utils/appEventNotifications";
import {
    buildAvailableSlotsForDate,
    getBlockedDateEntry,
    parseDateKey,
    toDateKey,
} from "../../../utils/appointmentScheduling";
import { isAllowedDay } from "../../../utils/dateUtils";

type BulkAction = "approve" | "reject" | "cancel";
type SingleAction = "approve" | "reject" | "cancel";

type UseAdminAppointmentsActionsParams = {
    appointments: AdminAppointmentRecord[];
    settings: ExamSettings;
    selectedAppointments: AdminAppointmentRecord[];
    setSelectedAppointmentIds: Dispatch<SetStateAction<string[]>>;
    updateAppointmentStatus: AdminPanelContextValue["updateAppointmentStatus"];
    updateAppointment: AdminPanelContextValue["updateAppointment"];
};

export const useAdminAppointmentsActions = ({
    appointments,
    settings,
    selectedAppointments,
    setSelectedAppointmentIds,
    updateAppointmentStatus,
    updateAppointment,
}: UseAdminAppointmentsActionsParams) => {
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
    const [bulkTargetIds, setBulkTargetIds] = useState<string[]>([]);
    const [bulkReason, setBulkReason] = useState("");
    const [bulkAdminNote, setBulkAdminNote] = useState("");

    const [singleDialogOpen, setSingleDialogOpen] = useState(false);
    const [singleAction, setSingleAction] = useState<SingleAction | null>(null);
    const [singleAppointmentId, setSingleAppointmentId] = useState<string | null>(null);
    const [singleReason, setSingleReason] = useState("");
    const [singleAdminNote, setSingleAdminNote] = useState("");

    const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
    const [rescheduleAppointment, setRescheduleAppointment] = useState<AdminAppointmentRecord | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleInterval, setRescheduleInterval] = useState("");

    const singleAppointment = useMemo(() => {
        if (!singleAppointmentId) return null;
        return appointments.find((appointment) => appointment.id === singleAppointmentId) || null;
    }, [appointments, singleAppointmentId]);

    const rescheduleSlotOptions = useMemo(() => {
        if (!rescheduleAppointment || !rescheduleDate || !/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDate)) {
            return [];
        }
        return buildAvailableSlotsForDate(settings, appointments, rescheduleDate, {
            excludeAppointmentId: rescheduleAppointment.id,
        });
    }, [appointments, rescheduleAppointment, rescheduleDate, settings]);

    const availableIntervalsLabel = useMemo(() => {
        const intervals = rescheduleSlotOptions
            .filter((slot) => slot.available)
            .map((slot) => `${slot.startTime}-${slot.endTime}`);
        return intervals.join(", ");
    }, [rescheduleSlotOptions]);

    useEffect(() => {
        if (!rescheduleDialogOpen || !rescheduleAppointment) return;
        if (!rescheduleDate || !/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDate)) return;
        if (!rescheduleInterval) {
            const suggested = rescheduleSlotOptions.find((slot) => slot.available);
            if (suggested) {
                setRescheduleInterval(`${suggested.startTime}-${suggested.endTime}`);
            }
            return;
        }
        const isValid = rescheduleSlotOptions.some(
            (slot) => `${slot.startTime}-${slot.endTime}` === rescheduleInterval && slot.available
        );
        if (!isValid) {
            const suggested = rescheduleSlotOptions.find((slot) => slot.available);
            setRescheduleInterval(suggested ? `${suggested.startTime}-${suggested.endTime}` : "");
        }
    }, [rescheduleAppointment, rescheduleDate, rescheduleDialogOpen, rescheduleInterval, rescheduleSlotOptions]);

    const closeBulkDialog = () => {
        setBulkDialogOpen(false);
        setBulkAction(null);
        setBulkTargetIds([]);
        setBulkReason("");
        setBulkAdminNote("");
    };

    const closeSingleDialog = () => {
        setSingleDialogOpen(false);
        setSingleAction(null);
        setSingleAppointmentId(null);
        setSingleReason("");
        setSingleAdminNote("");
    };

    const closeRescheduleDialog = () => {
        setRescheduleDialogOpen(false);
        setRescheduleAppointment(null);
        setRescheduleDate("");
        setRescheduleInterval("");
    };

    const openBulkDialog = (action: BulkAction, eligibleIds: string[]) => {
        setBulkAction(action);
        setBulkTargetIds(eligibleIds);
        setBulkReason("");
        setBulkAdminNote("");
        setBulkDialogOpen(true);
    };

    const applyBulkStatusAction = (action: BulkAction) => {
        if (selectedAppointments.length === 0) {
            toast.error("Selectează cel puțin o programare.");
            return;
        }

        const eligibleAppointments = selectedAppointments.filter((appointment) => {
            if (action === "approve") {
                return appointment.status !== "approved" && appointment.status !== "cancelled";
            }
            return appointment.status !== "cancelled";
        });

        if (eligibleAppointments.length === 0) {
            toast.error("Nicio programare selectată nu este eligibilă pentru acțiunea aleasă.");
            return;
        }

        openBulkDialog(
            action,
            eligibleAppointments.map((appointment) => appointment.id)
        );
    };

    const handleConfirmBulkAction = () => {
        if (!bulkAction) return;
        if (bulkTargetIds.length === 0) {
            closeBulkDialog();
            return;
        }

        const reason = bulkReason.trim() || null;
        const adminNote = bulkAdminNote.trim() || null;

        if (bulkAction === "reject" && !reason) {
            toast.error("Respingerea bulk necesita un motiv.");
            return;
        }

        bulkTargetIds.forEach((appointmentId) => {
            if (bulkAction === "approve") {
                updateAppointmentStatus(appointmentId, "approved", { reason: null, adminNote });
                return;
            }

            if (bulkAction === "reject") {
                updateAppointmentStatus(appointmentId, "rejected", { reason, adminNote });
                return;
            }

            updateAppointmentStatus(appointmentId, "cancelled", { reason, cancelledBy: "admin" });
        });

        setSelectedAppointmentIds([]);
        toast.success(
            `${bulkTargetIds.length} programări au fost ${bulkAction === "approve" ? "aprobate" : bulkAction === "reject" ? "respinse" : "anulate"}.`
        );
        closeBulkDialog();
    };

    const openSingleDialog = (action: SingleAction, appointmentId: string) => {
        setSingleAction(action);
        setSingleAppointmentId(appointmentId);
        setSingleReason("");
        setSingleAdminNote("");
        setSingleDialogOpen(true);
    };

    const handleApprove = (appointmentId: string) => {
        openSingleDialog("approve", appointmentId);
    };

    const handleReject = (appointmentId: string) => {
        openSingleDialog("reject", appointmentId);
    };

    const handleCancelByAdmin = (appointmentId: string) => {
        openSingleDialog("cancel", appointmentId);
    };

    const handleConfirmSingleAction = () => {
        if (!singleAction || !singleAppointmentId) return;

        const reason = singleReason.trim() || null;
        const adminNote = singleAdminNote.trim() || null;

        if (singleAction === "reject" && !reason) {
            toast.error("Respingerea necesită un motiv.");
            return;
        }

        if (singleAction === "approve") {
            updateAppointmentStatus(singleAppointmentId, "approved", { reason: null, adminNote });
            toast.success("Programarea a fost aprobată.");
        } else if (singleAction === "reject") {
            updateAppointmentStatus(singleAppointmentId, "rejected", { reason, adminNote });
            toast.success("Programarea a fost respinsă.");
        } else {
            updateAppointmentStatus(singleAppointmentId, "cancelled", { reason, cancelledBy: "admin" });
            toast.success("Programarea a fost anulată de admin.");
        }

        closeSingleDialog();
    };

    const handleReschedule = (appointmentId: string) => {
        const appointment = appointments.find((item) => item.id === appointmentId);
        if (!appointment) return;
        setRescheduleAppointment(appointment);
        const initialDate = toDateKey(appointment.date);
        setRescheduleDate(initialDate);
        const slotOptionsForDay = buildAvailableSlotsForDate(settings, appointments, initialDate, {
            excludeAppointmentId: appointmentId,
        });
        const suggested = slotOptionsForDay.find((slot) => slot.available);
        setRescheduleInterval(suggested ? `${suggested.startTime}-${suggested.endTime}` : "");
        setRescheduleDialogOpen(true);
    };

    const handleConfirmReschedule = () => {
        if (!rescheduleAppointment) return;
        if (!rescheduleDate) {
            toast.error("Data introdusă nu este validă (zi neeligibilă).");
            return;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDate) || !isAllowedDay(parseDateKey(rescheduleDate), settings.allowedWeekdays)) {
            toast.error("Data introdusă nu este validă (zi neeligibilă).");
            return;
        }
        if (getBlockedDateEntry(settings, rescheduleDate)) {
            toast.error("Ziua selectată este blocată.");
            return;
        }

        if (!rescheduleInterval) {
            toast.error("Intervalul introdus nu este disponibil.");
            return;
        }

        const [slotStart, slotEnd] = rescheduleInterval.split("-");
        const validSlot = rescheduleSlotOptions.find(
            (slot) => slot.startTime === slotStart && slot.endTime === slotEnd && slot.available
        );
        if (!validSlot) {
            toast.error("Intervalul introdus nu este disponibil.");
            return;
        }

        updateAppointment(rescheduleAppointment.id, {
            date: new Date(`${rescheduleDate}T00:00:00`).toISOString(),
            slotStart: validSlot.startTime,
            slotEnd: validSlot.endTime,
            rescheduleCount: (rescheduleAppointment.rescheduleCount || 0) + 1,
            previousAppointmentId: rescheduleAppointment.previousAppointmentId || rescheduleAppointment.id,
            status:
                rescheduleAppointment.status === "rejected" || rescheduleAppointment.status === "cancelled"
                    ? "pending"
                    : rescheduleAppointment.status,
            statusReason: undefined,
            updatedAt: new Date().toISOString(),
        });

        notifyUser(rescheduleAppointment.userEmail, {
            title: "Programare reprogramată",
            message: `Programarea ${rescheduleAppointment.appointmentCode || ""} a fost mutată la ${rescheduleDate}, ${validSlot.startTime}-${validSlot.endTime}.`,
            link: "/dashboard",
            tag: `admin-reschedule-${rescheduleAppointment.id}-${rescheduleDate}-${validSlot.id}`,
        });

        toast.success("Programarea a fost reprogramată.");
        closeRescheduleDialog();
    };

    return {
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
    };
};
