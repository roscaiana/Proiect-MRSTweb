import {
    User,
    AuthCredentials,
    RegisterData,
    UpdateUserProfileInput,
} from '../types/user';
import { buildNotificationStorageKey, readNotifications, saveNotifications } from './notificationUtils';
import { emitStorageUpdate, emitNotificationsUpdated } from './storageEvents';
import { buildUpdateProfileSchema } from '../schemas/profileSchema';

const ADMIN_EMAIL = 'admin@electoral.md';
const ADMIN_PASSWORD = 'admin123';
const USERS_STORAGE_KEY = 'users';
const SESSION_FORM_KEYS = ['appointmentFormDraft', 'appointmentRescheduleDraft'];

type AuthStorageUser = {
    email?: string;
    role?: 'admin' | 'user';
};

const normalizeComparableEmail = (value: string): string => value.trim().toLowerCase();

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

const migrateNotificationStorage = (role: 'user' | 'admin', oldEmail: string, newEmail: string): void => {
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

export const mockLogin = async (credentials: AuthCredentials): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (normalizeComparableEmail(credentials.email) === normalizeComparableEmail(ADMIN_EMAIL) && credentials.password === ADMIN_PASSWORD) {
        return {
            id: 'admin-1',
            email: ADMIN_EMAIL,
            fullName: 'Administrator',
            role: 'admin',
            createdAt: new Date(),
            isBlocked: false
        };
    }

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => normalizeComparableEmail(u.email) === normalizeComparableEmail(credentials.email));
    const user = userIndex >= 0 ? users[userIndex] : undefined;

    if (!user) {
        throw new Error('Email-ul nu este înregistrat');
    }

    if (user.isBlocked) {
        throw new Error('Contul este blocat. Contactează administratorul.');
    }

    const storedPassword = localStorage.getItem(`password_${user.email}`);
    if (storedPassword !== credentials.password) {
        throw new Error('Parola incorectă');
    }

    const updatedUser: User = {
        ...user,
        lastLoginAt: new Date()
    };
    users[userIndex] = updatedUser;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    emitStorageUpdate(USERS_STORAGE_KEY);

    return updatedUser;
};

export const mockRegister = async (data: RegisterData): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = getStoredUsers();
    if (users.some(u => normalizeComparableEmail(u.email) === normalizeComparableEmail(data.email))) {
        throw new Error('Acest email este deja înregistrat');
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        fullName: data.fullName,
        role: 'user',
        createdAt: new Date(),
        isBlocked: false
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    emitStorageUpdate(USERS_STORAGE_KEY);
    localStorage.setItem(`password_${data.email}`, data.password);

    return newUser;
};

export const updateMockUserProfile = async (
    currentEmail: string,
    data: UpdateUserProfileInput
): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const users = getStoredUsers();
    const schema = buildUpdateProfileSchema(currentEmail, users, ADMIN_EMAIL);
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message || 'Date invalide';
        throw new Error(message);
    }

    const trimmedFullName = parsed.data.fullName;
    const trimmedNickname = parsed.data.nickname?.trim() || '';
    const trimmedEmail = parsed.data.email;
    const trimmedPhoneNumber = parsed.data.phoneNumber?.trim() || '';
    const trimmedAvatar = parsed.data.avatarDataUrl?.trim() || '';

    const userIndex = users.findIndex(
        (candidate) => normalizeComparableEmail(candidate.email) === normalizeComparableEmail(currentEmail)
    );

    if (userIndex < 0) {
        throw new Error('Utilizatorul nu a fost găsit');
    }

    const previousUser = users[userIndex];
    const previousEmail = previousUser.email;

    const updatedUser: User = {
        ...previousUser,
        fullName: trimmedFullName,
        nickname: trimmedNickname || undefined,
        email: trimmedEmail,
        phoneNumber: trimmedPhoneNumber || undefined,
        avatarDataUrl: trimmedAvatar || undefined,
    };

    users[userIndex] = updatedUser;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    emitStorageUpdate(USERS_STORAGE_KEY);

    if (previousEmail !== trimmedEmail) {
        const previousPasswordKey = `password_${previousEmail}`;
        const nextPasswordKey = `password_${trimmedEmail}`;
        const storedPassword = localStorage.getItem(previousPasswordKey);

        if (storedPassword !== null) {
            localStorage.setItem(nextPasswordKey, storedPassword);

            if (previousPasswordKey !== nextPasswordKey) {
                localStorage.removeItem(previousPasswordKey);
            }
        }

        migrateArrayUserEmail('appointments', previousEmail, trimmedEmail);
        migrateArrayUserEmail('quizHistory', previousEmail, trimmedEmail);
        migrateNotificationStorage('user', previousEmail, trimmedEmail);
    }

    return updatedUser;
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
        return { user: { ...user, createdAt: new Date(user.createdAt) }, token };
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
            const normalizedRole = parsed.role === 'admin' ? 'admin' : parsed.role === 'user' ? 'user' : '';

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
