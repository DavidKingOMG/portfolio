# Portfolio Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the current single-file portfolio into a modular static site with one easy-to-edit data file, real profile content, and a GitHub Pages hosting path.

**Architecture:** Keep the existing visual direction, but split the current monolithic page into a static shell, a stylesheet, a behavior/rendering script, and a single JavaScript data source that holds all editable portfolio content. The rendering script should populate the page from the data file so future updates happen in one place while preserving the current interactions and visual identity.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Three.js via CDN, GitHub Pages

---

## File Structure

- Create: `C:\Users\DK\Documents\Playground\Portfolio\assets\css\site.css`
  Responsibility: Hold all page styles currently embedded in `index.html`.
- Create: `C:\Users\DK\Documents\Playground\Portfolio\assets\js\site.js`
  Responsibility: Render data-driven sections, preserve fade-in behavior, and own the Three.js scene setup.
- Create: `C:\Users\DK\Documents\Playground\Portfolio\assets\data\profile.js`
  Responsibility: Export one readable object containing editable profile text, links, stats, projects, skills, and experience.
- Modify: `C:\Users\DK\Documents\Playground\Portfolio\index.html`
  Responsibility: Become the page shell with containers/hooks, plus external references to CSS, data, and JS.
- Create: `C:\Users\DK\Documents\Playground\Portfolio\README.md`
  Responsibility: Explain local editing workflow and GitHub Pages deployment steps.

### Task 1: Capture Current Structure

**Files:**
- Modify: `C:\Users\DK\Documents\Playground\Portfolio\index.html`

- [ ] **Step 1: Read the current HTML and identify content buckets**

Buckets to extract:
- Hero identity and intro
- About copy
- Stats
- Projects
- Skills
- Experience
- Contact links

- [ ] **Step 2: Mark which content should become editable data**

Editable fields to move into `profile.js`:

```js
export const profile = {
  identity: {
    name: "",
    roleLine: "",
    intro: "",
    eyebrow: ""
  },
  about: {
    title: "",
    paragraphs: ["", ""]
  },
  stats: [
    { value: "", label: "" }
  ],
  links: {
    email: "",
    linkedin: "",
    github: "",
    x: ""
  },
  projects: [
    {
      id: "",
      title: "",
      description: "",
      tags: [""],
      href: "",
      featured: false
    }
  ],
  skills: [
    {
      category: "",
      items: [""]
    }
  ],
  experience: [
    {
      dates: "",
      duration: "",
      role: "",
      company: "",
      description: "",
      badge: ""
    }
  ]
};
```

- [ ] **Step 3: Commit**

```bash
git add C:\Users\DK\Documents\Playground\Portfolio\index.html
git commit -m "chore: capture portfolio content structure"
```

### Task 2: Create the Editable Data File

**Files:**
- Create: `C:\Users\DK\Documents\Playground\Portfolio\assets\data\profile.js`

- [ ] **Step 1: Create the data directory**

Run:

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\DK\Documents\Playground\Portfolio\assets\data"
```

Expected: directory created or already exists

- [ ] **Step 2: Write the data file with real fields and readable comments**

```js
export const profile = {
  identity: {
    name: "Your Real Name",
    roleLine: "Your real role line",
    intro: "Short real introduction",
    eyebrow: "Optional top-line label"
  },
  about: {
    title: "Personal Dossier",
    paragraphs: [
      "Real paragraph one.",
      "Real paragraph two.",
      "Real paragraph three."
    ]
  },
  stats: [
    { value: "5+", label: "Years Experience" },
    { value: "12", label: "Projects Shipped" }
  ]
};
```

- [ ] **Step 3: Load the file in the browser via ES module export**

Expected: no syntax errors when imported by `site.js`

- [ ] **Step 4: Commit**

```bash
git add C:\Users\DK\Documents\Playground\Portfolio\assets\data\profile.js
git commit -m "feat: add editable portfolio data file"
```

### Task 3: Extract CSS Into a Dedicated Stylesheet

**Files:**
- Create: `C:\Users\DK\Documents\Playground\Portfolio\assets\css\site.css`
- Modify: `C:\Users\DK\Documents\Playground\Portfolio\index.html`

- [ ] **Step 1: Create the CSS directory**

Run:

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\DK\Documents\Playground\Portfolio\assets\css"
```

Expected: directory created or already exists

- [ ] **Step 2: Move all inline styles from `index.html` into `site.css`**

Keep:
- Existing color variables
- Responsive rules
- Animation rules
- Current visual identity

- [ ] **Step 3: Replace the inline `<style>` block with a stylesheet link**

```html
<link rel="stylesheet" href="./assets/css/site.css">
```

- [ ] **Step 4: Open the page and verify styles still load**

Expected: page appearance matches the current design closely

- [ ] **Step 5: Commit**

```bash
git add C:\Users\DK\Documents\Playground\Portfolio\assets\css\site.css C:\Users\DK\Documents\Playground\Portfolio\index.html
git commit -m "refactor: extract portfolio styles"
```

### Task 4: Turn HTML Into a Renderable Shell

**Files:**
- Modify: `C:\Users\DK\Documents\Playground\Portfolio\index.html`

- [ ] **Step 1: Keep static layout scaffolding and replace repeated content with render targets**

Recommended targets:

