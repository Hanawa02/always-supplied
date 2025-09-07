import { expect,test } from '@playwright/test';

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  // Check for the app logo link (replaced the h1)
  await expect(page.getByRole('link').filter({ has: page.locator('svg') })).toBeVisible();
  // Check for the supply configuration page
  await expect(page.getByRole('heading', { name: 'Supply Configuration' })).toBeVisible();
})
