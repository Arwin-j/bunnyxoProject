import React from 'react';
import { HeartopiaEvent } from '../../types/event';
import { PlatformChip } from './PlatformChip';
import { formatDateTime, formatRelativeTime } from '../../utils/dateTime';
import { EventImage } from './EventImage';

export interface EventCardProps {
  event: HeartopiaEvent;
  now?: number;
  index?: number;
  imageLayout?: 'banner' | 'thumb';
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  now = Date.now(),
  index = 0,
  imageLayout = 'thumb',
  className = '',
}) => {
  const rotationClass = index % 2 === 1 ? 'rotate-[0.8deg]' : '-rotate-[0.8deg]';
  const isBanner = imageLayout === 'banner';

  if (isBanner) {
    return (
      <article
        className={`event-card sticker ticket-notch shadow-mint min-w-0 rounded-[20px] py-3.5 pl-7 pr-4 transition-transform hover:scale-[1.01] ${rotationClass} ${className}`}
      >
        {/* Banner layout: Media box at top, 16:9, full card width, max-height 160px */}
        <div className="mb-3 w-full">
          <EventImage
            src={event.image_url}
            alt={event.title}
            layout="banner"
            platform={event.platform}
          />
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
          <PlatformChip platform={event.platform} />
        </div>

        <p className="mt-1 text-sm">
          🕒 {formatDateTime(event.starts_at)}{' '}
          <span className="text-muted-foreground">· {formatRelativeTime(event.starts_at, now)}</span>
        </p>

        <p className="text-sm">📍 {event.location}</p>

        {event.prize && <p className="text-sm">🎁 {event.prize}</p>}
      </article>
    );
  }

  // Thumb layout: Two-column layout with container query
  return (
    <article
      className={`event-card sticker ticket-notch shadow-mint min-w-0 rounded-[20px] py-3.5 pl-7 pr-4 transition-transform hover:scale-[1.01] ${rotationClass} ${className}`}
    >
      <div className="event-card-thumb-layout">
        {/* Text column: minmax(0, 1fr) */}
        <div className="min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
            <PlatformChip platform={event.platform} />
          </div>

          <p className="mt-1 text-sm">
            🕒 {formatDateTime(event.starts_at)}{' '}
            <span className="text-muted-foreground block sm:inline">
              · {formatRelativeTime(event.starts_at, now)}
            </span>
          </p>

          <p className="text-sm truncate">📍 {event.location}</p>

          {event.prize && <p className="text-sm truncate">🎁 {event.prize}</p>}
        </div>

        {/* Image column: clamp(72px, 28%, 120px) wide with 1:1 aspect ratio */}
        <div className="event-card-thumb-media shrink-0">
          <EventImage
            src={event.image_url}
            alt={event.title}
            layout="thumb"
            platform={event.platform}
          />
        </div>
      </div>
    </article>
  );
};

// Re-export as EventTicket for backwards compatibility
export const EventTicket = EventCard;
export default EventCard;
