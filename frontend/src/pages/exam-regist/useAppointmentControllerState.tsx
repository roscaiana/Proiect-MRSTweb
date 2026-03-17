import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppointmentFormData, FormErrors } from '../../types/appointment';
import { useAuth } from '../../hooks/useAuth';
import { useStorageSync } from '../../hooks/useStorageSync';
import { useAppointmentDraft } from '../../hooks/useAppointmentDraft';
import type { AdminAppointmentRecord } from '../../features/admin/types';
import { readAppointments, readExamSettings, STORAGE_KEYS } from '../../features/admin/storage';
import { clampMonth as clampMonthToRange, startOfMonth } from '../../utils/calendarUtils';
import type { SlotFilter } from './AppointmentStep3Slots';
import type { AppointmentWizardTab } from './appointmentController.constants';

export const useAppointmentControllerState = () => {
    const { user } = useAuth();
    const location = useLocation();
    const { getRescheduleSourceId, clearDraft } = useAppointmentDraft();

    const [formData, setFormData] = useState<AppointmentFormData>({
        fullName: user?.fullName || '',
        idOrPhone: '',
        selectedDate: null,
        selectedSlot: null,
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
    const [activeTab, setActiveTab] = useState<AppointmentWizardTab>(1);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
        clampMonthToRange(startOfMonth(new Date()), new Date(2026, 0, 1), new Date(2050, 11, 31))
    );
    const calendarPickerRef = useRef<HTMLDivElement | null>(null);
    const previousUserEmailRef = useRef<string | null>(user?.email ? user.email.trim().toLowerCase() : null);

    const minDate = useMemo(() => new Date(2026, 0, 1), []);
    const maxDate = useMemo(() => new Date(2050, 11, 31), []);

    useStorageSync([STORAGE_KEYS.settings, STORAGE_KEYS.appointments], () => {
        setExamSettings(readExamSettings());
        setAppointments(readAppointments());
    });

    useEffect(() => {
        if (!user?.fullName) return;
        setFormData((prev) => (prev.fullName ? prev : { ...prev, fullName: user.fullName }));
    }, [user?.fullName]);

    useEffect(() => {
        const currentUserEmail = user?.email ? user.email.trim().toLowerCase() : null;
        const previousUserEmail = previousUserEmailRef.current;

        if (previousUserEmail && previousUserEmail !== currentUserEmail) {
            setFormData({ fullName: '', idOrPhone: '', selectedDate: null, selectedSlot: null });
            setErrors({});
            setSubmitMessage('');
            setSubmittedAppointment(null);
            setRescheduleSourceId(null);
            setActiveTab(1);
            clearDraft();
        }

        previousUserEmailRef.current = currentUserEmail;
    }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const rescheduleIdFromQuery = searchParams.get('reschedule');
        const sourceId = rescheduleIdFromQuery || getRescheduleSourceId();
        if (sourceId) setRescheduleSourceId(sourceId);
    }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isSubmitted) return;
        clearDraft();
    }, [isSubmitted]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        user,
        clearDraft,
        formData,
        setFormData,
        errors,
        setErrors,
        isSubmitted,
        setIsSubmitted,
        isSubmitting,
        setIsSubmitting,
        examSettings,
        setExamSettings,
        appointments,
        setAppointments,
        slotFilter,
        setSlotFilter,
        submitMessage,
        setSubmitMessage,
        submittedAppointment,
        setSubmittedAppointment,
        rescheduleSourceId,
        setRescheduleSourceId,
        activeTab,
        setActiveTab,
        isCalendarOpen,
        setIsCalendarOpen,
        calendarMonth,
        setCalendarMonth,
        calendarPickerRef,
        minDate,
        maxDate,
    };
};
