import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useNow } from '../hooks/useNow';
import { useRedemptionCodes } from '../hooks/useRedemptionCodes';
import { CurrentEventBox } from '../components/common/CurrentEventBox';
import { SectionTitle } from '../components/common/SectionTitle';
import { EventTicket } from '../components/common/EventTicket';

import instagramIcon from '../assets/social/instagram.svg';
import youtubeIcon from '../assets/social/youtube.svg';
import threadsIcon from '../assets/social/threads.svg';
import tiktokIcon from '../assets/social/tiktok.svg';
import pinterestIcon from '../assets/social/pinterest.svg';
import facebookIcon from '../assets/social/facebook.svg';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/hey.bunnyxo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D',
    icon: instagramIcon,
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@hey.bunnyxo',
    icon: youtubeIcon,
  },
  {
    name: 'Threads',
    url: 'https://www.threads.com/@hey.bunnyxo',
    icon: threadsIcon,
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@hey.bunny.xo?is_from_webapp=1&sender_device=pc',
    icon: tiktokIcon,
  },
  {
    name: 'Pinterest',
    url: 'https://in.pinterest.com/heybunnyx0/?invite_code=f37e124d3ff04a5c995a12d733ba2924&sender=1118792869839438298',
    icon: pinterestIcon,
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/hey.bunnyX0/?rdid=T0DxngwsD1AEFmIF',
    icon: facebookIcon,
  },
];

export const HomePage: React.FC = () => {
  const { events, loading } = useEvents({ publishedOnly: true });
  const { activeCodes } = useRedemptionCodes();
  const now = useNow();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = async (id: string, code: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 1800);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

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

        {/* Social Media Links */}
        <div className="welcome-social-row">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              title={item.name}
              className="welcome-social-btn"
            >
              <img
                src={item.icon}
                alt={item.name}
                className="welcome-social-img"
              />
            </a>
          ))}
        </div>
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

          {/* Active Redemption Codes (Long Pill Boxes) */}
          <section className="space-y-4 pt-2">
            <div className="flex items-end justify-between gap-2">
              <SectionTitle>Active Codes 🎁</SectionTitle>
              <Link
                to="/codes"
                className="mb-4 font-semibold underline decoration-primary decoration-[3px] underline-offset-4 hover:opacity-80"
              >
                See all codes →
              </Link>
            </div>

            {activeCodes.length > 0 ? (
              <div className="space-y-3">
                {activeCodes.map((item) => {
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCopyCode(item.id, item.code)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCopyCode(item.id, item.code);
                        }
                      }}
                      title="Click to copy code"
                      className={`home-code-pill ${isCopied ? 'home-code-pill-copied' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl sm:text-2xl select-none shrink-0" aria-hidden="true">
                          🎁
                        </span>
                        <span className="font-sans font-bold text-sm sm:text-base text-foreground truncate">
                          {item.title}
                        </span>
                      </div>

                      <span
                        className={`font-mono text-xs sm:text-sm font-bold tracking-wider shrink-0 transition-colors ${
                          isCopied ? 'text-emerald-800 font-extrabold' : 'text-muted-foreground'
                        }`}
                      >
                        {isCopied ? 'Copied! ✨' : item.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">No active codes right now 😴</p>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default HomePage;
