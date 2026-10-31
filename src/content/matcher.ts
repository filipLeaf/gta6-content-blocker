import type { MatchResult, Settings, TermLists } from '../shared/types.ts';
import { DEFAULT_TERMS } from '../shared/defaults.ts';

export type Matcher = (text: string) => MatchResult;

// "GTA-VI's Ending!" -> "gta vi s ending"
export function normalize(text: string | null | undefined): string {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Text is normalized, so a space marks a word boundary. \b would break on non-ASCII letters.
function compile(terms: readonly string[] | undefined): RegExp | null {
  const parts = [...new Set((terms ?? []).map(normalize).filter(Boolean))]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp);
  if (parts.length === 0) return null;
  return new RegExp(`(?<=^| )(${parts.join('|')})(?= |$)`, 'g');
}

function compilePrefixes(prefixes: readonly string[] | undefined): RegExp | null {
  const parts = [...new Set((prefixes ?? []).map(normalize).filter((p) => p && !p.includes(' ')))]
    .map(escapeRegExp);
  if (parts.length === 0) return null;
  return new RegExp(`(?<=^| )(?:${parts.join('|')})[\\p{L}\\p{N}]*(?= |$)`, 'gu');
}

function hasMatch(re: RegExp | null, text: string): boolean {
  if (!re) return false;
  re.lastIndex = 0;
  return re.test(text);
}

function countDistinct(re: RegExp | null, text: string): number {
  if (!re) return 0;
  return new Set(Array.from(text.matchAll(re), (m) => m[1])).size;
}

export function createMatcher(
  settings: Partial<Settings> = {},
  terms: TermLists = DEFAULT_TERMS,
): Matcher {
  const context = compile(terms.context);
  const contextPrefixes = compilePrefixes(terms.contextPrefixes);
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

    const isGta =
      hasMatch(context, text) || hasMatch(contextPrefixes, text) || countDistinct(weak, text) >= 2;
    if (!isGta) return null;
    if (!spoilersOnly) return { reason: 'gta' };
    return hasMatch(spoiler, text) ? { reason: 'spoiler' } : null;
  };
}
