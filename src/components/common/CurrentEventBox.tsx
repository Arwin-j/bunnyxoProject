import React, { useState } from 'react';
import { HeartopiaEvent } from '../../types/event';
import { PlatformChip } from './PlatformChip';
import { formatDateTime, formatTimeOnly } from '../../utils/dateTime';
import { EventDetailsModal } from './EventDetailsModal';
import { EventImage } from './EventImage';

interface CurrentEventBoxProps {
  liveEvents: HeartopiaEvent[];
}

export const CurrentEventBox: React.FC<CurrentEventBoxProps> = ({ liveEvents }) => {
  const [selectedEvent, setSelectedEvent] = useState<HeartopiaEvent | null>(null);
  const [current, ...otherLive] = liveEvents;

  if (!current) {
    return (
      <div className="rounded-[24px] border-[3px] border-dashed bg-muted p-5 text-center text-muted-foreground">
        No event right now, check back soon 🌙
      </div>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setSelectedEvent(current)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedEvent(current);
          }
        }}
        className="event-card sticker min-w-0 rounded-[24px] p-5 shadow-[4px_4px_0_var(--butter)] cursor-pointer hover:bg-accent/20 transition-all active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="event-card-thumb-layout">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-xl font-semibold leading-tight">
                <span className="text-muted-foreground">Current Event:</span> {current.title}{' '}
                <span className="font-normal text-sm sm:text-base">until {formatDateTime(current.ends_at)}</span>
              </h2>
              <PlatformChip platform={current.platform} />
            </div>

            <p className="mt-2 text-foreground/90">{current.details}</p>

            <p className="mt-2 text-sm">
              🕒 {formatTimeOnly(current.starts_at)} – {formatTimeOnly(current.ends_at)} · 📍 {current.location}
            </p>

            {current.prize && (
              <p className="mt-1 text-sm font-medium">🎁 Prize: {current.prize}</p>
            )}
          </div>

          <div className="event-card-thumb-media shrink-0">
            <EventImage
              src={current.image_url}
              alt={current.title}
              layout="thumb"
              platform={current.platform}
            />
          </div>
        </div>

        {otherLive.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-primary/40">
            <span className="text-sm text-muted-foreground">Also live:</span>
            {otherLive.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={(evt) => {
                  evt.stopPropagation();
                  setSelectedEvent(e);
                }}
                className="rounded-full border-2 border-foreground/40 bg-mint px-3 py-0.5 text-xs sm:text-sm font-semibold hover:bg-mint/80 cursor-pointer transition-all active:translate-y-0.5"
              >
                {e.title} ↗
              </button>
            ))}
          </div>
        )}
      </div>

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
};

