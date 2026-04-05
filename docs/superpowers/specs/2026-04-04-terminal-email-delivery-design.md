# Terminal Email Delivery Design

Date: 2026-04-04
Project: Portfolio terminal contact delivery
Status: Draft for review

## Goal

Turn the existing terminal contact form into a working inquiry pipeline that sends each submitted message directly to `davidmoya1309@gmail.com` without adding a custom backend.

## User Intent

The user wants the terminal section to feel real and useful, but does not want to build or host backend infrastructure for contact delivery. The site is already deployed as a static GitHub Pages portfolio, so the solution needs to work cleanly in that environment.

The user explicitly wants:

- email-only delivery
- no custom backend
- a third-party form service
- the existing terminal UI to remain the main contact surface

## Constraints

- Keep the site static and GitHub Pages compatible
- Avoid adding a server, database, or serverless function
- Prefer a lightweight integration with minimal new dependencies
- Preserve the terminal design and existing form layout
- Provide visible success/failure feedback in the page

## Recommended Approach

Use a third-party static form endpoint, with FormSubmit as the fixed target.

This approach keeps the site deployment simple while making the form actually useful. The form will submit to FormSubmit, and FormSubmit will send inquiry emails to the configured inbox.

## Alternatives Considered

### 1. FormSubmit

Use a direct form-post endpoint that emails submissions to the target address.

Pros:

- fastest setup
- works well with static hosting
- no client SDK required
- very small code change surface

Cons:

- public endpoint is visible in client markup
- limited control compared with a backend
- first submission usually requires email activation

### 2. EmailJS

Use a client-side email API with service and template IDs.

Pros:

- more customizable
- can be integrated more deeply into custom client-side UX

Cons:

- more moving parts
- introduces more client-side configuration
- not necessary for the current goal

### 3. Formspree

Use a hosted form-processing service with inbox-style features.

Pros:

- mature product
- optional dashboard and spam tooling

Cons:

- more product surface than needed
- less direct than the user’s email-only requirement

## UX Design

The terminal section stays visually the same, but the form becomes operational.

Behavior:

- user fills in identifier, return channel, and message
- submit button enters a sending state
- JavaScript intercepts the submit and sends the form data to the FormSubmit endpoint in place
- success displays an in-page confirmation message
- failure displays a clear retry message without navigating away from the site

The page should continue to feel like a polished terminal interaction, not a generic redirected contact form.

## Technical Shape

The implementation should stay inside the current static site structure.

Expected implementation boundaries:

- update the existing terminal form in `index.html`
- set the form endpoint to the FormSubmit target for `davidmoya1309@gmail.com` using the AJAX-friendly submission flow
- add the provider hidden fields needed for email-only delivery and honeypot-based anti-spam protection
- wire JavaScript-intercepted submit handling in `assets/js/site.js`
- add minimal styling support in `assets/css/site.css` only if needed for form states or inline messaging

No new backend code should be introduced.

## Operational Notes

- the provider endpoint will be public in the client-side form
- the implementation should use JavaScript `fetch` submission to the exact FormSubmit endpoint pattern `https://formsubmit.co/ajax/davidmoya1309@gmail.com` so the page can stay in place and show inline success or error states
- the implementation should treat a successful JSON response from the provider as success and a non-2xx or error response as failure
- the form should include FormSubmit hidden fields for subject and reply routing, and should explicitly disable CAPTCHA in favor of a hidden honeypot field
- the destination inbox may require one-time activation through a provider confirmation email
- spam protection will use a hidden honeypot field as the chosen anti-spam strategy for this phase
- this phase is email-only and does not include message storage or a dashboard

## Field Mapping

The terminal form should map fields explicitly as follows:

- visible input `name="name"`: sender name or handle for display in the email body
- visible input `name="email"`: required return email and the sender reply-to address
- visible textarea `name="message"`: required inquiry body
- hidden input `name="_subject"`: fixed email subject such as `Portfolio Terminal Inquiry`
- hidden input `name="_replyto"`: populated from the required return email field before submission
- hidden input `name="_captcha"`: fixed to `false`
- hidden honeypot input `name="_honey"`: left empty by normal users and used to reject bot-style submissions

Expected email metadata:

- subject should identify the site inquiry clearly, such as `Portfolio Terminal Inquiry`
- reply-to should be set from the required `Return Channel` email
- email body should include the identifier, return email, and message content in a readable order

Validation expectations:

- `Return Channel` must be a required valid email
- `Message` must be required
- `Identifier` may remain optional unless implementation needs it required for cleaner email formatting
- the honeypot field must remain visually hidden and should stay empty for normal human submissions

## Risks

### Form provider activation

The inbox may not receive messages until the provider confirmation step is completed. The mitigation is to test a real submission after wiring the form.

### Spam exposure

Public forms can attract abuse. The mitigation is to use the provider’s recommended hidden fields and the simplest available anti-spam options that fit a static site.

### UX regression

If the form redirects abruptly or lacks feedback, the terminal section will feel unfinished. The mitigation is to preserve the existing UI and handle success/error states in-page.

## Validation

This integration is successful if:

- submitting the terminal form results in an email arriving at `davidmoya1309@gmail.com`
- the terminal section stays visually consistent with the rest of the site
- the user sees a clear success or error state in the page
- the site still works correctly on GitHub Pages without any backend

## Out Of Scope

- backend or serverless email delivery
- contact database or dashboard
- analytics for inquiries
- CAPTCHA-heavy anti-spam flows unless required later
- redesigning the terminal section beyond the minimum interaction states
