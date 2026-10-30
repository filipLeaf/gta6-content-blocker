/**
 * Text classification against the term lists.
 * DOM-free by design so it can be unit-tested in Node.
 */
import type { MatchResult, Settings, TermLists } from '../shared/types.ts';
import { DEFAULT_TERMS } from '../shared/defaults.ts';

export type Matcher = (text: string) => MatchResult;

/**
 * Lowercases, strips diacritics and collapses every non-alphanumeric run into a single space.
 * @example normalize("GTA-VI's Ending!") === 'gta vi s ending'
 */
export function normalize(text: string | null | undefined): string {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compiles a term list into a single alternation regex.
 * Input is normalized, so word boundaries are expressed as start/end/space lookarounds;
 * unlike `\b`, this is correct for non-ASCII letters.
 */
function compile(terms: readonly string[] | undefined): RegExp | null {
  const parts = [...new Set((terms ?? []).map(normalize).filter(Boolean))]
    .sort((a, b) => b.length - a.length) // Longest first, so multi-word phrases take precedence.
    .map(escapeRegExp);
  if (parts.length === 0) return null;
  return new RegExp(`(?<=^| )(${parts.join('|')})(?= |$)`, 'g');
}

function hasMatch(re: RegExp | null, text: string): boolean {
  if (!re) return false;
  re.lastIndex = 0; // Reset state carried over by the global flag.
  return re.test(text);
}

function countDistinct(re: RegExp | null, text: string): number {
  if (!re) return 0;
  return new Set(Array.from(text.matchAll(re), (m) => m[1])).size;
}

/**
 * Builds a matcher for the given settings. Precedence:
 * whitelist → custom terms → GTA VI reference (context term, or ≥2 distinct weak terms)
 * → spoiler term (`spoilers` mode only).
 */
export function createMatcher(
  settings: Partial<Settings> = {},
  terms: TermLists = DEFAULT_TERMS,
): Matcher {
  const context = compile(terms.context);
  const weak = compile(terms.weak);
  const spoiler = compile(terms.spoiler);
  const custom = compile(settings.customTerms);
  const whitelist = compile(settings.whitelistTerms);
  const spoilersOnly = settings.mode === 'spoilers';

  return (rawText) => {
    const text = normalize(rawText);
    if (!text) return null;
    if (hasMatch(whitelist, text)) return null;
    if (hasMatch(custom, text)) return { reason: 'custom' };

    const isGta = hasMatch(context, text) || countDistinct(weak, text) >= 2;
    if (!isGta) return null;
    if (!spoilersOnly) return { reason: 'gta' };
    return hasMatch(spoiler, text) ? { reason: 'spoiler' } : null;
  };
}
