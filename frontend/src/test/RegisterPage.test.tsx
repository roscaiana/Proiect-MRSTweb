import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import RegisterPage from '../pages/auth/RegisterPage/RegisterPage';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();
const mockNotifyAdmins = vi.fn();

vi.mock('../utils/authUtils', () => ({
    mockRegister: (...args: unknown[]) => mockRegister(...args),
}));

vi.mock('../utils/appEventNotifications', () => ({
    notifyAdmins: (...args: unknown[]) => mockNotifyAdmins(...args),
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

describe('RegisterPage', () => {
    beforeEach(() => {
        mockRegister.mockReset();
        mockNavigate.mockReset();
        mockNotifyAdmins.mockReset();
    });

    it('se randează corect și afișează câmpurile principale', () => {
        render(<RegisterPage />);
        expect(screen.getByLabelText(/Nume Complet/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Parolă/i, { selector: 'input' })).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmă Parola/i, { selector: 'input' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Înregistrare/i })).toBeInTheDocument();
    });

    it('afișează erori de validare la submit gol', async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);
        await user.click(screen.getByRole('button', { name: /Înregistrare/i }));
        expect(await screen.findByText(/Numele trebuie să conțină/i)).toBeInTheDocument();
        expect(await screen.findByText(/Email-ul este obligatoriu/i)).toBeInTheDocument();
        expect(await screen.findByText(/Parola trebuie să conțină/i)).toBeInTheDocument();
    });

    it('înregistrează utilizatorul și navighează către login', async () => {
        const user = userEvent.setup();
        mockRegister.mockResolvedValue({
            id: 'user-2',
            email: 'test@example.com',
            fullName: 'Test User',
            role: 'user',
            createdAt: new Date(),
            isBlocked: false,
        });

        render(<RegisterPage />);
        await user.type(screen.getByLabelText(/Nume Complet/i), 'Test User');
        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/^Parolă/i, { selector: 'input' }), 'secret12');
        await user.type(screen.getByLabelText(/Confirmă Parola/i, { selector: 'input' }), 'secret12');
        await user.click(screen.getByRole('button', { name: /Înregistrare/i }));

        expect(mockRegister).toHaveBeenCalled();
        expect(mockNotifyAdmins).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login?registered=true');
    });

    it('afișează mesaj la eroare de înregistrare', async () => {
        const user = userEvent.setup();
        mockRegister.mockRejectedValue(new Error('Înregistrare eșuată'));

        render(<RegisterPage />);
        await user.type(screen.getByLabelText(/Nume Complet/i), 'Test User');
        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/^Parolă/i, { selector: 'input' }), 'secret12');
        await user.type(screen.getByLabelText(/Confirmă Parola/i, { selector: 'input' }), 'secret12');
        await user.click(screen.getByRole('button', { name: /Înregistrare/i }));

        expect(await screen.findByText(/Înregistrare eșuată/i)).toBeInTheDocument();
        expect(toast.error).toHaveBeenCalled();
    });
});
