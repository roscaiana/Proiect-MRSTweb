import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AxiosError, AxiosInstance } from "axios";
import { apiClient, getGlobalHttpErrorMessage } from "./axiosClient";

type AxiosContextValue = {
    client: AxiosInstance;
    globalHttpError: string | null;
    clearGlobalHttpError: () => void;
};

const AxiosContext = createContext<AxiosContextValue | undefined>(undefined);

type AxiosProviderProps = {
    children: ReactNode;
};

export const AxiosProvider = ({ children }: AxiosProviderProps) => {
    const [globalHttpError, setGlobalHttpError] = useState<string | null>(null);

    useEffect(() => {
        const interceptorId = apiClient.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                setGlobalHttpError(getGlobalHttpErrorMessage(error));
                return Promise.reject(error);
            },
        );

        return () => {
            apiClient.interceptors.response.eject(interceptorId);
        };
    }, []);

    const value = useMemo<AxiosContextValue>(() => {
        return {
            client: apiClient,
            globalHttpError,
            clearGlobalHttpError: () => setGlobalHttpError(null),
        };
    }, [globalHttpError]);

    return <AxiosContext.Provider value={value}>{children}</AxiosContext.Provider>;
};

export const useAxios = (): AxiosContextValue => {
    const context = useContext(AxiosContext);
    if (!context) {
        throw new Error("useAxios must be used within AxiosProvider");
    }

    return context;
};
