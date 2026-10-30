import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useNow } from '../hooks/useNow';
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
    <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-6 antialiased selection:bg-[#b23a6b] selection:text-white">
      {/* 1. Header Banner */}
      <section
        className="card-v2 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(120deg, #fbd5e1, #f6c9b8)',
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-3xl select-none" aria-hidden="true">🎟️</span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#b23a6b]">
              Community Events
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6b4f35] font-sans max-w-xl">
            Live gatherings, seasonal festivals, cozy café showcases, and multiplayer game nights!
          </p>
        </div>

        {/* Quick event stats pill */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#f3ecda] px-3.5 py-1 text-xs sm:text-sm font-bold text-[#6b4f35] shadow-xs">
            🌸 {upcomingEvents.length} Upcoming
          </span>
          {ongoingEvents.length > 0 && (
            <span className="rounded-full bg-[#6e7a3c] px-3.5 py-1 text-xs sm:text-sm font-bold text-white shadow-xs animate-pulse">
              ● {ongoingEvents.length} Live Now
            </span>
          )}
        </div>
      </section>

      {/* Ongoing Events Carousel */}
      {!loading && ongoingEvents.length > 0 && (
        <OngoingEventsCarousel ongoingEvents={ongoingEvents} />
      )}

      {/* Events Heading and Platform Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl text-[#7a5638] font-bold m-0">
            Upcoming Events Schedule
          </h2>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                aria-pressed={platformFilter === btn.key}
                onClick={() => setPlatformFilter(btn.key)}
                className={`tab-v2 text-xs sm:text-sm py-1.5 px-3.5 min-h-[34px] ${
                  platformFilter === btn.key ? 'on' : ''
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#8c6f55] font-mono">
            Loading cozy events… 🌸
          </div>
        ) : filteredUpcoming.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="card-v2 p-8 text-center text-[#8c6f55]">
            <span className="text-3xl block mb-2">😴</span>
            <p className="font-heading font-medium text-base text-[#6b4f35]">
              No planned events in this category right now
            </p>
            <p className="text-xs text-[#8c6f55] mt-1">
              Check back soon or join our Discord to suggest a community meetup!
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default EventsPage;
