// Route path constants for the application

export const ROUTES = {
    // Public routes
    HOME: '/',
    CONTACT: '/contact',
    SUPPORT: '/support',

    // Auth routes
    LOGIN: '/login',
    REGISTER: '/register',

    // User protected routes
    USER_DASHBOARD: '/dashboard',
    TEST_HISTORY: '/test-history',
    APPOINTMENT: '/appointment',
    TESTS: '/tests',

    // Admin protected routes
    ADMIN_DASHBOARD: '/admin',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

