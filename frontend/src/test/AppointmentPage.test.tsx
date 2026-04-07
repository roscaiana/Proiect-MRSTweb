import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AppointmentPage from '../pages/exam-regist/AppointmentPage';
import { renderWithProviders, createMockUser, setAuthState } from './testUtils';

vi.mock('../utils/appEventNotifications', () => ({
    notifyAppointmentCreated: vi.fn(),
    notifyUser: vi.fn(),
}));

describe('AppointmentPage', () => {
    beforeEach(() => {
        setAuthState(createMockUser());
    });

    afterEach(() => {
        setAuthState(null);
    });

    it('parcurge fluxul de programare și confirmă', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AppointmentPage />, { route: '/appointment' });

        const continueButton = await screen.findByRole('button', { name: /Continu/i });
        expect(continueButton).toBeDisabled();

        const dateButtons = screen.getAllByRole('button', { name: /\d{2}\.\d{2}/ });
        await user.click(dateButtons[1] ?? dateButtons[0]);

        await waitFor(() => expect(continueButton).toBeEnabled());
        await user.click(continueButton);

        const slotButtons = await screen.findAllByRole('button', { name: /12:00|13:00|15:00/ });
        await user.click(slotButtons[0]);
        await user.click(screen.getByRole('button', { name: /Continu/i }));

        const nameInput = screen.getByLabelText(/Nume Complet/i) as HTMLInputElement;
        if (!nameInput.value) {
            await user.type(nameInput, 'Ion Popescu');
        }
        await user.type(screen.getByLabelText(/Număr de Telefon/i), '68123456');

        await user.click(screen.getByRole('button', { name: /Continu/i }));
        await user.click(screen.getByRole('button', { name: /Confirmă Programarea/i }));

        expect(await screen.findByText(/Programare Confirmat/i, {}, { timeout: 4000 })).toBeInTheDocument();
    }, 10000);
});
