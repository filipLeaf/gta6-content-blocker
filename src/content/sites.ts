/**
 * Per-site selector configuration. Single source of truth for site markup;
 * markup changes on supported sites should only require edits here.
 * When item selectors nest, only the outermost match is evaluated.
 */
import type { Site } from '../shared/types.ts';

export const SITES: Site[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    hosts: ['youtube.com'],
    items: [
      // Feeds, search results, related videos
      'ytd-rich-item-renderer',
      'ytd-video-renderer',
      'ytd-compact-video-renderer',
      'ytd-grid-video-renderer',
      'ytd-playlist-renderer',
      'ytd-radio-renderer',
      'yt-lockup-view-model',
      // Shorts: shelf tiles and player
      'ytd-reel-item-renderer',
      'ytm-shorts-lockup-view-model',
      'ytd-reel-video-renderer',
      // Community posts and individual comments
      'ytd-post-renderer',
      'ytd-comment-view-model',
      'ytd-comment-renderer',
      // Mobile site (m.youtube.com)
      'ytm-video-with-context-renderer',
      'ytm-compact-video-renderer',
      // Search results: side panel game card and promoted results
      'ytd-universal-watch-card-renderer',
      'ytd-ad-slot-renderer',
    ],
    attrs: [],
  },
  {
    id: 'x',
    name: 'X',
    hosts: ['x.com', 'twitter.com'],
    items: ['article[data-testid="tweet"]', '[data-testid="trend"]'],
    attrs: [],
  },
  {
    id: 'reddit',
    name: 'Reddit',
    hosts: ['reddit.com'],
    items: [
      // New Reddit
      'shreddit-post',
      'shreddit-comment > [slot="comment"]', // Body only; nested replies are evaluated separately.
      // Old Reddit
      '.thing.link',
      '.thing.comment > .entry',
    ],
    attrs: ['post-title'],
  },
];

/** Resolves a hostname to its site config; matches the registrable domain and any subdomain. */
export function findSite(hostname: string): Site | null {
  const host = hostname.toLowerCase();
  return SITES.find((site) => site.hosts.some((h) => host === h || host.endsWith(`.${h}`))) ?? null;
}
