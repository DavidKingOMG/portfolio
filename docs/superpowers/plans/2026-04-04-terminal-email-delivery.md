# Terminal Email Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio terminal form send inquiry emails to `davidmoya1309@gmail.com` through FormSubmit AJAX while keeping the user on the page with inline success and error feedback.

**Architecture:** Keep the site fully static and integrate FormSubmit directly into the existing terminal form. Update the form markup with the exact provider field names and hidden fields, then add a small client-side submission flow in `assets/js/site.js` that validates, submits via `fetch`, and renders terminal-style status messaging without redirects.

**Tech Stack:** Static HTML, vanilla JavaScript, CSS, FormSubmit AJAX, GitHub Pages

---

## File Structure

- Modify: `index.html`
  - Own the terminal form markup, exact input `name` attributes, hidden provider fields, and an inline status outlet.
- Modify: `assets/js/site.js`
  - Own terminal form submission, reply-to field synchronization, loading state, success/error rendering, and graceful reset behavior.
- Modify: `assets/css/site.css`
  - Own only the minimum styles needed for sending, success, error, and hidden honeypot behavior.
- Verify: `assets/data/profile.js`
  - Confirm no content-model changes are required.
- Verify: `README.md`
  - Update only if the contact workflow adds a developer step worth documenting, such as FormSubmit inbox activation.

## Task 1: Wire the FormSubmit Markup Contract

**Files:**
- Modify: `index.html`
- Verify: `assets/data/profile.js`

- [ ] **Step 1: Inspect the existing terminal form and identify the current fields and submit button**

Expected result:
- confirm the form contains the visible fields for identifier, return channel, and message
- confirm there is a single submit button and no current backend behavior

- [ ] **Step 2: Update the visible inputs with the exact FormSubmit-compatible field names**

Implementation target:

```html
<input class="form-input" type="text" name="name" placeholder="Your name or handle" />
<input class="form-input" type="email" name="email" required placeholder="your@email.com" />
<textarea class="form-input" name="message" required rows="5" placeholder="Describe your request..."></textarea>
```

Expected result: the provider receives correctly named fields and the return email is required.

- [ ] **Step 3: Add the required hidden fields and honeypot field to the form**

Implementation target:

```html
<input type="hidden" name="_subject" value="Portfolio Terminal Inquiry" />
<input type="hidden" name="_captcha" value="false" />
<input type="hidden" name="_replyto" value="" />
<input type="text" name="_honey" class="form-honeypot" tabindex="-1" autocomplete="off" />
```

Expected result: the form contract is explicit and aligned with the approved spec.

- [ ] **Step 4: Add an explicit JavaScript hook and inline status element for terminal-style send feedback**

Implementation target:

```html
<form class="contact-form" data-terminal-form>
<p class="form-status" data-form-status aria-live="polite"></p>
```

Expected result: the page has a stable JS hook plus a dedicated place for success and error messaging without redirecting.

- [ ] **Step 5: Commit the markup contract**

```bash
git add index.html
git commit -m "feat: add terminal email form contract"
```

## Task 2: Implement In-Place AJAX Submission

**Files:**
- Modify: `assets/js/site.js`

- [ ] **Step 1: Add a focused terminal form setup function instead of mixing logic into unrelated render code**

Implementation target:

```js
function setupTerminalForm() {
  const form = document.querySelector('[data-terminal-form]');
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
}
```

Expected result: terminal form behavior is isolated and easy to maintain.

- [ ] **Step 2: Sync the required reply-to hidden field from the visible email input before submit**

Implementation target:

```js
const emailInput = form.elements.namedItem('email');
const replyToInput = form.elements.namedItem('_replyto');
replyToInput.value = emailInput.value.trim();
```

Expected result: delivered emails are easy to reply to directly.

- [ ] **Step 3: Submit the form via `fetch` to the exact FormSubmit AJAX endpoint and handle success/failure in place**

Implementation target:

