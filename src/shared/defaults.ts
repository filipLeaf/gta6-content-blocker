/** Default settings, term lists and external links. */
import type { Settings, Stats, TermLists } from './types.ts';

// TODO: Set the real Buy Me a Coffee URL before release.
export const DONATE_URL = 'https://buymeacoffee.com/BMC_USER';
export const REPO_URL = 'https://github.com/filipLeaf/gta6-content-blocker';

/** Blocked-item count after which the one-time donation prompt is shown. */
export const NUDGE_THRESHOLD = 100;

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  mode: 'strict',
  action: 'blur',
  disabledSites: [],
  customTerms: [],
  whitelistTerms: [],
};

export const DEFAULT_STATS: Stats = {
  blockedTotal: 0,
  nudgeDismissed: false,
};

export const DEFAULT_TERMS: TermLists = {
  context: [
    'gta 6', 'gta6', 'gta vi', 'gtavi', 'gta six',
    'grand theft auto 6', 'grand theft auto vi', 'grand theft auto six',
    'vice city', 'leonida', 'leonida keys', 'port gellhorn', 'grassrivers', 'mount kalaga',
    'jason duval', 'lucia caminos', 'cal hampton', 'boobie ike', 'dre quan priest',
    'real dimez', 'raul bautista', 'brian heder',
  ],
  contextPrefixes: ['gta6', 'gtavi'],
  weak: ['jason', 'lucia', 'duval', 'caminos', 'ambrosia', 'kalaga'],
  spoiler: [
    'spoiler', 'spoilers', 'spoil', 'spoiled',
    'ending', 'endings', 'secret ending', 'true ending', 'final mission', 'last mission',
    'final boss', 'boss fight', 'finale', 'epilogue', 'post credits',
    'plot twist', 'twist', 'dies', 'died', 'death', 'killed', 'kills',
    'betray', 'betrays', 'betrayed', 'betrayal',
    'leak', 'leaks', 'leaked',
    'story', 'storyline', 'cutscene', 'cutscenes', 'mission', 'missions', 'all missions',
    'walkthrough', 'playthrough', 'full game', 'explained', 'recap', 'lore',
  ],
};
