import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import Contact from '../pages/contacts/Contact';
import { renderWithProviders } from './testUtils';

describe('Contact', () => {
    it('se randează și afișează formularul', () => {
        renderWithProviders(<Contact />);
        expect(screen.getByText(/Trimite-ne un mesaj/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Ion Popescu/i)).toBeInTheDocument();
    });

    it('afișează erori de validare la submit gol', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Contact />);
        await user.click(screen.getByRole('button', { name: /Trimite mesajul/i }));

        expect(await screen.findByText(/Numele este obligatoriu/i)).toBeInTheDocument();
        expect(await screen.findByText(/Email-ul este obligatoriu/i)).toBeInTheDocument();
        expect(await screen.findByText(/Subiectul este obligatoriu/i)).toBeInTheDocument();
        expect(await screen.findByText(/Mesajul trebuie să de minim 10 caractere/i)).toBeInTheDocument();
    });

    it('trimite formularul și afișează starea de succes', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Contact />);

        await user.type(screen.getByPlaceholderText(/Ion Popescu/i), 'Ion Popescu');
        await user.type(screen.getByPlaceholderText(/ex@exemplu.md/i), 'ion@example.com');
        await user.type(screen.getByPlaceholderText(/Cum/i), 'Ajutor');
        await user.type(screen.getByPlaceholderText(/Scrie/i), 'Mesaj test');

        await user.click(screen.getByRole('button', { name: /Trimite mesajul/i }));
        expect(screen.getByText(/Se trimite/i)).toBeInTheDocument();

        expect(await screen.findByText(/Mesaj Trimis cu Succes/i, {}, { timeout: 2500 })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Trimite un alt mesaj/i }));
        expect(screen.getByPlaceholderText(/Ion Popescu/i)).toHaveValue('');
    });
});
