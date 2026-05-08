# List of Test Cases

Scratch notes for different cases

## General text boxes

1. Code injection? (SQL, HTML `<script>`, TS, etc)
2. Special characters
3. No value entered
4. Invalid format
5. Super long input
6. Case sensitivity
7. Leading/trailing whitespace


## First Page (Email only prompt)

### Email field

1. ✅Invalid email: Show error
2. ✅Valid & Unregistered email: Taken to next page
3. ✅Valid & Registered email: Taken to next page
4. ✅No email entered: Show error
5. Continue button vs pressing enter


### Create Account

1. Verify link works


### Other Login Options

1. Verify buttons work


### Footer

1. Verify links work


## Second Page (Email and Password option)

### Fields

1. Edit email: Redirect to first page
2. No password entered: error
3. Invalid password: do nothing
4. Password hidden by default
5. Show password button reveals/hides password
6. Forgot password: verify link is valid
7. Continue button vs pressing enter
8. Create account button: verify link is valid


### Footer

1. Verify links work


## Hotkeys

1. Tab to switch between fields
2. Enter to submit form items


## Other Possible Cases

1. Attempt login with direct API call
2. Mess with state in URL
3. Rate limiting? Can i keep trying login attempts?
4. Unexpected things in HTML?
5. Unexpected console errors/logs?
6. User stays logged in after closing/reopening browser
7. Session timeout?
8. Cookie/Local storage?
9. Concurrent login? Multiple device login?
10. Different screen sizes
11. Errors don't leak data
