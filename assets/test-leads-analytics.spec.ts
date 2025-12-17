import { test, expect } from '@playwright/test';

test.describe('Leads Analytics Dashboard', () => {
  const baseUrl = 'https://dashbord-supabase.vercel.app';

  test('should load the leads analytics page successfully', async ({ page }) => {
    // Navigate to leads analytics page
    await page.goto(`${baseUrl}/dashboard/leads`);

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await page.screenshot({ path: 'leads-analytics-screenshot.png', fullPage: true });

    // Check page title
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Leads Analytics');

    console.log('✅ Page loaded successfully');
  });

  test('should display filters sidebar', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard/leads`);
    await page.waitForLoadState('networkidle');

    // Check for filters title
    const filtersTitle = page.getByText('Filtres');
    await expect(filtersTitle).toBeVisible();

    // Check for filter controls
    await expect(page.getByText('Compte Facebook')).toBeVisible();
    await expect(page.getByText('Activité')).toBeVisible();
    await expect(page.getByText('Période')).toBeVisible();
    await expect(page.getByText('Recherche')).toBeVisible();

    // Check for Apply button
    const applyButton = page.getByRole('button', { name: /appliquer/i });
    await expect(applyButton).toBeVisible();

    console.log('✅ Filters sidebar found and functional');
  });

  test('should display KPI cards', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard/leads`);
    await page.waitForLoadState('networkidle');

    // Wait for data to load (check for one of the KPI values)
    await page.waitForSelector('text=Total Leads', { timeout: 10000 });

    // Check for KPI card titles
    await expect(page.getByText('Total Leads')).toBeVisible();
    await expect(page.getByText('Compte Principal')).toBeVisible();
    await expect(page.getByText('Activité Principale')).toBeVisible();
    await expect(page.getByText('Comptes Actifs')).toBeVisible();

    console.log('✅ All 4 KPI cards displayed');
  });

  test('should have chart tabs', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard/leads`);
    await page.waitForLoadState('networkidle');

    // Wait for tabs to be visible
    await page.waitForSelector('role=tablist', { timeout: 10000 });

    // Check for all tabs
    const overviewTab = page.getByRole('tab', { name: /vue d'ensemble/i });
    const evolutionTab = page.getByRole('tab', { name: /évolution/i });
    const accountsTab = page.getByRole('tab', { name: /par compte/i });
    const heatmapTab = page.getByRole('tab', { name: /heatmap/i });

    await expect(overviewTab).toBeVisible();
    await expect(evolutionTab).toBeVisible();
    await expect(accountsTab).toBeVisible();
    await expect(heatmapTab).toBeVisible();

    console.log('✅ All 4 chart tabs present');
  });

  test('should display charts in overview tab', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard/leads`);
    await page.waitForLoadState('networkidle');

    // Wait for charts to load
    await page.waitForTimeout(3000);

    // Check for chart titles in overview
    await expect(page.getByText('Leads par Compte')).toBeVisible();
    await expect(page.getByText('Leads par Activité')).toBeVisible();
    await expect(page.getByText('Évolution des Leads')).toBeVisible();

    console.log('✅ Charts displayed in overview tab');
  });

  test('should be able to switch between tabs', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard/leads`);
    await page.waitForLoadState('networkidle');

    // Wait for tabs
    await page.waitForSelector('role=tablist', { timeout: 10000 });

    // Click on Evolution tab
    const evolutionTab = page.getByRole('tab', { name: /évolution/i });
    await evolutionTab.click();
    await page.waitForTimeout(500);

    // Check content changed
    await expect(page.getByText('Évolution Totale')).toBeVisible();

    // Click on Accounts tab
    const accountsTab = page.getByRole('tab', { name: /par compte/i });
    await accountsTab.click();
    await page.waitForTimeout(500);

    // Check for table
    await expect(page.getByText('Détails par Compte')).toBeVisible();

    // Click on Heatmap tab
    const heatmapTab = page.getByRole('tab', { name: /heatmap/i });
    await heatmapTab.click();
    await page.waitForTimeout(500);

    // Check heatmap title
    await expect(page.getByText('Heatmap Compte × Date')).toBeVisible();

    console.log('✅ Tab navigation working correctly');
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard/leads`);
    await page.waitForLoadState('networkidle');

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    const filtersDesktop = page.getByText('Filtres');
    await expect(filtersDesktop).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const filtersMobile = page.getByText('Filtres');
    await expect(filtersMobile).toBeVisible();

    console.log('✅ Responsive layout verified');
  });

  test('should check sidebar has leads analytics link', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard/leads`);
    await page.waitForLoadState('networkidle');

    // Check for sidebar link
    const sidebarLink = page.getByRole('link', { name: /leads analytics/i });
    await expect(sidebarLink).toBeVisible();

    // Check if link is highlighted (active)
    const activeLink = page.locator('a[href="/dashboard/leads"]');
    await expect(activeLink).toHaveClass(/bg-white\/10/);

    console.log('✅ Sidebar navigation link present and active');
  });

  test('full page screenshot and metrics', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard/leads`);
    await page.waitForLoadState('networkidle');

    // Wait for content to load
    await page.waitForTimeout(3000);

    // Take full page screenshot
    await page.screenshot({
      path: 'leads-analytics-full-page.png',
      fullPage: true
    });

    // Get page metrics
    const metrics = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      url: window.location.href,
      title: document.title,
    }));

    console.log('\n📐 Page metrics:', metrics);

    // Count visible charts
    const chartWrappers = page.locator('.recharts-wrapper');
    const chartCount = await chartWrappers.count();

    console.log(`📊 Found ${chartCount} Recharts visualizations`);

    console.log('\n✅ Full page test completed!');
  });
});
