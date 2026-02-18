import { useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const stored = window.localStorage.getItem(key);
            return stored ? (JSON.parse(stored) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // ignore write errors (e.g. private mode)
        }
    }, [key, value]);

    return [value, setValue] as const;
}

export function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const id = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(id);
    }, [value, delay]);

    return debounced;
}

type FetchState<T> = {
    data: T | null;
    error: Error | null;
    loading: boolean;
};

export function useFetch<T = unknown>(
    url: string | null,
    options?: RequestInit,
    deps: React.DependencyList = []
) {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        error: null,
        loading: !!url
    });
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!url) {
            setState({ data: null, error: null, loading: false });
            return;
        }

        const controller = new AbortController();
        abortRef.current?.abort();
        abortRef.current = controller;

        setState((prev) => ({ ...prev, loading: true, error: null }));

        fetch(url, { ...options, signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`Request failed with ${res.status}`);
                }
                return (await res.json()) as T;
            })
            .then((data) => setState({ data, error: null, loading: false }))
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setState({ data: null, error: err, loading: false });
            });

        return () => controller.abort();
    }, [url, ...deps]);

    return state;
}
