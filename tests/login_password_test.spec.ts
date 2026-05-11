import { test, expect, Page } from '@playwright/test';

const loginPage = 'https://www.hudl.com/login'

const dummyEmail = 'abc123@domain.com'

async function enterEmail(page: Page, email: string): Promise<void> {
    await page.goto(loginPage);
    const emailInput = page.locator('[data-qa-id="email-input-input"]')
    const continueButton = page.locator('button[type="submit"]');

    await emailInput.fill(email);
    await continueButton.click();
    // Ensure we have moved to the password page
    await expect(page).toHaveURL(/\/password/);
}


test.describe('Password Entry Tests', () => {

    test('empty password field', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const continueButton = page.locator('button[type="submit"]');
        const helpText = page.locator('[data-qa-id="password-input-help-text"]')
        
        await continueButton.click();

        await expect(helpText).toContainText('Please enter your password');
    });

    test('invalid email and password', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const continueButton = page.locator('button[type="submit"]');
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');
        const helpText = page.locator('[data-qa-id="password-input-help-text"]')

        await passwordInput.fill('WrongPassword123');
        await continueButton.click()
        
        await expect(helpText).toContainText('Incorrect username or password.');
    });

    test('valid email and incorrect password', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const continueButton = page.locator('button[type="submit"]');
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');
        const helpText = page.locator('[data-qa-id="password-input-help-text"]')

        await passwordInput.fill('WrongPassword123');
        await continueButton.click()
        
        await expect(helpText).toContainText('Your email or password is incorrect. Try again.');
    });

    test('valid email and password', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const continueButton = page.locator('button[type="submit"]');
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');

        await passwordInput.fill(process.env.LOGIN_PASSWORD);
        await continueButton.click()
        
        await expect(page).toHaveURL(/\/home/);
    });

    test('space password', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const continueButton = page.locator('button[type="submit"]');
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');
        const helpText = page.locator('[data-qa-id="password-input-help-text"]')

        await passwordInput.fill(' ');
        await continueButton.click()
        
        await expect(helpText).toContainText('Please enter your password');
    });

    test('prevent code injection (XSS/SQLi)', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const continueButton = page.locator('button[type="submit"]');
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');
        const helpText = page.locator('[data-qa-id="password-input-help-text"]')
        
        const injectionStrings = [
            "<script>alert('xss')</script>",  // HTML/JS
            "password' OR '1'='1",            // SQL Injection
            "${process.env.LOGIN_PASSWORD}"   // Template Literal/TS
        ];

        // Enter each string into email field
        for (const payload of injectionStrings) {
            await passwordInput.fill(payload);
            await continueButton.click();
            await expect(helpText).toContainText('Your email or password is incorrect. Try again.');
        }
    });

    test('special characters handling', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const continueButton = page.locator('button[type="submit"]');
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');
        const helpText = page.locator('[data-qa-id="password-input-help-text"]')

        const invalidFormats = [
            '!#$%^&*()',
            '😁',
            '𝐍𝐚𝐦𝐞',
            '𖦹',
        ];

        // Enter each format
        for (const invalid of invalidFormats) {
            await passwordInput.fill(invalid);
            await continueButton.click();
            await expect(helpText).toContainText('Incorrect username or password.');
        }
    });

    test('long input string', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const continueButton = page.locator('button[type="submit"]');
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');
        const helpText = page.locator('[data-qa-id="password-input-help-text"]')

        const longPassword = 'a'.repeat(10_000);
        await passwordInput.fill(longPassword);
        await continueButton.click();
        await expect(helpText).toContainText('Incorrect username or password.');
    });

    test('password case insensitivity', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const continueButton = page.locator('button[type="submit"]');
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');
        const helpText = page.locator('[data-qa-id="password-input-help-text"]')

        const password = process.env.LOGIN_PASSWORD.toUpperCase();
        await passwordInput.fill(password);
        await continueButton.click();

        await expect(helpText).toContainText('Your email or password is incorrect. Try again.');
    });

    test('no trim of leading and trailing whitespace', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const continueButton = page.locator('button[type="submit"]');
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');
        const helpText = page.locator('[data-qa-id="password-input-help-text"]')
    
        const email = `  ${process.env.LOGIN_PASSWORD}   `;
        await passwordInput.fill(email);
        await continueButton.click();

        await expect(helpText).toContainText('Your email or password is incorrect. Try again.');
    });
});

test.describe('Password Page UI Tests', () => {

    test('edit email', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const editButton = page.locator('[data-qa-id="edit-identifier"]');

        await editButton.click();

        // Verify redirect
        await expect(page).toHaveURL(/\/login/);
        
        // Verify email field is empty
        const emailInput = page.locator('[data-qa-id="email-input-input"]');
        await expect(emailInput).toBeEmpty();
    });

    test('password hidden by default', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');

        // "password" type masks the characters
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('show password button reveals/hides password', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const passwordInput = page.locator('[data-qa-id="password-input-input"]');
        const toggleButton = page.locator('[data-qa-id="toggle-password-visibility"]');

        // Click to show
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click to hide
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('all hiperlinks navigate to correct pages', async ({ page }) => {
        const hyperlinks = [
            { name: 'Forgot Password?', expectedPath: /\/reset-password/ },
            { name: 'Create Account', expectedPath: /\/signup/ },
            { name: 'Privacy Policy', expectedPath: /\/privacy/ },
            { name: 'Terms of Service', expectedPath: /\/terms/ },
        ];

        for (const link of hyperlinks) {
            await enterEmail(page, dummyEmail);
            const anchor = page.getByRole('link', { name: link.name });

            // Verify link is visible
            await expect(anchor).toBeVisible();
            
            // Verify linked page is valid
            await anchor.click();
            await expect(page).toHaveURL(link.expectedPath);
        }
    });
});
