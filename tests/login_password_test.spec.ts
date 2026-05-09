import { test, expect, Page } from '@playwright/test';

const loginPage = 'https://www.hudl.com/login'

const dummyEmail = 'abc@domain.com'

async function enterEmail(page: Page, email: string): Promise<void> {
    const form = page.locator('form').filter({ hasText: 'Email' });
    await form.getByRole('textbox').fill(email);
    await form.getByRole('button', { name: 'Continue' }).click();
    // Wait for the password field to appear before proceeding
    await expect(page).toHaveURL(/\/password/i);
}


test.describe('Password Page Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(loginPage);
    });

    test('edit email', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const form = page.locator('form').filter({ hasText: 'Password' });
        
        await form.getByRole('link', { name: 'Edit' }).click();
        // Verify redirect
        await expect(page).toHaveURL(/\/login/);
    });

    test('password hidden by default', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const form = page.locator('form').filter({ hasText: 'Password' });

        const passwordInput = form.getByRole('textbox', { name: 'Password' });
        // "password" type masks the characters
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('show password button reveals/hides password', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const form = page.locator('form').filter({ hasText: 'Password' });

        const passwordInput = form.getByRole('textbox', { name: 'Password' });
        const toggleButton = form.getByRole('button', { name: /password/i });

        // Click to show
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click to hide
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('empty password field', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const form = page.locator('form').filter({ hasText: 'password' });
        await form.getByRole('button', { name: 'Continue' }).click();
        
        await expect(form).toContainText('Please enter your password');
    });

    test('invalid email and password', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const form = page.locator('form').filter({ hasText: 'password' });
        const passwordInput = form.getByRole('textbox', { name: 'Password' });

        await passwordInput.fill('WrongPassword123');
        await form.getByRole('button', { name: 'Continue' }).click()
        
        await expect(form).toContainText('Incorrect username or password.');
    });

    test('valid email and incorrect password', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const form = page.locator('form').filter({ hasText: 'password' });
        const passwordInput = form.getByRole('textbox', { name: 'Password' });

        await passwordInput.fill('WrongPassword123');
        await form.getByRole('button', { name: 'Continue' }).click()
        
        await expect(form).toContainText('Your email or password is incorrect. Try again.');
    });

    test('valid email and password', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const form = page.locator('form').filter({ hasText: 'password' });
        const passwordInput = form.getByRole('textbox', { name: 'Password' });

        await passwordInput.fill(process.env.LOGIN_PASSWORD);
        await form.getByRole('button', { name: 'Continue' }).click()
        
        await expect(page).toHaveURL(/\/home/);
    });

    test('prevent code injection (XSS/SQLi)', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const form = page.locator('form').filter({ hasText: 'password' });
        const passwordInput = form.getByRole('textbox', { name: 'Password' });
        
        const injectionStrings = [
            "<script>alert('xss')</script>",  // HTML/JS
            "password' OR '1'='1",            // SQL Injection
            "${process.env.LOGIN_PASSWORD}"   // Template Literal/TS
        ];

        // Enter each string into email field
        for (const payload of injectionStrings) {
            await passwordInput.fill(payload);
            await form.getByRole('button', { name: 'Continue' }).click();
            await expect(form).toContainText('Your email or password is incorrect. Try again.');
        }
    });

    test('special characters handling', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const form = page.locator('form').filter({ hasText: 'password' });
        const passwordInput = form.getByRole('textbox', { name: 'Password' });

        const invalidFormats = [
            '!#$%^&*()',
            '😁',
            '𝐍𝐚𝐦𝐞',
            '\t',
            '𖦹',
        ];

        // Enter each format
        for (const invalid of invalidFormats) {
            await passwordInput.fill(invalid);
            await form.getByRole('button', { name: 'Continue' }).click();
            await expect(form).toContainText('Incorrect username or password.');
        }
    });

    test('long input string', async ({ page }) => {
        await enterEmail(page, dummyEmail);
        const form = page.locator('form').filter({ hasText: 'password' });
        const passwordInput = form.getByRole('textbox', { name: 'Password' });

        const longPassword = 'a'.repeat(10_000);
        await passwordInput.fill(longPassword);
        await form.getByRole('button', { name: 'Continue' }).click();
        await expect(form).toContainText('Incorrect username or password.');
    });

    test('password case insensitivity', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const form = page.locator('form').filter({ hasText: 'password' });
        const passwordInput = form.getByRole('textbox', { name: 'Password' });

        const password = process.env.LOGIN_PASSWORD.toUpperCase();
        await passwordInput.fill(password);
        await form.getByRole('button', { name: 'Continue' }).click();
        await expect(form).toContainText('Your email or password is incorrect. Try again.');
    });

    test('no trim of leading and trailing whitespace', async ({ page }) => {
        await enterEmail(page, process.env.LOGIN_EMAIL);
        const form = page.locator('form').filter({ hasText: 'password' });
        const passwordInput = form.getByRole('textbox', { name: 'Password' });
    
        const email = `  ${process.env.LOGIN_PASSWORD}   `;
        await passwordInput.fill(email);
        await form.getByRole('button', { name: 'Continue' }).click();

        await expect(form).toContainText('Your email or password is incorrect. Try again.');
    });
});
