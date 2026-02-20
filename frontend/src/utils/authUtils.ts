import { User, AuthCredentials, RegisterData, AuthError } from '../types/user';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mock admin credentials
const ADMIN_EMAIL = 'admin@electoral.md';
const ADMIN_PASSWORD = 'admin123';

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
            createdAt: new Date()
        };
    }

    // Check user credentials from localStorage
    const users = getStoredUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
        throw new Error('Email-ul nu este înregistrat');
    }

    // In a real app, we'd hash and compare passwords
    const storedPassword = localStorage.getItem(`password_${user.email}`);
    if (storedPassword !== credentials.password) {
        throw new Error('Parolă incorectă');
    }

    return user;
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
        createdAt: new Date()
    };

    // Store user and password
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem(`password_${data.email}`, data.password);

    return newUser;
};

// Get stored users from localStorage
const getStoredUsers = (): User[] => {
    const stored = localStorage.getItem('users');
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
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
};
