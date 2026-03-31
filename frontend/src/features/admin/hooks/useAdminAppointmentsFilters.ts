import { useEffect, useMemo, useState } from "react";
import type { AdminAppointmentRecord, AppointmentStatus } from "../types";
import { TIME_SLOTS } from "../../../types/appointment";
import { toDateKey } from "../../../utils/appointmentScheduling";
import type { AppointmentSortBy } from "../components/AdminAppointmentsTable";

export const useAdminAppointmentsFilters = (appointments: AdminAppointmentRecord[]) => {
    const [statusFilters, setStatusFilters] = useState<AppointmentStatus[]>([]);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [slotFilters, setSlotFilters] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<AppointmentSortBy>("updated_desc");
    const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<string[]>([]);

    const slotOptions = useMemo(() => {
        const all = new Set<string>(TIME_SLOTS.map((slot) => `${slot.startTime}-${slot.endTime}`));
        appointments.forEach((appointment) => all.add(`${appointment.slotStart}-${appointment.slotEnd}`));
        return Array.from(all).sort();
    }, [appointments]);

    useEffect(() => {
        setSlotFilters((prev) => prev.filter((slot) => slotOptions.includes(slot)));
    }, [slotOptions]);

    const filteredAppointments = useMemo(() => {
        return [...appointments]
            .filter((appointment) => {
                const matchesStatus = statusFilters.length === 0 ? true : statusFilters.includes(appointment.status);
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
    }, [appointments, dateFilter, search, slotFilters, sortBy, statusFilters]);

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

    return {
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
    };
};

