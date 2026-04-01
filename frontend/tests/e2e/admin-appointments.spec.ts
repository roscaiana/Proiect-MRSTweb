import { test, expect, type Page } from '@playwright/test';

test('Admin: vizualizare, editare, stergere programare', async ({ page }: { page: Page }) => {
    await page.addInitScript(() => {
        const admin = {
            id: 'admin-1',
            email: 'admin@electoral.md',
            fullName: 'Administrator',
            role: 'admin',
            createdAt: new Date().toISOString(),
            isBlocked: false,
        };
        const appointment = {
            id: 'appointment-1',
            appointmentCode: 'AP-2026-12345',
            fullName: 'Ion Popescu',
            idOrPhone: '+37368123456',
            userEmail: 'user@example.com',
            date: '2026-04-06T00:00:00.000Z',
            slotStart: '12:00',
            slotEnd: '12:30',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('authUser', JSON.stringify(admin));
        localStorage.setItem('authToken', 'admin-token');
        localStorage.setItem('appointments', JSON.stringify([appointment]));
    });

    await page.goto('/admin/appointments');
    await expect(page.getByText(/Program/i)).toBeVisible();

    const row = page.locator('tr', { hasText: 'Ion Popescu' });
    await row.getByRole('button', { name: /Aprob/i }).click();
    await page.getByRole('button', { name: /Confirm/i }).click();
    await expect(row.getByText(/Aprobat/i)).toBeVisible();

    await row.getByRole('button', { name: /Reprogrameaz/i }).click();
    await page.getByLabel(/Data nou/i).fill('2026-04-08');
    await page.getByLabel(/Interval/i).fill('13:00-13:30');
    await page.getByRole('button', { name: /Confirm/i }).click();
    await expect(row.getByText(/13:00 - 13:30/)).toBeVisible();

    await row.getByRole('button', { name: /Anuleaz/i }).click();
    await page.getByRole('button', { name: /Confirm/i }).click();
    await expect(row.getByText(/Anulat/i)).toBeVisible();
});
