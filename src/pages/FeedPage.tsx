import React, { useState, useRef } from 'react';
import { useFeedPosts, FeedPost } from '../hooks/useFeedPosts';
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
  return `${diffDays} days ago`;
}

// Sub-component for the 24-hour Countdown Timer badge
const CountdownWidget: React.FC<{ timestamp: string }> = ({ timestamp }) => {
  const { hours, minutes, seconds, isExpired, formatted, progressPercent } = useCountdown(timestamp, 24);

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border-2 border-foreground bg-white/95 px-3.5 py-2 shadow-xs backdrop-blur-xs select-none">
      <div className="flex items-center justify-between gap-3 text-xs font-bold font-sans">
        <span className="flex items-center gap-1.5 text-rose-600">
          <span className="animate-pulse">⏳</span>
          <span>{isExpired ? 'EXPIRED' : '24H LIFESPAN'}</span>
        </span>
        <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-foreground">
          {isExpired ? '00:00:00' : formatted}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-rose-100 border border-foreground/20">
        <div
          className={`h-full transition-all duration-1000 ${
            isExpired ? 'bg-rose-400' : 'bg-rose-500'
          }`}
          style={{ width: `${100 - progressPercent}%` }}
          title={`${Math.round(100 - progressPercent)}% time remaining`}
        />
      </div>

      <span className="text-[10px] text-muted-foreground font-mono text-right">
        {isExpired ? 'Awaiting next daily reel' : `${hours}h ${minutes}m ${seconds}s left`}
      </span>
    </div>
  );
};

