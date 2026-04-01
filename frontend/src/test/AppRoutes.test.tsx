import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import App from '../App';
import { createMockUser, setAuthState } from './testUtils';

describe('App routing', () => {
    afterEach(() => {
        setAuthState(null);
    });

    it('redirecționează la 401 dacă utilizatorul nu este autentificat', async () => {
        setAuthState(null);
        window.history.pushState({}, '', '/dashboard');
        render(<App />);
        expect(await screen.findByText(/Autentificare necesar/i)).toBeInTheDocument();
    });

    it('permite acces la dashboard pentru utilizator autenticat', async () => {
        setAuthState(createMockUser());
        window.history.pushState({}, '', '/dashboard');
        render(<App />);
        expect(await screen.findByRole('heading', { level: 1, name: /Profilul meu/i })).toBeInTheDocument();
    });

    it('blochează accesul la admin pentru utilizator non-admin', async () => {
        setAuthState(createMockUser({ role: 'user' }));
        window.history.pushState({}, '', '/admin');
        render(<App />);
        expect(await screen.findByText(/Acces interzis/i)).toBeInTheDocument();
    });
});
