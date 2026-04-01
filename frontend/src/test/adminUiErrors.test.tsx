import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import type { AdminState, ExamSettings } from '../features/admin/types';
import AdminNewsPage from '../features/admin/pages/AdminNewsPage';
import AdminNotificationsPage from '../features/admin/pages/AdminNotificationsPage';
import AdminTestsPage from '../features/admin/pages/AdminTestsPage';

const mockUseAdminPanel = vi.fn();

vi.mock('../features/admin/hooks/useAdminPanel', () => ({
    useAdminPanel: () => mockUseAdminPanel(),
}));

const baseSettings: ExamSettings = {
    testDurationMinutes: 30,
    passingThreshold: 70,
    appointmentsPerDay: 10,
    appointmentLeadTimeHours: 24,
    maxReschedulesPerUser: 2,
    rejectionCooldownDays: 0,
    appointmentLocation: 'Chisinau',
    appointmentRoom: 'Sala 1',
    allowedWeekdays: [1, 2, 3, 4, 5],
    blockedDates: [],
    capacityOverrides: [],
    slotOverrides: [],
};

const baseState: AdminState = {
    tests: [],
    settings: baseSettings,
    users: [],
    appointments: [],
    quizHistory: [],
    sentNotifications: [],
    news: [],
};

beforeEach(() => {
    mockUseAdminPanel.mockReturnValue({
        state: baseState,
        createNewsArticle: vi.fn(),
        updateNewsArticle: vi.fn(),
        deleteNewsArticle: vi.fn(),
        sendNotification: vi.fn(),
        createTest: vi.fn(),
        updateTest: vi.fn(),
        deleteTest: vi.fn(),
        updateSettings: vi.fn(),
        updateAppointmentStatus: vi.fn(),
        updateAppointment: vi.fn(),
    });
});

describe('Admin UI error flows', () => {
    it('shows inline errors on AdminNewsPage submit', async () => {
        const user = userEvent.setup();
        render(<AdminNewsPage />);
        await user.click(screen.getByRole('button', { name: /Adaugă/i }));
        await screen.findByPlaceholderText(/Titlul știrii/i);
        await user.click(screen.getByRole('button', { name: /Publică/i }));

        expect(await screen.findByText(/Titlul este obligatoriu\./i)).toBeInTheDocument();
        expect(await screen.findByText(/Descrierea este obligatorie\./i)).toBeInTheDocument();
    });

    it('shows inline errors on AdminNotificationsPage submit', async () => {
        const user = userEvent.setup();
        render(<AdminNotificationsPage />);
        await screen.findByPlaceholderText(/Titlu notificare/i);
        await user.click(screen.getByRole('button', { name: /Trimite notificarea/i }));

        expect(await screen.findByText(/Completează titlul notificării\./i)).toBeInTheDocument();
        expect(await screen.findByText(/Completează mesajul notificării\./i)).toBeInTheDocument();
    });

    it('shows inline errors on AdminTestsPage invalid settings submit', async () => {
        const user = userEvent.setup();
        render(<AdminTestsPage />);
        const durationInput = screen.getByLabelText(/Durata test/i);
        fireEvent.change(durationInput, { target: { value: '0' } });
        await user.click(screen.getByRole('button', { name: /Salvează/i }));

        expect(toast.error).toHaveBeenCalled();
    });
});
