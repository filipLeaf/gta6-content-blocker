/**
 * DOM layer: locates site items, classifies them via the matcher and applies blur/hide.
 * Reacts to DOM mutations to cover infinite scroll and SPA navigation.
 */
import type { Settings, Site } from '../shared/types.ts';
import { DEFAULT_SETTINGS } from '../shared/defaults.ts';
import { addBlocked } from '../shared/storage.ts';
import { createMatcher, type Matcher } from './matcher.ts';

const STATE_ATTR = 'data-gsb'; // 'blocked' | 'revealed'
const ACTION_ATTR = 'data-gsb-action'; // 'blur' | 'hide'
const OVERLAY_TAG = 'gsb-overlay';

/** Overlay styles, scoped to the overlay's shadow root and isolated from page CSS. */
const OVERLAY_CSS = `
  .box {
    position: absolute; inset: 0;
    display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
    gap: 8px 12px; padding: 8px; box-sizing: border-box;
    background: rgba(20, 10, 30, 0.35);
    border-radius: 12px;
    font: 600 13px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #fff; text-align: center; cursor: default;
  }
  .label { display: inline-flex; align-items: center; gap: 8px; text-shadow: 0 1px 4px rgba(0,0,0,.7); }
  .dot {
    width: 8px; height: 8px; border-radius: 50%; flex: none;
    background: linear-gradient(135deg, #ff4fa3, #ff9a3c);
    box-shadow: 0 0 8px #ff4fa3;
  }
  button {
    font: inherit; font-size: 12px; cursor: pointer;
    border: 0; border-radius: 999px; padding: 6px 14px;
    color: #1a0b1f; background: linear-gradient(135deg, #ff4fa3, #ff9a3c);
    box-shadow: 0 2px 12px rgba(255, 79, 163, .45);
  }
  button:hover { filter: brightness(1.08); }
  button:focus-visible { outline: 2px solid #3ee6e6; outline-offset: 2px; }
`;

export interface Blocker {
  applySettings(settings: Settings): void;
}

