import { User } from '../types/user';
import { buildNotificationStorageKey, readNotifications, saveNotifications } from './notificationUtils';
import { emitStorageUpdate, emitNotificationsUpdated } from './storageEvents';

const USERS_STORAGE_KEY = 'users';
const SESSION_FORM_KEYS = ['appointmentFormDraft', 'appointmentRescheduleDraft'];

type AuthStorageUser = {
    email?: string;
    role?: 'admin' | 'manager' | 'user';
};

const readArray = (raw: string | null): Array<Record<string, unknown>> => {
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null);
    } catch {
        return [];
    }
};

const migrateArrayUserEmail = (storageKey: string, oldEmail: string, newEmail: string): void => {
    if (oldEmail === newEmail) {
        return;
    }

    const raw = localStorage.getItem(storageKey);
    if (!raw) {
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return;
        }

        let changed = false;
        const next = parsed.map((item) => {
            if (!item || typeof item !== 'object' || item.userEmail !== oldEmail) {
                return item;
            }

            changed = true;
            return { ...item, userEmail: newEmail };
        });

        if (changed) {
            localStorage.setItem(storageKey, JSON.stringify(next));
            emitStorageUpdate(storageKey);
        }
    } catch {
        // Ignore malformed storage payloads.
    }
};

const migrateNotificationStorage = (role: 'user' | 'manager' | 'admin', oldEmail: string, newEmail: string): void => {
    if (oldEmail === newEmail) {
        return;
    }

    const oldKey = buildNotificationStorageKey(role, oldEmail);
    const newKey = buildNotificationStorageKey(role, newEmail);

    if (oldKey === newKey) {
        return;
    }

    const oldNotifications = readNotifications(oldKey);
    const existingNotifications = readNotifications(newKey);

    if (oldNotifications.length === 0 && existingNotifications.length === 0) {
        localStorage.removeItem(oldKey);
        return;
    }

    const seen = new Set<string>();
    const merged = [...oldNotifications, ...existingNotifications].filter((notification) => {
        const dedupeKey = notification.tag?.trim() || notification.id;

        if (seen.has(dedupeKey)) {
            return false;
        }

        seen.add(dedupeKey);
        return true;
    });

    saveNotifications(newKey, merged.slice(0, 100));
    localStorage.removeItem(oldKey);
    emitNotificationsUpdated(newKey);
    emitNotificationsUpdated(oldKey);
};

const getStoredUsers = (): User[] => {
    const stored = readArray(localStorage.getItem(USERS_STORAGE_KEY));

    return stored.map((user, index) => {
        const id = typeof user.id === 'string' ? user.id : `user-${index + 1}`;
        const email = typeof user.email === 'string' ? user.email : '';
        const fullName = typeof user.fullName === 'string'
            ? user.fullName
            : typeof user.name === 'string'
                ? user.name
                : 'Utilizator';
        const nickname = typeof user.nickname === 'string' ? user.nickname : undefined;
        const phoneNumber = typeof user.phoneNumber === 'string' ? user.phoneNumber : undefined;
        const avatarDataUrl = typeof user.avatarDataUrl === 'string' ? user.avatarDataUrl : undefined;
        const role = user.role === 'admin' ? 'admin' : 'user';
        const createdAtValue =
            typeof user.createdAt === 'string' || typeof user.createdAt === 'number'
                ? user.createdAt
                : undefined;
        const createdAt = createdAtValue ? new Date(createdAtValue) : new Date();
        const isBlocked = Boolean(user.isBlocked);
        const lastLoginAt =
            typeof user.lastLoginAt === 'string' || typeof user.lastLoginAt === 'number'
                ? new Date(user.lastLoginAt).toISOString()
                : undefined;

        return {
            id,
            email,
            fullName,
            nickname,
            phoneNumber,
            avatarDataUrl,
            role,
            createdAt,
            isBlocked,
            lastLoginAt,
        };
    });
};

export const storeAuthState = (user: User, token: string): void => {
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
};

export const getAuthState = (): { user: User | null; token: string | null } => {
    const userStr = localStorage.getItem('authUser');
    const token = localStorage.getItem('authToken');

    if (!userStr || !token) {
        return { user: null, token: null };
    }

    try {
        const user = JSON.parse(userStr);
        const normalizedRole =
            user.role === 'admin' ? 'admin' : user.role === 'manager' ? 'manager' : 'user';
        return { user: { ...user, role: normalizedRole, createdAt: new Date(user.createdAt) }, token };
    } catch {
        return { user: null, token: null };
    }
};

export const clearAuthState = (): void => {
    const rawAuthUser = localStorage.getItem('authUser');

    if (rawAuthUser) {
        try {
            const parsed = JSON.parse(rawAuthUser) as AuthStorageUser;
            const normalizedEmail = typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : '';
            const normalizedRole =
                parsed.role === 'admin' ? 'admin' : parsed.role === 'manager' ? 'manager' : parsed.role === 'user' ? 'user' : '';

            if (normalizedEmail && normalizedRole) {
                localStorage.removeItem(`notifications_${normalizedRole}_${normalizedEmail}`);
            }
        } catch {
            // ignore malformed auth payload
        }
    }

    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    SESSION_FORM_KEYS.forEach((key) => localStorage.removeItem(key));
};
