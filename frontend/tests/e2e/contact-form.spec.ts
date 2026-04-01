import { test, expect, type Page } from '@playwright/test';

test('Trimitere formular contact', async ({ page }: { page: Page }) => {
    await page.goto('/contact');

    await page.fill('input[placeholder*="Ion"]', 'Ion Popescu');
    await page.fill('input[type="email"]', 'ion@example.com');
    await page.fill('input[placeholder*="Cum"]', 'Ajutor');
    await page.fill('textarea', 'Mesaj test');

    await page.getByRole('button', { name: /TRIMITE/i }).click();
    await expect(page.getByText(/Mesaj Trimis/i)).toBeVisible();
});
