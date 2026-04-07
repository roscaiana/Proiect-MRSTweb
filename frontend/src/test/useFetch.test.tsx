import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFetch } from '../hooks/functions';
import { vi, beforeEach, afterEach } from 'vitest';

const FetchConsumer = ({ url }: { url: string | null }) => {
    const { data, error, loading } = useFetch<{ message: string }>(url);
    if (loading) return <div>Loading</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (data) return <div>Data: {data.message}</div>;
    return <div>No data</div>;
};

describe('useFetch', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returnează date pentru răspuns valid', async () => {
        const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'ok' }),
        });
        render(<FetchConsumer url="https://example.com/api/test" />);
        expect(screen.getByText(/Loading/i)).toBeInTheDocument();
        expect(await screen.findByText(/Data: ok/i)).toBeInTheDocument();
    });

    it('returnează eroare pentru răspuns invalid', async () => {
        const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
        fetchMock.mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ message: 'fail' }),
        });
        render(<FetchConsumer url="https://example.com/api/error" />);
        expect(screen.getByText(/Loading/i)).toBeInTheDocument();
        expect(await screen.findByText(/Error: Request failed with 500/i)).toBeInTheDocument();
    });
});
