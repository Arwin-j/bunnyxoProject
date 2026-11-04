import React, { useState } from 'react';
import { useFeedPosts } from '../hooks/useFeedPosts';
import { FeedPostCard } from '../components/feed/FeedPostCard';

export const FeedPage: React.FC = () => {
  const { posts, isLoading, isLive, error, lastFetched, refreshFeed } = useFeedPosts();
  const [filterType, setFilterType] = useState<'ALL' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'IMAGE'>('ALL');
  const [showApiInfo, setShowApiInfo] = useState(false);

  // Filter all feed posts by selected media type
  const filteredPosts = posts.filter((post) => {
    if (filterType === 'ALL') return true;
    return post.media_type === filterType;
  });

  // Latest upload goes into Priority Feed (middle), and others into Feed
  const latestPost = filteredPosts[0] || null;
  const otherPosts = filteredPosts.slice(1);

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 py-6 space-y-8 antialiased selection:bg-[#b23a6b] selection:text-white">
      {/* 1. Top Header Banner (Shrunk horizontally, centered) */}
      <section
        className="card-v2"
        style={{
          background: 'linear-gradient(120deg, #fbd5e1, #f6c9b8)',
          borderRadius: '24px',
          border: '2px solid rgba(233, 179, 173, 0.6)',
          boxShadow: '0 6px 20px rgba(178, 58, 107, 0.1)',
          maxWidth: '780px',
          margin: '0 auto',
          width: '100%',
          padding: '18px 22px',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xl sm:text-4xl select-none" aria-hidden="true">
                📰
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#b23a6b] font-heading">
                Bunny Hub Feed
              </h1>
              <div className="flex items-center gap-1.5 rounded-full bg-[#f3ecda] px-3 py-0.5 text-xs font-bold text-[#6b4f35] shadow-xs select-none">
                <span
                  className={`size-2.5 rounded-full ${
                    isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{isLive ? 'Instagram Live' : isLoading ? 'Connecting…' : 'Instagram Feed'}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#6b4f35] font-sans max-w-xl">
              Live updates, giveaways, guides, and reels directly synced from{' '}
              <strong className="text-[#b23a6b]">@hey.bunnyxo</strong>.
            </p>
          </div>

          {/* Action Buttons */}
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

        {/* Filter Tabs */}
        <div className="mt-4 pt-3 border-t border-[#e9b3ad]/40 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#7a5638] font-sans">
            Filter by content type:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
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

        {/* Collapsible API Details */}
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
          </div>
        )}
      </section>

      {/* 2. Priority Feed Section: Latest Upload in the Middle */}
      {latestPost && (
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fbd5e1] px-3.5 py-1 text-xs font-bold text-[#b23a6b] shadow-xs">
              <span className="animate-pulse">✨</span>
              <span style={{ fontFamily: 'Fredoka, sans-serif' }}>Priority Feed</span>
            </div>
            <h2
              style={{
                margin: '4px 0 0',
                fontFamily: 'Lora, serif',
                fontSize: '24px',
                color: '#7a5638',
                fontWeight: 700,
              }}
            >
              Latest Upload
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                color: '#8c6f55',
              }}
            >
              Featured spotlight with real-time 24-hour lifespan countdown
            </p>
          </div>

          {/* Centered Latest Upload Card */}
          <div
            style={{
              maxWidth: '460px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <FeedPostCard post={latestPost} isPriority={true} />
          </div>
        </section>
      )}

      {/* 3. Feed Section: Others and Expired Ones */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9b3ad]/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">🌸</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#7a5638] font-serif flex items-center gap-2">
                <span>Feed</span>
                <span className="tag-v2">{otherPosts.length}</span>
              </h2>
              <p className="text-xs font-medium text-[#8c6f55] font-sans">
                Previous updates, community guides, and photo highlights
              </p>
            </div>
          </div>
        </div>

        {otherPosts.length === 0 ? (
          <div className="rounded-2xl bg-[#f3ecda] p-8 text-center text-[#6b4f35] space-y-2">
            <span className="text-3xl">🐰</span>
            <p className="text-sm font-semibold">No older posts in this filter category.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '20px',
            }}
          >
            {otherPosts.map((post) => (
              <FeedPostCard key={post.id} post={post} isPriority={false} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default FeedPage;
