# Vault Scene Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the portfolio vault scene so the camera path stays above-ground, the pillars feel monumental, and the center object becomes a controlled particle energy core without disturbing the rest of the site.

**Architecture:** Keep the current modular site intact and isolate this pass to the Three.js scene layer. Refactor `setupScene()` in `assets/js/site.js` into clearer scene-building units, then adjust camera math, pillar geometry, and the centerpiece system in place. Use light-touch CSS only if the scene changes require presentation stabilization.

**Tech Stack:** Vite, vanilla JavaScript, Three.js, static CSS, GitHub Pages

---

## File Structure

- Modify: `assets/js/site.js`
  - Break the scene logic into smaller helpers inside the same file or closely-related units.
  - Own camera motion updates, pillar creation, centerpiece creation, and render-loop integration.
- Modify: `assets/css/site.css`
  - Only if needed to support scene stability or preserve visual readability after camera changes.
- Verify: `index.html`
  - Confirm scene hooks and canvas placement remain untouched.
- Verify: `package.json`
  - Reuse existing scripts only; no dependency expansion unless implementation proves it necessary.
- Verify: `README.md`
  - Update only if the scene behavior meaningfully changes developer workflow.

## Task 1: Stabilize Scene Architecture

**Files:**
- Modify: `assets/js/site.js`

- [ ] **Step 1: Write a small scene-structure checklist in comments or working notes before refactoring**

Checklist:
- identify current responsibilities inside `setupScene()`
- group logic into camera, environment, pillars, centerpiece, particles, and animation updates
- preserve existing external behavior before changing values

Expected result: a clear map of what code can move without changing behavior yet.

- [ ] **Step 2: Refactor `setupScene()` into focused helper units without changing visuals yet**

Implementation target:

```js
function createSceneEnvironment(scene) {}
function createVaultPillars(scene) {}
function createEnergyCore(scene) {}
function updateCameraFromScroll(camera, state) {}
function updateSceneAnimation(state, runtime) {}
```

Expected result: scene responsibilities are separated enough that the camera, pillars, and centerpiece can be changed independently.

- [ ] **Step 3: Run the production build to ensure the refactor did not break bundling**

Run: `npm run build`
Expected: `vite build` completes successfully

- [ ] **Step 4: Start local preview and sanity-check that the current scene still renders before visual changes**

Run: `npm run preview -- --host 127.0.0.1 --port 4173`
Expected: site loads and scene still appears before the next tasks change values

- [ ] **Step 5: Commit the architectural cleanup**

```bash
git add assets/js/site.js
git commit -m "refactor: organize vault scene systems"
```

## Task 2: Fix Camera Path and Scroll Descent

**Files:**
- Modify: `assets/js/site.js`
- Verify: `assets/css/site.css`

- [ ] **Step 1: Define the intended camera bounds in code before changing movement**

Implementation target:

```js
const CAMERA_LIMITS = {
  startY: 3.6,
  minY: 0.85,
  startZ: 15.5,
  minZ: 11.8,
  lookAtYFloor: -0.35
};
```

Expected result: camera tuning is explicit and easy to adjust.

- [ ] **Step 2: Replace the raw scroll drop with clamped motion**

Implementation target:

```js
const scrollProgress = Math.min(scrollY / maxScrollDistance, 1);
camera.position.y = THREE.MathUtils.lerp(CAMERA_LIMITS.startY, CAMERA_LIMITS.minY, scrollProgress);
camera.position.z = THREE.MathUtils.lerp(CAMERA_LIMITS.startZ, CAMERA_LIMITS.minZ, scrollProgress);
```

Expected result: the camera descends smoothly but never feels underground.

- [ ] **Step 3: Slow the look-target drift so the frame feels guided rather than reactive**

Implementation target:

```js
const lookTargetY = THREE.MathUtils.lerp(0.4, CAMERA_LIMITS.lookAtYFloor, scrollProgress);
camera.lookAt(targetX * 0.25, lookTargetY, -4.5);
```

Expected result: the scene keeps depth and focus near the terminal section.

- [ ] **Step 4: Run the production build and manually verify the terminal section no longer dips below the floor feel**

Run: `npm run build`
Expected: successful build, then preview check confirms above-ground framing through the contact section

- [ ] **Step 5: Commit the camera pass**

```bash
git add assets/js/site.js assets/css/site.css
git commit -m "feat: refine vault camera descent"
```

