import React, { useEffect, useState, useMemo } from 'react';
import { CalendarCheck } from 'lucide-react';
import { AppointmentFormData, FormErrors, TIME_SLOTS } from '../../types/appointment';
import { useLocation } from 'react-router-dom';
import {
    isAllowedDay,
    //getNextAvailableDate,
    formatDate,
    getDayName,
    getMonthName
} from '../../utils/dateUtils';
import { useAuth } from '../../hooks/useAuth';
import type { AdminAppointmentRecord } from '../../features/admin/types';
import { readAppointments, readExamSettings, STORAGE_KEYS, writeAppointments } from '../../features/admin/storage';
import {
    buildAvailableSlotsForDate,
    generateAppointmentCode,
    getAppointmentsForDate,
    getBlockedDateEntry,
    getDailyCapacity,
    getNextEligibleDates,
    isDateBlocked,
    isLeadTimeSatisfied,
    toDateKey,
} from '../../utils/appointmentScheduling';
import { notifyAppointmentCreated, notifyUser } from '../../utils/appEventNotifications';
import './AppointmentPage.css';

const APPOINTMENT_DRAFT_KEY = 'appointmentFormDraft';
const APPOINTMENT_RESCHEDULE_KEY = 'appointmentRescheduleDraft';
type SlotFilter = 'all' | 'midday' | 'afternoon';

type CalendarDayCell = {
    date: Date;
    dateKey: string;
    inCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isAllowedWeekday: boolean;
    isWithinRange: boolean;
    isLeadTimeMet: boolean;
    isBlocked: boolean;
    isFull: boolean;
    remaining: number;
    capacity: number;
    selectable: boolean;
};

const CALENDAR_WEEK_DAYS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'];

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const getMonthKey = (date: Date): number => date.getFullYear() * 12 + date.getMonth();

const clampMonthToRange = (monthDate: Date, minDate: Date, maxDate: Date): Date => {
    const monthStart = startOfMonth(monthDate);
    const minMonth = startOfMonth(minDate);
    const maxMonth = startOfMonth(maxDate);
    const monthKey = getMonthKey(monthStart);

    if (monthKey < getMonthKey(minMonth)) return minMonth;
    if (monthKey > getMonthKey(maxMonth)) return maxMonth;
    return monthStart;
};

const isSameCalendarDate = (left: Date, right: Date): boolean => (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
);

