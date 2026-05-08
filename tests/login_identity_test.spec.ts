import { test, expect } from '@playwright/test';

const loginPage = 'https://www.hudl.com/login'
const dummyEmail = 'abc@domain.com'

test('has title', async ({ page }) => {
    await page.goto(loginPage);

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Log In/);
});


// === Test Email Field Functionality ===

test('empty email field', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form');

    // Press "Continue" button
    await form.getByRole('button', { name: 'Continue' }).click();
    // Verify error text is shown
    await expect(form).toContainText('Please enter your email address')
});

test('unregistered email', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form');
    
    // Enter invalid email
    await form.getByRole('textbox').fill(dummyEmail);
    await form.getByRole('button', { name: 'Continue' }).click();
    // Verify redirect to /login/password
    await expect(page).toHaveURL(/\/login\/password/);
});

test('registered email', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form');
    
    // Enter valid email
    const email = process.env.LOGIN_EMAIL;
    if (!email) {
        throw new Error('LOGIN_EMAIL is not defined in the .env file');
    }

    await form.getByRole('textbox').fill(email);
    await form.getByRole('button', { name: 'Continue' }).click();
    // Verify redirect to /login/password
    await expect(page).toHaveURL(/\/login\/password/);
});

test('invalid email formats', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form');
    const formats = [
        'plainaddress',
        '@missing-username.com',
        'username@.com',
        'user@domain..com'
    ];

    // Enter each format
    for (const invalid of formats) {
        await form.getByRole('textbox').fill(invalid);
        await form.getByRole('button', { name: 'Continue' }).click();
        await expect(form).toContainText('Enter a valid email.');
    }
});

test('prevent code injection (XSS/SQLi)', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form');
    
    const injectionStrings = [
        "<script>alert('xss')</script>",  // HTML/JS
        "email@example.com' OR '1'='1",   // SQL Injection
        "${process.env.LOGIN_PASSWORD}"   // Template Literal/TS
    ];

    // Enter each string into email field
    for (const payload of injectionStrings) {
        await form.getByRole('textbox').fill(payload);
        await form.getByRole('button', { name: 'Continue' }).click();
        await expect(form).toContainText('Enter a valid email.');
    }
});

test('special characters handling', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form');
    const invalidFormats = [
        '!#$%^&*()@domain.com',
        '\\/@domain.com',
        '😁@domain.com',
        '𝐍𝐚𝐦𝐞@domain.com',
        '\t@domain.com',
    ];

    // Enter each format
    for (const invalid of invalidFormats) {
        await form.getByRole('textbox').fill(invalid);
        await form.getByRole('button', { name: 'Continue' }).click();
        await expect(form).toContainText('Enter a valid email.');
    }
});

test('long input string', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form');

    const longEmail = 'a'.repeat(10_000) + '@example.com';
    await form.getByRole('textbox').fill(longEmail);
    await form.getByRole('button', { name: 'Continue' }).click();
    await expect(form).toContainText('Enter a valid email.');
});

test('email case insensitivity', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form');

    const email = process.env.LOGIN_EMAIL.toUpperCase();
    await form.getByRole('textbox').fill(email);
    await form.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/login\/password/);
});

test('trim leading and trailing whitespace', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form');

    const email = `  ${dummyEmail}   `;
    await form.getByRole('textbox').fill(email);
    await form.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/login\/password/);
});
