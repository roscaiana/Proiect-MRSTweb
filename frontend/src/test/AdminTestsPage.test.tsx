import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { toast } from 'react-hot-toast';
import AdminTestsPage from '../features/admin/pages/AdminTestsPage';

const mockPanel = {
    state: {
        settings: {
            testDurationMinutes: 30,
            passingThreshold: 70,
            appointmentsPerDay: 30,
            appointmentLeadTimeHours: 24,
            maxReschedulesPerUser: 2,
            rejectionCooldownDays: 2,
            appointmentLocation: 'Locatie',
            appointmentRoom: 'Sala',
            allowedWeekdays: [1, 3, 5],
            blockedDates: [],
            capacityOverrides: [],
            slotOverrides: [],
        },
        tests: [],
    },
    createTest: vi.fn(),
    updateTest: vi.fn(),
    deleteTest: vi.fn(),
    updateSettings: vi.fn(),
};

vi.mock('../features/admin/hooks/useAdminPanel', () => ({
    useAdminPanel: () => mockPanel,
}));

describe('AdminTestsPage', () => {
    beforeEach(() => {
        mockPanel.updateSettings.mockReset();
    });

    it('afișează erori de validare pentru valori invalide', async () => {
        const user = userEvent.setup();
        render(<AdminTestsPage />);

        const durationInput = screen.getByLabelText(/Durata test/i);
        fireEvent.change(durationInput, { target: { value: '0' } });
        await user.click(screen.getByRole('button', { name: /Salvează/i }));

        expect(toast.error).toHaveBeenCalled();
    });

    it('salvează setările când valorile sunt valide', async () => {
        const user = userEvent.setup();
        render(<AdminTestsPage />);

        const durationInput = screen.getByLabelText(/Durata test/i);
        fireEvent.change(durationInput, { target: { value: '45' } });
        await user.click(screen.getByRole('button', { name: /Salvează/i }));

        expect(mockPanel.updateSettings).toHaveBeenCalled();
    });
});
