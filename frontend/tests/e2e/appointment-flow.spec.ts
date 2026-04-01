import { test, expect, type Page } from '@playwright/test';

test('Creare programare de la zero pana la confirmare', async ({ page }: { page: Page }) => {
    await page.addInitScript(() => {
        const user = {
            id: 'user-2',
            email: 'user2@example.com',
            fullName: 'Ion Popescu',
            role: 'user',
            createdAt: new Date().toISOString(),
            isBlocked: false,
        };
        localStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('authToken', 'test-token');
        localStorage.setItem('users', JSON.stringify([user]));
    });

    await page.goto('/appointment');
    await expect(page.getByText(/nscriere/i)).toBeVisible();

    await page.locator('.availability-preview-grid .availability-day').first().click();
    await page.getByRole('button', { name: /Continu/i }).click();

    await page.locator('.time-slots .time-slot').first().click();
    await page.getByRole('button', { name: /Continu/i }).click();

    await page.fill('#fullName', 'Ion Popescu');
    await page.fill('#idOrPhone', '68123456');
    await page.getByRole('button', { name: /Continu/i }).click();

    await page.getByRole('button', { name: /Programarea/i }).click();

    await expect(page.getByText(/Programare Confirmat/i)).toBeVisible();
});
