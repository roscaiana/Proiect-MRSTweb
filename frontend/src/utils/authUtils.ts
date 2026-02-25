import {
    User,
    AuthCredentials,
    RegisterData,
    AuthError,
    UpdateUserProfileInput,
} from '../types/user';
import { buildNotificationStorageKey, readNotifications, saveNotifications } from './notificationUtils';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mock admin credentials
const ADMIN_EMAIL = 'admin@electoral.md';
const ADMIN_PASSWORD = 'admin123';
const USERS_STORAGE_KEY = 'users';
const SESSION_FORM_KEYS = ['appointmentFormDraft', 'appointmentRescheduleDraft'];
const PHONE_REGEX = /^[0-9+\s()-]{6,20}$/;

type AuthStorageUser = {
    email?: string;
    role?: 'admin' | 'user';
};

const emitStorageUpdate = (key: string): void => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-storage-updated', { detail: { key } }));
    }
};

const emitNotificationsUpdated = (storageKey: string): void => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { storageKey } }));
    }
};

const normalizeComparableEmail = (value: string): string => value.trim().toLowerCase();

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

// Validate email format
export const validateEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
};

// Validate password strength (minimum 6 characters)
export const validatePassword = (password: string): boolean => {
    return password.length >= 6;
};

// Validate registration form
export const validateRegistration = (data: RegisterData): AuthError[] => {
    const errors: AuthError[] = [];

    if (!data.fullName.trim()) {
        errors.push({ field: 'fullName', message: 'Numele complet este obligatoriu' });
    } else if (data.fullName.trim().length < 3) {
        errors.push({ field: 'fullName', message: 'Numele trebuie să conțină cel puțin 3 caractere' });
    }

    if (!data.email.trim()) {
        errors.push({ field: 'email', message: 'Email-ul este obligatoriu' });
    } else if (!validateEmail(data.email)) {
        errors.push({ field: 'email', message: 'Format de email invalid (ex: utilizator@exemplu.com)' });
    }

    if (!data.password) {
        errors.push({ field: 'password', message: 'Parola este obligatorie' });
    } else if (!validatePassword(data.password)) {
        errors.push({ field: 'password', message: 'Parola trebuie să conțină cel puțin 6 caractere' });
    }

    if (!data.confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Confirmarea parolei este obligatorie' });
    } else if (data.password !== data.confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Parolele nu coincid' });
    }

    return errors;
};

// Validate login form
export const validateLogin = (data: AuthCredentials): AuthError[] => {
    const errors: AuthError[] = [];

    if (!data.email.trim()) {
        errors.push({ field: 'email', message: 'Email-ul este obligatoriu' });
    } else if (!validateEmail(data.email)) {
        errors.push({ field: 'email', message: 'Format de email invalid' });
    }

    if (!data.password) {
        errors.push({ field: 'password', message: 'Parola este obligatorie' });
    }

    return errors;
};

// Mock login function
export const mockLogin = async (credentials: AuthCredentials): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check admin credentials
    if (credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
        return {
            id: 'admin-1',
            email: ADMIN_EMAIL,
            fullName: 'Administrator',
            role: 'admin',
            createdAt: new Date(),
            isBlocked: false
        };
    }

    // Check user credentials from localStorage
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.email === credentials.email);
    const user = userIndex >= 0 ? users[userIndex] : undefined;

    if (!user) {
        throw new Error('Email-ul nu este înregistrat');
    }

    if (user.isBlocked) {
        throw new Error('Contul este blocat. Contactează administratorul.');
    }

    // In a real app, we'd hash and compare passwords
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

// Mock register function
export const mockRegister = async (data: RegisterData): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists
    const users = getStoredUsers();
    if (users.some(u => u.email === data.email)) {
        throw new Error('Acest email este deja înregistrat');
    }

    // Create new user
    const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        fullName: data.fullName,
        role: 'user',
        createdAt: new Date(),
        isBlocked: false
    };

    // Store user and password
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

    const trimmedFullName = data.fullName.trim();
    const trimmedNickname = data.nickname?.trim() || '';
    const trimmedEmail = data.email.trim();
    const trimmedPhoneNumber = data.phoneNumber?.trim() || '';
    const trimmedAvatar = data.avatarDataUrl?.trim() || '';

    if (!trimmedFullName) {
        throw new Error('Numele este obligatoriu');
    }

    if (trimmedFullName.length < 3) {
        throw new Error('Numele trebuie să conțină cel puțin 3 caractere');
    }

    if (!trimmedEmail) {
        throw new Error('Email-ul este obligatoriu');
    }

    if (!validateEmail(trimmedEmail)) {
        throw new Error('Format de email invalid');
    }

    if (trimmedPhoneNumber && !PHONE_REGEX.test(trimmedPhoneNumber)) {
        throw new Error('Număr de telefon invalid');
    }

    if (
        normalizeComparableEmail(trimmedEmail) === normalizeComparableEmail(ADMIN_EMAIL) &&
        normalizeComparableEmail(currentEmail) !== normalizeComparableEmail(ADMIN_EMAIL)
    ) {
        throw new Error('Acest email este rezervat');
    }

    const users = getStoredUsers();
    const userIndex = users.findIndex(
        (candidate) => normalizeComparableEmail(candidate.email) === normalizeComparableEmail(currentEmail)
    );

    if (userIndex < 0) {
        throw new Error('Utilizatorul nu a fost găsit');
    }

    const duplicate = users.find(
        (candidate, index) =>
            index !== userIndex &&
            normalizeComparableEmail(candidate.email) === normalizeComparableEmail(trimmedEmail)
    );

    if (duplicate) {
        throw new Error('Acest email este deja utilizat de alt cont');
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

// Get stored users from localStorage
const getStoredUsers = (): User[] => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored).map((u: any) => ({
            ...u,
            createdAt: new Date(u.createdAt)
        }));
    } catch {
        return [];
    }
};

// Store auth state
export const storeAuthState = (user: User, token: string): void => {
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
};

// Get auth state
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

// Clear auth state
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
