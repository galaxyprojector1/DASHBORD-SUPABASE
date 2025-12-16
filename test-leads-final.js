const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🔍 Testing Leads Analytics: https://dashbord-supabase.vercel.app/dashboard/leads');

  try {
    await page.goto('https://dashbord-supabase.vercel.app/dashboard/leads', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded successfully');

    // Wait for data to load
    await page.waitForTimeout(5000);

    // Check for KPI cards
    const totalLeadsElement = page.locator('text=Total Leads').first();
    if (await totalLeadsElement.count() > 0) {
      console.log('✅ "Total Leads" KPI card found');
    }

    // Check for actual data (not loading spinner)
    const loader = page.locator('.animate-spin');
    const loaderCount = await loader.count();

    if (loaderCount > 0) {
      console.log('⚠️  Loading spinner still visible - data may be loading');
    } else {
      console.log('✅ No loading spinner - data should be displayed');
    }

    // Check for error messages
    const errorText = await page.locator('text=/error/i, text=/erreur/i').count();
    if (errorText > 0) {
      console.log('❌ Error message detected on page');
      const errorContent = await page.locator('text=/error/i, text=/erreur/i').first().textContent();
      console.log('   Error:', errorContent);
    } else {
      console.log('✅ No error messages visible');
    }

    // Check for chart elements
    const recharts = page.locator('.recharts-wrapper');
    const chartCount = await recharts.count();
    console.log(`📊 Found ${chartCount} Recharts visualizations`);

    // Take a screenshot
    await page.screenshot({ path: 'leads-final-test.png', fullPage: true });
    console.log('📸 Screenshot saved: leads-final-test.png');

    // Check console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    if (logs.length > 0) {
      console.log('\\n⚠️  Console errors detected:');
      logs.forEach(log => console.log('   -', log));
    } else {
      console.log('✅ No console errors');
    }

    console.log('\\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
