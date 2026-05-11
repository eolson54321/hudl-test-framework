import { test, expect, Page } from '@playwright/test';

const loginPage = 'https://www.hudl.com/login'

async function login(page: Page): Promise<void> {
    await page.goto(loginPage);

    // Identity page
    const emailInput = page.locator('[data-qa-id="email-input-input"]');
    const continueButton = page.locator('button[type="submit"]');

    await emailInput.fill(process.env.LOGIN_EMAIL);
    await continueButton.click();
    // Ensure we have moved to the password page
    await expect(page).toHaveURL(/\/password/);

    // Login page
    const passwordInput = page.locator('[data-qa-id="password-input-input"]');

    await passwordInput.fill(process.env.LOGIN_PASSWORD);
    await continueButton.click();
    // Ensure we have logged in successfully
    await expect(page).toHaveURL(/\/home/);
}

async function logout(page: Page) {
    const menu = page.locator('div.hui-globalusermenu');
    const logoutButton = page.locator('[data-qa-id="webnav-usermenu-logout"]').first();

    await menu.hover();
    await logoutButton.click();
}

test.describe('Logout Tests', () => {

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('logout', async ({ page }) => {
        await logout(page);

        // Verify redirect
        await expect(page).toHaveURL("https://www.hudl.com/");
    });

    test('no back button', async ({ page }) => {
        await logout(page);

        // Go back and reload page
        await page.goBack();
        await page.reload();
        // Verify redirect to login page
        await expect(page).toHaveURL(/\/identity/);
    });

    test('no url manipulation', async ({ page }) => {
        await logout(page);

        // Attempt to jump directly to a protected URL
        await page.goto('https://www.hudl.com/home'); 

        await expect(page).toHaveURL(/\/identity/);
    });

    test('verify CloudFront session cookies are cleared on logout', async ({ page, context }) => {
        await logout(page);
        await expect(page).toHaveURL("https://www.hudl.com/");

        const postLogoutCookies = await context.cookies();
        const cookieNames = ['CloudFront-Policy', 'CloudFront-Signature', 'CloudFront-Key-Pair-Id'];
        
        cookieNames.forEach(cookieName => {
            const cookie = postLogoutCookies.find(cookie => cookie.name === cookieName);
            expect(cookie, `Cookie ${cookieName} should be deleted`).toBeUndefined();
        });
    });

    test('logging out of one tab invalidates the session in all tabs', async ({ browser }) => {
        const context = await browser.newContext();
        
        // Open two tabs
        const tabA = await context.newPage();
        const tabB = await context.newPage();

        // Log in on Tab A (Tab B will now be logged in too because of shared cookies)
        await login(tabA);
        await tabB.goto('https://www.hudl.com/home');
        await expect(tabA).toHaveURL(/\/home/);
        await expect(tabB).toHaveURL(/\/home/);

        // Perform logout on Tab A & verify redirect
        await logout(tabA);
        await expect(tabA).toHaveURL("https://www.hudl.com/");

        // Try to interact with Tab B & verify it is kicked to login screen
        await tabB.reload();
        await expect(tabB).toHaveURL(/\/identity/);
    });
});
