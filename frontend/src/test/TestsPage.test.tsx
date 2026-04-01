import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import TestsPage from '../pages/testpage/TestsPage';
import { renderWithProviders, setAuthState, createMockUser } from './testUtils';

describe('TestsPage', () => {
    it('afișează pagina de start și permite pornirea unui test', async () => {
        setAuthState(createMockUser());
        const user = userEvent.setup();
        renderWithProviders(<TestsPage />, { route: '/tests' });

        expect(screen.getByText(/Simulare examen/i)).toBeInTheDocument();

        const startButtons = screen.getAllByRole('button', { name: /ncepe/i });
        await user.click(startButtons[0]);

        expect(await screen.findByRole('button', { name: /Finalizeaz/i })).toBeInTheDocument();

        const answerButton = document.querySelector('.option-btn') as HTMLButtonElement | null;
        if (answerButton) {
            await user.click(answerButton);
        }

        expect(document.querySelector('.instant-feedback')).toBeTruthy();
    });
});
