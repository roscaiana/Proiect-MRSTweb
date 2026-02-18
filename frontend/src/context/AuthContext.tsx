import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { getAuthState, storeAuthState, clearAuthState } from '../utils/authUtils';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const authState = getAuthState();
        if (authState) {
            setUser(authState.user);
        }
    }, []);

    const login = (user: User, token: string) => {
        setUser(user);
        storeAuthState(user, token);
    };

    const logout = () => {
        setUser(null);
        clearAuthState();
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

