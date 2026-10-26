import React, { useState } from 'react';
import { EventPlatform, PLATFORM_CONFIG } from '../../types/event';
import { cn } from '../../utils/cn';

export interface EventImageProps {
  src?: string | null;
  alt: string;
  layout?: 'banner' | 'thumb';
  platform?: EventPlatform;
  className?: string;
}

export const EventImage: React.FC<EventImageProps> = ({
  src,
  alt,
  layout = 'thumb',
  platform,
  className = '',
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  const isBanner = layout === 'banner';
  const showPlaceholder = !src || hasError;

  const platformMeta = platform ? PLATFORM_CONFIG[platform] : undefined;
  const placeholderEmoji = platformMeta ? platformMeta.emoji : '🐰';
  const placeholderBg = platformMeta ? platformMeta.bgClass : 'bg-muted';

  return (
    <div
      className={cn(
        'media-box relative w-full overflow-hidden rounded-xl border-2 border-foreground bg-card shadow-xs select-none',
        isBanner ? 'aspect-video max-h-[160px]' : 'aspect-square',
        className
      )}
    >
      {showPlaceholder ? (
        <div
          className={`flex h-full w-full flex-col items-center justify-center p-2 text-center transition-colors ${placeholderBg}/30`}
          aria-label={alt}
        >
          <span className="text-2xl sm:text-3xl" aria-hidden="true">
            {placeholderEmoji}
          </span>
          <span className="mt-1 font-mono text-[10px] font-bold text-foreground/60 uppercase tracking-wider truncate max-w-full px-1">
            {platformMeta ? platformMeta.label : 'Event'}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={isBanner ? 1600 : 800}
          height={isBanner ? 900 : 800}
          onError={() => setHasError(true)}
          className="block h-full w-full max-w-full object-cover"
        />
      )}
    </div>
  );
};
