import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchSocialFeedPosts,
  filterInstagramPosts,
  formatCompactMetric,
  formatFeedTimestamp,
  hasArabicCharacters,
  normalizeAndSortPosts,
  type SocialPost,
} from './socialFeedLogic';

const SAMPLE_POSTS: SocialPost[] = [
  {
    id: 'ig-Dd2M2omonbl',
    shortcode: 'Dd2M2omonbl',
    platform: 'instagram',
    mediaType: 'photo',
    handle: '@visiona__agency × @_d_zekoo',
    title: 'VESIONA — Coming Soon',
    caption: 'VESIONA — Coming Soon.',
    image: '/instagram/post-6-vesiona.jpg',
    permalink: 'https://www.instagram.com/p/Dd2M2omonbl/',
    embedUrl: 'https://www.instagram.com/p/Dd2M2omonbl/embed/captioned/',
    publishedAt: '2026-09-25T18:30:00Z',
    likes: 16,
    format: 'Post',
    tags: ['VESIONA'],
  },
  {
    id: 'ig-DezmFCqJ_jl',
    shortcode: 'DezmFCqJ_jl',
    platform: 'instagram',
    mediaType: 'reel',
    handle: '@_d_zekoo',
    title: 'I will make my little version happier',
    caption: 'I will make my little version happier .',
    image: '/instagram/post-1-little-version.jpg',
    permalink: 'https://www.instagram.com/p/DezmFCqJ_jl/',
    embedUrl: 'https://www.instagram.com/p/DezmFCqJ_jl/embed/captioned/',
    publishedAt: '2026-11-14T18:00:00Z',
    likes: 43,
    comments: 6,
    format: 'Reel',
    tags: ['Reel'],
  },
  {
    id: 'ig-DeMOty7itg2',
    shortcode: 'DeMOty7itg2',
    platform: 'instagram',
    mediaType: 'carousel',
    handle: '@_d_zekoo',
    title: 'كايــن فـرق بيـن ، بغــيت نجــح و محتــاج نجــح',
    caption: 'كايــن فـرق بيـن ، بغــيت نجــح و محتــاج نجــح ...',
    image: '/instagram/post-3-attestation.jpg',
    permalink: 'https://www.instagram.com/p/DeMOty7itg2/',
    embedUrl: 'https://www.instagram.com/p/DeMOty7itg2/embed/captioned/',
    publishedAt: '2026-10-08T19:00:00Z',
    likes: 80,
    format: 'Carousel',
    tags: ['Milestone'],
  },
];

test('normalizeAndSortPosts validates Instagram records and sorts newest first', () => {
  const result = normalizeAndSortPosts([
    ...SAMPLE_POSTS,
    { id: 'bad', platform: 'behance', title: 'Should be filtered out' },
  ]);
  assert.equal(result.length, 3);
  assert.equal(result[0].shortcode, 'DezmFCqJ_jl');
  assert.equal(result[1].shortcode, 'DeMOty7itg2');
  assert.equal(result[2].shortcode, 'Dd2M2omonbl');
});

test('filterInstagramPosts filters cleanly by reel, carousel, and photo', () => {
  assert.equal(filterInstagramPosts(SAMPLE_POSTS, 'all').length, 3);
  assert.equal(filterInstagramPosts(SAMPLE_POSTS, 'reel')[0].shortcode, 'DezmFCqJ_jl');
  assert.equal(filterInstagramPosts(SAMPLE_POSTS, 'carousel')[0].shortcode, 'DeMOty7itg2');
  assert.equal(filterInstagramPosts(SAMPLE_POSTS, 'photo')[0].shortcode, 'Dd2M2omonbl');
});

test('hasArabicCharacters detects Arabic/Darija captions accurately', () => {
  assert.equal(hasArabicCharacters('نكملوا القصة'), true);
  assert.equal(hasArabicCharacters('VESIONA — Coming Soon'), false);
});

test('formatCompactMetric and formatFeedTimestamp format numbers and dates cleanly', () => {
  assert.equal(formatCompactMetric(88), '88');
  assert.equal(formatCompactMetric(1450), '1.5K');
  assert.equal(formatCompactMetric(-10), '0');
  assert.ok(formatFeedTimestamp('2026-10-06T16:00:00Z', 'en').includes('2026'));
  assert.equal(formatFeedTimestamp('invalid', 'en'), '');
});

test('fetchSocialFeedPosts loads real Instagram profile metadata and sorted posts', async () => {
  const mockFetch = (async () =>
    ({
      ok: true,
      status: 200,
      json: async () => ({
        source: 'instagram-public-feed',
        updatedAt: '2026-11-19T10:52:00Z',
        profile: {
          handle: '@_d_zekoo',
          displayName: 'Ze Koo',
          avatar: '/instagram/profile.jpg',
          followers: 423,
          postsCount: 39,
          url: 'https://www.instagram.com/_d_zekoo/',
          embedUrl: 'https://www.instagram.com/_d_zekoo/embed/',
        },
        posts: SAMPLE_POSTS,
      }),
    }) as Response) as typeof fetch;

  const data = await fetchSocialFeedPosts({ fetchImpl: mockFetch });
  assert.equal(data.profile.handle, '@_d_zekoo');
  assert.equal(data.profile.followers, 423);
  assert.equal(data.posts.length, 3);
  assert.equal(data.posts[0].shortcode, 'DezmFCqJ_jl');
});

test('fetchSocialFeedPosts rejects non-200 HTTP responses and malformed payloads', async () => {
  const failingFetch = (async () =>
    ({
      ok: false,
      status: 502,
      json: async () => ({}),
    }) as Response) as typeof fetch;

  await assert.rejects(() => fetchSocialFeedPosts({ fetchImpl: failingFetch }), /HTTP 502/);

  const malformedFetch = (async () =>
    ({
      ok: true,
      status: 200,
      json: async () => ({ source: 'broken' }),
    }) as Response) as typeof fetch;

  await assert.rejects(
    () => fetchSocialFeedPosts({ fetchImpl: malformedFetch }),
    /missing posts array/
  );
});
