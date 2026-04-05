# Portfolio

This is a static, Vite-served portfolio site. The page shell, styles, and client-side behavior live in the repository, while the main editable content is centralized in `assets/data/profile.js`.

## Edit Content

If you want to update the portfolio copy, links, sections, or personal details, start with `assets/data/profile.js`. That file is the single source of truth for the site content.

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Vite dev server:

   ```bash
   npm run dev
   ```

3. For a production-style local preview:

   ```bash
   npm run build
   npm run preview
   ```

## Contact Form Activation

The contact form posts to FormSubmit. On the first real submission for a new site URL, FormSubmit may pause delivery and send an activation email to `davidmoya1309@gmail.com`.

If the page shows an activation-required message:

1. Open the inbox for `davidmoya1309@gmail.com`.
2. Find the message from `FormSubmit <submissions@formsubmit.co>`.
3. Click the `Activate Form` link in that email.
4. Retry the submission from the same site URL and confirm it arrives.

## Publish to GitHub Pages

This repo includes a GitHub Actions workflow that builds the site and deploys it to GitHub Pages automatically.

1. Push this project to a GitHub repository.
2. In the repository settings, open `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to the `main` branch.
5. Wait for the `Deploy to GitHub Pages` workflow to finish.

If you are publishing from a project repository, keep the Vite base path aligned with your final URL. The current setup is intended to be portable and safe for static hosting.

## Published URL

For a project site, the URL format is:

```text
https://<your-github-username>.github.io/<repository-name>/
```

If the repository is named `<your-github-username>.github.io`, the published URL becomes:

```text
https://<your-github-username>.github.io/
```
