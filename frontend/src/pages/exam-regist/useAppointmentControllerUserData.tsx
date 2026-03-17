import { useMemo } from 'react';
import type { AdminAppointmentRecord } from '../../features/admin/types';

type UseAppointmentControllerUserDataParams = {
    userEmail: string | undefined;
    appointments: AdminAppointmentRecord[];
    rescheduleSourceId: string | null;
};

export const useAppointmentControllerUserData = ({
    userEmail,
    appointments,
    rescheduleSourceId,
}: UseAppointmentControllerUserDataParams) => {
    const userAppointments = useMemo(() => {
        if (!userEmail) return [];
        const normalizedEmail = userEmail.trim().toLowerCase();
        return appointments.filter((appointment) => appointment.userEmail?.trim().toLowerCase() === normalizedEmail);
    }, [appointments, userEmail]);

    const activeUserAppointments = useMemo(
        () => userAppointments.filter((appointment) => appointment.status === 'pending' || appointment.status === 'approved'),
        [userAppointments]
    );

    const lastRejectedUserAppointment = useMemo(() => {
        return [...userAppointments]
            .filter((appointment) => appointment.status === 'rejected')
            .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0] || null;
    }, [userAppointments]);

    const rescheduleSourceAppointment = useMemo(
        () => (rescheduleSourceId ? appointments.find((appointment) => appointment.id === rescheduleSourceId) || null : null),
        [appointments, rescheduleSourceId]
    );

    return {
        userAppointments,
        activeUserAppointments,
        lastRejectedUserAppointment,
        rescheduleSourceAppointment,
    };
};
