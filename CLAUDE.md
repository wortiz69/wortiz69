# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A [Remotion](https://www.remotion.dev/) video project (`shelter-dogs`) that programmatically renders a 10-second (300 frame @ 30fps), 1080×1920 (vertical/social) MP4 about shelter dog adoption. The video is written entirely in React/TypeScript — there is no server, backend, or app UI to run; the "product" is the rendered `out/shelter-dogs.mp4`.

The repo also bundles the `ui-ux-pro-max` Claude Code skill (`.claude/skills/ui-ux-pro-max/`), which is unrelated to the video itself — it's a searchable design-guideline database/tool used when producing UI/UX work. `src/sample-skill-demo.html` is a sample output demonstrating that skill, not part of the Remotion app.

## Commands

Install dependencies first: `npm install`

- `npm start` — launches Remotion Studio (`npx remotion studio`) for live-reloading preview/editing of the composition in a browser.
- `npm run build` / `npm run render` — identical scripts; render the `ShelterDogs` composition to `out/shelter-dogs.mp4` via `npx remotion render`.
  - Both scripts pass explicit `--browser-executable` and `--ffmpeg-executable` flags pointing at `/opt/pw-browsers/...` paths. These are specific to this sandboxed/container environment (pre-installed headless Chromium + ffmpeg). If developing elsewhere, drop those flags (or point them at local installs) so Remotion falls back to its own downloaded binaries.

There are no lint or test scripts configured in `package.json`.

## Architecture

- `src/index.ts` — Remotion entry point (set via `remotion.entryPoint` in `package.json`); calls `registerRoot(Root)`.
- `src/Root.tsx` — declares all `<Composition>`s Remotion knows about. Currently one: `id="ShelterDogs"`, 300 frames, 30fps, 1080×1920, rendering `ShelterDogs` from `src/ShelterDogs.tsx`. New videos/compositions get added here.
- `src/ShelterDogs.tsx` — the actual video content, structured as four scenes composed with Remotion's `<Sequence from={...} durationInFrames={...}>` to place them back-to-back on the timeline:
  1. `SceneHook` (0–90f) — title hook
  2. `SceneStats` (90–180f) — stat cards
  3. `SceneHelp` (180–270f) — "how to help" steps
  4. `SceneCTA` (270–300f) — call to action
  - Animation is driven by Remotion's `useCurrentFrame()`/`useVideoConfig()` plus `interpolate` and `spring` from `remotion`; two local hooks, `useFadeIn` and `useSlideUp`, wrap those primitives for the common fade/slide-up entrance pattern used throughout.
  - A small palette of named color constants (`WARM_BROWN`, `CREAM`, `AMBER`, `DARK`, `WHITE`, `SOFT_RED`) is defined at the top of the file and reused across scenes — keep new scene styling consistent with these rather than introducing new colors ad hoc.
  - Reusable sub-components (`PawPrint`, `FloatingPaws`, `StatCard`, `Step`) live in this same file next to the scenes that use them.
- `out/shelter-dogs.mp4` — the rendered output. Note `.gitignore` has `out/` commented out, so the rendered MP4 is currently tracked in git (regenerate and commit it after content changes if it needs to stay in sync).
- `tsconfig.json` — `strict: true`, JSX via classic `"react"` runtime (so `import React` is required in files using JSX, as done in `ShelterDogs.tsx`), CommonJS modules.

## The bundled `ui-ux-pro-max` skill

`.claude/skills/ui-ux-pro-max/` is a self-contained design-guideline lookup tool (CSV data files under `data/`, Python scripts under `scripts/`). It's invoked as a Claude Code skill (see `SKILL.md`) rather than as part of the video build. Its `scripts/search.py` supports BM25 search over the CSVs and can generate/persist a full design system:

```
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" [--domain <domain>] [--stack <stack>]
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Project Name"
```

This is only relevant when doing general UI/UX design work in this workspace (e.g. producing HTML/React mockups like `src/sample-skill-demo.html`); it does not affect the Remotion video pipeline.
