const SIMULATED_SERVER_ERROR_KEY = "simulateServerError";

const hasQueryFlag = (): boolean => {
    if (typeof window === "undefined") {
        return false;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("fail") === "500" || params.get("simulate") === "500";
};

export const isSimulatedServerErrorEnabled = (): boolean => {
    if (typeof window === "undefined") {
        return false;
    }

    const raw = localStorage.getItem(SIMULATED_SERVER_ERROR_KEY);
    return raw === "1" || raw === "true" || hasQueryFlag();
};

export const enableSimulatedServerError = (): void => {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(SIMULATED_SERVER_ERROR_KEY, "1");
};

export const clearSimulatedServerError = (): void => {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(SIMULATED_SERVER_ERROR_KEY);
};

export const assertNoSimulatedServerError = (): void => {
    if (isSimulatedServerErrorEnabled()) {
        throw new Error("Simulated server error");
    }
};