export const FeedPage: React.FC = () => {
  const { featuredPost, gridPosts, resetToDefault } = useFeedPosts();
  const [filterType, setFilterType] = useState<'ALL' | 'VIDEO' | 'IMAGE'>('ALL');
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
    <main className="mx-auto max-w-6xl px-3 sm:px-6 py-6 space-y-8 antialiased">
      {/* 1. Header & Hero Bar */}
      <section className="relative overflow-hidden rounded-[28px] border-[3px] border-foreground bg-[#ffe4e6] p-5 sm:p-7 shadow-ink">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl select-none" aria-hidden="true">📰</span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
                Bunny Hub Feed
              </h1>
              <span className="rounded-full border-2 border-foreground bg-white px-2.5 py-0.5 text-xs font-bold shadow-xs">
                Instagram Live
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground/80 font-sans max-w-xl">
              Daily 24-hour spotlight reel, community snapshots, and official Heartopia updates.
            </p>
          </div>

          {/* Social Links & Action Pill */}
          <div className="flex flex-wrap items-center gap-2 select-none">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border-2 border-foreground bg-white hover:bg-[#fdf2f8] px-3.5 py-1.5 text-xs sm:text-sm font-bold shadow-xs transition-all active:translate-y-0.5"
            >
              <span className="text-base">📸</span>
              <span>@bunnyhub.heartopia</span>
              <span className="text-muted-foreground text-xs">↗</span>
            </a>

            <button
              type="button"
              onClick={() => setShowApiInfo((curr) => !curr)}
              className="flex items-center gap-1 rounded-full border-2 border-foreground/30 bg-white/70 hover:bg-white px-3 py-1.5 text-xs font-bold text-foreground transition-all cursor-pointer"
              title="View layout & API architecture"
            >
              <span>⚙️</span>
              <span>{showApiInfo ? 'Hide Tech Info' : 'API Info'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Architecture & Implementation Notes */}
        {showApiInfo && (
          <div className="mt-4 rounded-2xl border-2 border-foreground bg-white p-4 shadow-sm space-y-2 text-xs font-sans text-foreground">
            <div className="flex items-center justify-between font-bold text-sm text-foreground">
              <span className="flex items-center gap-1.5">
                <span>⚡</span>
                <span>Production Architecture (Path A: Custom Code in React)</span>
              </span>
              <button
                type="button"
                onClick={resetToDefault}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                ↻ Reset Sample Posts & Countdown
              </button>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              This layout directly implements the <strong>Top vs. Bottom Splitting Logic</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-1">
              <li>
                <strong>Top Container (Index 0)</strong>: Renders the latest post with an HTML5{' '}
                <code className="font-mono bg-muted px-1 rounded">&lt;video autoPlay loop muted playsInline&gt;</code>{' '}
                tag, accompanied by a live 24-hour JavaScript countdown timer calculating remaining lifespan from the creation timestamp.
              </li>
              <li>
                <strong>Bottom Container (Elements 1..N)</strong>: Maps subsequent posts into a 3-column CSS Grid{' '}
                <code className="font-mono bg-muted px-1 rounded">grid-cols-3</code> of clickable anchor cards linked to their Instagram permalinks.
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* 2. Top Container: Featured Latest Post (Index 0) with 24-Hour Countdown Timer */}
      {featuredPost && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="flex size-3 rounded-full bg-rose-500 animate-ping select-none" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
                <span>Featured Daily Spotlight</span>
                <span className="rounded-full border border-foreground/30 bg-rose-100 text-rose-700 px-2.5 py-0.5 text-xs font-bold">
                  Post #0
                </span>
              </h2>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono font-bold text-muted-foreground">
              Auto-refreshes daily
            </span>
          </div>

          <div className="overflow-hidden rounded-[24px] border-[3px] border-foreground bg-card shadow-ink">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Media Player (Video or Image) */}
              <div className="relative lg:col-span-7 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[420px] max-h-[560px] overflow-hidden">
                {featuredPost.media_type === 'VIDEO' ? (
                  <video
                    ref={videoRef}
                    src={featuredPost.media_url}
                    poster={featuredPost.thumbnail_url}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="h-full w-full object-cover select-none"
                  />
                ) : (
                  <img
                    src={featuredPost.media_url}
                    alt={featuredPost.caption}
                    className="h-full w-full object-cover select-none"
                  />
                )}

                {/* Floating Top Left Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border-1.5 border-white/80 bg-black/60 px-3 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-xs select-none">
                  <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                  <span>24H DAILY REEL</span>
                </div>

                {/* Floating Media Controls on Bottom Right */}
                {featuredPost.media_type === 'VIDEO' && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 select-none">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                      className="size-8 rounded-full border border-white/70 bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/90 transition-all cursor-pointer"
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                      className="size-8 rounded-full border border-white/70 bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/90 transition-all cursor-pointer"
                    >
                      {isMuted ? '🔇' : '🔊'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Metadata, Countdown Timer & Linkout */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between gap-5 bg-card border-t-[3px] lg:border-t-0 lg:border-l-[3px] border-foreground">
                <div className="space-y-4">
                  {/* Author Header */}
                  <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-10 rounded-full border-2 border-foreground bg-[#ffe4e6] flex items-center justify-center text-lg shadow-xs select-none">
                        {featuredPost.author_avatar || '🐰'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold font-sans text-sm text-foreground">
                            {featuredPost.author}
                          </span>
                          <span className="text-xs text-blue-500" title="Verified Creator">✓</span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {featuredPost.author_handle}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-muted-foreground">
                      {formatRelativeTime(featuredPost.timestamp)}
                    </span>
                  </div>

                  {/* 24-Hour Countdown Clock Widget */}
                  <CountdownWidget timestamp={featuredPost.timestamp} />

                  {/* Caption & Tags */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-sans font-medium text-foreground leading-relaxed">
                      {featuredPost.caption}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {featuredPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#fce7f3] border border-foreground/20 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Interactions & Instagram Link */}
                <div className="space-y-3 pt-3 border-t-2 border-dashed border-foreground/20">
                  <div className="flex items-center justify-between text-xs font-bold font-mono text-muted-foreground px-1">
                    <span className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>{featuredPost.likes.toLocaleString()} likes</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{featuredPost.comments.toLocaleString()} comments</span>
                    </span>
                  </div>

                  <a
                    href={featuredPost.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-primary hover:bg-accent py-2.5 px-4 font-sans text-sm sm:text-base font-bold text-foreground shadow-ink active:translate-y-0.5 transition-all select-none"
                  >
                    <span>📸</span>
                    <span>Watch on Instagram</span>
                    <span className="text-xs">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Bottom Container: Elements 1 through N in a 3-Column CSS Grid */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-foreground/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">📸</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
                <span>Recent Community Posts</span>
                <span className="rounded-full border border-foreground bg-white px-2.5 py-0.5 text-xs font-bold shadow-xs">
                  {filteredGridPosts.length}
                </span>
              </h2>
              <p className="text-xs font-medium text-muted-foreground font-sans">
                Posts starting from the 2nd newest onward (skipping featured post #0).
              </p>
            </div>
          </div>

          {/* Media Filter Tabs */}
          <div className="flex items-center rounded-full border-2 border-foreground bg-card p-1 shadow-xs select-none">
            {(['ALL', 'VIDEO', 'IMAGE'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`rounded-full px-3 py-1 font-sans text-xs font-bold transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-primary text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {type === 'ALL' ? 'All' : type === 'VIDEO' ? 'Reels 🎬' : 'Photos 📷'}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column CSS Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGridPosts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] border-[2.5px] border-foreground bg-card shadow-ink transition-all duration-150 hover:-translate-y-1 hover:shadow-[5px_5px_0_0_var(--foreground)] active:translate-y-0.5 cursor-pointer"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-black/10 border-b-2 border-foreground">
                <img
                  src={post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url}
                  alt={post.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Media Type Badge */}
                <div className="absolute top-2.5 left-2.5 rounded-full border border-white/80 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs select-none">
                  {post.media_type === 'VIDEO' ? '🎬 REEL' : '📷 PHOTO'}
                </div>

                {/* Hover Instagram Overlay Pill */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <span className="flex items-center gap-1.5 rounded-full border-2 border-white bg-white/95 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-md transition-transform group-hover:scale-105">
                    <span>View on Instagram</span>
                    <span>↗</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <span>{post.author_avatar || '🐰'}</span>
                      <span className="truncate max-w-[130px]">{post.author_handle}</span>
                    </span>
                    <span>{formatRelativeTime(post.timestamp)}</span>
                  </div>

                  <p className="font-sans text-xs font-medium text-foreground line-clamp-2 leading-snug">
                    {post.caption}
                  </p>
                </div>

                {/* Card Footer: Likes & Comments */}
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-foreground/20 text-[11px] font-mono font-bold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{post.likes.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>💬</span>
                    <span>{post.comments.toLocaleString()}</span>
                  </span>
                  <span className="text-primary group-hover:translate-x-0.5 transition-transform">
                    →
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