export function startBlocker(site: Site, initialSettings: Settings): Blocker {
  const itemSelector = site.items.join(',');

  let settings: Settings = DEFAULT_SETTINGS;
  let match: Matcher = () => null;
  let active = false;
  /** Text of each item at its last evaluation; unchanged items are skipped. */
  let lastText = new WeakMap<Element, string>();
  /** Content key captured when the user revealed an item. */
  const revealedKey = new WeakMap<Element, string>();
  const watchedForPlay = new WeakSet<Element>();

  // ---------- Item inspection ----------

  /**
   * Collects the item's text with a space between text nodes. `textContent` concatenates
   * adjacent elements without a separator (badge "New" + title "GTA 6" -> "NewGTA 6"),
   * which defeats whole-word matching.
   */
  function getText(el: Element): string {
    const parts: string[] = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeValue) parts.push(node.nodeValue);
    }
    let text = parts.join(' ');
    for (const attr of site.attrs) {
      const value = el.getAttribute(attr);
      if (value) text += ` ${value}`;
    }
    return text;
  }

  /**
   * Identifies the content an item currently renders. Sites recycle elements across
   * navigations (notably YouTube), so a changed key means a revealed item must be re-evaluated.
   */
  function contentKey(el: Element): string {
    return el.querySelector('a[href]')?.getAttribute('href') ?? '';
  }

  /** Resolves nested items (e.g. quoted tweets) to the outermost item. */
  function outermost(el: Element): Element {
    let current = el;
    let parent = current.parentElement?.closest(itemSelector);
    while (parent) {
      current = parent;
      parent = current.parentElement?.closest(itemSelector);
    }
    return current;
  }

  // ---------- Evaluation ----------

  function evaluate(el: Element): void {
    const text = getText(el);
    const state = el.getAttribute(STATE_ATTR);

    if (lastText.get(el) === text) {
      // Framework re-renders may detach the overlay; restore it.
      if (state === 'blocked' && settings.action === 'blur') ensureOverlay(el);
      return;
    }
    lastText.set(el, text);

    const result = active ? match(text) : null;
    if (!result) {
      if (state) unblock(el);
      return;
    }
    if (state === 'revealed' && revealedKey.get(el) === contentKey(el)) return;
    block(el);
  }

  function block(el: Element): void {
    const wasBlocked = el.getAttribute(STATE_ATTR) === 'blocked';
    el.setAttribute(STATE_ATTR, 'blocked');
    el.setAttribute(ACTION_ATTR, settings.action);
    if (settings.action === 'blur') ensureOverlay(el);
    else removeOverlay(el);
    pauseMedia(el);
    if (!wasBlocked) countBlocked();
  }

  function unblock(el: Element): void {
    el.removeAttribute(STATE_ATTR);
    el.removeAttribute(ACTION_ATTR);
    revealedKey.delete(el);
    removeOverlay(el);
  }

  function reveal(el: Element): void {
    el.setAttribute(STATE_ATTR, 'revealed');
    el.removeAttribute(ACTION_ATTR);
    revealedKey.set(el, contentKey(el));
    removeOverlay(el);
  }

  // ---------- Media ----------

  function pauseMedia(el: Element): void {
    for (const video of el.querySelectorAll('video')) {
      video.muted = true;
      video.pause();
    }
    if (watchedForPlay.has(el)) return;
    watchedForPlay.add(el);
    // Sites resume autoplay on scroll; suppress playback while the item is blocked.
    el.addEventListener(
      'play',
      (event) => {
        const target = event.target;
        if (el.getAttribute(STATE_ATTR) === 'blocked' && target instanceof HTMLMediaElement) {
          target.pause();
        }
      },
      true,
    );
  }

  // ---------- Overlay ----------

  function findOverlay(el: Element): Element | null {
    for (const child of el.children) if (child.localName === OVERLAY_TAG) return child;
    return null;
  }

  /**
   * Attaches the "Show anyway" overlay. A closed shadow root isolates it from page CSS and
   * keeps its label out of `item.textContent`, so the overlay never matches itself.
   * The matched term is intentionally not displayed, as it may itself be a spoiler.
   */
  function ensureOverlay(el: Element): void {
    if (findOverlay(el)) return;

    const host = document.createElement(OVERLAY_TAG);
    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = OVERLAY_CSS;

    const dot = document.createElement('span');
    dot.className = 'dot';
    const label = document.createElement('span');
    label.className = 'label';
    label.append(dot, 'GTA 6 content hidden');

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Show anyway';
    button.addEventListener('click', () => reveal(el));

    const box = document.createElement('div');
    box.className = 'box';
    box.append(label, button);
    shadow.append(style, box);

    // Swallow pointer events so the underlying link or post handler is not triggered.
    for (const type of ['click', 'auxclick', 'mousedown', 'mouseup', 'pointerdown', 'pointerup']) {
      host.addEventListener(type, (event) => {
        event.stopPropagation();
        if (type === 'click' || type === 'auxclick') event.preventDefault();
      });
    }

    el.append(host);
  }

  function removeOverlay(el: Element): void {
    findOverlay(el)?.remove();
  }

  // ---------- Counter ----------

  let pendingCount = 0;
  let counterTimer: ReturnType<typeof setTimeout> | undefined;

  function countBlocked(): void {
    pendingCount += 1;
    counterTimer ??= setTimeout(flushCounter, 2000);
  }

  function flushCounter(): void {
    counterTimer = undefined;
    const count = pendingCount;
    pendingCount = 0;
    // Rejects once the extension context is invalidated (e.g. after an update); safe to ignore.
    if (count) addBlocked(count).catch(() => {});
  }

  // ---------- Mutation handling ----------

  const queue = new Set<Node>();
  let scheduled = false;

  function schedule(): void {
    if (scheduled) return;
    scheduled = true;
    // Batch per frame; rAF runs before paint, so new items are blocked before first render.
    requestAnimationFrame(flush);
  }

  function flush(): void {
    scheduled = false;
    const items = new Set<Element>();
    for (const node of queue) {
      const el = node instanceof Element ? node : node.parentElement;
      if (!el?.isConnected) continue;
      const owner = el.closest(itemSelector);
      if (owner) items.add(outermost(owner));
      if (node instanceof Element && node.firstElementChild) {
        for (const item of node.querySelectorAll(itemSelector)) items.add(outermost(item));
      }
    }
    queue.clear();
    items.forEach(evaluate);
  }

  function scanAll(): void {
    lastText = new WeakMap();
    const items = new Set<Element>();
    for (const item of document.querySelectorAll(itemSelector)) items.add(outermost(item));
    items.forEach(evaluate);
  }

  function applySettings(next: Settings): void {
    settings = next;
    active = settings.enabled && !settings.disabledSites.includes(site.id);
    match = createMatcher(settings);
    scanAll();
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      queue.add(record.target);
      for (const node of record.addedNodes) queue.add(node);
    }
    schedule();
  });

  applySettings(initialSettings);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  addEventListener('pagehide', flushCounter);

  return { applySettings };
}
