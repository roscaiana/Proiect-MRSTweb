import { test, expect, type Page } from '@playwright/test';

test('Login -> Dashboard', async ({ page }: { page: Page }) => {
    await page.addInitScript(() => {
        const user = {
            id: 'user-1',
            email: 'user@example.com',
            fullName: 'Test User',
            role: 'user',
            createdAt: new Date().toISOString(),
            isBlocked: false,
        };
        localStorage.setItem('users', JSON.stringify([user]));
        localStorage.setItem('password_user@example.com', 'test1234');
    });

    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('user@example.com');
    await page.getByLabel(/Parol/i).fill('test1234');
    await page.getByRole('button', { name: /Autentificare/i }).click();

    await expect(page.getByText(/Profilul meu/i)).toBeVisible();
});
