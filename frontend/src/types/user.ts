export type UserRole = 'user' | 'admin';

export interface User {
    id: string;
    email: string;
    fullName: string;
    nickname?: string;
    phoneNumber?: string;
    avatarDataUrl?: string;
    role: UserRole;
    createdAt: Date;
    isBlocked?: boolean;
    lastLoginAt?: Date | string;
}

export interface UpdateUserProfileInput {
    fullName: string;
    nickname?: string;
    email: string;
    phoneNumber?: string;
    avatarDataUrl?: string;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends AuthCredentials {
    fullName: string;
    confirmPassword: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}

export interface AuthError {
    field?: string;
    message: string;
}
