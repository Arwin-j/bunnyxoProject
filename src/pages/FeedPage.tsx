import React, { useState, useRef } from 'react';
import { useFeedPosts } from '../hooks/useFeedPosts';
import { useCountdown } from '../hooks/useCountdown';

// Helper to format ISO date to readable relative time
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Sub-component for the 24-hour Countdown Timer badge
const CountdownWidget: React.FC<{ timestamp: string }> = ({ timestamp }) => {
  const { hours, minutes, seconds, isExpired, formatted, progressPercent } = useCountdown(timestamp, 24);

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-[#f9f4e6] p-3 select-none border border-[#e9b3ad]/40">
      <div className="flex items-center justify-between gap-3 text-xs font-bold font-sans">
        <span className="flex items-center gap-1.5 text-[#b23a6b]">
          <span className="animate-pulse">⏳</span>
          <span>{isExpired ? 'EXPIRED' : '24H LIFESPAN'}</span>
        </span>
        <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-[#6b4f35]">
          {isExpired ? '00:00:00' : formatted}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#fbd5e1]">
        <div
          className={`h-full transition-all duration-1000 ${
            isExpired ? 'bg-[#8c6f55]' : 'bg-[#b23a6b]'
          }`}
          style={{ width: `${100 - progressPercent}%` }}
          title={`${Math.round(100 - progressPercent)}% time remaining`}
        />
      </div>

      <span className="text-[10px] text-[#8c6f55] font-mono text-right">
        {isExpired ? 'Awaiting next daily reel' : `${hours}h ${minutes}m ${seconds}s left`}
      </span>
    </div>
  );
};

export const FeedPage: React.FC = () => {
  const { featuredPost, gridPosts, isLoading, isLive, error, lastFetched, refreshFeed } = useFeedPosts();
  const [filterType, setFilterType] = useState<'ALL' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'IMAGE'>('ALL');
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Filter grid posts
  const filteredGridPosts = gridPosts.filter((post) => {
    if (filterType === 'ALL') return true;
    return post.media_type === filterType;
  });

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-6 antialiased selection:bg-[#b23a6b] selection:text-white">
      {/* 1. Header & Hero Bar */}
      <section
        className="card-v2 p-5 sm:p-6"
        style={{ background: 'linear-gradient(120deg, #fbd5e1, #f6c9b8)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xl sm:text-4xl select-none" aria-hidden="true">📰</span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#b23a6b] font-heading">
                Bunny Hub Feed
              </h1>
              <div className="flex items-center gap-1.5 rounded-full bg-[#f3ecda] px-3 py-0.5 text-xs font-bold text-[#6b4f35] shadow-xs select-none">
                <span className={`size-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isLive ? 'Instagram Live' : isLoading ? 'Connecting…' : 'Instagram Feed'}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#6b4f35] font-sans max-w-xl">
              Live updates, giveaways, guides, and reel highlights directly synced from{' '}
              <strong className="text-[#b23a6b]">@hey.bunnyxo</strong>.
            </p>
          </div>

          {/* Social Links & Action Pills */}
          <div className="flex flex-wrap items-center gap-2 select-none">
            <button
              type="button"
              onClick={refreshFeed}
              disabled={isLoading}
              title="Refresh live posts from Instagram"
              className="btn-v2 btn-v2-olive text-xs"
            >
              <span className={isLoading ? 'animate-spin' : ''}>↻</span>
              <span>{isLoading ? 'Syncing…' : 'Refresh'}</span>
            </button>

            <a
              href="https://www.instagram.com/hey.bunnyxo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-v2 text-xs"
            >
              <span>📸</span>
              <span>@hey.bunnyxo</span>
              <span className="text-xs">↗</span>
            </a>

            <button
              type="button"
              onClick={() => setShowApiInfo((curr) => !curr)}
              className="tab-v2 text-xs py-1.5 px-3 min-h-[34px]"
              title="View live API endpoint & feed status"
            >
              <span>⚙️</span>
              <span>{showApiInfo ? 'Hide Info' : 'API Info'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Architecture & Implementation Notes */}
        {showApiInfo && (
          <div className="mt-4 rounded-2xl bg-[#f3ecda] p-4 shadow-sm space-y-2 text-xs font-sans text-[#6b4f35]">
            <div className="flex items-center justify-between font-bold text-sm text-[#7a5638]">
              <span className="flex items-center gap-1.5">
                <span>⚡</span>
                <span>Instagram Graph API Live Sync</span>
              </span>
              <span className="text-xs text-[#8c6f55] font-mono">
                {lastFetched ? `Last synced: ${lastFetched.toLocaleTimeString()}` : ''}
              </span>
            </div>
            <p className="text-[#8c6f55] leading-relaxed">
              Connected directly to Instagram Graph API at{' '}
              <code className="font-mono bg-[#f9f4e6] px-1.5 py-0.5 rounded text-[11px] text-[#6b4f35]">
                https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink...
              </code>
            </p>
            {error && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-2 text-rose-800 text-[11px] font-semibold">
                Notice: {error} (Serving cached live posts)
              </div>
            )}
            <ul className="list-disc list-inside space-y-1 text-[#6b4f35] pl-1">
              <li>
                <strong>Spotlight (Post #0)</strong>: Plays latest video reel directly or highlights newest Instagram post with real-time countdown timer.
              </li>
              <li>
                <strong>Community Grid</strong>: Responsive grid of recent posts, reels, and guide albums with direct permalinks.
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* 2. Top Container: Featured Latest Post (Index 0) */}
      {featuredPost && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="flex size-3 rounded-full bg-[#b23a6b] animate-ping select-none" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#7a5638] font-serif flex items-center gap-2">
                <span>Featured Daily Spotlight</span>
                <span className="tag-v2">
                  {featuredPost.media_type === 'VIDEO' ? '🎬 Latest Reel' : '📸 Latest Post'}
                </span>
              </h2>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono font-bold text-[#8c6f55]">
              Live from Instagram
            </span>
          </div>

          <div className="overflow-hidden rounded-[24px] bg-[#f3ecda] p-3 sm:p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Media Player (Video or Image) */}
              <div className="lg:col-span-7 relative flex items-center justify-center bg-black/5 rounded-2xl overflow-hidden aspect-video sm:aspect-[16/10] max-h-[460px]">
                {featuredPost.media_type === 'VIDEO' ? (
                  <>
                    <video
                      ref={videoRef}
                      src={featuredPost.media_url}
                      poster={featuredPost.thumbnail_url}
                      className="w-full h-full object-cover rounded-2xl"
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                    />
                    {/* Media controls overlay */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause video' : 'Play video'}
                        className="size-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xs backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        {isPlaying ? '⏸' : '▶'}
                      </button>
                      <button
                        type="button"
                        onClick={toggleMute}
                        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                        className="size-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xs backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        {isMuted ? '🔇' : '🔊'}
                      </button>
                    </div>
                  </>
                ) : (
                  <img
                    src={featuredPost.media_url}
                    alt={featuredPost.caption || 'Featured post'}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                )}
              </div>

              {/* Right Column: Metadata & Caption */}
              <div className="lg:col-span-5 flex flex-col justify-between p-2 space-y-4">
                <div className="space-y-3">
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#e9b3ad]/40 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-full bg-[#fbd5e1] flex items-center justify-center text-lg shadow-xs">
                        {featuredPost.author_avatar || '🐰'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-heading font-semibold text-sm text-[#7a5638]">
                            {featuredPost.author}
                          </span>
                          <span className="text-xs text-[#b23a6b] font-bold" title="Official Creator">✓</span>
                        </div>
                        <span className="font-mono text-xs text-[#8c6f55]">
                          {featuredPost.author_handle}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#8c6f55]">
                      {formatRelativeTime(featuredPost.timestamp)}
                    </span>
                  </div>

                  {/* 24-Hour Countdown Clock Widget */}
                  <CountdownWidget timestamp={featuredPost.timestamp} />

                  {/* Caption & Tags */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-sans font-medium text-[#6b4f35] leading-relaxed line-clamp-4">
                      {featuredPost.caption}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {featuredPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="tag-v2 text-[11px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Interactions & Instagram Link */}
                <div className="space-y-3 pt-3 border-t border-[#e9b3ad]/40">
                  <a
                    href={featuredPost.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-v2 w-full text-center"
                  >
                    <span>📸</span>
                    <span>View Reel on Instagram</span>
                    <span className="text-xs">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Bottom Container: Grid of Recent Instagram Posts */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9b3ad]/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">📸</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#7a5638] font-serif flex items-center gap-2">
                <span>Recent Community Posts</span>
                <span className="tag-v2">
                  {filteredGridPosts.length}
                </span>
              </h2>
              <p className="text-xs font-medium text-[#8c6f55] font-sans">
                Latest updates, giveaway winners, and guides from @hey.bunnyxo.
              </p>
            </div>
          </div>

          {/* Media Filter Tabs */}
          <div className="flex items-center gap-1">
            {(
              [
                { key: 'ALL', label: 'All' },
                { key: 'VIDEO', label: 'Reels 🎬' },
                { key: 'CAROUSEL_ALBUM', label: 'Albums 📸' },
                { key: 'IMAGE', label: 'Photos 🖼️' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterType(tab.key)}
                className={`tab-v2 text-xs py-1 px-3 min-h-[32px] ${
                  filterType === tab.key ? 'on' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGridPosts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="card-v2 p-3 group relative flex flex-col justify-between overflow-hidden transition-all duration-150 hover:-translate-y-1 cursor-pointer no-underline text-inherit"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-black/5 rounded-2xl">
                <img
                  src={post.thumbnail_url || post.media_url}
                  alt={post.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Media Type Badge */}
                <div className="absolute top-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs select-none">
                  {post.media_type === 'VIDEO'
                    ? '🎬 REEL'
                    : post.media_type === 'CAROUSEL_ALBUM'
                    ? '📸 ALBUM'
                    : '🖼️ PHOTO'}
                </div>

                {/* Hover Instagram Overlay Pill */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <span className="btn-v2 text-xs py-1.5 px-3">
                    <span>View on Instagram</span>
                    <span>↗</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="pt-3 flex flex-col justify-between flex-1 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8c6f55]">
                    <span className="font-bold text-[#6b4f35] flex items-center gap-1">
                      <span>{post.author_avatar || '🐰'}</span>
                      <span className="truncate max-w-[130px]">{post.author_handle}</span>
                    </span>
                    <span>{formatRelativeTime(post.timestamp)}</span>
                  </div>

                  <p className="font-sans text-xs font-medium text-[#6b4f35] line-clamp-3 leading-snug">
                    {post.caption}
                  </p>
                </div>

                {/* Card Footer: Tags & Link indicator */}
                <div className="flex items-center justify-between pt-2 border-t border-[#e9b3ad]/40 text-[11px] font-mono font-bold text-[#8c6f55]">
                  <span className="truncate max-w-[180px] text-[#b23a6b]">
                    {post.tags[0] ? `#${post.tags[0]}` : '#Heartopia'}
                    {post.tags[1] ? ` #${post.tags[1]}` : ''}
                  </span>
                  <span className="text-[#b23a6b] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Open</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
};

export default FeedPage;
