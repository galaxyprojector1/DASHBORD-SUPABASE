import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://dashbord-supabase.vercel.app';
const ADMIN_EMAIL = 'admin@dashbord.local';
const ADMIN_PASSWORD = 'Admin2025!Secure#Claude';
const MAX_WAIT_TIME = 5 * 60 * 1000; // 5 minutes

test.describe('Dashboard Authentication Tests', () => {

  test('1. Test de la page de login', async ({ page }) => {
    console.log('\n📝 Test 1: Page de login');
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    console.log(`⏱️  Page loaded in ${loadTime}ms`);

    await page.screenshot({ path: 'tests/screenshots/01-login-page.png', fullPage: true });

    // Vérifie le formulaire de connexion
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();
    console.log('✅ Champ Email présent');

    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(passwordInput).toBeVisible();
    console.log('✅ Champ Password présent');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    console.log('✅ Bouton "Se connecter" présent');
  });

  test('2. Test de l\'authentification réussie', async ({ page }) => {
    console.log('\n🔐 Test 2: Authentification');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    // Remplir le formulaire
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await emailInput.fill(ADMIN_EMAIL);
    console.log('✅ Email rempli');

    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await passwordInput.fill(ADMIN_PASSWORD);
    console.log('✅ Password rempli');

    await page.screenshot({ path: 'tests/screenshots/02-form-filled.png', fullPage: true });

    // Cliquer sur le bouton de connexion
    const startTime = Date.now();
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Attendre la redirection vers le dashboard
    await page.waitForURL('**/dashboard/leads', { timeout: 30000 });
    const authTime = Date.now() - startTime;
    console.log(`⏱️  Authentication completed in ${authTime}ms`);

    // Vérifier qu'on est bien sur la page leads
    expect(page.url()).toContain('/dashboard/leads');
    console.log('✅ Redirection vers /dashboard/leads réussie');

    await page.screenshot({ path: 'tests/screenshots/03-dashboard-logged-in.png', fullPage: true });
  });

  test('3. Test de protection du dashboard (sans authentification)', async ({ page, context }) => {
    console.log('\n🔒 Test 3: Protection du dashboard');

    // Créer un nouveau contexte sans cookies
    const newContext = await context.browser()?.newContext();
    if (!newContext) {
      throw new Error('Failed to create new context');
    }
    const newPage = await newContext.newPage();

    // Tenter d'accéder au dashboard sans être connecté
    await newPage.goto(`${BASE_URL}/dashboard/leads`, { waitUntil: 'networkidle' });

    // Vérifier la redirection vers /login
    await newPage.waitForURL('**/login', { timeout: 10000 });
    expect(newPage.url()).toContain('/login');
    console.log('✅ Redirection vers /login pour utilisateur non authentifié');

    await newPage.screenshot({ path: 'tests/screenshots/04-redirect-to-login.png', fullPage: true });

    await newContext.close();
  });

  test('4. Test de déconnexion', async ({ page }) => {
    console.log('\n🚪 Test 4: Déconnexion');

    // Se connecter d'abord
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await emailInput.fill(ADMIN_EMAIL);

    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await passwordInput.fill(ADMIN_PASSWORD);

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await page.waitForURL('**/dashboard/leads', { timeout: 30000 });
    console.log('✅ Connexion effectuée');

    // Chercher le bouton de déconnexion dans la sidebar
    const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Logout"), button:has-text("Se déconnecter")').first();

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      console.log('✅ Clic sur bouton Déconnexion');
    } else {
      // Chercher un lien de déconnexion
      const logoutLink = page.locator('a:has-text("Déconnexion"), a:has-text("Logout"), a:has-text("Se déconnecter")').first();
      await logoutLink.click();
      console.log('✅ Clic sur lien Déconnexion');
    }

    // Vérifier la redirection vers /login
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
    console.log('✅ Redirection vers /login après déconnexion');

    await page.screenshot({ path: 'tests/screenshots/05-after-logout.png', fullPage: true });

    // Tenter de retourner au dashboard
    await page.goto(`${BASE_URL}/dashboard/leads`, { waitUntil: 'networkidle' });

    // Vérifier qu'on est redirigé vers /login
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
    console.log('✅ Accès au dashboard bloqué après déconnexion');

    await page.screenshot({ path: 'tests/screenshots/06-blocked-after-logout.png', fullPage: true });
  });

  test('5. Test d\'erreur d\'authentification (mauvais credentials)', async ({ page }) => {
    console.log('\n❌ Test 5: Authentification avec mauvais credentials');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    // Remplir avec de mauvais credentials
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await emailInput.fill('wrong@email.com');

    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await passwordInput.fill('wrongpassword');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Attendre un message d'erreur ou rester sur la page de login
    await page.waitForTimeout(3000);

    // Vérifier qu'on est toujours sur /login
    expect(page.url()).toContain('/login');
    console.log('✅ Reste sur /login avec mauvais credentials');

    // Chercher un message d'erreur
    const errorMessage = page.locator('text=/Invalid|Error|incorrect|wrong/i').first();
    if (await errorMessage.isVisible()) {
      console.log('✅ Message d\'erreur affiché');
    } else {
      console.log('⚠️  Aucun message d\'erreur visible');
    }

    await page.screenshot({ path: 'tests/screenshots/07-invalid-credentials.png', fullPage: true });
  });
});
