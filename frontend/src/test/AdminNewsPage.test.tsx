import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import AdminNewsPage from '../features/admin/pages/AdminNewsPage';

const mockPanel = {
    state: { news: [] as Array<{ id: string; title: string; description: string; category: string; image: string; publishedAt: string }> },
    createNewsArticle: vi.fn(),
    updateNewsArticle: vi.fn(),
    deleteNewsArticle: vi.fn(),
};

vi.mock('../features/admin/hooks/useAdminPanel', () => ({
    useAdminPanel: () => mockPanel,
}));

describe('AdminNewsPage', () => {
    beforeEach(() => {
        mockPanel.state.news = [];
        mockPanel.createNewsArticle.mockReset();
        mockPanel.updateNewsArticle.mockReset();
        mockPanel.deleteNewsArticle.mockReset();
    });

    it('afișează lista goală de noutăți', () => {
        render(<AdminNewsPage />);
        expect(screen.getByText(/Nu există noutăți/i)).toBeInTheDocument();
    });

    it('validează câmpurile obligatorii la creare', async () => {
        const user = userEvent.setup();
        render(<AdminNewsPage />);
        await user.click(screen.getByRole('button', { name: /Adaugă noutate/i }));
        await user.click(screen.getByRole('button', { name: /Publică noutatea/i }));
        expect(await screen.findByText(/Titlul este obligatoriu/i)).toBeInTheDocument();
        expect(await screen.findByText(/Descrierea este obligatorie/i)).toBeInTheDocument();
    });

    it('creează o noutate validă', async () => {
        const user = userEvent.setup();
        render(<AdminNewsPage />);
        await user.click(screen.getByRole('button', { name: /Adaugă noutate/i }));
        await user.type(screen.getByPlaceholderText(/Titlul/i), 'Știre test');
        await user.type(screen.getByPlaceholderText(/Con/i), 'Descriere test');
        await user.click(screen.getByRole('button', { name: /Publică noutatea/i }));

        expect(mockPanel.createNewsArticle).toHaveBeenCalled();
    });

    it('șterge o noutate din listă', async () => {
        const user = userEvent.setup();
        mockPanel.state.news = [{
            id: 'news-1',
            title: 'Noutate',
            description: 'Descriere',
            category: 'Certificare',
            image: 'cert',
            publishedAt: new Date().toISOString(),
        }];

        const { container } = render(<AdminNewsPage />);
        const deleteButton = container.querySelector('button.admin-btn.danger');
        expect(deleteButton).toBeTruthy();
        if (deleteButton) {
            await user.click(deleteButton);
        }
        await user.click(screen.getByRole('button', { name: /Șterge/i }));
        expect(mockPanel.deleteNewsArticle).toHaveBeenCalledWith('news-1');
    });
});
