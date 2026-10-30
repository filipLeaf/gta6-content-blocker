/**
 * Typed accessors for extension storage.
 * Settings are kept in `storage.sync` (synced across devices), stats in `storage.local`.
 */
import type { Settings, Stats } from './types.ts';
import { DEFAULT_SETTINGS, DEFAULT_STATS } from './defaults.ts';

/** Returns stored settings merged over defaults. */
export async function getSettings(): Promise<Settings> {
  return (await chrome.storage.sync.get(DEFAULT_SETTINGS)) as Settings;
}

export function setSettings(patch: Partial<Settings>): Promise<void> {
  return chrome.storage.sync.set(patch);
}

/** Returns stored stats merged over defaults. */
export async function getStats(): Promise<Stats> {
  return (await chrome.storage.local.get(DEFAULT_STATS)) as Stats;
}

export function setStats(patch: Partial<Stats>): Promise<void> {
  return chrome.storage.local.set(patch);
}

/** Increments the blocked-item counter. Not atomic across tabs; acceptable for a stat. */
export async function addBlocked(count: number): Promise<void> {
  const { blockedTotal } = await getStats();
  await setStats({ blockedTotal: blockedTotal + count });
}
