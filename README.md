# Login Test Framework

This project aims to create a framework for end-to-end tests of the Hudl login page. `Node.js` is required for this project, `v24.15.0` was used during development.

## Setup

1. Install `Node.js` if necessary.
2. Download or clone this repository. (Make sure to unzip if downloaded)

    - The repository can be cloned with: `git clone https://github.com/eolson54321/hudl-test-framework.git`

3. Open a new terminal and navigate to the project: `cd /PATH/TO/hudl-test-framework`
4. Install project dependencies with:

    ```bash
    npm install
    ``` 

5. Playwright is used for this projects test suite. It can be installed with:

    ```bash
    npx playwright install
    ```

6. Environment variables need to be configured with valid login credentials.

    1. You will first need to create the `.env` file. This can be done from the example with the following command:

        ```bash
        cp .env.example .env
        ```

    2. Afterwards, open the new `.env` file and replace the placeholder username and password with valid login credentials.

7. The setup should now be complete. See the below steps for how to run the tests.

## Running the Tests

These tests verify different components of the Hudl login page. This is done by actually making login attempts at certain testing stages and running all tests at once will likely cause a `"You’ve tried to log in too many times, so we’ve temporarily blocked your account. To get help, contact support."` message to appear during the tests. Instead, it is best to run the tests in one of two ways:

1. **Run the test suites manually:** Running the test suites manually typically avoids this login rate limiting. The following commands will run each of the suites:

    - You can run the login `identity` page tests with the following command. These tests don't login so rate limiting isn't an issue.

        ```bash
        npx playwright test tests/login_identity_test.spec.ts
        ```

    - You can run the login `password` page tests with the following command. These tests are slowed down in an attempt to avoid too many login attempts at once.

        ```bash
        npx playwright test tests/login_password_test.spec.ts --workers 1
        ```

    - You can run the `logout` tests with the following command. These tests login, but typically don't cause any type of rate limiting as all logins are valid.

        ```bash
        npx playwright test tests/logout_test.spec.ts
        ```

2. **Using Playwright's UI mode**: Playwright's UI mode can be used to have easier control of which tests run when. This is another easy way of ensuring this rate limiting doesn't occur and cause tests to fail as tests can be run individually. Run all tests with the following command:

    ```bash
    npx playwright test --ui
    ```

    The left sidebar shows all the test suites which can be run. You can run each of the test suites using the green play button which appears after hovering over the desired test or test suite. A green checkmark with the `Passed` text should appear in the center column if all tests pass. Rerunning tests which have failed due to rate limiting should give them another change to pass.

> 🛈 **Note**
> 
>If you continue to get the max login attempt error, you can try changing the `dummyEmail` within `login_password_test.spec.ts` on line `5` to a different fake email.

## Important Files

This repository contains the foundation for creating future tests of the Hudl platform. The following files are important in making the existing tests work.

- `tests/`: This folder contains all end-to-end tests.

    - `login_identity_test.spec.ts`: Tests for the identity page of Hudl's login flow. These test the `email` field's functionality and hyperlinks found on the page.
    - `login_password_test.spec.ts`: Tests for the password page of Hudl's login flow. These test the `password` field's functionality, credential validation, and hyperlinks found on the page. Note that a dummy email address is used (when applicable) for most of these tests so that you don't get locked out of your account.
    - `logout_test.spec.ts`: Tests for the logout functionality of Hudl's login flow. These test different states of logging out.

- `playwright.config.ts`: Defines the config of how Playwright should run the tests.
- `.env`: Defines necessary environment variables for the tests. This file should be kept secret and needs to include valid login credentials.
- `devemopment_notes/test_cases.md`: This file contains notes I used when creating tests. This would likely not be present in production, or at least be written more formally, but I included it as it shows my thought process for creating tests. 

## Future Work

There are many missing aspects of this test suite. The following highlights a few key components for future work. 

1. End-to-end tests of the login page send multiple login attempts. This commonly results in a `"You’ve tried to log in too many times, so we’ve temporarily blocked your account. To get help, contact support."` message and the tests fail. Current work arounds run these tests slower, which is not ideal for scalability or a production environment. Running these tests in a development environment with no rate limiting or moving some tests to be unit tests instead would likely solve this problem. 

    - Note: I tried randomizing the email address which attempts log ins, but either the IP or session gets blocked, not the specific account trying to log in.

2. The logout tests require logging in before each test. Instead, this could be rewritten to capture the authentication cookies and use these instead. This would reduce the number of login attempts needed to run the tests and would likely speed these ones up. 

3. These tests strictly check the functionality of the `identity` and `password` pages and logging out. There is plenty of room for building upon this to add tests for account creation, password resets, or other aspects of the Hudl platform. This can be done by either modifying the existing test files within the `tests/` folder, or creating a new test file. Possible things to test:

    1. Logging in by directly calling the API
    2. Changing the state in the URL
    3. More direct testing of rate limiting
    4. Multi-device login
    5. Hotkeys (e.g., `tab`, `enter`, etc)

4. Currently, the GitHub workflow attempts to run all tests. Some tests require the `.env` file, which GitHub does not have, resulting in failing tests. 


## Other

- `ESLint` can be used to lint the project with `npx eslint tests`.
