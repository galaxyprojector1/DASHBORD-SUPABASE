import { test, expect } from '@playwright/test';

test.describe('Dashboard Supabase', () => {
  test('should load the dashboard successfully', async ({ page }) => {
    // Navigate to the production URL
    await page.goto('https://dashbord-supabase.vercel.app');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });

    // Check page title
    await expect(page).toHaveTitle(/Dashboard Supabase/i);

    console.log('✅ Page loaded successfully');
  });

  test('should display dashboard heading', async ({ page }) => {
    await page.goto('https://dashbord-supabase.vercel.app');

    // Check for dashboard heading
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();

    const headingText = await heading.textContent();
    console.log(`📊 Dashboard heading: ${headingText}`);
  });

  test('should have sidebar navigation', async ({ page }) => {
    await page.goto('https://dashbord-supabase.vercel.app');

    // Check for navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    console.log('🧭 Sidebar navigation found');
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto('https://dashbord-supabase.vercel.app');

    // Look for cards on the dashboard
    const cards = page.locator('[class*="card"]');
    const cardCount = await cards.count();

    console.log(`📊 Found ${cardCount} stat cards`);
    expect(cardCount).toBeGreaterThan(0);
  });
});