```js
const endpoint = 'https://formsubmit.co/ajax/davidmoya1309@gmail.com';
const formData = new FormData(form);
const response = await fetch(endpoint, {
  method: 'POST',
  body: formData,
  headers: { Accept: 'application/json' }
});
```

Success criteria:
- JSON success response shows success state
- non-2xx or thrown errors show error state
- no redirect occurs

- [ ] **Step 4: Add sending-state behavior and post-success reset behavior**

Implementation target:

```js
submitButton.disabled = true;
submitButton.textContent = 'Transmitting...';
statusElement.textContent = 'Secure channel opening...';
```

On success:

```js
form.reset();
statusElement.textContent = 'Transmission received. I will get back to you soon.';
```

Expected result: the interaction feels intentional and polished.

- [ ] **Step 5: Add explicit failure-path cleanup, call the terminal form setup during app boot, and commit the JS integration**

Failure-path requirement:

```js
submitButton.disabled = false;
submitButton.textContent = 'Transmit';
statusElement.textContent = 'Transmission failed. Please try again.';
```

Run:

```bash
git add assets/js/site.js
git commit -m "feat: submit terminal inquiries via formsubmit"
```

## Task 3: Add Minimal Form State Styling

**Files:**
- Modify: `assets/css/site.css`

- [ ] **Step 1: Add a visually hidden honeypot style that keeps the field out of normal interaction**

Implementation target:

```css
.form-honeypot {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

Expected result: the honeypot stays invisible to normal users.

- [ ] **Step 2: Add minimal terminal-style status states for idle, success, and error**

Implementation target:

```css
.form-status { min-height: 1.2rem; font-size: 11px; letter-spacing: 0.12em; }
.form-status-success { color: var(--cyan); }
.form-status-error { color: #ff8a8a; }
```

Expected result: users get clear feedback without a redesign.

- [ ] **Step 3: Add a sending-state button style only if the current button needs clearer disabled feedback**

Expected result: sending feels intentional, not broken.

- [ ] **Step 4: Run the production build to verify styling changes do not break the site**

Run: `npm run build`
Expected: `vite build` completes successfully

- [ ] **Step 5: Commit the styling pass**

```bash
git add assets/css/site.css
git commit -m "feat: add terminal form status states"
```

## Task 4: Verify the Full Contact Flow

**Files:**
- Verify: `index.html`
- Verify: `assets/js/site.js`
- Verify: `assets/css/site.css`
- Verify: `README.md`

- [ ] **Step 1: Run the local verification sequence**

Run:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Expected:
- production build succeeds
- preview loads
- terminal form renders correctly

- [ ] **Step 2: Verify field behavior and in-page messaging manually**

Checklist:
- return email is required
- message is required
- honeypot field is hidden
- submit button enters sending state
- success and error messages render inline

- [ ] **Step 3: Test a real submission and confirm the inbox activation step if needed**

Expected result:
- first provider activation email is completed if required
- a real inquiry reaches `davidmoya1309@gmail.com`
- reply-to is populated from the return email field

- [ ] **Step 4: Update `README.md` only if the file exists and a one-time setup note is helpful**

Suggested note if needed:
- FormSubmit inbox activation may require confirming the destination address after the first submission

- [ ] **Step 5: Create the final integration commit**

```bash
git add index.html assets/js/site.js assets/css/site.css README.md
git commit -m "feat: add terminal email delivery"
```

## Task 5: Publish the Contact Integration

**Files:**
- Verify: full branch state only

- [ ] **Step 1: Confirm the branch is clean and the contact flow is working locally**

Run:

```bash
git status --short
```

Expected: no unexpected changes remain

- [ ] **Step 2: Merge or push the finished work to `main` after approval so GitHub Pages actually deploys**

Run:

```bash
git push origin codex/portfolio-modularization:main
```

Expected: the push updates `main`, the GitHub Pages workflow starts, and the live site receives the working terminal contact flow
