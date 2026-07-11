# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Thai-language WebAR science-workshop experience for kids (grades 4–9): scanning a QR opens `index.html`, which uses the phone camera + a printed Hiro marker to display a walkable 3D nuclear power plant with a step-by-step learn mode, quiz, cutaway view, and energy-flow visualization. Built with A-Frame 1.3.0 + AR.js 3.4.5 (marker-based tracking). No build step, no package manager — plain static HTML/JS, deployed to Vercel as a static site.

## Running / testing

- `npx serve -l 3000 .` then open `http://localhost:3000/viewer.html` — the non-AR 3D page is the fastest way to test the model and all UI (learn/quiz/toggles) without a camera.
- `index.html` (AR) requires HTTPS + camera; test on a phone against the deployed URL. `file://` and LAN `http://` won't get camera permission.
- `print.html` generates its QR client-side from `new URL('index.html', location.href)`, so it's only meaningful opened from the deployed site.
- `.claude/launch.json` defines the `ar-home` preview server (same `npx serve`).

## Architecture

- **Shared model + UI across two entry points**: `index.html` (AR, model inside `<a-marker preset="hiro">`) and `viewer.html` (plain 3D with the custom `simple-orbit` camera). Both call `injectPlant('#plant')` from `js/plant-model.js` and `PlantUI.init({arMode})` from `js/ui.js`. Overlay DOM ids must stay identical in both pages — `ui.js` looks elements up by id (`btnLearn`, `quizPanel`, `learnPanel`, etc.).
- `js/plant-model.js` builds the whole plant as one HTML string from helper functions (trees, steam, pylons, window rows…). Entity ids inside the model are load-bearing: `#domeWall`/`#domeCap`/`#domeRibs` (cutaway mode), `#reactorCore`, `#energyFlow`, `#stepMarker` (learn-mode highlight arrow), `.plantLabel`. Units: 1 ≈ marker width; +x east, +z south.
- `js/components.js` registers custom components used by the model string: `cooling-tower` (THREE.LatheGeometry hyperboloid), `wire` (sagging TubeGeometry), `energy-flow` (glowing dots on a CatmullRom curve; toggled via `enabled`), `thai-label` (canvas texture — A-Frame's `a-text` SDF font has no Thai glyphs), `billboard`, `simple-orbit`. Scripts must load before `<a-scene>` — keep the `<script>` order in both HTML heads.
- `simple-orbit` wraps the camera in a group; orientation must use `Matrix4.lookAt` + quaternion (camera convention, −Z toward target) — plain `object3D.lookAt()` points the group's +Z at the target and the camera faces away (this was a real bug).
- Learn mode temporarily overrides the user's manual cutaway/energy toggles and restores them on close (`state.cutawayOn`/`state.energyOn` vs `applyCutaway`/`applyEnergy` in `ui.js`).
- **Tap-to-explore (POI)**: invisible `.poi-hit` boxes (opacity-0, in `plant-model.js`) are raycast manually in `ui.js` `initTapExplore()` — own raycaster, not A-Frame `cursor`, so taps can be distinguished from orbit drags (<10–12px movement) and gated in AR by `marker.object3D.visible` (three.js raycasts invisible objects, so the guard is required). Tap opens a `POI[...]` card; in viewer mode it calls `simple-orbit.flyTo()` (goal-lerped in `tick`), in AR it shows a walk-closer tip instead. Building labels (`.plantLabel`) are hidden while a card is open — they block the zoomed camera.
- All libraries are vendored in `libs/` so the site works with flaky venue Wi-Fi. Keep it that way — don't switch to CDN references.
- The printed Hiro marker must keep a white margin (`.marker-wrap` padding in `print.html`) — AR.js detection fails without it.
- Educational copy lives in four places that must stay consistent: `LEARN_STEPS`/`QUIZ` in `js/ui.js`, the worksheet in `print.html`, the answer key in `workshop.html`, and the take-home PDF source `pack.html`. After editing `pack.html`, regenerate the committed PDF with headless Edge: `msedge --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="assets\workshop-pack.pdf" "file:///D:/AR%20home/pack.html"`. `pdf.html` auto-downloads that PDF (QR targets it from the app passport panel, print.html worksheet, and workshop.html); `vercel.json` forces Content-Disposition attachment on the direct asset URL. Keep `pack.html` free of deploy-domain-dependent content — the PDF gets redistributed.
