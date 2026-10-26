import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useNow } from '../hooks/useNow';
import { SectionTitle } from '../components/common/SectionTitle';
import { EventTicket } from '../components/common/EventTicket';
import { PLATFORM_CONFIG } from '../types/event';
import { OngoingEventsCarousel } from '../components/common/OngoingEventsCarousel';

export const EventsPage: React.FC = () => {
  const { events, loading } = useEvents({ publishedOnly: true });
  const now = useNow();
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Filter ongoing/live events
  const ongoingEvents = events
    .filter((e) => {
      const s = new Date(e.starts_at).getTime();
      const end = new Date(e.ends_at).getTime();
      return s <= now && now <= end;
    })
    .sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());

  // Filter upcoming published events
  const upcomingEvents = events
    .filter((e) => new Date(e.starts_at).getTime() > now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const filteredUpcoming = upcomingEvents.filter((e) =>
    platformFilter === 'all' ? true : e.platform === platformFilter
  );

  const filterButtons = [
    { key: 'all', label: 'All' },
    ...Object.entries(PLATFORM_CONFIG).map(([key, meta]) => ({
      key,
      label: `${meta.emoji} ${meta.label}`,
    })),
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      {/* Ongoing Events Boxes (Above the Events tag) */}
      {!loading && ongoingEvents.length > 0 && (
        <OngoingEventsCarousel ongoingEvents={ongoingEvents} />
      )}

      {/* Events Heading and Filters */}
      <SectionTitle>Events 🎟️</SectionTitle>

      <div className="mb-5 flex flex-wrap gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            type="button"
            aria-pressed={platformFilter === btn.key}
            onClick={() => setPlatformFilter(btn.key)}
            className={`rounded-full border-[3px] px-3.5 py-0.5 text-sm sm:text-base font-semibold cursor-pointer transition-all active:translate-y-0.5 ${
              platformFilter === btn.key
                ? 'bg-accent shadow-ink border-foreground'
                : 'bg-card border-foreground/30 hover:border-foreground hover:bg-accent/40'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground font-mono">Loading events...</div>
      ) : filteredUpcoming.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredUpcoming.map((event, idx) => (
            <EventTicket
              key={event.id}
              event={event}
              now={now}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-8 text-center">No planned events 😴</p>
      )}
    </main>
  );
};
