export type Mode = 'strict' | 'spoilers';
export type Action = 'blur' | 'hide';

export interface Settings {
  enabled: boolean;
  mode: Mode;
  action: Action;
  disabledSites: string[];
  customTerms: string[];
  whitelistTerms: string[];
}

export interface Stats {
  blockedTotal: number;
  nudgeDismissed: boolean;
}

export interface TermLists {
  context: string[];
  // Matches whole words starting with the prefix, e.g. subreddit names like "gta6news".
  contextPrefixes: string[];
  // Ambiguous on their own; two different ones are needed for a match.
  weak: string[];
  spoiler: string[];
}

export interface Site {
  id: string;
  name: string;
  hosts: string[];
  items: string[];
  attrs: string[];
}

export type MatchResult = { reason: 'custom' | 'gta' | 'spoiler' } | null;
