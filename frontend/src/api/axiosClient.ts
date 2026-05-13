import axios, { AxiosError } from "axios";

export const API_BASE_URL = "http://localhost:5014/api";
const AUTH_TOKEN_STORAGE_KEY = "authToken";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Response interceptor - global error handling based on HTTP Status Code
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;

        if (status !== undefined && status >= 500) {
            console.error("[Axios] Server error (5xx):", getGlobalHttpErrorMessage(error));
        } else if (status === 401) {
            console.warn("[Axios] Unauthorized (401) - redirect to login");
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.assign("/login");
            }
        } else if (status === 403) {
            console.warn("[Axios] Forbidden (403)");
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/403")) {
                window.location.assign("/403");
            }
        } else if (status === 404) {
            console.warn("[Axios] Not found (404)");
        } else if (!error.response) {
            console.error("[Axios] Network error - backend unreachable");
        }

        return Promise.reject(error);
    }
);

export const getGlobalHttpErrorMessage = (error: AxiosError): string => {
    const status = error.response?.status;

    if (status === 400) {
        return "Cerere invalida (400). Verifica datele trimise.";
    }

    if (status === 401) {
        return "Neautorizat (401). Autentifica-te din nou.";
    }

    if (status === 403) {
        return "Acces interzis (403).";
    }

    if (status === 404) {
        return "Resursa nu a fost gasita (404).";
    }

    if (status === 409) {
        return "Conflict de date (409).";
    }

    if (status !== undefined && status >= 500) {
        return "Eroare interna server (5xx).";
    }

    return "Eroare de retea sau server indisponibil.";
};