```html
<h1 id="hero-name"></h1>
<p id="hero-role-line"></p>
<p id="hero-intro"></p>
<div id="stats-grid"></div>
<div id="projects-grid"></div>
<div id="skills-map"></div>
<div id="experience-list"></div>
<div id="contact-links"></div>
```

- [ ] **Step 2: Preserve IDs/classes needed for existing styling and scrolling**

Do not remove:
- `#hero`
- `#about`
- `#projects`
- `#skills`
- `#experience`
- `#contact`
- `.fade-in`
- `#vault-canvas`

- [ ] **Step 3: Keep import map and script module loading hooks**

Expected final shell:

```html
<script type="importmap">...</script>
<script type="module" src="./assets/js/site.js"></script>
```

- [ ] **Step 4: Commit**

```bash
git add C:\Users\DK\Documents\Playground\Portfolio\index.html
git commit -m "refactor: convert portfolio page to render shell"
```

### Task 5: Build the Rendering Script

**Files:**
- Create: `C:\Users\DK\Documents\Playground\Portfolio\assets\js\site.js`

- [ ] **Step 1: Create the JS directory**

Run:

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\DK\Documents\Playground\Portfolio\assets\js"
```

Expected: directory created or already exists

- [ ] **Step 2: Import the editable data file**

```js
import * as THREE from "three";
import { profile } from "../data/profile.js";
```

- [ ] **Step 3: Write small render helpers for each section**

Recommended functions:

```js
function renderIdentity(profile) {}
function renderStats(stats) {}
function renderProjects(projects) {}
function renderSkills(skills) {}
function renderExperience(experience) {}
function renderLinks(links) {}
```

- [ ] **Step 4: Render arrays into HTML with defensive defaults**

Example:

```js
function renderStats(stats = []) {
  const container = document.getElementById("stats-grid");
  container.innerHTML = stats.map(({ value, label }) => `
    <div class="stat-item">
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
    </div>
  `).join("");
}
```

- [ ] **Step 5: Move the current fade-in observer code into `site.js`**

Expected: scrolling animations still work

- [ ] **Step 6: Move the current Three.js canvas scene into `site.js`**

Expected: the 3D background still renders after the split

- [ ] **Step 7: Initialize rendering only after DOM content is available**

```js
renderIdentity(profile);
renderStats(profile.stats);
renderProjects(profile.projects);
renderSkills(profile.skills);
renderExperience(profile.experience);
renderLinks(profile.links);
```

- [ ] **Step 8: Commit**

```bash
git add C:\Users\DK\Documents\Playground\Portfolio\assets\js\site.js
git commit -m "feat: render portfolio from editable data"
```

### Task 6: Replace Fictional Content With Real Content

**Files:**
- Modify: `C:\Users\DK\Documents\Playground\Portfolio\assets\data\profile.js`

- [ ] **Step 1: Replace fictional identity fields with real values**

Update:
- Name
- Role line
- Intro
- About paragraphs

- [ ] **Step 2: Replace placeholder links with real links**

Required:
- Email
- LinkedIn
- GitHub

Optional:
- X/Twitter
- Resume
- Project demos

- [ ] **Step 3: Replace sample projects with real projects**

Each project should include:
- Real title
- One concise description
- 3-5 tech tags
- Real link if available

- [ ] **Step 4: Replace sample experience and stats**

Expected: no fictional company names or fictional achievement metrics remain

- [ ] **Step 5: Commit**

```bash
git add C:\Users\DK\Documents\Playground\Portfolio\assets\data\profile.js
git commit -m "feat: add real portfolio content"
```

### Task 7: Add Free Hosting Documentation

**Files:**
- Create: `C:\Users\DK\Documents\Playground\Portfolio\README.md`

- [ ] **Step 1: Document local editing**

Include:
- Which single file to edit
- How to preview locally
- Which files should rarely need changes

- [ ] **Step 2: Document GitHub Pages deployment**

Include exact flow:

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

Then explain:
- GitHub repo settings
- Pages
- Deploy from `main` branch / root

- [ ] **Step 3: Document final free URL format**

```text
https://<username>.github.io/<repo>/
```

- [ ] **Step 4: Commit**

```bash
git add C:\Users\DK\Documents\Playground\Portfolio\README.md
git commit -m "docs: add portfolio editing and deployment guide"
```

### Task 8: Manual Verification

**Files:**
- Verify: `C:\Users\DK\Documents\Playground\Portfolio\index.html`
- Verify: `C:\Users\DK\Documents\Playground\Portfolio\assets\css\site.css`
- Verify: `C:\Users\DK\Documents\Playground\Portfolio\assets\js\site.js`
- Verify: `C:\Users\DK\Documents\Playground\Portfolio\assets\data\profile.js`

- [ ] **Step 1: Open the site locally and verify rendering**

Checklist:
- Hero shows real name and role
- Stats render from data file
- Projects render from data file
- Links render from data file
- Three.js background still works
- Fade-in animations still work

- [ ] **Step 2: Verify responsive behavior**

Checklist:
- Desktop layout matches intended design
- Mobile layout remains readable
- Navigation still works

- [ ] **Step 3: Verify editing workflow**

Test:
- Change one project title in `profile.js`
- Refresh page
- Confirm the UI updates without editing HTML

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: finalize modular portfolio refactor"
```
