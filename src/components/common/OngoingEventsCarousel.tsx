import React, { useState } from 'react';
import { HeartopiaEvent } from '../../types/event';
import { PlatformChip } from './PlatformChip';
import { formatTimeOnly } from '../../utils/dateTime';
import { EventDetailsModal } from './EventDetailsModal';

interface OngoingEventsCarouselProps {
  ongoingEvents: HeartopiaEvent[];
}

export const OngoingEventsCarousel: React.FC<OngoingEventsCarouselProps> = ({ ongoingEvents }) => {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<HeartopiaEvent | null>(null);

  if (!ongoingEvents || ongoingEvents.length === 0) {
    return null;
  }

  const total = ongoingEvents.length;
  const eventsPerPage = 2;
  const maxIndex = Math.max(0, total - eventsPerPage);

  const handlePrev = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  // Slice 2 events currently in view
  const visibleEvents =
    total <= eventsPerPage
      ? ongoingEvents
      : [ongoingEvents[startIndex], ongoingEvents[(startIndex + 1) % total]];

  return (
    <section className="mb-6 rounded-2xl border-2 border-primary/40 bg-accent/20 p-3.5 sm:p-4">
      {/* Header bar with Live pulse badge and carousel controls */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-100 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-900 shadow-xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            ONGOING ({total})
          </span>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            Click an event for full details
          </span>
        </div>

        {total > eventsPerPage && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted-foreground">
              {startIndex + 1}–{Math.min(startIndex + eventsPerPage, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous ongoing events"
                title="Previous"
                className="flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-foreground bg-card text-xs font-bold shadow-ink hover:bg-primary active:translate-y-0.5 transition-all"
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next ongoing events"
                title="Next"
                className="flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-foreground bg-card text-xs font-bold shadow-ink hover:bg-primary active:translate-y-0.5 transition-all"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Cards (showing two events per time) */}
      <div className={`grid gap-3 ${visibleEvents.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {visibleEvents.map((ev, idx) => (
          <div
            key={`${ev.id}-${idx}`}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedEvent(ev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedEvent(ev);
              }
            }}
            className="sticker shadow-ink group flex cursor-pointer flex-col justify-between rounded-xl border-[2.5px] border-foreground bg-card p-3 sm:p-3.5 transition-all hover:-translate-y-0.5 hover:bg-accent/40 active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <PlatformChip platform={ev.platform} className="text-xs px-2 py-0.5" />
                <span className="font-mono text-[11px] font-bold text-muted-foreground">
                  until {formatTimeOnly(ev.ends_at)}
                </span>
              </div>

              {/* Crucial Info: Name of the event */}
              <h3 className="text-base sm:text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors truncate" title={ev.title}>
                {ev.title}
              </h3>
            </div>

            {/* Crucial Info: Where it is happening */}
            <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-foreground/20 pt-2 text-xs sm:text-sm">
              <span className="flex items-center gap-1 font-semibold text-foreground/90 truncate max-w-[80%]" title={ev.location}>
                <span>📍</span>
                <span className="truncate">{ev.location}</span>
              </span>
              <span className="text-[11px] font-mono text-muted-foreground group-hover:underline">
                View ↗
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Modal Window within the website */}
      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
};
