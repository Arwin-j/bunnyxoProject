import React, { useEffect, useRef } from 'react';
import { HeartopiaEvent } from '../../types/event';
import { PlatformChip } from './PlatformChip';
import { formatDateTime, formatTimeOnly } from '../../utils/dateTime';
import { EventImage } from './EventImage';

interface EventDetailsModalProps {
  event: HeartopiaEvent | null;
  onClose: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!event) return;

    // Focus close button on mount
    closeButtonRef.current?.focus();

    // Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [event, onClose]);

  if (!event) return null;

  const hasImage = Boolean(event.image_url && event.image_url.trim());

  const renderDetailsBox = () => (
    <div className="space-y-3 rounded-2xl border-2 border-foreground/30 bg-muted/30 p-4 text-sm sm:text-base font-medium">
      <div className="flex items-start gap-2.5">
        <span className="text-xl" aria-hidden="true">📍</span>
        <div>
          <span className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
            Where it is happening
          </span>
          <span className="font-semibold text-foreground">{event.location}</span>
        </div>
      </div>

      <div className="flex items-start gap-2.5 border-t border-dashed border-foreground/20 pt-2.5">
        <span className="text-xl" aria-hidden="true">🕒</span>
        <div>
          <span className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
            Date & Time
          </span>
          <span className="font-semibold text-foreground">
            {formatDateTime(event.starts_at)} – {formatTimeOnly(event.ends_at)}
          </span>
        </div>
      </div>

      {event.prize && (
        <div className="flex items-start gap-2.5 border-t border-dashed border-foreground/20 pt-2.5">
          <span className="text-xl" aria-hidden="true">🎁</span>
          <div>
            <span className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              Prize
            </span>
            <span className="font-semibold text-foreground">{event.prize}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderDescription = () =>
    event.details ? (
      <div>
        <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
          Description
        </h4>
        <p className="mt-1 text-sm sm:text-base text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {event.details}
        </p>
      </div>
    ) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`sticker shadow-berry relative w-full ${
          hasImage ? 'max-w-lg sm:max-w-2xl' : 'max-w-lg'
        } rounded-[28px] border-[3px] border-foreground bg-card p-6 sm:p-7 text-left transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with Live badge & Close Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              ONGOING NOW
            </span>
            <PlatformChip platform={event.platform} />
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-foreground bg-background font-mono text-sm font-bold shadow-ink hover:bg-accent active:translate-y-0.5 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <h3
          id="event-modal-title"
          className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight"
        >
          {event.title}
        </h3>

        {/* Modal Body: Two-column with Image Area if image exists; otherwise original single-column */}
        {hasImage ? (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
            {/* Left Column: Info Box & Description */}
            <div className="space-y-4 min-w-0">
              {renderDetailsBox()}
              {renderDescription()}
            </div>

            {/* Right Column: Image Area */}
            <div className="w-full">
              <EventImage
                src={event.image_url}
                alt={event.title}
                layout="thumb"
                platform={event.platform}
                className="aspect-square w-full rounded-[24px] border-[3px] border-foreground shadow-sm"
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {renderDetailsBox()}
            {renderDescription()}
          </div>
        )}

        {/* Footer Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="sticker shadow-ink cursor-pointer rounded-full border-2 border-foreground bg-primary px-6 py-2 text-sm sm:text-base font-bold text-foreground hover:bg-accent active:translate-y-0.5 transition-all"
          >
            Got it! 🐾
          </button>
        </div>
      </div>
    </div>
  );
};



