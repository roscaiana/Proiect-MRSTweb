import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import LoginPage from '../pages/auth/LoginPage/LoginPage';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();
const mockAuthLogin = vi.fn();

vi.mock('../utils/authUtils', () => ({
    mockLogin: (...args: unknown[]) => mockLogin(...args),
}));

vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        login: mockAuthLogin,
    }),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({ to, children, ...rest }: { to: string; children: ReactNode }) => (
            <a href={to} {...rest}>{children}</a>
        ),
    };
});

describe('LoginPage', () => {
    beforeEach(() => {
        mockLogin.mockReset();
        mockNavigate.mockReset();
        mockAuthLogin.mockReset();
    });

    it('se randează corect și afișează câmpurile principale', () => {
        render(<LoginPage />);
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Parol/i, { selector: 'input' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Autentificare/i })).toBeInTheDocument();
    });

    it('afișează erori de validare la submit gol', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);
        await user.click(screen.getByRole('button', { name: /Autentificare/i }));
        expect(await screen.findByText(/Email-ul este obligatoriu/i)).toBeInTheDocument();
        expect(await screen.findByText(/Parola este obligatorie/i)).toBeInTheDocument();
    });

    it('autentifică și navighează către dashboard pentru utilizator', async () => {
        const user = userEvent.setup();
        mockLogin.mockResolvedValue({
            id: 'user-1',
            email: 'user@example.com',
            fullName: 'User Example',
            role: 'user',
            createdAt: new Date(),
            isBlocked: false,
        });

        render(<LoginPage />);
        await user.type(screen.getByLabelText(/Email/i), 'user@example.com');
        await user.type(screen.getByLabelText(/Parol/i, { selector: 'input' }), 'password123');
        await user.click(screen.getByRole('button', { name: /Autentificare/i }));

        expect(mockLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password123' });
        expect(mockAuthLogin).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('afișează mesaj la eroare de autentificare', async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValue(new Error('Login eșuat'));
        render(<LoginPage />);
        await user.type(screen.getByLabelText(/Email/i), 'user@example.com');
        await user.type(screen.getByLabelText(/Parol/i, { selector: 'input' }), 'bad');
        await user.click(screen.getByRole('button', { name: /Autentificare/i }));

        expect(await screen.findByText(/Login eșuat/i)).toBeInTheDocument();
    });
});
