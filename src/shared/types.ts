// Shared types used across the whole extension.

export type Mode = 'strict' | 'spoilers';
export type Action = 'blur' | 'hide';

export interface Settings {
  enabled: boolean;
  mode: Mode;
  action: Action;
  disabledSites: string[]; // site ids, e.g. ['reddit']
  customTerms: string[]; // always blocked, in every mode
  whitelistTerms: string[]; // never blocked
}

export interface Stats {
  blockedTotal: number;
  nudgeDismissed: boolean;
}

export interface TermLists {
  context: string[]; // clearly GTA VI ("gta 6", "vice city") - one is enough
  weak: string[]; // common words ("jason", "lucia") - need two different ones
  spoiler: string[]; // used in "spoilers" mode ("ending", "final mission")
}

export interface Site {
  id: string;
  name: string;
  hosts: string[]; // matches the domain and its subdomains
  items: string[]; // CSS selectors of elements to check and blur
  attrs: string[]; // extra attributes on the item whose text is checked
}

export type MatchResult = { reason: 'custom' | 'gta' | 'spoiler' } | null;
