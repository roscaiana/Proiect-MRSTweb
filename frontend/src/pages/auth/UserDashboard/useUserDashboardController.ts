import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useStorageSync } from "../../../hooks/useStorageSync";
import type { UpdateUserProfileInput } from "../../../types/user";
import type { AdminAppointmentRecord } from "../../../features/admin/types";
import { notifyAdmins, notifyUser } from "../../../utils/appEventNotifications";
import {
    readAppointments,
    readExamSettings,
    readQuizHistory,
    STORAGE_KEYS,
    writeAppointments,
} from "../../../features/admin/storage";

const APPOINTMENT_RESCHEDULE_KEY = "appointmentRescheduleDraft";
const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;
const APPOINTMENTS_PREVIEW_COUNT = 2;

export type PackagePerformanceItem = {
    name: string;
    shortName: string;
    attempts: number;
    averageScore: number;
    passRate: number;
    isGood: boolean;
};

export const useUserDashboardController = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const [quizHistory, setQuizHistory] = useState(() => readQuizHistory());
    const [examSettings, setExamSettings] = useState(() => readExamSettings());
    const [passThreshold, setPassThreshold] = useState(() => readExamSettings().passingThreshold);
    const [appointments, setAppointments] = useState(() => readAppointments());

    const [profileDraft, setProfileDraft] = useState<UpdateUserProfileInput>({
        fullName: "",
        nickname: "",
        email: "",
        phoneNumber: "",
        avatarDataUrl: "",
    });
    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

    useStorageSync([STORAGE_KEYS.quizHistory, STORAGE_KEYS.settings, STORAGE_KEYS.appointments], () => {
        setQuizHistory(readQuizHistory());
        const settings = readExamSettings();
        setExamSettings(settings);
        setPassThreshold(settings.passingThreshold);
        setAppointments(readAppointments());
    });

    useEffect(() => {
        if (!user) return;
        setProfileDraft({
            fullName: user.fullName || "",
            nickname: user.nickname || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            avatarDataUrl: user.avatarDataUrl || "",
        });
        setProfileMessage("");
        setProfileError("");
        setIsProfileEditorOpen(false);
    }, [user]);

    const userQuizHistory = useMemo(
        () => (!user?.email ? [] : quizHistory.filter((entry) => entry.userEmail === user.email)),
        [quizHistory, user?.email]
    );
    const sortedUserQuizHistory = useMemo(
        () => [...userQuizHistory].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()),
        [userQuizHistory]
    );

    const userAppointments = useMemo(() => {
        if (!user?.email) return [];
        return appointments
            .filter((appointment) => appointment.userEmail === user.email)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [appointments, user?.email]);

    const visibleAppointments = useMemo(
        () => userAppointments.slice(0, APPOINTMENTS_PREVIEW_COUNT),
        [userAppointments]
    );

    const packagePerformance = useMemo<PackagePerformanceItem[]>(() => {
        const grouped = new Map<string, { name: string; attempts: number; totalScore: number; passed: number }>();

        sortedUserQuizHistory.forEach((attempt: any) => {
            const name = (attempt.categoryTitle || "Test general").trim();
            const current = grouped.get(name) || { name, attempts: 0, totalScore: 0, passed: 0 };
            current.attempts += 1;
            current.totalScore += attempt.score;
            if (attempt.score >= passThreshold) current.passed += 1;
            grouped.set(name, current);
        });

        return Array.from(grouped.values())
            .map((item) => {
                const averageScore = Math.round(item.totalScore / item.attempts);
                return {
                    name: item.name,
                    shortName: item.name.length > 14 ? `${item.name.slice(0, 12)}...` : item.name,
                    attempts: item.attempts,
                    averageScore,
                    passRate: Math.round((item.passed / item.attempts) * 100),
                    isGood: averageScore >= passThreshold,
                };
            })
            .sort((a, b) => b.averageScore - a.averageScore);
    }, [sortedUserQuizHistory, passThreshold]);

    const overallPassRate = useMemo(() => {
        if (!sortedUserQuizHistory.length) return 0;
        const passedAttempts = sortedUserQuizHistory.filter((attempt: any) => attempt.score >= passThreshold).length;
        return Math.round((passedAttempts / sortedUserQuizHistory.length) * 100);
    }, [sortedUserQuizHistory, passThreshold]);

    const bestPackage = useMemo(
        () => (packagePerformance.length ? packagePerformance[packagePerformance.length - 1] : null),
        [packagePerformance]
    );

    const profileDisplayName = (user?.nickname || user?.fullName || "Utilizator").trim();
    const profileAvatarPreview = (profileDraft.avatarDataUrl || user?.avatarDataUrl || "").trim();
    const profileAvatarInitial = (profileDisplayName || user?.email || "U").charAt(0).toUpperCase();

    const canCancelAppointment = (status: string) => status === "pending" || status === "approved";
    const canRescheduleAppointment = (appointment: any) =>
        (appointment.status === "pending" || appointment.status === "approved") &&
        (appointment.rescheduleCount || 0) < examSettings.maxReschedulesPerUser;

    const handleCancelAppointment = (appointmentId: string) => {
        const target = appointments.find((appointment) => appointment.id === appointmentId);
        if (!target) return;

        const updatedAt = new Date().toISOString();
        const nextAppointments: AdminAppointmentRecord[] = appointments.map((appointment) =>
            appointment.id === appointmentId
                ? {
                      ...appointment,
                      status: "cancelled",
                      cancelledBy: "user",
                      statusReason: "Anulată din dashboard de utilizator",
                      updatedAt,
                  }
                : appointment
        );

        writeAppointments(nextAppointments);
        setAppointments(nextAppointments);

        notifyUser(user?.email, {
            title: "Programare anulată",
            message: `Programarea ${target.appointmentCode || ""} a fost anulată din dashboard.`,
            link: "/dashboard",
            tag: `appointment-cancelled-user-${appointmentId}-${updatedAt}`,
        });
        notifyAdmins({
            title: "Programare anulată de utilizator",
            message: `Cererea ${target.appointmentCode || ""} (${target.fullName}) a fost anulată din dashboard.`,
            link: "/admin/appointments",
            tag: `admin-appointment-cancelled-user-${appointmentId}-${updatedAt}`,
        });
    };

    const handleRescheduleAppointment = (appointmentId: string) => {
        localStorage.setItem(
            APPOINTMENT_RESCHEDULE_KEY,
            JSON.stringify({ appointmentId, createdAt: new Date().toISOString() })
        );
        navigate(`/appointment?reschedule=${encodeURIComponent(appointmentId)}`);
    };

    const handleProfileFieldChange = (field: keyof UpdateUserProfileInput, value: string) => {
        setProfileError("");
        setProfileMessage("");
        setProfileDraft((prev) => ({ ...prev, [field]: value }));
    };

    const resetProfileDraft = () => {
        if (!user) return;
        setProfileDraft({
            fullName: user.fullName || "",
            nickname: user.nickname || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            avatarDataUrl: user.avatarDataUrl || "",
        });
        setProfileError("");
        setProfileMessage("");
        if (avatarInputRef.current) avatarInputRef.current.value = "";
    };

    const handleProfileAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setProfileError("Selectează un fișier imagine valid");
            event.target.value = "";
            return;
        }
        if (file.size > MAX_AVATAR_FILE_SIZE) {
            setProfileError("Imaginea este prea mare (maxim 2MB)");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => handleProfileFieldChange("avatarDataUrl", typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => setProfileError("Nu am putut încărca imaginea selectată");
        reader.readAsDataURL(file);
    };

    const handleRemoveProfileAvatar = () => {
        handleProfileFieldChange("avatarDataUrl", "");
        if (avatarInputRef.current) avatarInputRef.current.value = "";
    };

    const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) return;
        setProfileError("");
        setProfileMessage("");
        setIsProfileSaving(true);
        try {
            await updateProfile({
                fullName: profileDraft.fullName,
                nickname: profileDraft.nickname,
                email: profileDraft.email,
                phoneNumber: profileDraft.phoneNumber,
                avatarDataUrl: profileDraft.avatarDataUrl,
            });
            setProfileMessage("Profilul a fost actualizat.");
            setIsProfileEditorOpen(false);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        } catch (error: any) {
            setProfileError(error?.message || "Nu am putut actualiza profilul.");
        } finally {
            setIsProfileSaving(false);
        }
    };

    return {
        user,
        avatarInputRef,
        examSettings,
        userQuizHistory,
        sortedUserQuizHistory,
        userAppointments,
        visibleAppointments,
        hasMoreAppointments: userAppointments.length > APPOINTMENTS_PREVIEW_COUNT,
        packagePerformance,
        overallPassRate,
        bestPackage,
        profileDraft,
        profileMessage,
        profileError,
        isProfileSaving,
        isProfileEditorOpen,
        setIsProfileEditorOpen,
        profileDisplayName,
        profileAvatarPreview,
        profileAvatarInitial,
        canCancelAppointment,
        canRescheduleAppointment,
        handleCancelAppointment,
        handleRescheduleAppointment,
        handleProfileFieldChange,
        resetProfileDraft,
        handleProfileAvatarChange,
        handleRemoveProfileAvatar,
        handleProfileSave,
        passThreshold,
    };
};
