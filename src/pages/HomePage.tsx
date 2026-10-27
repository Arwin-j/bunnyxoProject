import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useNow } from '../hooks/useNow';
import { useRedemptionCodes } from '../hooks/useRedemptionCodes';
import { useFeedPosts } from '../hooks/useFeedPosts';
import { CurrentEventBox } from '../components/common/CurrentEventBox';
import { OngoingEventsCarousel } from '../components/common/OngoingEventsCarousel';
import { SectionTitle } from '../components/common/SectionTitle';
import { EventTicket } from '../components/common/EventTicket';
import islandMapUrl from '../assets/heartopia-island-map.jpg';

const DAILY_TASKS_KEY = 'hh.daily_tasks.v1';

interface DailyTask {
  id: string;
  label: string;
  icon: string;
}

const DEFAULT_DAILY_TASKS: DailyTask[] = [
  { id: 'task-greenhouse', label: 'Water botanical greenhouse tulips', icon: '🌸' },
  { id: 'task-fishing', label: 'Cast line for rare fish at Heart Beach', icon: '🎣' },
  { id: 'task-bakery', label: 'Grab a cozy pastry at the town bakery', icon: '🥐' },
  { id: 'task-codes', label: 'Claim active Heartopia gift codes', icon: '🎁' },
];

