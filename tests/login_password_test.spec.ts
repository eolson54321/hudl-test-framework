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
});
