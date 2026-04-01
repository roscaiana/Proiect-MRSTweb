import React, { type ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ScrollLockProvider } from '../context/ScrollLockContext';
import type { User } from '../types/user';

type RenderOptions = {
    route?: string;
};

export const createMockUser = (overrides?: Partial<User>): User => ({
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'Test User',
    role: 'user',
    createdAt: new Date(),
    isBlocked: false,
    ...overrides,
});

export const setAuthState = (user: User | null) => {
    if (!user) {
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        return;
    }
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('authToken', 'test-token');
};

export const renderWithProviders = (ui: ReactElement, { route = '/' }: RenderOptions = {}) => {
    window.history.pushState({}, '', route);
    return render(
        <AuthProvider>
            <ScrollLockProvider>
                <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
            </ScrollLockProvider>
        </AuthProvider>
    );
};
