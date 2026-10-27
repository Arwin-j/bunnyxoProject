import React from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useNow } from '../hooks/useNow';
import { CurrentEventBox } from '../components/common/CurrentEventBox';
import { SectionTitle } from '../components/common/SectionTitle';
import { EventTicket } from '../components/common/EventTicket';

export const HomePage: React.FC = () => {
  const { events, loading } = useEvents({ publishedOnly: true });
  const now = useNow();

  // Filter live and upcoming events
  const liveEvents = events
    .filter((e) => {
      const s = new Date(e.starts_at).getTime();
      const end = new Date(e.ends_at).getTime();
      return s <= now && now <= end;
    })
    .sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());

  const upcomingEvents = events
    .filter((e) => new Date(e.starts_at).getTime() > now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <section className="sticker shadow-berry rounded-[32px_40px_28px_44px] p-6 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Hello! Bunnies 🐰🌸</h1>
        <p className="mt-1 text-muted-foreground">
          Grab a warm drink — here's what's happening in our cozy little corner.
        </p>
      </section>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading cozy events...</div>
      ) : (
        <>
          <CurrentEventBox liveEvents={liveEvents} />

          <section>
            <div className="flex items-end justify-between gap-2">
              <SectionTitle>Upcoming Events 🎟️</SectionTitle>
              <Link
                to="/events"
                className="mb-4 font-semibold underline decoration-primary decoration-[3px] underline-offset-4 hover:opacity-80"
              >
                See all events →
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcomingEvents.slice(0, 4).map((event, idx) => (
                  <EventTicket
                    key={event.id}
                    event={event}
                    now={now}
                    index={idx}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4">No planned events 😴</p>
            )}
          </section>
        </>
      )}
    </main>
  );
};
