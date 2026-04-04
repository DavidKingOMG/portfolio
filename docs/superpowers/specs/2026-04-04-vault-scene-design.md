# Vault Scene Design

Date: 2026-04-04
Project: Portfolio vault scene refinement
Status: Draft for review

## Goal

Refine the existing Three.js vault scene so it feels more monumental and intentional without destabilizing the deployed site. The update should preserve the current page structure and data-driven content system while improving the camera motion, room scale, and central focal object.

## User Intent

The current theme already works, but the final visual pass should make the scene feel larger, safer, and more personal. The user wants:

- a higher, more controlled camera path that does not feel like it drops underground near the terminal
- taller and larger pillars that emphasize scale and security
- a new central object that feels like a personal signature, but in an abstract form
- the centerpiece to read as a controlled energy core rather than a chaotic particle cloud
- the terminal-in-world idea deferred until after the rest of the site content is settled

## Constraints

- Keep the current modular structure intact
- Avoid broad layout or data-model changes
- Touch only the scene and tightly-related presentation code for this pass
- Minimize risk to the live site
- Preserve mobile and desktop readability of the existing HTML sections
- Do not implement the in-world terminal in this phase

## Recommended Approach

Use a controlled upgrade of the existing scene rather than a full rebuild.

This approach keeps the current scene scaffolding, lighting model, and page integration, but changes the three highest-impact systems:

1. Camera path
2. Pillar scale and framing
3. Centerpiece replacement

This is the lowest-risk option because it keeps the stable pieces of the current deployment while still producing a noticeable visual improvement.

## Alternatives Considered

### 1. Controlled upgrade

Keep the current scene composition and refactor only the high-impact systems.

Pros:

- lowest risk to the deployed site
- easiest to test incrementally
- preserves the current theme and scroll behavior

Cons:

- some legacy scene structure remains in place
- final result will be an evolution, not a complete reinvention

### 2. Full scene rebuild

Reconstruct the vault composition from scratch around a new camera and centerpiece.

Pros:

- maximum creative freedom
- cleanest long-term scene architecture

Cons:

- highest regression risk
- slower to iterate and harder to debug
- unnecessary for the current goal

### 3. Pure lighting/composition pass

Keep geometry mostly intact and rely on fog, lighting, and grading to simulate a larger redesign.

Pros:

- fastest implementation path
- least invasive code change

Cons:

- does not solve the terminal camera dip
- does not materially improve scale
- weak personal signature

## Scene Design

### Camera

The camera should feel like a guided descent through a secure vault rather than a falling drop. Scroll will still influence camera movement, but the vertical movement should be clamped so the camera never dips beneath the perceived floor near the terminal section. The starting viewpoint should be slightly higher than the current one, and the look target should move more slowly than the camera itself so the composition feels deliberate rather than reactive.

The intended effect is:

- hero starts with an elevated reveal of the chamber
- mid-page maintains visibility of the central aisle and pillars
- terminal section remains above-ground and readable

### Pillars

The pillars should define the room’s scale at a glance. They will become both taller and thicker, with their cyan accent strips extended to reinforce the idea of powered structural columns. Their placement should continue to frame the core and the path through the room, but they should read as architecture rather than decorative props.

The intended effect is:

- the room feels larger and more secure
- the central chamber gains stronger depth cues
- the scene supports the personal centerpiece instead of competing with it

### Energy Core

Replace the existing octahedron-and-rings centerpiece with a controlled particle energy core. The new core should keep a stable spherical silhouette, with dense particles, restrained orbital motion, and subtle pulsing. The motion language should feel engineered, contained, and pressurized rather than erratic.

The core should serve as the personal signature of the vault without requiring a portrait asset yet. It should be abstract, confident, and high-tech.

The intended effect is:

- stronger focal point at the center of the scene
- more memorable identity for the portfolio
- a cleaner bridge toward a future signature scene pass

## Technical Shape

This pass should remain inside the current scene setup in `assets/js/site.js`.

Expected implementation boundaries:

- revise camera scroll math and introduce clamped vertical movement
- enlarge pillar geometry and related glow-strip geometry in place
- remove or disable the current octahedron and ring centerpiece
- introduce a new particle-core system that can animate efficiently in the existing render loop
- leave page rendering, content binding, and section markup unchanged

CSS changes should stay minimal and only support scene stability if needed. Most of the work should be isolated to the Three.js scene logic.

## Risks

### Visual regression

Because the site is already deployed, the most important risk is breaking the current cinematic feel while trying to improve it. The mitigation is to keep the refactor narrow and avoid unrelated changes.

### Performance regression

A denser particle core could increase GPU cost. The mitigation is to keep particle count moderate, reuse buffers, and avoid expensive per-frame object allocation.

### Camera discomfort

Overcorrecting the scroll behavior could make the scene feel stiff or detached from the page. The mitigation is to clamp the vertical motion without removing the feeling of descent.

## Validation

This scene pass is successful if:

- the camera no longer appears to go underground at the terminal section
- the pillars clearly increase the sense of vault scale
- the centerpiece feels stronger and more personal than the current octahedron
- the site remains readable and stable across the full page scroll
- the deployed experience still feels like the same portfolio, just more intentional

## Out Of Scope

- in-world terminal integration
- project-content updates
- copy revisions
- terminal UI redesign
- major CSS/layout refactors outside the scene
