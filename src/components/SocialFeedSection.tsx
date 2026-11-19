import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  ExternalLink,
  Film,
  Grid2x2,
  Heart,
  Layers,
  MessageCircle,
  Play,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  fetchSocialFeedPosts,
  filterInstagramPosts,
  formatCompactMetric,
  formatFeedTimestamp,
  hasArabicCharacters,
  type InstagramMediaFilter,
  type InstagramProfileSummary,
  type SocialPost,
} from '../utils/socialFeedLogic';

interface SocialFeedSectionProps {
  currentLang: 'en' | 'fr' | 'ar';
}

const COPY = {
  en: {
    kickerLeft: 'INSTAGRAM FEED',
    kickerRight: '@_D_ZEKOO · LIVE ARCHIVE',
    heading: 'LATEST POSTS & DROPS',
    subtitle:
      'Real reels, carousels, and creative milestones directly from Zakaria Boubkeraoui’s Instagram (@_d_zekoo).',
    filterAll: 'All',
    filterReels: 'Reels',
    filterCarousels: 'Carousels',
    filterPosts: 'Posts',
    viewGrid: 'Editorial Cards',
    viewEmbed: 'Live IG Embed',
    refresh: 'Sync Feed',
    refreshing: 'Syncing...',
    syncedLabel: 'Synced',
    inspectPost: 'Inspect Post',
    openPost: 'View on Instagram',
    followProfile: 'Follow @_d_zekoo',
    retry: 'Retry Fetch',
    errorTitle: 'Could not load Instagram posts.',
    emptyTitle: 'No posts match this format yet.',
    closeModal: 'Close post preview',
    likesLabel: 'likes',
    commentsLabel: 'comments',
    followersLabel: 'followers',
    postsLabel: 'posts',
    toggleLiveEmbed: 'Live Instagram Embed',
    toggleCardView: 'Clean Preview',
  },
  fr: {
    kickerLeft: 'FLUX INSTAGRAM',
    kickerRight: '@_D_ZEKOO · POSTS RÉELS',
    heading: 'DERNIERS POSTS & DROPS',
    subtitle:
      'Vrais reels, carrousels et moments clés directement issus du compte Instagram de Zakaria Boubkeraoui (@_d_zekoo).',
    filterAll: 'Tous',
    filterReels: 'Reels',
    filterCarousels: 'Carrousels',
    filterPosts: 'Photos',
    viewGrid: 'Cartes Éditoriales',
    viewEmbed: 'Embed IG Direct',
    refresh: 'Actualiser',
    refreshing: 'Sync...',
    syncedLabel: 'Synchronisé',
    inspectPost: 'Inspecter',
    openPost: 'Voir sur Instagram',
    followProfile: 'Suivre @_d_zekoo',
    retry: 'Réessayer',
    errorTitle: 'Impossible de charger les posts Instagram.',
    emptyTitle: 'Aucun post disponible pour ce format.',
    closeModal: 'Fermer l’aperçu',
    likesLabel: 'j’aime',
    commentsLabel: 'commentaires',
    followersLabel: 'abonnés',
    postsLabel: 'publications',
    toggleLiveEmbed: 'Embed Instagram Live',
    toggleCardView: 'Aperçu Éditorial',
  },
  ar: {
    kickerLeft: 'إنستغرام مباشر',
    kickerRight: '@_D_ZEKOO · منشورات حقيقية',
    heading: 'أحدث منشورات إنستغرام',
    subtitle:
      'ريلز، منشورات كاروسيل ولحظات حقيقية مباشرة من حساب زكرياء بوبكراوي على إنستغرام (@_d_zekoo).',
    filterAll: 'الكل',
    filterReels: 'ريلز',
    filterCarousels: 'كاروسيل',
    filterPosts: 'صور',
    viewGrid: 'بطاقات العرض',
    viewEmbed: 'عرض إنستغرام المباشر',
    refresh: 'تحديث',
    refreshing: 'جاري المزامنة...',
    syncedLabel: 'آخر تحديث',
    inspectPost: 'معاينة',
    openPost: 'فتح في إنستغرام',
    followProfile: 'متابعة @_d_zekoo',
    retry: 'إعادة المحاولة',
    errorTitle: 'تعذر تحميل منشورات إنستغرام.',
    emptyTitle: 'لا توجد منشورات لهذا النوع حالياً.',
    closeModal: 'إغلاق المعاينة',
    likesLabel: 'إعجاب',
    commentsLabel: 'تعليق',
    followersLabel: 'متابع',
    postsLabel: 'منشور',
    toggleLiveEmbed: 'تضمين إنستغرام المباشر',
    toggleCardView: 'معاينة سريعة',
  },
} as const;

