# Content Blocker for GTA 6 — CLAUDE.md

An open-source browser extension that blurs / hides GTA 6 content and spoilers on popular websites.
Public name: **Content Blocker for GTA 6** ("for", not "GTA 6 …" first, to avoid implying affiliation with Rockstar).
Small side project: simplicity and shipping fast beat features. Launch target is before the game's release (2026-11-19).

**Language: everything in this repo is in English** — code, comments, UI, README, store listings, commit messages.

## Project rules (do not break)

1. **No data collection.** No analytics, no network requests, no external servers. Everything runs locally.
2. **No ads and no affiliate links** injected into websites. The only monetization is voluntary donations.
3. **Minimal permissions.** Only `storage` + `host_permissions` for supported sites. Never `<all_urls>`.
4. **Minimal tooling.** TypeScript + esbuild only (dev dependencies). No runtime dependencies, no frameworks.
5. **No Rockstar/Take-Two assets.** No logos, cover art or in-game graphics. "Not affiliated with Rockstar Games or Take-Two Interactive."
6. **License: MIT.**

## Stack

- Manifest V3, one codebase for Chrome and Firefox (`browser_specific_settings.gecko` in the manifest).
- TypeScript 7 (`tsc` only type-checks, `noEmit`). esbuild bundles each entry into one IIFE file in `dist/` (content scripts can't be ES modules).
- Imports use `.ts` extensions (`import { x } from './matcher.ts'`) so Node can run the tests directly.
- Only erasable TS syntax (`erasableSyntaxOnly`): no `enum`, no `namespace`. Use union types instead.
- API: `chrome.*` (Firefox supports it). Types from `@types/chrome`.
- Settings: `chrome.storage.sync`; stats (blocked counter): `chrome.storage.local`.
- Tests: `node --test` (built-in runner, runs `.ts` files natively on Node 24).

## File structure

```
public/               # copied as-is into dist/
  manifest.json
  icons/              # original icons 16/32/48/128 (no GTA artwork)
src/
  shared/
    types.ts          # Settings, Stats, Site, MatchResult...
    defaults.ts       # default keywords, settings, links
    storage.ts        # typed chrome.storage helpers
  content/
    index.ts          # content script entry point
    matcher.ts        # pure logic: normalization + keyword matching (no DOM, testable in Node)
    sites.ts          # per-site selectors (the ONLY place with selectors!)
    blocker.ts        # DOM scanning, MutationObserver, blur/hide, "Show anyway" overlay
    blocker.css
  popup/              # popup.html / popup.css / popup.ts
  options/            # options.html / options.css / options.ts
tests/                # *.test.ts
scripts/
  build.mjs           # esbuild build / watch / zip
store/                # store descriptions, screenshots, promo images
.github/workflows/ci.yml   # typecheck + tests + build on every push
dist/                 # build output, load this in the browser (gitignored)
```

## How it works

### Matching (`matcher.ts`)
- Normalize text: lowercase, strip accents, turn punctuation into single spaces (`"GTA-VI's"` → `"gta vi s"`).
- Match whole words only (space/start/end boundaries, not `\b`, so non-ASCII letters work).
- Term lists (`defaults.ts`):
  - **context** — clearly GTA VI (`gta 6`, `gta vi`, `vice city`, `leonida`, full character names). One is enough.
  - **weak** — common words (`jason`, `lucia`). Only count when two *different* ones appear together.
  - **spoiler** — `ending`, `final mission`, `leak`, `twist`...
- **Strict** mode (default): block on GTA VI context. **Spoilers only**: GTA VI context AND a spoiler term.
- User `customTerms` always block; `whitelistTerms` never block.

### Sites (`sites.ts`)
- Each site: `{ id, name, hosts, items, attrs }` (see `Site` in `types.ts`).
- `items` are selectors of whole elements to check and blur (a video tile, a tweet, a comment body).
- Selectors break often, so they live **only here**.
- MVP: YouTube, X, Reddit. Then TikTok (best effort).

### Blocking (`blocker.ts`)
- Scan the page once, then `MutationObserver` for new content (infinite scroll, SPA navigation), batched per animation frame so items are blurred before they're painted.
- Only the outermost item counts when items are nested (quoted tweets).
- Skip items whose text hasn't changed since the last check. Re-check when it changes (sites reuse elements).
- Blocked item: `data-gsb="blocked"` + `data-gsb-action="blur|hide"`, styled by `blocker.css`.
- Blur mode adds an overlay ("GTA 6 content hidden — Show anyway") inside a closed shadow root: page CSS can't break it and its text is not part of the item's `textContent`. Never show the matched term (it could be a spoiler itself).
- Videos inside blocked items are paused and muted.
- Each newly blocked item adds +1 to the counter (batched writes).

### Popup
- On/off (global + current site), mode, action, "N content blocked" counter, donate + GitHub links.
- A one-time, dismissible donate message after 100 blocked items. **Never** show donation prompts on websites or via notifications.

## Commands

```bash
npm install          # once
npm run watch        # build to dist/ and rebuild on .ts changes (restart it after editing html/css)
npm run build        # one-off build
npm run typecheck    # tsc --noEmit
npm test             # node --test
npm run zip          # build + zip for the stores
```
Local loading: Chrome → `chrome://extensions` → Developer mode → "Load unpacked" → `dist/`. Firefox → `about:debugging` → "Load Temporary Add-on" → `dist/manifest.json`.

## Manual test checklist (before every release)

- [ ] YouTube: home, search "gta 6", watch page (related + comments), Shorts
- [ ] X: timeline, search #GTA6
- [ ] Reddit: r/GTA6, a comment thread
- [ ] Infinite scroll: new items get blocked
- [ ] SPA navigation (no page reload) works
- [ ] "Show anyway" reveals only that one element
- [ ] Changing settings in the popup applies without reload
- [ ] No false positives on a random "Jason" / "Miami" video without GTA context
- [ ] No console errors, no noticeable scroll lag
- [ ] Chrome and Firefox
- [ ] `npm run typecheck && npm test && npm run build` passes

## Post-launch ideas (not before the MVP ships)

- Spoiler "packs" for other games/shows.
- Facebook, Instagram, Twitch, Discord (web).
- Timed mode ("block until date X").
- Keyword list import/export.

## Notes for AI assistants

- Follow the rules above. If something delays the MVP, suggest it for Post-launch instead of implementing it.
- Change selectors only in `sites.ts`. Matching logic stays DOM-free (testable in Node).
- Don't add npm dependencies, network requests or new permissions without approval.
- Before finishing a change, run `npm run typecheck && npm test && npm run build`.
