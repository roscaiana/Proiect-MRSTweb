import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mswServer';

const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
};

vi.mock('react-hot-toast', () => ({
    __esModule: true,
    default: toastMock,
    toast: toastMock,
    Toaster: () => null,
}));

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.clearAllMocks();
});

afterAll(() => {
    server.close();
});

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'scrollTo', {
        value: () => {},
        writable: true,
    });
}


if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = (query: string) =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        }) as MediaQueryList;
}

if (typeof window !== 'undefined' && !window.IntersectionObserver) {
    class IntersectionObserverMock {
        root: Element | Document | null = null;
        rootMargin = '';
        thresholds: ReadonlyArray<number> = [];

        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords(): IntersectionObserverEntry[] {
            return [];
        }
    }

    window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
}

if (typeof window !== 'undefined' && !window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {};
}
