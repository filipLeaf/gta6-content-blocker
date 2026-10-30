/** Shared domain types. */

export type Mode = 'strict' | 'spoilers';
export type Action = 'blur' | 'hide';

export interface Settings {
  enabled: boolean;
  mode: Mode;
  action: Action;
  /** Site ids (see `SITES`) where blocking is disabled. */
  disabledSites: string[];
  /** User-defined terms that are blocked regardless of mode. */
  customTerms: string[];
  /** User-defined terms that are never blocked. Takes precedence over all other lists. */
  whitelistTerms: string[];
}

export interface Stats {
  blockedTotal: number;
  nudgeDismissed: boolean;
}

export interface TermLists {
  /** Unambiguous GTA VI references. A single hit is sufficient. */
  context: string[];
  /** Ambiguous terms (e.g. character first names). Require two distinct hits. */
  weak: string[];
  /** Spoiler indicators. Required in addition to a GTA VI reference in `spoilers` mode. */
  spoiler: string[];
}

export interface Site {
  id: string;
  name: string;
  /** Registrable domains. Subdomains are matched implicitly. */
  hosts: string[];
  /** Selectors for content units that are evaluated and blocked as a whole. */
  items: string[];
  /** Attributes on the item element whose values are included in the evaluated text. */
  attrs: string[];
}

export type MatchResult = { reason: 'custom' | 'gta' | 'spoiler' } | null;
