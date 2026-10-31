import type { Settings } from '../shared/types.ts';
import { DEFAULT_SETTINGS } from '../shared/defaults.ts';
import { getSettings } from '../shared/storage.ts';
import { findSite } from './sites.ts';
import { startBlocker } from './blocker.ts';

async function main(): Promise<void> {
  const site = findSite(location.hostname);
  if (!site) return;

  let settings: Settings = await getSettings().catch(() => DEFAULT_SETTINGS);
  const blocker = startBlocker(site, settings);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    const next: Settings = { ...settings };
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
      const change = changes[key];
      if (change) Object.assign(next, { [key]: change.newValue ?? DEFAULT_SETTINGS[key] });
    }
    settings = next;
    blocker.applySettings(settings);
  });
}

main();