## Task 3: Scale the Pillars Into Monumental Architecture

**Files:**
- Modify: `assets/js/site.js`

- [ ] **Step 1: Increase pillar geometry size and set explicit pillar specs**

Implementation target:

```js
const PILLAR_SPEC = {
  width: 1.35,
  height: 22,
  depth: 1.35,
  stripWidth: 0.14,
  stripHeight: 16
};
```

Expected result: pillar scale is intentional, not buried in magic numbers.

- [ ] **Step 2: Reposition the pillar bases so the larger geometry still anchors correctly to the floor**

Implementation target:

```js
pillar.position.set(x, floorY + PILLAR_SPEC.height / 2, z);
strip.position.set(x + 0.48, floorY + PILLAR_SPEC.stripHeight / 2 + 1.2, z + 0.48);
```

Expected result: taller pillars rise from the floor naturally instead of floating or clipping.

- [ ] **Step 3: Adjust spacing or add one supporting pair only if the room still feels underscaled after resizing**

Guardrail:
- do not add decorative clutter
- only add geometry if the resized pillars alone do not create the intended vault scale

Expected result: stronger depth and security without overcrowding the chamber.

- [ ] **Step 4: Run preview and validate that the pillars frame the core and remain readable behind page content**

Run: `npm run preview -- --host 127.0.0.1 --port 4173`
Expected: pillars feel architectural and do not distract from text content

- [ ] **Step 5: Commit the pillar pass**

```bash
git add assets/js/site.js
git commit -m "feat: enlarge vault pillar architecture"
```

## Task 4: Replace the Centerpiece With a Controlled Energy Core

**Files:**
- Modify: `assets/js/site.js`

- [ ] **Step 1: Remove or disable the octahedron and ring systems behind a single clear replacement boundary**

Implementation target:

```js
// remove legacy centerpiece creation
// createControlledEnergyCore(scene)
```

Expected result: there is only one active centerpiece system in the scene.

- [ ] **Step 2: Create a stable spherical particle core with a moderate particle budget**

Implementation target:

```js
const CORE_PARTICLE_COUNT = 1800;
const CORE_RADIUS = 1.7;
```

Use:
- one `BufferGeometry`
- one `PointsMaterial`
- precomputed particle seeds for orbit offsets and pulse variation

Expected result: a dense, spherical, engineered core rather than a noisy cloud.

- [ ] **Step 3: Add restrained motion and pulse behavior inside the render loop**

Implementation target:

```js
core.rotation.y += 0.0025;
coreMaterial.opacity = 0.72 + Math.sin(time * 2.1) * 0.08;
cyanLight.intensity = 2.2 + Math.sin(time * 2.0) * 0.45;
```

Guardrails:
- no chaotic scatter
- no portrait logic
- preserve a controlled silhouette at all times

Expected result: the centerpiece reads as a controlled energy core and personal signature.

- [ ] **Step 4: Run the production build and manually inspect the hero, mid-scroll, and terminal sections**

Run: `npm run build`
Expected: successful build and no rendering regressions across the page

- [ ] **Step 5: Commit the centerpiece pass**

```bash
git add assets/js/site.js
git commit -m "feat: add controlled vault energy core"
```

## Task 5: Final Verification and Deployment Readiness

**Files:**
- Verify: `assets/js/site.js`
- Verify: `assets/css/site.css`
- Verify: `README.md`

- [ ] **Step 1: Run the full local verification sequence**

Run:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Expected:
- build succeeds
- site loads locally
- camera remains above-ground
- pillars feel larger
- energy core is visible and stable

- [ ] **Step 2: Compare the deployed UX against the validation list from the spec**

Checklist:
- terminal section framing feels above-ground
- monumental scale is visible without overwhelming content
- centerpiece is more memorable than the old octahedron
- no unrelated layout regressions appear in content sections

- [ ] **Step 3: Update docs only if the scene implementation changes developer workflow**

Possible update:
- note any scene constants worth tuning in `README.md`

Expected result: docs remain minimal unless the workflow changed.

- [ ] **Step 4: Create the final commit for the scene pass**

```bash
git add assets/js/site.js assets/css/site.css README.md
git commit -m "feat: refine portfolio vault scene"
```

- [ ] **Step 5: Push and verify the GitHub Pages deployment after approval**

Run:

```bash
git push
```

Expected: GitHub Pages workflow runs successfully and the deployed site reflects the scene refinements
