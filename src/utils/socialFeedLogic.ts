export type InstagramMediaType = 'reel' | 'carousel' | 'photo';
export type InstagramMediaFilter = 'all' | InstagramMediaType;

export interface InstagramProfileSummary {
  handle: string;
  displayName: string;
  avatar: string;
  followers: number;
  postsCount: number;
  url: string;
  embedUrl: string;
}

export interface SocialPost {
  id: string;
  shortcode: string;
  platform: 'instagram';
  mediaType: InstagramMediaType;
  handle: string;
  title: string;
  caption: string;
  image: string;
  permalink: string;
  embedUrl: string;
  publishedAt: string;
  likes: number;
  comments?: number;
  format: string;
  tags: string[];
}

export interface SocialFeedResponse {
  source: string;
  updatedAt: string;
  profile: InstagramProfileSummary;
  posts: SocialPost[];
}

const DEFAULT_FEED_ENDPOINT = '/api/social-feed.json';

const DEFAULT_PROFILE: InstagramProfileSummary = {
  handle: '@_d_zekoo',
  displayName: 'Ze Koo',
  avatar: '/instagram/profile.jpg',
  followers: 423,
  postsCount: 39,
  url: 'https://www.instagram.com/_d_zekoo/',
  embedUrl: 'https://www.instagram.com/_d_zekoo/embed/',
};

function isValidMediaType(value: unknown): value is InstagramMediaType {
  return value === 'reel' || value === 'carousel' || value === 'photo';
}

function isValidSocialPost(value: unknown): value is SocialPost {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    item.platform === 'instagram' &&
    isValidMediaType(item.mediaType) &&
    typeof item.id === 'string' &&
    item.id.trim().length > 0 &&
    typeof item.shortcode === 'string' &&
    item.shortcode.trim().length > 0 &&
    typeof item.title === 'string' &&
    item.title.trim().length > 0 &&
    typeof item.caption === 'string' &&
    typeof item.image === 'string' &&
    typeof item.permalink === 'string' &&
    typeof item.publishedAt === 'string'
  );
}

export function normalizeAndSortPosts(rawPosts: unknown[]): SocialPost[] {
  return rawPosts
    .filter(isValidSocialPost)
    .map((post) => ({
      ...post,
      embedUrl:
        typeof post.embedUrl === 'string' && post.embedUrl.trim()
          ? post.embedUrl.trim()
          : `https://www.instagram.com/p/${post.shortcode}/embed/captioned/`,
      likes: Number.isFinite(post.likes) && post.likes >= 0 ? Math.round(post.likes) : 0,
      comments:
        typeof post.comments === 'number' && Number.isFinite(post.comments) && post.comments >= 0
          ? Math.round(post.comments)
          : undefined,
      format:
        typeof post.format === 'string' && post.format.trim()
          ? post.format.trim()
          : post.mediaType === 'reel'
          ? 'Reel'
          : post.mediaType === 'carousel'
          ? 'Carousel'
          : 'Post',
      tags: Array.isArray(post.tags)
        ? post.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
        : [],
    }))
    .sort((a, b) => {
      const timeA = Date.parse(a.publishedAt);
      const timeB = Date.parse(b.publishedAt);
      if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
      if (Number.isNaN(timeA)) return 1;
      if (Number.isNaN(timeB)) return -1;
      return timeB - timeA;
    });
}

export function filterInstagramPosts(
  posts: SocialPost[],
  mediaFilter: InstagramMediaFilter
): SocialPost[] {
  if (mediaFilter === 'all') return posts;
  return posts.filter((post) => post.mediaType === mediaFilter);
}

export function formatCompactMetric(count: number): string {
  if (!Number.isFinite(count) || count < 0) return '0';
  if (count >= 1_000_000) {
    const millions = Math.round(count / 100_000) / 10;
    return `${millions}M`;
  }
  if (count >= 1_000) {
    const thousands = Math.round(count / 100) / 10;
    return `${thousands}K`;
  }
  return String(Math.round(count));
}

export function formatFeedTimestamp(
  isoDate: string,
  lang: 'en' | 'fr' | 'ar' = 'en'
): string {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return '';
  const locale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(parsed));
}

export function hasArabicCharacters(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export interface FetchSocialFeedOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

export async function fetchSocialFeedPosts(
  options: FetchSocialFeedOptions = {}
): Promise<SocialFeedResponse> {
  const endpoint = options.endpoint ?? DEFAULT_FEED_ENDPOINT;
  const fetchFn = options.fetchImpl ?? fetch;

  const response = await fetchFn(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Feed request failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  if (!payload || !Array.isArray(payload.posts)) {
    throw new Error('Invalid feed payload: missing posts array');
  }

  const rawProfile =
    payload.profile && typeof payload.profile === 'object'
      ? (payload.profile as Partial<InstagramProfileSummary>)
      : {};

  const profile: InstagramProfileSummary = {
    handle: typeof rawProfile.handle === 'string' ? rawProfile.handle : DEFAULT_PROFILE.handle,
    displayName:
      typeof rawProfile.displayName === 'string'
        ? rawProfile.displayName
        : DEFAULT_PROFILE.displayName,
    avatar: typeof rawProfile.avatar === 'string' ? rawProfile.avatar : DEFAULT_PROFILE.avatar,
    followers:
      typeof rawProfile.followers === 'number' && Number.isFinite(rawProfile.followers)
        ? rawProfile.followers
        : DEFAULT_PROFILE.followers,
    postsCount:
      typeof rawProfile.postsCount === 'number' && Number.isFinite(rawProfile.postsCount)
        ? rawProfile.postsCount
        : DEFAULT_PROFILE.postsCount,
    url: typeof rawProfile.url === 'string' ? rawProfile.url : DEFAULT_PROFILE.url,
    embedUrl:
      typeof rawProfile.embedUrl === 'string' ? rawProfile.embedUrl : DEFAULT_PROFILE.embedUrl,
  };

  return {
    source: typeof payload.source === 'string' ? payload.source : 'instagram-public-feed',
    updatedAt:
      typeof payload.updatedAt === 'string' ? payload.updatedAt : new Date().toISOString(),
    profile,
    posts: normalizeAndSortPosts(payload.posts),
  };
}
