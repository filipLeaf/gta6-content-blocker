import type { Action, Mode, Settings, Site, Stats } from '../shared/types.ts';
import { DONATE_URL, NUDGE_THRESHOLD, REPO_URL } from '../shared/defaults.ts';
import { getSettings, getStats, setSettings, setStats } from '../shared/storage.ts';
import { SITES, findSite } from '../content/sites.ts';

const MODE_HINTS: Record<Mode, string> = {
  strict: 'Hides everything about GTA 6. Safest.',
  spoilers: 'Only hides posts that look like story spoilers.',
};

function $<T extends Element = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Popup element not found: ${selector}`);
  return el;
}

function radios(name: string): HTMLInputElement[] {
  return [...document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)];
}

const ui = {
  enabled: $<HTMLInputElement>('#enabled'),
  count: $('#count'),
  status: $('#status'),
  modeRadios: radios('mode'),
  modeHint: $('#mode-hint'),
  actionRadios: radios('action'),
  siteRow: $('#site-row'),
  siteLabel: $('#site-label'),
  siteEnabled: $<HTMLInputElement>('#site-enabled'),
  nudge: $('#nudge'),
  nudgeClose: $('#nudge-close'),
  nudgeDonate: $<HTMLAnchorElement>('#nudge-donate'),
  donate: $<HTMLAnchorElement>('#donate'),
  repo: $<HTMLAnchorElement>('#repo'),
  options: $<HTMLAnchorElement>('#options'),
};

// tab.url is only available for hosts in host_permissions, i.e. supported sites.
async function getActiveSite(): Promise<Site | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  try {
    return findSite(new URL(tab.url).hostname);
  } catch {
    return null;
  }
}

function statusText(settings: Settings, site: Site | null, siteActive: boolean): string {
  if (!settings.enabled) return 'Protection is paused';
  if (!site) return `Active on ${SITES.map((s) => s.name).join(', ')}`;
  return siteActive ? `Protecting you on ${site.name}` : `Paused on ${site.name}`;
}

async function main(): Promise<void> {
  const [initialSettings, initialStats, site] = await Promise.all([
    getSettings(),
    getStats(),
    getActiveSite(),
  ]);
  let settings: Settings = initialSettings;
  let stats: Stats = initialStats;

  function renderSettings(): void {
    const siteActive = site !== null && !settings.disabledSites.includes(site.id);

    ui.enabled.checked = settings.enabled;
    for (const radio of ui.modeRadios) radio.checked = radio.value === settings.mode;
    for (const radio of ui.actionRadios) radio.checked = radio.value === settings.action;
    ui.modeHint.textContent = MODE_HINTS[settings.mode];

    ui.siteRow.hidden = site === null;
    if (site) {
      ui.siteLabel.textContent = `Active on ${site.name}`;
      ui.siteEnabled.checked = siteActive;
      ui.siteEnabled.disabled = !settings.enabled;
    }

    ui.status.textContent = statusText(settings, site, siteActive);
    ui.status.classList.toggle('on', settings.enabled && (site === null || siteActive));
  }

  function renderStats(): void {
    ui.count.textContent = stats.blockedTotal.toLocaleString('en-US');
    ui.nudge.hidden = stats.nudgeDismissed || stats.blockedTotal < NUDGE_THRESHOLD;
  }

  function updateSettings(patch: Partial<Settings>): void {
    settings = { ...settings, ...patch };
    renderSettings();
    void setSettings(patch);
  }

  ui.enabled.addEventListener('change', () => updateSettings({ enabled: ui.enabled.checked }));

  for (const radio of ui.modeRadios) {
    radio.addEventListener('change', () => updateSettings({ mode: radio.value as Mode }));
  }
  for (const radio of ui.actionRadios) {
    radio.addEventListener('change', () => updateSettings({ action: radio.value as Action }));
  }

  ui.siteEnabled.addEventListener('change', () => {
    if (!site) return;
    const others = settings.disabledSites.filter((id) => id !== site.id);
    updateSettings({ disabledSites: ui.siteEnabled.checked ? others : [...others, site.id] });
  });

  ui.nudgeClose.addEventListener('click', () => {
    stats = { ...stats, nudgeDismissed: true };
    renderStats();
    void setStats({ nudgeDismissed: true });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    const total = changes['blockedTotal'];
    if (area !== 'local' || !total) return;
    stats = { ...stats, blockedTotal: (total.newValue as number | undefined) ?? 0 };
    renderStats();
  });

  ui.donate.href = DONATE_URL;
  ui.nudgeDonate.href = DONATE_URL;
  ui.repo.href = REPO_URL;
  ui.options.addEventListener('click', (event) => {
    event.preventDefault();
    void chrome.runtime.openOptionsPage();
  });

  renderSettings();
  renderStats();
}

main().catch((error: unknown) => console.error('[gsb] Popup failed to initialize:', error));
