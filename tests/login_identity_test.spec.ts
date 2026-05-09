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
    const form = page.locator('form').filter({ hasText: 'Email' });

    // Press "Continue" button
    await form.getByRole('button', { name: 'Continue' }).click();
    // Verify error text is shown
    await expect(form).toContainText('Please enter your email address');
});

test('unregistered email', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form').filter({ hasText: 'Email' });
    
    // Enter unregistered email
    await form.getByRole('textbox').fill(dummyEmail);
    await form.getByRole('button', { name: 'Continue' }).click();
    // Verify redirect to /login/password
    await expect(page).toHaveURL(/\/login\/password/);
});

test('registered email', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form').filter({ hasText: 'Email' });
    
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
    const form = page.locator('form').filter({ hasText: 'Email' });
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
    const form = page.locator('form').filter({ hasText: 'Email' });
    
    const injectionStrings = [
        "<script>alert('xss')</script>",  // HTML/JS
        "email@example.com' OR '1'='1",   // SQL Injection
        "${process.env.LOGIN_EMAIL}"      // Template Literal/TS
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
    const form = page.locator('form').filter({ hasText: 'Email' });
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
    const form = page.locator('form').filter({ hasText: 'Email' });

    const longEmail = 'a'.repeat(10_000) + '@example.com';
    await form.getByRole('textbox').fill(longEmail);
    await form.getByRole('button', { name: 'Continue' }).click();
    await expect(form).toContainText('Enter a valid email.');
});

test('email case insensitivity', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form').filter({ hasText: 'Email' });

    const email = process.env.LOGIN_EMAIL.toUpperCase();
    await form.getByRole('textbox').fill(email);
    await form.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/login\/password/);
});

test('trim leading and trailing whitespace', async ({ page }) => {
    await page.goto(loginPage);
    const form = page.locator('form').filter({ hasText: 'Email' });

    const email = `  ${dummyEmail}   `;
    await form.getByRole('textbox').fill(email);
    await form.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/login\/password/);
});


// === Test Hyperlink(s) Functionality ===

test('all hiperlinks navigate to correct pages', async ({ page }) => {
    const hyperlinks = [
        { name: /Create Account/i, expectedPath: /\/signup/ },
        { name: /Privacy Policy/i, expectedPath: /\/privacy/ },
        { name: /Terms of Service/i, expectedPath: /\/terms/ },
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


// === Test External Login Redirects ===

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