const AppointmentPage: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [formData, setFormData] = useState<AppointmentFormData>({
        fullName: user?.fullName || '',
        idOrPhone: '',
        selectedDate: null,
        selectedSlot: null
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [examSettings, setExamSettings] = useState(() => readExamSettings());
    const [appointments, setAppointments] = useState(() => readAppointments());
    const [slotFilter, setSlotFilter] = useState<SlotFilter>('all');
    const [submitMessage, setSubmitMessage] = useState('');
    const [submittedAppointment, setSubmittedAppointment] = useState<AdminAppointmentRecord | null>(null);
    const [rescheduleSourceId, setRescheduleSourceId] = useState<string | null>(null);
    const previousUserEmailRef = React.useRef<string | null>(
        user?.email ? user.email.trim().toLowerCase() : null
    );

    useEffect(() => {
        const refreshData = () => {
            setExamSettings(readExamSettings());
            setAppointments(readAppointments());
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEYS.settings || event.key === STORAGE_KEYS.appointments) {
                refreshData();
            }
        };

        const handleAppStorageUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<{ key?: string }>;
            const key = customEvent.detail?.key;
            if (key === STORAGE_KEYS.settings || key === STORAGE_KEYS.appointments) {
                refreshData();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('app-storage-updated', handleAppStorageUpdated as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('app-storage-updated', handleAppStorageUpdated as EventListener);
        };
    }, []);

    useEffect(() => {
        if (!user?.fullName) return;
        setFormData((prev) => (prev.fullName ? prev : { ...prev, fullName: user.fullName }));
    }, [user?.fullName]);

    useEffect(() => {
        const currentUserEmail = user?.email ? user.email.trim().toLowerCase() : null;
        const previousUserEmail = previousUserEmailRef.current;

        if (previousUserEmail && previousUserEmail !== currentUserEmail) {
            setFormData({
                fullName: '',
                idOrPhone: '',
                selectedDate: null,
                selectedSlot: null,
            });
            setErrors({});
            setSubmitMessage('');
            setSubmittedAppointment(null);
            setRescheduleSourceId(null);
            localStorage.removeItem(APPOINTMENT_DRAFT_KEY);
            localStorage.removeItem(APPOINTMENT_RESCHEDULE_KEY);
        }

        previousUserEmailRef.current = currentUserEmail;
    }, [user?.email]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const rescheduleIdFromQuery = searchParams.get('reschedule');
        const rawRescheduleDraft = localStorage.getItem(APPOINTMENT_RESCHEDULE_KEY);
        let sourceId = rescheduleIdFromQuery || null;

        if (!sourceId && rawRescheduleDraft) {
            try {
                const parsed = JSON.parse(rawRescheduleDraft) as { appointmentId?: string };
                sourceId = parsed.appointmentId || null;
            } catch {
                sourceId = null;
            }
        }

        if (sourceId) {
            setRescheduleSourceId(sourceId);
        }
    }, [location.search]);

    useEffect(() => {
        if (!isSubmitted) return;
        localStorage.removeItem(APPOINTMENT_DRAFT_KEY);
        localStorage.removeItem(APPOINTMENT_RESCHEDULE_KEY);
    }, [isSubmitted]);

    // Get minimum selectable date (Jan 1st, 2026)
    const minDate = useMemo(() => {
        // Set strictly to 2026
        const date = new Date(2026, 0, 1); // January 1st, 2026
        return date;
    }, []);

    // Get maximum selectable date (Dec 31st, 2050)
    const maxDate = useMemo(() => {
        const date = new Date(2050, 11, 31); // December 31st, 2050
        return date;
    }, []);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
        return clampMonthToRange(startOfMonth(new Date()), new Date(2026, 0, 1), new Date(2050, 11, 31));
    });
    const calendarPickerRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!formData.selectedDate) return;
        setCalendarMonth(clampMonthToRange(startOfMonth(formData.selectedDate), minDate, maxDate));
    }, [formData.selectedDate, minDate, maxDate]);

    useEffect(() => {
        if (!isCalendarOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (!calendarPickerRef.current) return;
            if (event.target instanceof Node && !calendarPickerRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsCalendarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isCalendarOpen]);

    const userAppointments = useMemo(() => {
        if (!user?.email) return [];
        return appointments.filter((appointment) => appointment.userEmail === user.email);
    }, [appointments, user?.email]);

    const activeUserAppointments = useMemo(() => {
        return userAppointments.filter((appointment) => appointment.status === 'pending' || appointment.status === 'approved');
    }, [userAppointments]);

    const lastRejectedUserAppointment = useMemo(() => {
        return [...userAppointments]
            .filter((appointment) => appointment.status === 'rejected')
            .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0] || null;
    }, [userAppointments]);

    const selectedDateKey = formData.selectedDate ? toDateKey(formData.selectedDate) : '';
    const selectedBlockedEntry = useMemo(
        () => (selectedDateKey ? getBlockedDateEntry(examSettings, selectedDateKey) : undefined),
        [examSettings, selectedDateKey]
    );
    const minMonth = useMemo(() => startOfMonth(minDate), [minDate]);
    const maxMonth = useMemo(() => startOfMonth(maxDate), [maxDate]);
    const canNavigatePrevMonth = getMonthKey(calendarMonth) > getMonthKey(minMonth);
    const canNavigateNextMonth = getMonthKey(calendarMonth) < getMonthKey(maxMonth);

    const selectedDateLabel = useMemo(() => {
        if (!formData.selectedDate) return 'Selectați data programării';
        return `${getDayName(formData.selectedDate)}, ${formData.selectedDate.getDate()} ${getMonthName(formData.selectedDate)} ${formData.selectedDate.getFullYear()}`;
    }, [formData.selectedDate]);

    const calendarDays = useMemo<CalendarDayCell[]>(() => {
        const firstDayOfMonth = startOfMonth(calendarMonth);
        const monthStartWeekDay = (firstDayOfMonth.getDay() + 6) % 7; // Monday first
        const gridStart = new Date(firstDayOfMonth);
        gridStart.setDate(firstDayOfMonth.getDate() - monthStartWeekDay);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Array.from({ length: 42 }, (_, index) => {
            const dayDate = new Date(gridStart);
            dayDate.setDate(gridStart.getDate() + index);
            dayDate.setHours(0, 0, 0, 0);

            const dateKey = toDateKey(dayDate);
            const dayAppointments = getAppointmentsForDate(appointments, dateKey, {
                activeOnly: true,
                excludeId: rescheduleSourceId || undefined,
            });
            const capacity = getDailyCapacity(examSettings, dateKey);
            const blockedEntry = getBlockedDateEntry(examSettings, dateKey);
            const remaining = Math.max(0, capacity - dayAppointments.length);
            const isAllowedWeekday = isAllowedDay(dayDate);
            const isWithinRange = dayDate >= minDate && dayDate <= maxDate;
            const isLeadTimeMet = isLeadTimeSatisfied(examSettings, dayDate);
            const isBlocked = Boolean(blockedEntry);
            const isFull = remaining === 0;
            const selectable = isWithinRange && isAllowedWeekday && isLeadTimeMet && !isBlocked && !isFull;

            return {
                date: dayDate,
                dateKey,
                inCurrentMonth: dayDate.getMonth() === calendarMonth.getMonth() && dayDate.getFullYear() === calendarMonth.getFullYear(),
                isToday: isSameCalendarDate(dayDate, today),
                isSelected: selectedDateKey === dateKey,
                isAllowedWeekday,
                isWithinRange,
                isLeadTimeMet,
                isBlocked,
                isFull,
                remaining,
                capacity,
                selectable,
            };
        });
    }, [appointments, calendarMonth, examSettings, maxDate, minDate, rescheduleSourceId, selectedDateKey]);

    const selectedDayAppointments = useMemo(() => {
        if (!selectedDateKey) return [];
        return getAppointmentsForDate(appointments, selectedDateKey, { activeOnly: true, excludeId: rescheduleSourceId || undefined });
    }, [appointments, selectedDateKey, rescheduleSourceId]);

    const currentDayCapacity = useMemo(() => {
        if (!selectedDateKey) return examSettings.appointmentsPerDay;
        return getDailyCapacity(examSettings, selectedDateKey);
    }, [examSettings, selectedDateKey]);

    const remainingAppointmentsForDay = useMemo(() => {
        return Math.max(0, currentDayCapacity - selectedDayAppointments.length);
    }, [currentDayCapacity, selectedDayAppointments.length]);

    const allAvailableSlots = useMemo(() => {
        if (!selectedDateKey) {
            return TIME_SLOTS.map((slot) => ({ ...slot }));
        }
        return buildAvailableSlotsForDate(examSettings, appointments, selectedDateKey, {
            excludeAppointmentId: rescheduleSourceId || undefined,
        });
    }, [appointments, examSettings, selectedDateKey, rescheduleSourceId]);

    const availableSlots = useMemo(() => {
        return allAvailableSlots.filter((slot) => {
            const hour = Number(slot.startTime.split(':')[0] || 0);
            if (slotFilter === 'midday') return hour < 14;
            if (slotFilter === 'afternoon') return hour >= 14;
            return true;
        });
    }, [allAvailableSlots, slotFilter]);

    const recommendedSlot = useMemo(() => {
        return allAvailableSlots.find((slot) => slot.available) || null;
    }, [allAvailableSlots]);

    const availabilityPreviewDays = useMemo(
        () => getNextEligibleDates(examSettings, appointments, { count: 12, startDate: new Date(), maxDate }),
        [appointments, examSettings, maxDate]
    );

    useEffect(() => {
        if (!formData.selectedSlot) {
            return;
        }

        const stillAvailable = allAvailableSlots.some(
            (slot) => slot.id === formData.selectedSlot?.id && slot.available
        );

        if (!stillAvailable) {
            setFormData((prev) => ({ ...prev, selectedSlot: null }));
            setErrors((prev) => ({
                ...prev,
                slot: 'Intervalul selectat nu mai este disponibil. Alegeți alt interval.',
            }));
        }
    }, [allAvailableSlots, formData.selectedSlot]);

    const handleDateValueChange = (dateString: string) => {
        if (!dateString) {
            setFormData({ ...formData, selectedDate: null, selectedSlot: null });
            setErrors((prev) => ({ ...prev, date: undefined, slot: undefined }));
            return;
        }

        const selectedDate = new Date(dateString + 'T00:00:00');

        const dateKey = toDateKey(selectedDate);
        const dayAppointments = getAppointmentsForDate(appointments, dateKey, {
            activeOnly: true,
            excludeId: rescheduleSourceId || undefined,
        });
        const dayCapacity = getDailyCapacity(examSettings, dateKey);
        const blockedEntry = getBlockedDateEntry(examSettings, dateKey);
        const isDayFullyBooked = dayAppointments.length >= dayCapacity;

        let dateError: string | undefined;
        let slotError: string | undefined;

        if (!isAllowedDay(selectedDate)) {
            dateError = 'Vă rugăm să selectați Luni, Miercuri sau Vineri.';
        } else if (blockedEntry) {
            dateError = blockedEntry.note
                ? `Ziua este blocată: ${blockedEntry.note}.`
                : 'Ziua selectată este blocată pentru programări.';
        } else if (!isLeadTimeSatisfied(examSettings, selectedDate)) {
            dateError = `Programarea trebuie făcută cu cel puțin ${examSettings.appointmentLeadTimeHours} ore înainte.`;
        } else if (isDayFullyBooked) {
            dateError = `Ziua selectată este complet rezervată (${dayCapacity}/${dayCapacity}).`;
            slotError = 'Nu mai sunt intervale disponibile pentru această zi.';
        }

        setFormData({ ...formData, selectedDate, selectedSlot: null });
        setErrors({
            ...errors,
            date: dateError,
            slot: slotError,
        });
    };

    const toggleCalendar = () => {
        if (!isCalendarOpen) {
            const monthSeed = formData.selectedDate || new Date();
            setCalendarMonth(clampMonthToRange(startOfMonth(monthSeed), minDate, maxDate));
        }
        setIsCalendarOpen((prev) => !prev);
    };

    const goToPreviousMonth = () => {
        if (!canNavigatePrevMonth) return;
        const previous = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
        setCalendarMonth(clampMonthToRange(previous, minDate, maxDate));
    };

    const goToNextMonth = () => {
        if (!canNavigateNextMonth) return;
        const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
        setCalendarMonth(clampMonthToRange(next, minDate, maxDate));
    };

    const handleCalendarDaySelect = (dateKey: string) => {
        handleDateValueChange(dateKey);
        setIsCalendarOpen(false);
    };

    const handleSlotSelect = (slotId: string) => {
        const slot = allAvailableSlots.find(s => s.id === slotId && s.available);
        if (slot) {
            setFormData({ ...formData, selectedSlot: slot });
            setErrors({ ...errors, slot: undefined });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Numele complet este obligatoriu';
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Numele trebuie să conțină cel puțin 3 caractere';
        }

        if (!formData.idOrPhone.trim()) {
            newErrors.idOrPhone = 'Numărul de telefon este obligatoriu';
        } else if (!/^\d{9}$/.test(formData.idOrPhone.trim())) {
            newErrors.idOrPhone = 'Introduceți un număr de telefon corect (exact 9 cifre).';
        }

        if (!formData.selectedDate) {
            newErrors.date = 'Vă rugăm să selectați o dată';
        } else {
            const selectedDateKeyForValidation = toDateKey(formData.selectedDate);
            const dayAppointments = getAppointmentsForDate(appointments, selectedDateKeyForValidation, {
                activeOnly: true,
                excludeId: rescheduleSourceId || undefined,
            });
            const dayCapacity = getDailyCapacity(examSettings, selectedDateKeyForValidation);

            if (!isAllowedDay(formData.selectedDate)) {
                newErrors.date = 'Vă rugăm să selectați Luni, Miercuri sau Vineri.';
            } else if (isDateBlocked(examSettings, selectedDateKeyForValidation)) {
                const blockedEntry = getBlockedDateEntry(examSettings, selectedDateKeyForValidation);
                newErrors.date = blockedEntry?.note
                    ? `Ziua este blocată: ${blockedEntry.note}.`
                    : 'Ziua selectată este blocată pentru programări.';
            } else if (!isLeadTimeSatisfied(examSettings, formData.selectedDate)) {
                newErrors.date = `Programarea trebuie făcută cu cel puțin ${examSettings.appointmentLeadTimeHours} ore înainte.`;
            } else if (dayAppointments.length >= dayCapacity) {
                newErrors.date = `Limita zilnică de ${dayCapacity} programări a fost atinsă.`;
            }
        }

        if (!rescheduleSourceId && activeUserAppointments.length > 0) {
            newErrors.date =
                newErrors.date ||
                'Ai deja o programare activă. Anulează sau folosește reprogramarea din dashboard.';
        }

        if (rescheduleSourceId) {
            const sourceAppointment = userAppointments.find((appointment) => appointment.id === rescheduleSourceId);
            if (!sourceAppointment) {
                newErrors.date = newErrors.date || 'Programarea sursă pentru reprogramare nu a fost găsită.';
            } else if ((sourceAppointment.rescheduleCount || 0) >= examSettings.maxReschedulesPerUser) {
                newErrors.date =
                    newErrors.date ||
                    `Ai atins limita de ${examSettings.maxReschedulesPerUser} reprogramări pentru această cerere.`;
            }
        } else if (lastRejectedUserAppointment && examSettings.rejectionCooldownDays > 0) {
            const lastRejectedAt = new Date(lastRejectedUserAppointment.updatedAt || lastRejectedUserAppointment.createdAt);
            const cooldownUntil = new Date(lastRejectedAt.getTime() + examSettings.rejectionCooldownDays * 24 * 60 * 60 * 1000);
            if (cooldownUntil > new Date()) {
                newErrors.date =
                    newErrors.date ||
                    `Poți face o nouă programare după ${cooldownUntil.toLocaleDateString('ro-RO')} (cooldown ${examSettings.rejectionCooldownDays} zile).`;
            }
        }

        if (!formData.selectedSlot) {
            newErrors.slot = 'Vă rugăm să selectați un interval orar';
        } else {
            const isSelectedSlotAvailable = allAvailableSlots.some(
                (slot) => slot.id === formData.selectedSlot?.id && slot.available
            );

            if (!isSelectedSlotAvailable) {
                newErrors.slot = 'Intervalul selectat nu mai este disponibil.';
            } else if (formData.selectedDate) {
                const duplicateUserSameDay = activeUserAppointments.find(
                    (appointment) =>
                        appointment.id !== rescheduleSourceId &&
                        toDateKey(appointment.date) === toDateKey(formData.selectedDate as Date)
                );
                if (duplicateUserSameDay) {
                    newErrors.date =
                        newErrors.date ||
                        'Ai deja o programare activă în aceeași zi. Folosește funcția de reprogramare.';
                }

                const duplicateUserSameSlot = activeUserAppointments.find(
                    (appointment) =>
                        appointment.id !== rescheduleSourceId &&
                        toDateKey(appointment.date) === toDateKey(formData.selectedDate as Date) &&
                        appointment.slotStart === formData.selectedSlot?.startTime &&
                        appointment.slotEnd === formData.selectedSlot?.endTime
                );
                if (duplicateUserSameSlot) {
                    newErrors.slot = 'Ai deja o programare activă pe acest interval.';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitMessage('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (formData.selectedDate && formData.selectedSlot) {
            const latestAppointments = readAppointments();
            const latestSettings = readExamSettings();
            const selectedDateKeyForSubmit = toDateKey(formData.selectedDate);
            const sourceAppointment = rescheduleSourceId
                ? latestAppointments.find((appointment) => appointment.id === rescheduleSourceId)
                : null;
            const sameDayAppointments = getAppointmentsForDate(latestAppointments, selectedDateKeyForSubmit, {
                activeOnly: true,
                excludeId: rescheduleSourceId || undefined,
            });
            const dayCapacity = getDailyCapacity(latestSettings, selectedDateKeyForSubmit);

            if (!isAllowedDay(formData.selectedDate)) {
                setErrors((prev) => ({ ...prev, date: 'Sunt permise doar zilele Luni, Miercuri sau Vineri.' }));
                setIsSubmitting(false);
                return;
            }

            if (isDateBlocked(latestSettings, selectedDateKeyForSubmit)) {
                const blockedEntry = getBlockedDateEntry(latestSettings, selectedDateKeyForSubmit);
                setErrors((prev) => ({
                    ...prev,
                    date: blockedEntry?.note ? `Zi blocată: ${blockedEntry.note}` : 'Ziua selectată este blocată.',
                }));
                setIsSubmitting(false);
                return;
            }

            if (!isLeadTimeSatisfied(latestSettings, formData.selectedDate)) {
                setErrors((prev) => ({
                    ...prev,
                    date: `Programarea trebuie făcută cu cel puțin ${latestSettings.appointmentLeadTimeHours} ore înainte.`,
                }));
                setIsSubmitting(false);
                return;
            }

            if (!rescheduleSourceId) {
                const latestActiveUserAppointment = latestAppointments.find(
                    (appointment) =>
                        appointment.userEmail === user?.email &&
                        (appointment.status === 'pending' || appointment.status === 'approved')
                );
                if (latestActiveUserAppointment) {
                    setErrors((prev) => ({
                        ...prev,
                        date: 'Ai deja o programare activă. Folosește anulare sau reprogramare din dashboard.',
                    }));
                    setIsSubmitting(false);
                    return;
                }
            }

            if (sourceAppointment && (sourceAppointment.rescheduleCount || 0) >= latestSettings.maxReschedulesPerUser) {
                setErrors((prev) => ({
                    ...prev,
                    date: `Ai atins limita de ${latestSettings.maxReschedulesPerUser} reprogramări pentru această cerere.`,
                }));
                setIsSubmitting(false);
                return;
            }

            if (sameDayAppointments.length >= dayCapacity) {
                setErrors((prev) => ({
                    ...prev,
                    date: `Între timp, limita zilnică de ${dayCapacity} programări a fost atinsă.`,
                }));
                setIsSubmitting(false);
                return;
            }

            const slotAlreadyTaken = sameDayAppointments.some(
                (appointment) =>
                    appointment.slotStart === formData.selectedSlot?.startTime &&
                    appointment.slotEnd === formData.selectedSlot?.endTime
            );

            if (slotAlreadyTaken) {
                setErrors((prev) => ({
                    ...prev,
                    slot: 'Intervalul ales a fost ocupat între timp. Alege alt interval.',
                }));
                setIsSubmitting(false);
                return;
            }

            const appointmentCode = generateAppointmentCode();
            const createdAt = new Date().toISOString();
            const newAppointment: AdminAppointmentRecord = {
                id: `appointment-${Date.now()}`,
                appointmentCode,
                fullName: formData.fullName.trim(),
                idOrPhone: formData.idOrPhone.trim(),
                userEmail: user?.email,
                date: formData.selectedDate.toISOString(),
                slotStart: formData.selectedSlot.startTime,
                slotEnd: formData.selectedSlot.endTime,
                status: 'pending',
                statusReason: undefined,
                adminNote: undefined,
                previousAppointmentId: sourceAppointment?.id,
                rescheduleCount: sourceAppointment ? (sourceAppointment.rescheduleCount || 0) + 1 : 0,
                createdAt,
                updatedAt: createdAt,
            };

            let nextAppointments = [newAppointment, ...latestAppointments];
            if (sourceAppointment) {
                nextAppointments = nextAppointments.map((appointment) =>
                    appointment.id === sourceAppointment.id
                        ? {
                            ...appointment,
                            status: 'cancelled',
                            cancelledBy: 'user',
                            statusReason: 'Reprogramată de utilizator',
                            updatedAt: createdAt,
                        }
                        : appointment
                );
                notifyUser(user?.email, {
                    title: 'Reprogramare inițiată',
                    message: `Cererea veche ${sourceAppointment.appointmentCode || ''} a fost anulată și înlocuită cu ${appointmentCode}.`,
                    link: '/dashboard',
                    tag: `appointment-user-rescheduled-${sourceAppointment.id}-${appointmentCode}`,
                });
            }

            writeAppointments(nextAppointments);
            setAppointments(nextAppointments);
            setSubmittedAppointment(newAppointment);
            notifyAppointmentCreated({
                userEmail: user?.email,
                appointmentCode,
                dateLabel: formatDate(formData.selectedDate),
                intervalLabel: `${formData.selectedSlot.startTime} - ${formData.selectedSlot.endTime}`,
            });

            setSubmitMessage(
                sourceAppointment
                    ? 'Programarea a fost reprogramată. Cererea nouă este în așteptare de confirmare.'
                    : 'Programarea a fost înregistrată și este în așteptare de confirmare.'
            );
        }

        setIsSubmitting(false);
        setIsSubmitted(true);

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNewAppointment = () => {
        setFormData({
            fullName: user?.fullName || '',
            idOrPhone: '',
            selectedDate: null,
            selectedSlot: null
        });
        setErrors({});
        setIsSubmitted(false);
        setSubmittedAppointment(null);
        setSubmitMessage('');
        setRescheduleSourceId(null);
        localStorage.removeItem(APPOINTMENT_DRAFT_KEY);
        localStorage.removeItem(APPOINTMENT_RESCHEDULE_KEY);
    };

    const rescheduleSourceAppointment = useMemo(
        () => (rescheduleSourceId ? appointments.find((appointment) => appointment.id === rescheduleSourceId) || null : null),
        [appointments, rescheduleSourceId]
    );

    const currentStep = useMemo(() => {
        if (!formData.selectedDate) return 1;
        if (!formData.selectedSlot) return 2;
        if (!formData.fullName.trim() || !formData.idOrPhone.trim()) return 3;
        return 4;
    }, [formData]);

    if (isSubmitted) {
        return (
            <div className="appointment-page">
                <div className="container">
                    <div className="success-card">
                        <div className="success-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#FFCC00" strokeWidth="2" />
                                <path d="M8 12l2 2 4-4" stroke="#FFCC00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2>Programare Confirmată!</h2>
                        <p className="success-message">
                            {submitMessage || 'Programarea dumneavoastră pentru examenul de certificare a fost înregistrată cu succes.'}
                        </p>
                        <div className="appointment-details">
                            <div className="detail-row">
                                <span className="detail-label">Cod programare:</span>
                                <span className="detail-value">{submittedAppointment?.appointmentCode || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value">În așteptare confirmare</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Candidat:</span>
                                <span className="detail-value">{formData.fullName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Data:</span>
                                <span className="detail-value">
                  {formData.selectedDate && `${getDayName(formData.selectedDate)}, ${formatDate(formData.selectedDate)}`}
                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Ora:</span>
                                <span className="detail-value">
                  {formData.selectedSlot && `${formData.selectedSlot.startTime} - ${formData.selectedSlot.endTime}`}
                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Locație:</span>
                                <span className="detail-value">{examSettings.appointmentLocation}, {examSettings.appointmentRoom}</span>
                            </div>
                        </div>
                        <div className="appointment-next-steps">
                            <h4>Pași următori</h4>
                            <ul>
                                <li>Verifică dashboard-ul pentru aprobarea sau respingerea cererii.</li>
                                <li>Poți anula sau reprograma cererea direct din dashboard (în limitele permise).</li>
                                <li>Vei primi notificări în aplicație la schimbarea statusului.</li>
                            </ul>
                        </div>
                        <div className="success-actions">
                            <button className="success-btn success-btn-primary" onClick={handleNewAppointment}>
                                Programare Nouă
                            </button>
                            <button className="success-btn success-btn-secondary" onClick={() => window.print()}>
                                Printează Confirmare
                            </button>
                        </div>
                        <p className="success-note">
                            <strong>Notă:</strong> Vă rugăm să vă prezentați cu 15 minute înainte de ora programării
                            cu actul de identitate. Dacă apar schimbări, statusul se actualizează în dashboard.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="appointment-page appointment-page-form">
            <section className="appointment-hero-simple" aria-labelledby="appointment-page-title">
                <div className="appointment-hero-overlay appointment-hero-overlay-right" />
                <div className="appointment-hero-overlay appointment-hero-overlay-left" />
                <div className="container">
                    <div className="appointment-hero-simple-content">
                        <div className="appointment-hero-badge">
                            <CalendarCheck className="w-4 h-4 text-blue-200" />
                            <span className="uppercase">Înscriere examen</span>
                        </div>
                        <h1 id="appointment-page-title">
                            Înscriere <span className="appointment-hero-title-highlight">Examen</span>
                        </h1>
                        <p className="appointment-hero-subtitle">
                            Completează formularul pentru a rezerva intervalul dorit și a finaliza înscrierea la evaluare.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container appointment-content-shell">
                <div className="appointment-content-panel">

                    <div className="appointment-stepper" aria-label="Pași programare">
                        {[
                            'Alege data',
                            'Alege interval',
                            'Date personale',
                            'Confirmare',
                        ].map((label, index) => (
                            <div
                                key={label}
                                className={`step-item ${currentStep > index + 1 ? 'done' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
                            >
                                <span className="step-index">{index + 1}</span>
                                <span className="step-label">{label}</span>
                            </div>
                        ))}
                    </div>

                    {rescheduleSourceAppointment && (
                        <div className="appointment-inline-banner info">
                            Reprogramezi cererea <strong>{rescheduleSourceAppointment.appointmentCode || rescheduleSourceAppointment.id}</strong>
                            {' '}({formatDate(new Date(rescheduleSourceAppointment.date))}, {rescheduleSourceAppointment.slotStart}-{rescheduleSourceAppointment.slotEnd}).
                        </div>
                    )}
                    {!rescheduleSourceId && activeUserAppointments.length > 0 && (
                        <div className="appointment-inline-banner warning">
                            Ai deja o programare activă. Pentru o nouă dată/oră, folosește <strong>Reprogramează</strong> din dashboard.
                        </div>
                    )}

                    {/* Appointment Form */}
                    <form className="appointment-form" onSubmit={handleSubmit} autoComplete="off">
                        <div className="appointment-summary-card">
                            <div className="appointment-summary-header">
                                <h3>Rezumat programare</h3>
                                <span className={`summary-chip ${rescheduleSourceId ? 'reschedule' : ''}`}>
                                {rescheduleSourceId ? 'Reprogramare' : 'Cerere nouă'}
                            </span>
                            </div>
                            <div className="appointment-summary-grid">
                                <div><span>Data</span><strong>{formData.selectedDate ? formatDate(formData.selectedDate) : 'Neselectată'}</strong></div>
                                <div><span>Interval</span><strong>{formData.selectedSlot ? `${formData.selectedSlot.startTime}-${formData.selectedSlot.endTime}` : 'Neselectat'}</strong></div>
                                <div><span>Locație</span><strong>{examSettings.appointmentLocation}</strong></div>
                                <div><span>Sală</span><strong>{examSettings.appointmentRoom}</strong></div>
                                <div><span>Lead time</span><strong>{examSettings.appointmentLeadTimeHours}h</strong></div>
                                <div><span>Capacitate/zi</span><strong>{selectedDateKey ? `${remainingAppointmentsForDay}/${currentDayCapacity} libere` : `${examSettings.appointmentsPerDay}/zi`}</strong></div>
                            </div>
                        </div>
                        <div className="form-grid">
                            {/* Date Selection Card */}
                            <div className="form-card">
                                <div className="card-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                                <h3>Selectați Data</h3>
                                <p className="card-description">
                                    Puteți programa examenul doar în zilele de <strong>Luni, Miercuri și Vineri</strong>.
                                </p>

                                <div className="form-group">
                                    <label htmlFor="examDate">
                                        Alege Data <span className="required">*</span>
                                    </label>
                                    <div className={`custom-date-picker ${errors.date ? 'error' : ''}`} ref={calendarPickerRef}>
                                        <button
                                            type="button"
                                            id="examDate"
                                            className={`date-trigger ${isCalendarOpen ? 'open' : ''}`}
                                            onClick={toggleCalendar}
                                            aria-haspopup="dialog"
                                            aria-expanded={isCalendarOpen}
                                            aria-controls="appointment-calendar-popover"
                                        >
                                            <span className={formData.selectedDate ? 'date-trigger-value' : 'date-trigger-placeholder'}>
                                                {formData.selectedDate ? selectedDateLabel : 'Selectați data programării'}
                                            </span>
                                            <svg className={`calendar-chevron ${isCalendarOpen ? 'open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </button>

                                        {isCalendarOpen && (
                                            <div
                                                className="calendar-popover"
                                                id="appointment-calendar-popover"
                                                role="dialog"
                                                aria-label="Calendar selecție dată"
                                            >
                                                <div className="calendar-popover-header">
                                                    <button
                                                        type="button"
                                                        className="calendar-nav-btn"
                                                        onClick={goToPreviousMonth}
                                                        disabled={!canNavigatePrevMonth}
                                                        aria-label="Luna anterioară"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <polyline points="15 18 9 12 15 6" />
                                                        </svg>
                                                    </button>

                                                    <strong className="calendar-month-label">
                                                        {getMonthName(calendarMonth)} {calendarMonth.getFullYear()}
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        className="calendar-nav-btn"
                                                        onClick={goToNextMonth}
                                                        disabled={!canNavigateNextMonth}
                                                        aria-label="Luna următoare"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <polyline points="9 18 15 12 9 6" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="calendar-week-row" aria-hidden="true">
                                                    {CALENDAR_WEEK_DAYS.map((dayLabel) => (
                                                        <span key={dayLabel}>{dayLabel}</span>
                                                    ))}
                                                </div>

                                                <div className="calendar-grid" role="grid">
                                                    {calendarDays.map((day) => {
                                                        const occupancyRatio = day.capacity > 0
                                                            ? (day.capacity - day.remaining) / day.capacity
                                                            : 1;
                                                        let statusClass = 'status-open';

                                                        if (day.isBlocked) statusClass = 'status-blocked';
                                                        else if (day.isFull) statusClass = 'status-full';
                                                        else if (!day.isAllowedWeekday || !day.isLeadTimeMet || !day.isWithinRange) statusClass = 'status-muted';
                                                        else if (occupancyRatio >= 0.8) statusClass = 'status-tight';

                                                        const tooltip = day.isBlocked
                                                            ? 'Zi blocată pentru programări.'
                                                            : !day.isWithinRange
                                                                ? `Alegeți între ${formatDate(minDate)} și ${formatDate(maxDate)}.`
                                                                : !day.isAllowedWeekday
                                                                    ? 'Programările sunt doar luni, miercuri și vineri.'
                                                                    : !day.isLeadTimeMet
                                                                        ? `Este necesar un lead time de ${examSettings.appointmentLeadTimeHours} ore.`
                                                                        : day.isFull
                                                                            ? `Zi complet rezervată (${day.capacity}/${day.capacity}).`
                                                                            : `${day.remaining}/${day.capacity} locuri libere.`;

                                                        return (
                                                            <button
                                                                key={day.dateKey}
                                                                type="button"
                                                                className={`calendar-day-cell ${day.inCurrentMonth ? '' : 'outside'} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''} ${statusClass}`}
                                                                onClick={() => handleCalendarDaySelect(day.dateKey)}
                                                                disabled={!day.selectable}
                                                                title={tooltip}
                                                                aria-label={`Selectează ${getDayName(day.date)} ${day.date.getDate()} ${getMonthName(day.date)} ${day.date.getFullYear()}`}
                                                                aria-selected={day.isSelected}
                                                            >
                                                                <span>{day.date.getDate()}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="calendar-legend" aria-hidden="true">
                                                    <span><i className="legend-dot legend-open" />Disponibilă</span>
                                                    <span><i className="legend-dot legend-tight" />Aproape plină</span>
                                                    <span><i className="legend-dot legend-full" />Completă</span>
                                                    <span><i className="legend-dot legend-blocked" />Blocată</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {errors.date && <span className="error-message">{errors.date}</span>}
                                    {formData.selectedDate && (
                                        <div className="selected-date-display">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            {getDayName(formData.selectedDate)}, {formData.selectedDate.getDate()} {getMonthName(formData.selectedDate)} {formData.selectedDate.getFullYear()}
                                        </div>
                                    )}
                                    {selectedBlockedEntry && (
                                        <span className="error-message">
                                        Zi blocată{selectedBlockedEntry.note ? `: ${selectedBlockedEntry.note}` : '.'}
                                    </span>
                                    )}
                                </div>

                                <div className="availability-preview">
                                    <div className="availability-preview-header">
                                        <strong>Zile disponibile (preview)</strong>
                                        <span>următoarele {availabilityPreviewDays.length}</span>
                                    </div>
                                    <div className="availability-preview-grid">
                                        {availabilityPreviewDays.map((day) => {
                                            const ratio = day.capacity > 0 ? day.occupied / day.capacity : 0;
                                            const statusClass = day.blocked
                                                ? 'blocked'
                                                : day.remaining === 0
                                                    ? 'full'
                                                    : ratio >= 0.8
                                                        ? 'tight'
                                                        : 'open';
                                            return (
                                                <button
                                                    key={day.dateKey}
                                                    type="button"
                                                    className={`availability-day ${statusClass} ${selectedDateKey === day.dateKey ? 'selected' : ''}`}
                                                    onClick={() => handleDateValueChange(day.dateKey)}
                                                    title={
                                                        day.blocked
                                                            ? `Blocată${day.blockedNote ? `: ${day.blockedNote}` : ''}`
                                                            : `${day.remaining}/${day.capacity} locuri libere`
                                                    }
                                                >
                                                    <span>{new Date(day.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })}</span>
                                                    <small>{day.blocked ? 'blocată' : `${day.remaining} lib.`}</small>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Time Slot Selection Card */}
                            <div className="form-card">
                                <div className="card-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <h3>Selectați Intervalul Orar</h3>
                                <p className="card-description">
                                    Alegeți intervalul orar care vi se potrivește pentru examen.
                                </p>
                                {formData.selectedDate && (
                                    <p className="card-description">
                                        Locuri rămase în ziua selectată: <strong>{remainingAppointmentsForDay}</strong> / {currentDayCapacity}
                                    </p>
                                )}

                                <div className="slot-filter-row">
                                    <div className="slot-filter-group" role="tablist" aria-label="Filtru intervale">
                                        <button type="button" className={slotFilter === 'all' ? 'active' : ''} onClick={() => setSlotFilter('all')}>Toate</button>
                                        <button type="button" className={slotFilter === 'midday' ? 'active' : ''} onClick={() => setSlotFilter('midday')}>Prânz</button>
                                        <button type="button" className={slotFilter === 'afternoon' ? 'active' : ''} onClick={() => setSlotFilter('afternoon')}>După-amiază</button>
                                    </div>
                                    <button
                                        type="button"
                                        className="slot-suggest-btn"
                                        onClick={() => recommendedSlot && handleSlotSelect(recommendedSlot.id)}
                                        disabled={!recommendedSlot}
                                    >
                                        Sugerează primul slot liber
                                    </button>
                                </div>

                                <div className="time-slots">
                                    {availableSlots.length === 0 && (
                                        <div className="slot-empty-note">
                                            Nu există intervale în filtrul selectat. Încearcă „Toate”.
                                        </div>
                                    )}
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            type="button"
                                            className={`time-slot ${formData.selectedSlot?.id === slot.id ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                                            onClick={() => handleSlotSelect(slot.id)}
                                            disabled={!slot.available}
                                        >
                                            <div className="slot-time">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                <span>{slot.startTime} - {slot.endTime}</span>
                                            </div>
                                            {formData.selectedSlot?.id === slot.id && (
                                                <div className="check-icon">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {errors.slot && <span className="error-message">{errors.slot}</span>}
                            </div>

                            {/* Personal Information Card */}
                            <div className="form-card full-width">
                                <div className="card-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <h3>Informații Personale</h3>
                                <p className="card-description">
                                    Introduceți datele dumneavoastră personale pentru confirmare.
                                </p>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fullName">
                                            Nume Complet <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            className={`text-input ${errors.fullName ? 'error' : ''}`}
                                            placeholder="Ex: Ion Popescu"
                                            value={formData.fullName}
                                            onChange={(e) => {
                                                setFormData({ ...formData, fullName: e.target.value });
                                                setErrors({ ...errors, fullName: undefined });
                                            }}
                                        />
                                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="idOrPhone">
                                            Număr de Telefon <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="idOrPhone"
                                            className={`text-input ${errors.idOrPhone ? 'error' : ''}`}
                                            placeholder="Ex: 691234567"
                                            inputMode="numeric"
                                            pattern="\d{9}"
                                            maxLength={9}
                                            value={formData.idOrPhone}
                                            onChange={(e) => {
                                                const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
                                                setFormData({ ...formData, idOrPhone: onlyDigits });
                                                setErrors({ ...errors, idOrPhone: undefined });
                                            }}
                                        />
                                        {errors.idOrPhone && <span className="error-message">{errors.idOrPhone}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Important Information */}
                        <div className="info-box">
                            <div className="info-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            </div>
                            <div className="info-content">
                                <h4>Informații Importante</h4>
                                <ul>
                                    <li>Examenul durează aproximativ {examSettings.testDurationMinutes} minute</li>
                                    <li>Limită zilnică configurată de admin: {examSettings.appointmentsPerDay} programări</li>
                                    <li>Programarea se face cu minim {examSettings.appointmentLeadTimeHours} ore înainte</li>
                                    <li>Maxim {examSettings.maxReschedulesPerUser} reprogramări pentru aceeași cerere</li>
                                    <li>Cooldown după respingere: {examSettings.rejectionCooldownDays} zile</li>
                                    <li>Locație examen: {examSettings.appointmentLocation}, {examSettings.appointmentRoom}</li>
                                    <li>Vă rugăm să vă prezentați cu 15 minute înainte de ora programării</li>
                                    <li>Este necesar să aveți actul de identitate asupra dumneavoastră</li>
                                    <li>Statusul se actualizează în dashboard și prin notificări in-app</li>
                                </ul>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Se procesează...
                                    </>
                                ) : (
                                    <>
                                        {rescheduleSourceId ? 'Trimite Reprogramarea' : 'Confirmă Programarea'}
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AppointmentPage;
