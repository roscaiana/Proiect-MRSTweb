import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UpdateUserProfileInput } from '../types/user';
import { getAuthState, storeAuthState, clearAuthState, updateMockUserProfile } from '../utils/authUtils';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isAuthReady: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateProfile: (data: UpdateUserProfileInput) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const authState = getAuthState();
        if (authState) {
            setUser(authState.user);
        }
        setIsAuthReady(true);
    }, []);

    useEffect(() => {
        const syncCurrentUser = () => {
            if (!user || user.role === 'admin') {
                return;
            }

            const rawUsers = localStorage.getItem('users');
            if (!rawUsers) {
                return;
            }

            try {
                const users = JSON.parse(rawUsers) as User[];
                const updatedUser = users.find((candidate) => candidate.email === user.email);

                if (!updatedUser) {
                    return;
                }

                if (updatedUser.isBlocked) {
                    setUser(null);
                    clearAuthState();
                    return;
                }

                setUser((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        ...updatedUser,
                        createdAt: new Date(updatedUser.createdAt),
                    };
                });
            } catch {
                // Ignore malformed user storage values.
            }
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'users') {
                syncCurrentUser();
            }
        };

        const handleAppStorageUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<{ key?: string }>;
            if (customEvent.detail?.key === 'users') {
                syncCurrentUser();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('app-storage-updated', handleAppStorageUpdated as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('app-storage-updated', handleAppStorageUpdated as EventListener);
        };
    }, [user]);

    const login = (user: User, token: string) => {
        setUser(user);
        storeAuthState(user, token);
    };

    const logout = () => {
        setUser(null);
        clearAuthState();
    };

    const updateProfile = async (data: UpdateUserProfileInput) => {
        if (!user) {
            throw new Error('Nu există utilizator autentificat');
        }

        const updatedUser = await updateMockUserProfile(user.email, data);
        setUser(updatedUser);

        const { token } = getAuthState();
        if (token) {
            storeAuthState(updatedUser, token);
        }

        return updatedUser;
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isAuthReady,
        login,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

