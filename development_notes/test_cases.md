# List of Test Cases

Scratch notes for different cases

## General text boxes

1. ✅✅Code injection? (SQL, HTML `<script>`, TS, etc)
2. ✅✅Special characters
3. ✅✅No value entered
4. ✅✅Invalid format
5. ✅✅Super long input
6. ✅✅Case sensitivity
7. ✅✅Leading/trailing whitespace


## First Page (Email only prompt)

### Email field

1. ✅Invalid email: Show error
2. ✅Valid & Unregistered email: Taken to next page
3. ✅Valid & Registered email: Taken to next page
4. ✅No email entered: Show error


### Other Login Options

1. ✅Verify buttons work


### Footer

1. ✅Verify links work


## Second Page (Email and Password option)

### Fields

1. ✅Edit email: Redirect to first page
2. ✅No password entered: error
3. ✅Invalid password: do nothing
4. ✅Password hidden by default
5. ✅Show password button reveals/hides password
6. ✅Forgot password: verify link is valid
7. ✅Create account button: verify link is valid


### Footer

1. ✅Verify links work

## Logout

1. ✅Basic logout: Redirects
2. ✅Session termination: back button does not gain access
3. ✅Manual entry of URL: should not work
4. ✅Verify local storage/cookies are cleared
5. ✅Multitab login/logout: Logout of one tab should invalidate the other
