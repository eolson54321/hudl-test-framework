import { test, expect } from '@playwright/test';

const loginPage = 'https://www.hudl.com/login'

const dummyEmail = 'abc123@domain.com'

test.describe('Email Field Functionality', () => {

    test('empty email field', async ({ page }) => {
        await page.goto(loginPage);
        const continueButton = page.locator('button[type="submit"]');
        const helpText = page.locator('[data-qa-id="email-input-help-text"]');

        // Press "Continue" button
        await continueButton.click();
        // Verify error text is shown
        await expect(helpText).toContainText('Please enter your email address');
    });

    test('unregistered email', async ({ page }) => {
        await page.goto(loginPage);
        const continueButton = page.locator('button[type="submit"]');
        const emailInput = page.locator('[data-qa-id="email-input-input"]');

        // Enter unregistered email
        await emailInput.fill(dummyEmail);
        await continueButton.click();
        // Verify redirect to /login/password
        await expect(page).toHaveURL(/\/login\/password/);
    });

    test('registered email', async ({ page }) => {
        await page.goto(loginPage);
        const continueButton = page.locator('button[type="submit"]');
        const emailInput = page.locator('[data-qa-id="email-input-input"]');
        
        // Enter valid email
        await emailInput.fill(process.env.LOGIN_EMAIL);
        await continueButton.click();
        // Verify redirect to /login/password
        await expect(page).toHaveURL(/\/login\/password/);
    });

    test('invalid email formats', async ({ page }) => {
        await page.goto(loginPage);
        const continueButton = page.locator('button[type="submit"]');
        const emailInput = page.locator('[data-qa-id="email-input-input"]');
        const helpText = page.locator('[data-qa-id="email-input-help-text"]');

        const formats = [
            'plainaddress',
            '@missing-username.com',
            'username@.com',
            'user@domain..com'
        ];

        // Enter each format
        for (const invalid of formats) {
            await emailInput.fill(invalid);
            await continueButton.click();
            await expect(helpText).toContainText('Enter a valid email.');
        }
    });

    test('prevent code injection (XSS/SQLi)', async ({ page }) => {
        await page.goto(loginPage);
        const continueButton = page.locator('button[type="submit"]');
        const emailInput = page.locator('[data-qa-id="email-input-input"]');
        const helpText = page.locator('[data-qa-id="email-input-help-text"]');

        const injectionStrings = [
            "<script>alert('xss')</script>",  // HTML/JS
            "email@example.com' OR '1'='1",   // SQL Injection
            "${process.env.LOGIN_EMAIL}"      // Template Literal/TS
        ];

        // Enter each string into email field
        for (const payload of injectionStrings) {
            await emailInput.fill(payload);
            await continueButton.click();
            await expect(helpText).toContainText('Enter a valid email.');
        }
    });

    test('special characters handling', async ({ page }) => {
        await page.goto(loginPage);
        const continueButton = page.locator('button[type="submit"]');
        const emailInput = page.locator('[data-qa-id="email-input-input"]');
        const helpText = page.locator('[data-qa-id="email-input-help-text"]');

        const invalidFormats = [
            '!#$%^&*()@domain.com',
            '\\/@domain.com',
            '😁@domain.com',
            '𝐍𝐚𝐦𝐞@domain.com',
            '\t@domain.com',
        ];

        // Enter each format
        for (const invalid of invalidFormats) {
            await emailInput.fill(invalid);
            await continueButton.click();
            await expect(helpText).toContainText('Enter a valid email.');
        }
    });

    test('long input string', async ({ page }) => {
        await page.goto(loginPage);
        const continueButton = page.locator('button[type="submit"]');
        const emailInput = page.locator('[data-qa-id="email-input-input"]');
        const helpText = page.locator('[data-qa-id="email-input-help-text"]');

        const longEmail = 'a'.repeat(10_000) + '@example.com';

        await emailInput.fill(longEmail);
        await continueButton.click();
        await expect(helpText).toContainText('Enter a valid email.');
    });

    test('email case insensitivity', async ({ page }) => {
        await page.goto(loginPage);
        const continueButton = page.locator('button[type="submit"]');
        const emailInput = page.locator('[data-qa-id="email-input-input"]');

        const email = process.env.LOGIN_EMAIL.toUpperCase();
        await emailInput.fill(email);
        await continueButton.click();
        await expect(page).toHaveURL(/\/login\/password/);
    });

    test('trim leading and trailing whitespace', async ({ page }) => {
        await page.goto(loginPage);
        const continueButton = page.locator('button[type="submit"]');
        const emailInput = page.locator('[data-qa-id="email-input-input"]');

        const email = `  ${dummyEmail}   `;
        await emailInput.fill(email);
        await continueButton.click();
        await expect(page).toHaveURL(/\/login\/password/);
    });
});

test.describe('External Link Functionality', () => {
    test('all hiperlinks navigate to correct pages', async ({ page }) => {
        const hyperlinks = [
            { name: 'Create Account', expectedPath: /\/signup/ },
            { name: 'Privacy Policy', expectedPath: /\/privacy/ },
            { name: 'Terms of Service', expectedPath: /\/terms/ },
        ];

        for (const link of hyperlinks) {
            await page.goto(loginPage);
            const anchor = page.getByRole('link', { name: link.name });

            // Verify link is visible
            await expect(anchor).toBeVisible();
            
            // Verify linked page is valid
            await anchor.click();
            await expect(page).toHaveURL(link.expectedPath);
        }
    });

    test('google login button redirects to google accounts', async ({ page }) => {
        await page.goto(loginPage);
        
        await page.getByRole('button', { name: /continue with google/i }).click();

        // Verify the url is a Google domain
        await expect(page).toHaveURL(/accounts\.google\.com/);
    });

    test('facebook login button redirects to facebook login page', async ({ page }) => {
        await page.goto(loginPage);
        
        await page.getByRole('button', { name: /continue with facebook/i }).click();

        // Verify the URL contains facebook.com
        await expect(page).toHaveURL(/facebook\.com/);
    });

    test('apple login button redirects to apple id page', async ({ page }) => {
        await page.goto(loginPage);
        
        await page.getByRole('button', { name: /continue with apple/i }).click();

        // Verify the URL contains appleid.apple.com
        await expect(page).toHaveURL(/appleid\.apple\.com/);
    });
});
