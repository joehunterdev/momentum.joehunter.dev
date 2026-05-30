import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://momentum.joehunter.localhost';
const EMAIL = process.env.BASIC_EMAIL ?? 'test@momentum.joehunter.dev';
const PASSWORD = process.env.BASIC_PASSWORD ?? 'password';

async function login(page: Page) {
    await page.goto('/login');
    await page.getByLabel('Email').fill(EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForURL(/\//);
}

test.describe('Friction mechanic', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('no-friction moment commits instantly on full drag', async ({ page }) => {
        // Force no-friction via URL param
        await page.goto('/?friction=none');
        const icon = page.locator('.moment-action__icon').first();
        const box = (await icon.boundingBox())!;

        // Swipe right past the 85% threshold
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 400, box.y + box.height / 2, { steps: 20 });
        await page.mouse.up();

        // Arc should have disappeared (drag complete)
        await expect(page.locator('.moment-action__arc').first()).not.toBeVisible();
    });

    test('low-friction moment shows arc and requires hold', async ({ page }) => {
        await page.goto('/?friction=low&holdMs=500');
        const icon = page.locator('.moment-action__icon').first();
        const box = (await icon.boundingBox())!;

        // Drag to the wall and hold
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 400, box.y + box.height / 2, { steps: 20 });

        // Arc should be visible during hold
        await expect(page.locator('.moment-action__arc').first()).toBeVisible();

        // Hold for the required 500ms + buffer
        await page.waitForTimeout(700);
        await page.mouse.up();

        // Arc should be gone after commit
        await expect(page.locator('.moment-action__arc').first()).not.toBeVisible();
    });
});
