import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import AdminNotificationsPage from '../features/admin/pages/AdminNotificationsPage';

const mockPanel = {
    state: {
        users: [
            { id: 'u1', email: 'user@example.com', fullName: 'User', role: 'user', createdAt: new Date(), isBlocked: false },
        ],
        sentNotifications: [],
    },
    sendNotification: vi.fn(() => 1),
};

vi.mock('../features/admin/hooks/useAdminPanel', () => ({
    useAdminPanel: () => mockPanel,
}));

describe('AdminNotificationsPage', () => {
    beforeEach(() => {
        mockPanel.sendNotification.mockReset();
    });

    it('validează emailul când target este email specific', async () => {
        const user = userEvent.setup();
        render(<AdminNotificationsPage />);

        await user.click(screen.getByRole('button', { name: /Selectare target notificare/i }));
        await user.click(screen.getByRole('option', { name: /Email specific/i }));

        await user.type(screen.getByPlaceholderText(/Titlu notificare/i), 'Test');
        await user.type(screen.getByPlaceholderText(/Mesajul/i), 'Mesaj');
        await user.click(screen.getByRole('button', { name: /Trimite notificarea/i }));

        expect(await screen.findByText(/Adaugă emailul destinatarului/i)).toBeInTheDocument();
    });

    it('trimite notificarea când datele sunt valide', async () => {
        const user = userEvent.setup();
        render(<AdminNotificationsPage />);

        await user.type(screen.getByPlaceholderText(/Titlu notificare/i), 'Test');
        await user.type(screen.getByPlaceholderText(/Mesajul/i), 'Mesaj');
        await user.click(screen.getByRole('button', { name: /Trimite notificarea/i }));

        expect(mockPanel.sendNotification).toHaveBeenCalled();
        expect(await screen.findByRole('tabpanel', { name: /Istoric notificări/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Istoric notificări/i })).toHaveAttribute('aria-selected', 'true');
    });
});
