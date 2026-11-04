import React, { useState, useRef } from 'react';
import { FeedPost } from '../../hooks/useFeedPosts';
import { useCountdown } from '../../hooks/useCountdown';

// Helper to format ISO date to readable relative time matching "8 hr ago"
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins <= 1) return 'Just now';
    return `${diffMins} min ago`;
  }
  if (diffHours === 1) return '1 hr ago';
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export interface FeedPostCardProps {
  post: FeedPost;
  isPriority?: boolean;
  boxLabel?: string;
  className?: string;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  isPriority = false,
  boxLabel,
  className = '',
}) => {
  const { formatted, isExpired } = useCountdown(post.timestamp, 24);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleCardClick = () => {
    if (post.permalink) {
      window.open(post.permalink, '_blank', 'noopener,noreferrer');
    }
  };

  // Format hashtags text for the enclosed hashtag rectangle
  const hashtagsText =
    post.tags && post.tags.length > 0
      ? post.tags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(' ')
      : 'Hashtags';

  const authorHandle = post.author_handle
    ? post.author_handle.startsWith('@')
      ? post.author_handle
      : `@${post.author_handle}`
    : '@Username';

  const relativeTime = formatRelativeTime(post.timestamp);
  const hasMedia = Boolean(post.media_url || post.thumbnail_url);
  const innerLabel = boxLabel || (isPriority ? 'Priority Feed' : 'Feed');

  return (
    <article
      onClick={handleCardClick}
      title={post.caption ? `${post.caption}\n\n(Click to view on Instagram)` : 'Click to view on Instagram'}
      className={`relative flex flex-col justify-between w-full cursor-pointer select-none transition-transform duration-150 hover:-translate-y-1 ${className}`}
      style={{
        backgroundColor: '#d9d9d9',
        border: '4px solid #000000',
        borderRadius: '0px',
        padding: '18px',
        boxSizing: 'border-box',
        boxShadow: 'none',
      }}
    >
      {/* 1. Inner Media / Feed Box with thick black border and sharp corners */}
      <div
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{
          aspectRatio: '3/4',
          border: '4px solid #000000',
          borderRadius: '0px',
          backgroundColor: '#d9d9d9',
        }}
      >
        {post.media_type === 'VIDEO' && post.media_url ? (
          <>
            <video
              ref={videoRef}
              src={post.media_url}
              poster={post.thumbnail_url}
              className="w-full h-full object-cover block"
              loop
              muted={isMuted}
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {/* Wireframe styled video controls */}
            <div
              className="absolute bottom-2 right-2 flex items-center gap-1.5 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="w-7 h-7 bg-white text-black border-2 border-black flex items-center justify-center text-xs font-bold hover:bg-neutral-200 transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                className="w-7 h-7 bg-white text-black border-2 border-black flex items-center justify-center text-xs font-bold hover:bg-neutral-200 transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </>
        ) : hasMedia ? (
          <img
            src={post.thumbnail_url || post.media_url}
            alt={post.caption || 'Feed post'}
            className="w-full h-full object-cover block"
            loading="lazy"
          />
        ) : null}

        {/* Center label (Priority Feed) matching template */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
            isPlaying ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ zIndex: 10 }}
        >
          <span
            className={`font-sans text-2xl sm:text-3xl text-black font-normal tracking-wide text-center px-4 py-1.5 ${
              hasMedia ? 'bg-[#d9d9d9]/90 border-2 border-black backdrop-blur-xs shadow-xs' : ''
            }`}
          >
            {innerLabel}
          </span>
        </div>
      </div>

      {/* 2. Row 1: @Username (left) and Relative Time (right) */}
      <div
        className="flex items-center justify-between mt-3.5 text-black font-sans"
        style={{ fontSize: '15px', lineHeight: '1.2' }}
      >
        <span className="font-normal truncate max-w-[65%]">
          {authorHandle}
        </span>
        <span className="font-normal shrink-0">
          {relativeTime}
        </span>
      </div>

      {/* 3. Row 2: Enclosed box with Hashtags centered */}
      <div
        className="mt-3 flex items-center justify-center text-center overflow-hidden"
        style={{
          border: '2px solid #000000',
          borderRadius: '0px',
          backgroundColor: '#d9d9d9',
          padding: '6px 10px',
          minHeight: '34px',
        }}
        title={hashtagsText}
      >
        <span className="font-sans text-sm text-black font-normal truncate block w-full">
          {hashtagsText}
        </span>
      </div>

      {/* 4. Row 3: Lifespan timer right-aligned at the bottom */}
      <div
        className="mt-3 flex items-center justify-end font-sans text-black"
        style={{ fontSize: '14px', lineHeight: '1.2', minHeight: '22px' }}
      >
        <span className="font-normal">
          {!isExpired ? `Lifespan timer: ${formatted}` : 'Lifespan timer'}
        </span>
      </div>
    </article>
  );
};

export default FeedPostCard;