export const SocialFeedSection: React.FC<SocialFeedSectionProps> = ({ currentLang }) => {
  const copy = COPY[currentLang];

  const [profile, setProfile] = useState<InstagramProfileSummary | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [mediaFilter, setMediaFilter] = useState<InstagramMediaFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'embed'>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [activePost, setActivePost] = useState<SocialPost | null>(null);
  const [modalShowEmbed, setModalShowEmbed] = useState<boolean>(false);

  const loadFeed = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchSocialFeedPosts({ signal });
        setProfile(data.profile);
        setPosts(data.posts);
        const syncTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        setLastSyncedAt(syncTime);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setErrorMessage(err instanceof Error ? err.message : copy.errorTitle);
      } finally {
        setIsLoading(false);
      }
    },
    [copy.errorTitle]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadFeed(controller.signal);
    return () => controller.abort();
  }, [loadFeed]);

  // Reset modal embed toggle whenever selected post changes
  useEffect(() => {
    setModalShowEmbed(false);
  }, [activePost?.id]);

  // Escape key closes lightbox modal
  useEffect(() => {
    if (!activePost) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePost(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePost]);

  const visiblePosts = useMemo(
    () => filterInstagramPosts(posts, mediaFilter),
    [posts, mediaFilter]
  );

  const counts = useMemo(
    () => ({
      all: posts.length,
      reel: posts.filter((p) => p.mediaType === 'reel').length,
      carousel: posts.filter((p) => p.mediaType === 'carousel').length,
      photo: posts.filter((p) => p.mediaType === 'photo').length,
    }),
    [posts]
  );

  const markImageFailed = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  const activeProfile: InstagramProfileSummary = profile ?? {
    handle: '@_d_zekoo',
    displayName: 'Ze Koo',
    avatar: '/instagram/profile.jpg',
    followers: 423,
    postsCount: 39,
    url: 'https://www.instagram.com/_d_zekoo/',
    embedUrl: 'https://www.instagram.com/_d_zekoo/embed/',
  };

  return (
    <section
      id="social-feed"
      data-testid="social-feed-section"
      className="py-10 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Editorial Section Header */}
      <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-black/80 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
            <span>{copy.kickerLeft}</span>
            <span aria-hidden="true">·</span>
            <span>{copy.kickerRight}</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tighter text-black uppercase text-balance max-w-3xl">
            {copy.heading}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-2xl mt-1.5 leading-relaxed">
            {copy.subtitle}
          </p>
        </div>

        {/* View Mode Switch + Refresh Action */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label="Instagram feed display mode"
            className="inline-flex items-center p-1 bg-neutral-200/80 border border-black/20 rounded-md gap-1"
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:text-black hover:bg-white/60'
              }`}
            >
              <Grid2x2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copy.viewGrid}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('embed')}
              aria-pressed={viewMode === 'embed'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'embed'
                  ? 'bg-red-600 text-white'
                  : 'text-neutral-700 hover:text-black hover:bg-white/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copy.viewEmbed}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => void loadFeed()}
            disabled={isLoading}
            aria-label={copy.refresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-100 disabled:opacity-60 border-2 border-black text-black text-xs font-mono font-bold rounded-md shadow-[3px_3px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? copy.refreshing : copy.refresh}</span>
          </button>
        </div>
      </div>

      {/* Real Instagram Account Strip (@_d_zekoo) + Format Filter Tabs */}
      <div
        data-testid="instagram-profile-bar"
        className="mb-6 bg-white border-2 border-black rounded-md p-3.5 sm:p-4 shadow-[4px_4px_0px_#121212] flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-full border-2 border-red-600 p-0.5 shrink-0 bg-white overflow-hidden">
            {!failedImages['profile'] ? (
              <img
                src={activeProfile.avatar}
                alt={`${activeProfile.handle} profile picture`}
                referrerPolicy="no-referrer"
                onError={() => markImageFailed('profile')}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-neutral-900 text-white font-display font-bold text-sm flex items-center justify-center">
                ZK
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={activeProfile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display font-black text-base sm:text-lg text-neutral-900 hover:text-red-600 transition-colors truncate"
              >
                {activeProfile.handle}
              </a>
              <span aria-hidden="true" className="text-neutral-400 text-xs">·</span>
              <span className="font-mono text-xs text-neutral-600 truncate">
                {activeProfile.displayName} (Zakaria Boubkeraoui)
              </span>
            </div>

            <div
              data-testid="social-feed-meta"
              className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-600 mt-0.5 tabular-nums"
            >
              <span>
                <strong className="text-neutral-900">{activeProfile.postsCount}</strong>{' '}
                {copy.postsLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-neutral-900">{activeProfile.followers}</strong>{' '}
                {copy.followersLabel}
              </span>
              {lastSyncedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-500">
                    {copy.syncedLabel} {lastSyncedAt}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {viewMode === 'grid' && (
            <div
              role="tablist"
              aria-label="Filter Instagram posts by media format"
              className="inline-flex items-center p-1 bg-neutral-100 border border-neutral-300 rounded-md gap-1"
            >
              {(
                [
                  { id: 'all', label: copy.filterAll, count: counts.all },
                  { id: 'reel', label: copy.filterReels, count: counts.reel },
                  { id: 'carousel', label: copy.filterCarousels, count: counts.carousel },
                  { id: 'photo', label: copy.filterPosts, count: counts.photo },
                ] as const
              ).map((tab) => {
                const isSelected = mediaFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setMediaFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-700 hover:text-black hover:bg-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {posts.length > 0 && (
                      <span className="ml-1 opacity-70 tabular-nums">{tab.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <a
            href={activeProfile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <span>{copy.followProfile}</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Live Instagram Profile Embed Mode */}
      {viewMode === 'embed' ? (
        <div
          data-testid="instagram-live-embed-container"
          className="bg-white border-2 border-black rounded-md shadow-[5px_5px_0px_#121212] overflow-hidden"
        >
          <iframe
            src={activeProfile.embedUrl}
            title="Zakaria Boubkeraoui (@_d_zekoo) Live Instagram Profile Embed"
            className="w-full h-[640px] border-0 bg-white"
            loading="lazy"
          />
        </div>
      ) : (
        <>
          {/* Loading Skeleton State */}
          {isLoading && posts.length === 0 && (
            <div
              data-testid="social-feed-skeleton"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[0, 1, 2].map((skeletonIdx) => (
                <div
                  key={skeletonIdx}
                  className="bg-white border-2 border-black/20 rounded-md overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-neutral-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-36 bg-neutral-200 rounded" />
                    <div className="h-5 w-4/5 bg-neutral-200 rounded" />
                    <div className="h-3 w-full bg-neutral-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recoverable Error State */}
          {!isLoading && errorMessage && (
            <div
              role="alert"
              data-testid="social-feed-error"
              className="bg-white border-2 border-red-600 p-6 rounded-md shadow-[4px_4px_0px_#dc2626] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-display font-bold text-lg text-black">{copy.errorTitle}</h3>
                <p className="font-mono text-xs text-neutral-600 mt-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => void loadFeed()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{copy.retry}</span>
              </button>
            </div>
          )}

          {/* Empty Filter State */}
          {!isLoading && !errorMessage && visiblePosts.length === 0 && (
            <div
              data-testid="social-feed-empty"
              className="bg-white border-2 border-black p-8 text-center rounded-md"
            >
              <p className="font-mono text-sm text-neutral-600">{copy.emptyTitle}</p>
            </div>
          )}

          {/* Real Instagram Posts Grid */}
          {!errorMessage && visiblePosts.length > 0 && (
            <div
              data-testid="social-feed-grid"
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${
                isLoading ? 'opacity-65' : 'opacity-100'
              }`}
            >
              {visiblePosts.map((post) => {
                const imgFailed = Boolean(failedImages[post.id]);
                const formattedDate = formatFeedTimestamp(post.publishedAt, currentLang);
                const isArabicTitle = hasArabicCharacters(post.title);
                const isArabicCaption = hasArabicCharacters(post.caption);

                return (
                  <article
                    key={post.id}
                    data-testid="social-feed-card"
                    data-media-type={post.mediaType}
                    data-shortcode={post.shortcode}
                    className="bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_#121212] hover:-translate-y-0.5 transition-transform duration-150 flex flex-col overflow-hidden"
                  >
                    {/* Real Instagram Thumbnail with Clean Scrim */}
                    <button
                      type="button"
                      onClick={() => setActivePost(post)}
                      aria-label={`${copy.inspectPost}: ${post.title}`}
                      className="relative aspect-[4/3] w-full bg-neutral-950 overflow-hidden group text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      {!imgFailed ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={() => markImageFailed(post.id)}
                          className="w-full h-full object-cover object-[50%_20%] group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col items-center justify-center p-4 text-center">
                          <Camera className="w-8 h-8 text-red-500 mb-2" />
                          <span className="font-display font-bold text-sm text-white line-clamp-2">
                            {post.title}
                          </span>
                        </div>
                      )}

                      {/* Subtle top-right media type affordance icon */}
                      <div
                        aria-hidden="true"
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-sm bg-black/75 text-white flex items-center justify-center border border-white/20"
                      >
                        {post.mediaType === 'reel' ? (
                          <Play className="w-3.5 h-3.5 fill-white" />
                        ) : post.mediaType === 'carousel' ? (
                          <Layers className="w-3.5 h-3.5" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Measured Gradient Scrim for 4.5:1+ contrast */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none"
                      />

                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[11px] font-mono text-white/95 pointer-events-none">
                        <span className="font-bold tracking-wide shrink-0">
                          Instagram · {post.format}
                        </span>
                        <span className="truncate opacity-85">{post.handle}</span>
                      </div>
                    </button>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        {/* Clean Unboxed Metadata */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-neutral-500 mb-1.5">
                          <span className="text-red-600 font-bold">{post.format}</span>
                          {formattedDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{formattedDate}</span>
                            </>
                          )}
                          {post.tags.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate">{post.tags.slice(0, 2).join(' / ')}</span>
                            </>
                          )}
                        </div>

                        <h3
                          dir={isArabicTitle ? 'rtl' : 'ltr'}
                          className={`font-extrabold text-lg text-neutral-900 leading-snug line-clamp-2 ${
                            isArabicTitle ? 'font-arabic text-right' : 'font-display'
                          }`}
                        >
                          {post.title}
                        </h3>
                        <p
                          dir={isArabicCaption ? 'rtl' : 'ltr'}
                          className={`text-xs sm:text-[13px] text-neutral-600 mt-1.5 leading-relaxed line-clamp-2 ${
                            isArabicCaption ? 'font-arabic text-right' : 'font-body'
                          }`}
                        >
                          {post.caption}
                        </p>
                      </div>

                      {/* Card Footer: Real Engagement + Direct Post Link */}
                      <div className="pt-3 border-t border-neutral-200 flex items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-3 text-neutral-700 tabular-nums">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                            <span>{formatCompactMetric(post.likes)}</span>
                          </span>
                          {typeof post.comments === 'number' && (
                            <span className="inline-flex items-center gap-1 text-neutral-500">
                              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{formatCompactMetric(post.comments)}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActivePost(post)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-900 hover:text-white border border-neutral-300 text-neutral-900 text-[11px] font-mono font-bold rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {copy.inspectPost}
                          </button>
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${copy.openPost}: ${post.title}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-800 hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
                          >
                            <span>IG</span>
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Accessible Post Detail Lightbox Modal (portaled to document.body) */}
      {activePost &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-post-modal-title"
            data-testid="social-post-modal"
            onClick={() => setActivePost(null)}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-black rounded-md shadow-[8px_8px_0px_#121212] max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-neutral-200 bg-[#F9F9F6] shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 min-w-0">
                  <span className="font-bold text-neutral-900 truncate">{activePost.handle}</span>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0">{activePost.format}</span>
                  <span aria-hidden="true" className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline shrink-0">
                    {formatFeedTimestamp(activePost.publishedAt, currentLang)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalShowEmbed((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-neutral-900 hover:text-white border border-neutral-300 text-neutral-800 text-[11px] font-mono font-bold rounded-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Film className="w-3 h-3" aria-hidden="true" />
                    <span>{modalShowEmbed ? copy.toggleCardView : copy.toggleLiveEmbed}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePost(null)}
                    aria-label={copy.closeModal}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-sm bg-white hover:bg-neutral-900 hover:text-white border border-neutral-300 text-neutral-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Visual / Live Embed */}
              {modalShowEmbed ? (
                <div className="w-full h-[540px] bg-white overflow-hidden">
                  <iframe
                    src={activePost.embedUrl}
                    title={`Instagram post ${activePost.shortcode}`}
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <>
                  <div className="w-full max-h-[46vh] bg-neutral-950 overflow-hidden flex items-center justify-center shrink-0">
                    {!failedImages[activePost.id] ? (
                      <img
                        src={activePost.image}
                        alt={activePost.title}
                        referrerPolicy="no-referrer"
                        onError={() => markImageFailed(activePost.id)}
                        className="w-full h-full max-h-[46vh] object-contain"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-white font-display font-bold text-lg p-6 text-center">
                        {activePost.title}
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                      <h3
                        id="social-post-modal-title"
                        dir={hasArabicCharacters(activePost.title) ? 'rtl' : 'ltr'}
                        className={`font-black text-xl sm:text-2xl text-neutral-900 leading-tight ${
                          hasArabicCharacters(activePost.title)
                            ? 'font-arabic text-right'
                            : 'font-display'
                        }`}
                      >
                        {activePost.title}
                      </h3>
                      <p
                        dir={hasArabicCharacters(activePost.caption) ? 'rtl' : 'ltr'}
                        className={`text-sm text-neutral-700 mt-2 leading-relaxed whitespace-pre-line ${
                          hasArabicCharacters(activePost.caption)
                            ? 'font-arabic text-right'
                            : 'font-body'
                        }`}
                      >
                        {activePost.caption}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-3 text-neutral-700 tabular-nums">
                        <span>
                          {formatCompactMetric(activePost.likes)} {copy.likesLabel}
                        </span>
                        {typeof activePost.comments === 'number' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>
                              {formatCompactMetric(activePost.comments)} {copy.commentsLabel}
                            </span>
                          </>
                        )}
                      </div>

                      <a
                        href={activePost.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold rounded-md transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>{copy.openPost}</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default SocialFeedSection;
