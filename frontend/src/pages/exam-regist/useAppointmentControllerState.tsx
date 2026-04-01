import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm, useFormState, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AppointmentFormData, FormErrors, TimeSlot } from '../../types/appointment';
import { useAuth } from '../../hooks/useAuth';
import { useStorageSync } from '../../hooks/useStorageSync';
import { useAppointmentDraft } from '../../hooks/useAppointmentDraft';
import type { AdminAppointmentRecord } from '../../features/admin/types';
import { readAppointments, readExamSettings, STORAGE_KEYS } from '../../features/admin/storage';
import { clampMonth as clampMonthToRange, startOfMonth } from '../../utils/calendarUtils';
import type { SlotFilter } from './AppointmentStep3Slots';
import type { AppointmentWizardTab } from './appointmentController.constants';
import {
    buildAppointmentSchema,
    type AppointmentFormValues,
    type AppointmentValidationContext,
} from '../../schemas/appointmentSchema';

export const useAppointmentControllerState = () => {
    const { user } = useAuth();
    const location = useLocation();
    const { getRescheduleSourceId, clearDraft } = useAppointmentDraft();

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
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastUnavailableSlotId, setLastUnavailableSlotId] = useState<string | null>(null);
    const calendarPickerRef = useRef<HTMLDivElement | null>(null);
    const previousUserEmailRef = useRef<string | null>(user?.email ? user.email.trim().toLowerCase() : null);

    const minDate = useMemo(() => new Date(2026, 0, 1), []);
    const maxDate = useMemo(() => new Date(2050, 11, 31), []);

    const validationContextRef = useRef<AppointmentValidationContext>({
        examSettings,
        appointments,
        rescheduleSourceId: null,
        allowedWeekdayNames: '',
        activeUserAppointments: [],
        userAppointments: [],
        lastRejectedUserAppointment: null,
        allAvailableSlots: [],
        lastUnavailableSlotId: null,
    });

    const setValidationContext = useCallback((context: AppointmentValidationContext) => {
        validationContextRef.current = context;
    }, []);

    const resolver = useCallback<Resolver<AppointmentFormValues>>(
        (values, context, options) => {
            const schema = buildAppointmentSchema(validationContextRef.current);
            return zodResolver(schema)(values, context, options) as ReturnType<Resolver<AppointmentFormValues>>;
        },
        []
    );

    const form = useForm<AppointmentFormValues>({
        resolver,
        defaultValues: {
            fullName: user?.fullName || '',
            idOrPhone: '',
            selectedDate: null,
            selectedSlot: null,
        },
        reValidateMode: 'onChange',
    });

    const { errors: formErrors } = useFormState({ control: form.control });
    const watchedValues = useWatch<AppointmentFormValues>({ control: form.control });

    const normalizedSelectedSlot: TimeSlot | null = useMemo(() => {
        const slot = watchedValues.selectedSlot;
        if (
            slot &&
            typeof slot.id === 'string' &&
            typeof slot.startTime === 'string' &&
            typeof slot.endTime === 'string' &&
            typeof slot.available === 'boolean'
        ) {
            return {
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                available: slot.available,
            };
        }
        return null;
    }, [watchedValues.selectedSlot]);

    const formData: AppointmentFormData = useMemo(
        () => ({
            fullName: watchedValues.fullName ?? '',
            idOrPhone: watchedValues.idOrPhone ?? '',
            selectedDate: watchedValues.selectedDate ?? null,
            selectedSlot: normalizedSelectedSlot,
        }),
        [normalizedSelectedSlot, watchedValues.fullName, watchedValues.idOrPhone, watchedValues.selectedDate]
    );

    const errors: FormErrors = {
        fullName: formErrors.fullName?.message,
        idOrPhone: formErrors.idOrPhone?.message,
        date: formErrors.selectedDate?.message,
        slot: formErrors.selectedSlot?.message,
    };

    useStorageSync([STORAGE_KEYS.settings, STORAGE_KEYS.appointments], () => {
        setExamSettings(readExamSettings());
        setAppointments(readAppointments());
    });

    useEffect(() => {
        if (!user?.fullName) return;
        const current = form.getValues('fullName');
        if (current) return;
        form.setValue('fullName', user.fullName, { shouldValidate: true, shouldDirty: false });
    }, [form, user?.fullName]);

    useEffect(() => {
        const currentUserEmail = user?.email ? user.email.trim().toLowerCase() : null;
        const previousUserEmail = previousUserEmailRef.current;

        if (previousUserEmail && previousUserEmail !== currentUserEmail) {
            form.reset({ fullName: '', idOrPhone: '', selectedDate: null, selectedSlot: null });
            form.clearErrors();
            setSubmitMessage('');
            setSubmittedAppointment(null);
            setRescheduleSourceId(null);
            setActiveTab(1);
            setLastUnavailableSlotId(null);
            clearDraft();
        }

        previousUserEmailRef.current = currentUserEmail;
    }, [clearDraft, form, user?.email]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const rescheduleIdFromQuery = searchParams.get('reschedule');
        const sourceId = rescheduleIdFromQuery || getRescheduleSourceId();
        if (sourceId) setRescheduleSourceId(sourceId);
    }, [getRescheduleSourceId, location.search]);

    useEffect(() => {
        if (!isSubmitted) return;
        clearDraft();
    }, [clearDraft, isSubmitted]);

    return {
        user,
        clearDraft,
        form,
        formData,
        errors,
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
        setValidationContext,
        lastUnavailableSlotId,
        setLastUnavailableSlotId,
    };
};