export const HomePage: React.FC = () => {
  const { events, loading } = useEvents({ publishedOnly: true });
  const { activeCodes } = useRedemptionCodes();
  const { featuredPost } = useFeedPosts();
  const now = useNow();

  // Copied code feedback state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Daily interactive checklist state
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(DAILY_TASKS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
    }
  };

  // Calculate live server daily reset countdown (00:00 UTC)
  const [resetCountdown, setResetCountdown] = useState<string>('');
  useEffect(() => {
    const updateReset = () => {
      const current = new Date();
      const nextReset = new Date();
      nextReset.setUTCHours(24, 0, 0, 0);
      const diff = Math.max(0, nextReset.getTime() - current.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setResetCountdown(`${hours}h ${mins}m`);
    };
    updateReset();
    const interval = setInterval(updateReset, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const nextUpcoming = upcomingEvents[0] || null;

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      {/* 1. Hero Welcome & Island Status Header */}
      <section className="sticker shadow-berry relative overflow-hidden rounded-[32px_40px_28px_44px] border-[3px] border-foreground bg-card p-6 sm:p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <img
            src="/bunny-logo.webp"
            alt="Bunny Squad Mascot"
            className="bob size-16 sm:size-20 object-contain select-none mb-2"
          />
          <h1 className="text-3xl font-semibold sm:text-4xl text-foreground">
            Hello! Bunnies 🐰🌸
          </h1>
          <p className="mt-1.5 max-w-lg text-sm sm:text-base text-muted-foreground font-medium">
            Grab a warm drink — here's everything happening in our cozy Heartopia corner.
          </p>

          {/* Island Status Pill Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-dashed border-foreground/20 font-mono text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground/30 bg-mint px-3 py-1 font-semibold text-foreground">
              <span>🕒</span>
              <span>Daily Reset: <strong>{resetCountdown || 'in ~10h'}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground/30 bg-butter px-3 py-1 font-semibold text-foreground">
              <span>🌦️</span>
              <span>Weather: <strong>Sunny & Breezy</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground/30 bg-accent/40 px-3 py-1 font-semibold text-foreground">
              <span>🌷</span>
              <span>Flower Bloom: <strong>+25%</strong></span>
            </span>
          </div>

          {/* Quick Jump Navigation Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <a
              href="#active-codes"
              className="rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs sm:text-sm font-semibold shadow-xs hover:bg-accent active:translate-y-0.5 transition-all"
            >
              🎁 {activeCodes.length} Active Codes
            </a>
            <a
              href="#live-events"
              className="rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs sm:text-sm font-semibold shadow-xs hover:bg-accent active:translate-y-0.5 transition-all"
            >
              🎟️ {liveEvents.length > 0 ? `${liveEvents.length} Live Now` : 'Events Schedule'}
            </a>
            <Link
              to="/map"
              className="rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs sm:text-sm font-semibold shadow-xs hover:bg-accent active:translate-y-0.5 transition-all"
            >
              🗺️ Island Map
            </Link>
            <Link
              to="/feed"
              className="rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs sm:text-sm font-semibold shadow-xs hover:bg-accent active:translate-y-0.5 transition-all"
            >
              📸 Feed & Guides
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Live & Ongoing Events Spotlight */}
      <section id="live-events" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>
            {liveEvents.length > 0 ? 'Live Right Now 🔴' : 'Island Events 🎟️'}
          </SectionTitle>
          <Link
            to="/events"
            className="mb-4 font-semibold text-sm sm:text-base underline decoration-primary decoration-[3px] underline-offset-4 hover:opacity-80"
          >
            See all events →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground font-mono animate-pulse">
            Loading cozy events… 🐾
          </div>
        ) : liveEvents.length > 0 ? (
          <div className="space-y-4">
            <CurrentEventBox liveEvents={liveEvents} />
            {liveEvents.length > 1 && (
              <OngoingEventsCarousel ongoingEvents={liveEvents} />
            )}
          </div>
        ) : nextUpcoming ? (
          <div className="rounded-[24px] border-[3px] border-foreground bg-card p-5 sm:p-6 shadow-ink">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 rounded-full border-2 border-foreground/30 bg-butter px-3 py-0.5 font-mono text-xs font-bold text-foreground">
                ⏳ UPCOMING NEXT
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Starts {new Date(nextUpcoming.starts_at).toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h3 className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
              {nextUpcoming.title}
            </h3>
            <p className="mt-1 text-sm text-foreground/80">{nextUpcoming.details}</p>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-dashed border-foreground/20 text-xs sm:text-sm">
              <span className="font-semibold text-foreground/90">📍 {nextUpcoming.location}</span>
              <Link
                to="/events"
                className="font-bold underline decoration-primary decoration-2 underline-offset-2 hover:opacity-80"
              >
                View calendar details ↗
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border-[3px] border-dashed border-foreground/30 bg-muted/40 p-5 text-center text-muted-foreground">
            No events scheduled right now. Check back soon for the next weekend gathering! 🌙
          </div>
        )}
      </section>

      {/* 3. Active Gift & Redemption Codes Widget (Top Requested Feature!) */}
      <section id="active-codes" className="sticker shadow-ink rounded-[28px] border-[3px] border-foreground bg-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-foreground/20 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <span>Active Gift Codes</span>
              <span className="text-xl select-none">🎁</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Redeem these working gift codes in Heartopia for free Wishing Stars, gold & decor!
            </p>
          </div>
          <Link
            to="/codes"
            className="rounded-full border-2 border-foreground bg-primary hover:bg-accent px-3 py-1 font-mono text-xs sm:text-sm font-bold shadow-xs active:translate-y-0.5 transition-all"
          >
            All Codes ({activeCodes.length}) →
          </Link>
        </div>

        {/* Quick Codes Grid (Top 3 active) */}
        <div className="grid gap-3 sm:grid-cols-3">
          {activeCodes.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border-2 border-foreground bg-background p-3.5 shadow-xs transition-all hover:bg-accent/20"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-sm sm:text-base font-bold text-foreground tracking-wide">
                    {item.code}
                  </span>
                  <span className="rounded-full bg-emerald-100 border border-emerald-400 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-foreground/80 line-clamp-2" title={item.rewards}>
                  {item.rewards}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-dashed border-foreground/20 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-muted-foreground truncate" title={item.expiry}>
                  Exp: {item.expiry}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(item.code)}
                  className={`cursor-pointer rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-bold shadow-xs active:translate-y-0.5 transition-all ${
                    copiedCode === item.code
                      ? 'bg-emerald-300 text-emerald-950 font-extrabold'
                      : 'bg-primary hover:bg-accent text-foreground'
                  }`}
                >
                  {copiedCode === item.code ? 'Copied! ✨' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Explore Heartopia Feature Cards (Stickers Grid) */}
      <section className="space-y-4">
        <SectionTitle>Explore Bunny Hub 🌷</SectionTitle>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Tile A: Interactive Island Map */}
          <Link
            to="/map"
            className="sticker shadow-ink group flex flex-col justify-between rounded-[24px] border-[3px] border-foreground bg-card p-4 sm:p-5 transition-all hover:-translate-y-1 hover:bg-accent/30"
          >
            <div>
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl border-2 border-foreground bg-muted">
                <img
                  src={islandMapUrl}
                  alt="Heartopia Island Map Preview"
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent flex items-end p-2">
                  <span className="rounded-full bg-card/90 border border-foreground px-2 py-0.5 text-[10px] font-bold font-mono">
                    📍 Interactive Map
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                Heartopia Island Map
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                Explore Blossom Meadow, Heart Beach, and drop custom pins on secret fishing & gathering spots.
              </p>
            </div>
            <div className="mt-3 flex items-center font-mono text-xs font-bold text-foreground group-hover:underline">
              <span>Open Map Explorer ↗</span>
            </div>
          </Link>

          {/* Tile B: Community Feed & 24H Spotlight */}
          <Link
            to="/feed"
            className="sticker shadow-berry group flex flex-col justify-between rounded-[24px] border-[3px] border-foreground bg-card p-4 sm:p-5 transition-all hover:-translate-y-1 hover:bg-accent/30"
          >
            <div>
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl border-2 border-foreground bg-mint flex items-center justify-center p-3 text-center">
                <div className="space-y-1">
                  <span className="text-2xl select-none">📸</span>
                  <div className="rounded-full bg-card border border-foreground px-2.5 py-0.5 text-[10px] font-bold font-mono text-foreground">
                    24H Daily Spotlight
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                Community Feed & Guides
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {featuredPost?.caption || 'Daily showcase of cozy room tours, bakery recipes, fashion styling & tips.'}
              </p>
            </div>
            <div className="mt-3 flex items-center font-mono text-xs font-bold text-foreground group-hover:underline">
              <span>Watch Spotlight ↗</span>
            </div>
          </Link>

          {/* Tile C: Game Updates & Patch Notes */}
          <Link
            to="/updates"
            className="sticker shadow-mint group flex flex-col justify-between rounded-[24px] border-[3px] border-foreground bg-card p-4 sm:p-5 transition-all hover:-translate-y-1 hover:bg-accent/30"
          >
            <div>
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl border-2 border-foreground bg-butter flex items-center justify-center p-3 text-center">
                <div className="space-y-1">
                  <span className="text-2xl select-none">📣</span>
                  <div className="rounded-full bg-card border border-foreground px-2.5 py-0.5 text-[10px] font-bold font-mono text-foreground">
                    Patch Notes & News
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                Updates & Notices
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                Spring Tulip Festival is live! Check out new furniture craftables, flower mutation guide & events.
              </p>
            </div>
            <div className="mt-3 flex items-center font-mono text-xs font-bold text-foreground group-hover:underline">
              <span>Read Updates ↗</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Upcoming Community Events Calendar Preview */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-2">
          <SectionTitle>Upcoming Events 🎟️</SectionTitle>
          <Link
            to="/events"
            className="mb-4 font-semibold text-sm sm:text-base underline decoration-primary decoration-[3px] underline-offset-4 hover:opacity-80"
          >
            See all events ({upcomingEvents.length}) →
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
          <div className="rounded-[24px] border-2 border-dashed border-foreground/30 bg-muted/30 p-6 text-center text-muted-foreground">
            No upcoming events planned at this moment. Check back soon! 😴
          </div>
        )}
      </section>

      {/* 6. Daily Island Routine Checklist & Cozy Bunny Tip */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* Daily Routine Checklist */}
        <div className="rounded-[28px] border-[3px] border-foreground bg-card p-5 sm:p-6 shadow-ink space-y-3">
          <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/20 pb-2.5">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
              <span>Daily Island Routine</span>
              <span>✅</span>
            </h3>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {Object.values(completedTasks).filter(Boolean).length} / {DEFAULT_DAILY_TASKS.length} done
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {DEFAULT_DAILY_TASKS.map((task) => {
              const isDone = Boolean(completedTasks[task.id]);
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center justify-between gap-2 rounded-xl border-2 border-foreground p-2.5 text-left transition-all cursor-pointer ${
                    isDone
                      ? 'bg-mint/40 line-through opacity-75'
                      : 'bg-background hover:bg-accent/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base select-none">{task.icon}</span>
                    <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                      {task.label}
                    </span>
                  </div>
                  <span className={`flex size-5 items-center justify-center rounded-full border-2 border-foreground text-xs font-bold ${
                    isDone ? 'bg-emerald-400 text-emerald-950' : 'bg-background'
                  }`}>
                    {isDone ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cozy Bunny Tip Card */}
        <div className="rounded-[28px] border-[3px] border-foreground bg-[#fff1f2] p-5 sm:p-6 shadow-berry flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl select-none">🐰💡</span>
              <h3 className="text-lg font-bold text-foreground">Bunny's Cozy Tip</h3>
            </div>
            <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-medium">
              "Did you know? Fishing around the Heart Beach lighthouse during rainy weather boosts the bite rate for rare <strong className="text-foreground">Rainbow Trout & Golden Starfish</strong> by 40%! Don't forget your raincoat! 🌧️🎣✨"
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-rose-300 flex items-center justify-between text-xs font-mono font-bold text-rose-800">
            <span>Have a cozy day in Heartopia!</span>
            <span className="bob text-base select-none">🐾</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
