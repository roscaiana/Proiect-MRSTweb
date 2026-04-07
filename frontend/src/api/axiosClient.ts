import axios, { AxiosError } from "axios";

export const API_BASE_URL = "http://localhost:5014/api";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const getGlobalHttpErrorMessage = (error: AxiosError): string => {
    const status = error.response?.status;

    if (status === 400) {
        return "Cerere invalidă (400). Verifică datele trimise.";
    }

    if (status === 401) {
        return "Neautorizat (401). Autentifică-te din nou.";
    }

    if (status === 403) {
        return "Acces interzis (403).";
    }

    if (status === 404) {
        return "Resursa nu a fost găsită (404).";
    }

    if (status === 409) {
        return "Conflict de date (409).";
    }

    if (status !== undefined && status >= 500) {
        return "Eroare internă server (5xx).";
    }

    return "Eroare de rețea sau server indisponibil.";
};
