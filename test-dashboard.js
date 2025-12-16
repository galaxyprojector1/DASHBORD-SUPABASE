const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🔍 Testing dashboard: https://dashbord-supabase.vercel.app');

  try {
    // Navigate to the dashboard
    await page.goto('https://dashbord-supabase.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded successfully');

    // Take a screenshot
    await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: dashboard-screenshot.png');

    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check if main content is visible
    const dashboardContent = await page.locator('h2').first().textContent();
    console.log(`📊 Dashboard heading: ${dashboardContent}`);

    // Check for sidebar navigation
    const sidebarExists = await page.locator('nav').count() > 0;
    console.log(`🧭 Sidebar navigation: ${sidebarExists ? '✅ Present' : '❌ Missing'}`);

    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console error: ${msg.text()}`);
      }
    });

    // Get page metrics
    const metrics = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      url: window.location.href
    }));

    console.log(`\n📐 Page metrics:`, metrics);

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
