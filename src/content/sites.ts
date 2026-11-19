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
      'shreddit-comment > [slot="comment"]', // body only, replies are checked separately
      // Search results and server-driven post units
      '[data-testid="search-post-with-content-preview"]',
      '[data-testid="search-post-unit"]',
      '[data-testid="sdui-post-unit"]',
      // Old Reddit
      '.thing.link',
      '.thing.comment > .entry',
    ],
    attrs: ['post-title'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    hosts: ['facebook.com'],
    // Posts and comments are role="article"; Facebook's class names are obfuscated.
    items: ['[role="article"]'],
    attrs: [],
  },
  {
    id: 'twitch',
    name: 'Twitch',
    hosts: ['twitch.tv'],
    items: [
      // Directory/stream cards and chat messages
      'article',
      '[data-a-target="card-0"]',
      '.chat-line__message',
      '[data-a-target="chat-line-message"]',
    ],
    attrs: [],
  },
  {
    id: 'kick',
    name: 'Kick',
    hosts: ['kick.com'],
    // Checked against kick.com category pages: stream cards use these test ids.
    items: ['[data-testid="livestream-results-card"]', '[data-testid="media-card"]'],
    attrs: [],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    hosts: ['instagram.com'],
    // Feed posts, plus grid tiles on explore/search/profile pages (the tile's alt text is read via attrs).
    items: ['article', 'a[href^="/p/"]', 'a[href^="/reel/"]'],
    attrs: ['aria-label'],
  },
];

export function findSite(hostname: string): Site | null {
  const host = hostname.toLowerCase();
  return SITES.find((site) => site.hosts.some((h) => host === h || host.endsWith(`.${h}`))) ?? null;
}
