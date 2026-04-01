import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { AdminAppointmentRecord, ExamSettings } from "../types";
import type { AdminPanelContextValue } from "../context/adminPanelTypes";
import {
    buildAvailableSlotsForDate,
    getAppointmentsForDate,
    getBlockedDateEntry,
    getDailyCapacity,
    toDateKey,
} from "../../../utils/appointmentScheduling";

type UseAdminAppointmentsConfigParams = {
    settings: ExamSettings;
    appointments: AdminAppointmentRecord[];
    updateSettings: AdminPanelContextValue["updateSettings"];
};

export const useAdminAppointmentsConfig = ({
    settings,
    appointments,
    updateSettings,
}: UseAdminAppointmentsConfigParams) => {
    const [configDate, setConfigDate] = useState(() => toDateKey(new Date()));
    const [blockDate, setBlockDate] = useState(false);
    const [blockNote, setBlockNote] = useState("");
    const [overrideCapacity, setOverrideCapacity] = useState(false);
    const [capacityValue, setCapacityValue] = useState(0);
    const [overrideSlots, setOverrideSlots] = useState(false);
    const [slotDraftText, setSlotDraftText] = useState("");
    const [locationValue, setLocationValue] = useState(settings.appointmentLocation);
    const [roomValue, setRoomValue] = useState(settings.appointmentRoom);
    const [allowedWeekdaysDraft, setAllowedWeekdaysDraft] = useState<number[]>(settings.allowedWeekdays);

    useEffect(() => {
        setLocationValue(settings.appointmentLocation);
        setRoomValue(settings.appointmentRoom);
        setAllowedWeekdaysDraft(settings.allowedWeekdays);
    }, [settings.appointmentLocation, settings.appointmentRoom, settings.allowedWeekdays]);

    useEffect(() => {
        const blocked = settings.blockedDates.find((item) => item.date === configDate);
        const capacityOverride = settings.capacityOverrides.find((item) => item.date === configDate);
        const slotOverride = settings.slotOverrides.find((item) => item.date === configDate);
        setBlockDate(Boolean(blocked));
        setBlockNote(blocked?.note || "");
        setOverrideCapacity(Boolean(capacityOverride));
        setCapacityValue(capacityOverride?.appointmentsPerDay || settings.appointmentsPerDay);
        setOverrideSlots(Boolean(slotOverride && slotOverride.slots.length > 0));
        setSlotDraftText(
            slotOverride?.slots
                .map((slot) => `${slot.startTime}-${slot.endTime}`)
                .join("\n") || ""
        );
    }, [configDate, settings]);

    const configDayBlockedEntry = useMemo(
        () => getBlockedDateEntry(settings, configDate),
        [configDate, settings]
    );

    const configDayCapacity = useMemo(
        () => getDailyCapacity(settings, configDate),
        [configDate, settings]
    );

    const configDayAppointments = useMemo(
        () => getAppointmentsForDate(appointments, configDate, { activeOnly: true }),
        [appointments, configDate]
    );

    const configDaySlots = useMemo(
        () => buildAvailableSlotsForDate(settings, appointments, configDate),
        [appointments, configDate, settings]
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

    const handleSaveDayConfig = () => {
        if (!configDate) {
            toast.error("Selectează o dată pentru configurare.");
            return;
        }

        const nextBlockedDates = blockDate
            ? [
                  ...settings.blockedDates.filter((item) => item.date !== configDate),
                  { date: configDate, note: blockNote.trim() || undefined },
              ].sort((a, b) => a.date.localeCompare(b.date))
            : settings.blockedDates.filter((item) => item.date !== configDate);

        const nextCapacityOverrides = overrideCapacity
            ? [
                  ...settings.capacityOverrides.filter((item) => item.date !== configDate),
                  { date: configDate, appointmentsPerDay: Math.max(1, Number(capacityValue) || 1) },
              ].sort((a, b) => a.date.localeCompare(b.date))
            : settings.capacityOverrides.filter((item) => item.date !== configDate);

        const nextSlotOverrides = (() => {
            if (!overrideSlots) {
                return settings.slotOverrides.filter((item) => item.date !== configDate);
            }

            const parsedLines = slotDraftText
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean);

            if (parsedLines.length === 0) {
                toast.error("Adaugă cel puțin un slot valid sau dezactivează override sloturi.");
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
                toast.error("Format slot invalid. Folosește linii de forma HH:MM-HH:MM.");
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
                ...settings.slotOverrides.filter((item) => item.date !== configDate),
                { date: configDate, slots: deduped },
            ].sort((a, b) => a.date.localeCompare(b.date));
        })();

        if (nextSlotOverrides === null) {
            return;
        }

        updateSettings({
            ...settings,
            appointmentLocation: locationValue.trim() || settings.appointmentLocation,
            appointmentRoom: roomValue.trim() || settings.appointmentRoom,
            allowedWeekdays: allowedWeekdaysDraft.length > 0 ? allowedWeekdaysDraft : settings.allowedWeekdays,
            blockedDates: nextBlockedDates,
            capacityOverrides: nextCapacityOverrides,
            slotOverrides: nextSlotOverrides,
        });

        toast.success(`Configurația pentru ${configDate} a fost salvată.`);
    };

    return {
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
    };
};

