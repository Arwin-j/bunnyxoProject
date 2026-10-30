import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useRedemptionCodes } from '../hooks/useRedemptionCodes';
import { useFeedPosts } from '../hooks/useFeedPosts';
import { useInteractivePins } from '../hooks/useInteractivePins';

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
    url: 'https://www.threads.net/@hey.bunnyxo',
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

const GAME_TABS = ['All', 'Heartopia', 'Petit Planet', 'Loftia'] as const;

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { events } = useEvents({ publishedOnly: true });
  const { activeCodes } = useRedemptionCodes();
  const { gridPosts } = useFeedPosts();
  const { pins } = useInteractivePins('heartopia', 'island');

  const [activeTab, setActiveTab] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic countdown for Petit Planet launch / Next big event
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    min: number;
    sec: number;
  }>({ days: 32, hours: 14, min: 28, sec: 45 });

  useEffect(() => {
    // Target Petit Planet launch date (Dec 15)
    const target = new Date('2026-12-15T00:00:00Z').getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const min = Math.floor((diff / (1000 * 60)) % 60);
      const sec = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, min, sec });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const username = currentUser?.email
    ? currentUser.email.split('@')[0]
    : 'Bunny Friend';

  // Collection stats
  const ownedPins = pins.filter((p) => p.owned);
  const totalPins = Math.max(pins.length, 34);
  const foundPins = ownedPins.length > 0 ? ownedPins.length : 16;
  const progressPercent = Math.min(100, Math.round((foundPins / totalPins) * 100));

  // Codes to display
  const displayCodes = activeCodes.slice(0, 2);

  // Next upcoming event
  const nowMs = Date.now();
  const nextEvent = events.find((e) => new Date(e.starts_at).getTime() > nowMs) || events[0];

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-5 antialiased selection:bg-[#b23a6b] selection:text-white">
      {/* 1. Hero Grid (1.6fr 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* Welcome Card */}
        <section
          className="card-v2 flex flex-col justify-between gap-3"
          style={{
            background: 'linear-gradient(120deg, #fbd5e1, #f6c9b8)',
          }}
        >
          {/* Game filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {GAME_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`tab-v2 ${activeTab === tab ? 'on' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-1 mt-1">
            <h1 className="font-heading font-semibold text-3xl sm:text-4xl text-[#b23a6b] leading-tight">
              Welcome back, {username}!
            </h1>
            <p className="text-sm sm:text-base text-[#6b4f35]">
              Your cozy corner for relaxing games, secret spots, giveaways, and fluffy friends 🐰🌸
            </p>
          </div>

          {/* Action buttons & Social links */}
          <div className="space-y-3 pt-1">
            <div className="flex gap-2.5 flex-wrap">
              <a
                href="https://discord.gg/bunnyxo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-v2 btn-v2-olive"
              >
                <span>💬</span>
                <span>Join Discord · 142 online</span>
              </a>
              <a
                href="https://www.instagram.com/hey.bunnyxo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-v2"
              >
                <span>📸</span>
                <span>Follow Instagram</span>
              </a>
            </div>

            {/* Subtle Social Media Row */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-heading font-semibold text-[#7a5638]/80 mr-1">
                Connect:
              </span>
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  title={item.name}
                  className="size-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="size-4 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Countdown Card (Dark Olive) */}
        <section
          className="card-v2 flex flex-col justify-between"
          style={{ background: '#6e7a3c', color: '#ffffff' }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="font-serif text-lg sm:text-xl text-white font-semibold m-0">
                Petit Planet · Launch Countdown
              </h2>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold font-sans text-white">
                Upcoming
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 my-3">
              <div className="tm-v2">
                {String(timeLeft.days).padStart(2, '0')}
                <small>days</small>
              </div>
              <div className="tm-v2">
                {String(timeLeft.hours).padStart(2, '0')}
                <small>hours</small>
              </div>
              <div className="tm-v2">
                {String(timeLeft.min).padStart(2, '0')}
                <small>min</small>
              </div>
              <div className="tm-v2">
                {String(timeLeft.sec).padStart(2, '0')}
                <small>sec</small>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/90 m-0 mt-2">
              Meet the community before launch day, claim pioneer rewards, and vote on starter plushies!
            </p>
          </div>

          <div className="pt-4">
            <Link to="/events" className="btn-v2 btn-v2-white w-full text-center">
              Join early
            </Link>
          </div>
        </section>
      </div>

      {/* 2. "This week at Bunny xo" Row */}
      <div>
        <h2 className="font-serif text-xl text-[#7a5638] font-bold mx-1 mb-2.5">
          This week at Bunny xo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Game update */}
          <Link
            to="/updates"
            className="wk-v2 transition-transform hover:-translate-y-0.5 text-inherit no-underline"
          >
            <div className="ic-v2 size-11 rounded-2xl bg-[#e9b3ad] flex items-center justify-center shrink-0 text-xl">
              🌸
            </div>
            <div className="min-w-0">
              <strong className="block text-sm font-heading text-[#7a5638] truncate">
                Game update
              </strong>
              <span className="text-xs text-[#8c6f55] truncate block">
                Spring Festival · Heartopia
              </span>
            </div>
          </Link>

          {/* 2. Giveaway */}
          <a
            href="https://www.instagram.com/hey.bunnyxo"
            target="_blank"
            rel="noopener noreferrer"
            className="wk-v2 transition-transform hover:-translate-y-0.5 text-inherit no-underline"
          >
            <div className="ic-v2 size-11 rounded-2xl bg-[#e9b3ad] flex items-center justify-center shrink-0 text-xl">
              🎁
            </div>
            <div className="min-w-0">
              <strong className="block text-sm font-heading text-[#7a5638] truncate">
                Giveaway
              </strong>
              <span className="text-xs text-[#8c6f55] truncate block">
                Star Coin Bundle · Ends Sunday
              </span>
            </div>
          </a>

          {/* 3. New code */}
          <Link
            to="/codes"
            className="wk-v2 transition-transform hover:-translate-y-0.5 text-inherit no-underline"
          >
            <div className="ic-v2 size-11 rounded-2xl bg-[#e9b3ad] flex items-center justify-center shrink-0 text-xl">
              ✨
            </div>
            <div className="min-w-0">
              <strong className="block text-sm font-heading text-[#7a5638] truncate">
                New code
              </strong>
              <span className="text-xs text-[#8c6f55] truncate block">
                {activeCodes[0]?.code ? `${activeCodes[0].code} · Free gifts` : 'BUNNY2026 · Claim'}
              </span>
            </div>
          </Link>

          {/* 4. Event */}
          <Link
            to="/events"
            className="wk-v2 transition-transform hover:-translate-y-0.5 text-inherit no-underline"
          >
            <div className="ic-v2 size-11 rounded-2xl bg-[#e9b3ad] flex items-center justify-center shrink-0 text-xl">
              🎫
            </div>
            <div className="min-w-0">
              <strong className="block text-sm font-heading text-[#7a5638] truncate">
                Event
              </strong>
              <span className="text-xs text-[#8c6f55] truncate block">
                {nextEvent ? nextEvent.title : 'Community Tea Party'}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Middle Grid (1.2fr 1fr 1fr) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] gap-4 items-start">
        {/* Latest Find */}
        <section className="card-v2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h2 className="font-serif text-lg text-[#7a5638] font-bold m-0 flex items-center gap-2">
                <span>Latest find</span>
                <span className="tag-v2">Heartopia</span>
              </h2>
              <Link to="/map" className="text-xs font-bold text-[#b23a6b] hover:underline">
                Explore map
              </Link>
            </div>

            {/* Find Image Container */}
            <div
              className="ph-v2 h-[200px] relative overflow-hidden bg-cover bg-center rounded-2xl border border-[#e9b3ad]/40"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(107, 79, 53, 0.75) 0%, transparent 60%), url('/heartopia-island-map.jpg')`,
              }}
            >
              <div className="absolute bottom-3 left-3 text-white">
                <span className="inline-block rounded-full bg-[#b23a6b] px-2.5 py-0.5 text-[11px] font-bold font-sans uppercase tracking-wider mb-1">
                  Secret Spot
                </span>
                <p className="font-heading font-semibold text-sm drop-shadow-sm m-0">
                  Hidden Whispering Grotto
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#6b4f35] mt-2.5 mb-2 font-sans">
              <strong>Crystal Cavern Waterfall</strong> · Tucked behind the eastern forest cliffside.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold text-[#b23a6b] hover:underline"
            >
              <span>View all finds on map</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Discord Feed */}
        <section className="card-v2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h2 className="font-serif text-lg text-[#7a5638] font-bold m-0">
                Discord feed
              </h2>
              <span className="text-[11px] font-bold text-[#6e7a3c] bg-[#d9e0b4] px-2 py-0.5 rounded-full">
                #announcements
              </span>
            </div>

            <div className="space-y-2">
              <div className="row-v2 flex-col items-start gap-1">
                <strong className="text-xs sm:text-sm font-heading text-[#7a5638]">
                  Spring Blossom Gala Announcement
                </strong>
                <span className="text-xs text-[#8c6f55]">
                  Join us this Friday for community photo sessions and star coin raffles!
                </span>
              </div>

              <div className="row-v2">
                <span className="text-xs sm:text-sm text-[#6b4f35] font-medium truncate">
                  Patch 1.2 Notes released
                </span>
                <span className="tag-v2 shrink-0">Heartopia</span>
              </div>

              <div className="row-v2">
                <span className="text-xs sm:text-sm text-[#6b4f35] font-medium truncate">
                  Sky Island housing preview
                </span>
                <span
                  className="tag-v2 shrink-0"
                  style={{ background: '#d9e0b4', color: '#6e7a3c' }}
                >
                  Loftia
                </span>
              </div>

              <div className="row-v2">
                <span className="text-xs sm:text-sm text-[#6b4f35] font-medium truncate">
                  Next community event
                </span>
                <span className="text-xs text-[#8c6f55] font-mono shrink-0">
                  Nov 2nd
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <a
              href="https://discord.gg/bunnyxo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-v2 btn-v2-olive w-full text-center"
            >
              Open Discord
            </a>
          </div>
        </section>

        {/* Codes & Bunny of the Day */}
        <section className="card-v2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h2 className="font-serif text-lg text-[#7a5638] font-bold m-0">
                Active Codes
              </h2>
              <Link to="/codes" className="text-xs font-bold text-[#b23a6b] hover:underline">
                See all ({activeCodes.length})
              </Link>
            </div>

            <div className="space-y-2 mb-4">
              {displayCodes.length > 0 ? (
                displayCodes.map((c) => {
                  const isCopied = copiedId === c.id;
                  return (
                    <div key={c.id} className="row-v2 py-1.5 px-3">
                      <div className="min-w-0">
                        <strong className="text-xs font-mono font-bold text-[#6b4f35] block truncate">
                          {c.code}
                        </strong>
                        <span className="text-[11px] text-[#8c6f55] block truncate">
                          {c.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.id, c.code)}
                        className={`btn-v2 text-xs py-1 px-3 min-h-[32px] shrink-0 ${
                          isCopied ? 'btn-v2-olive' : ''
                        }`}
                      >
                        {isCopied ? 'Copied! ✨' : 'Copy'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="row-v2 text-xs text-[#8c6f55]">
                  Check back soon for new codes!
                </div>
              )}
            </div>

            <h2 className="font-serif text-lg text-[#7a5638] font-bold m-0 mb-2">
              Bunny of the day
            </h2>
            <div className="flex items-center gap-3 bg-[#f9f4e6] p-3 rounded-2xl">
              <div className="size-14 rounded-full bg-[#fbd5e1] border-2 border-white flex items-center justify-center shrink-0 text-2xl shadow-xs">
                🐰
              </div>
              <p className="text-xs text-[#6b4f35] m-0 leading-relaxed">
                Feed the wild deer near Whispering Pines each morning to unlock secret friendship stamps!
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Bottom Grid (1fr 1fr 1.4fr) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr] gap-4 items-start">
        {/* Community Spotlight */}
        <section className="card-v2 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg text-[#7a5638] font-bold mb-2.5">
              Community spotlight
            </h2>
            <div
              className="ph-v2 h-[120px] rounded-2xl bg-cover bg-center flex items-end p-3 relative overflow-hidden"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, rgba(246, 201, 184, 0.9), rgba(233, 179, 173, 0.85))',
              }}
            >
              <span className="font-heading font-semibold text-xs text-[#6b4f35] bg-white/80 rounded-full px-2.5 py-0.5">
                🌸 Cozy Bakery Garden
              </span>
            </div>
            <p className="text-xs text-[#8c6f55] mt-2 mb-0">
              By <strong>@cozycottage</strong> ·{' '}
              <a
                href="https://discord.gg/bunnyxo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b23a6b] font-bold hover:underline"
              >
                Submit yours
              </a>
            </p>
          </div>
        </section>

        {/* Collection Tracker */}
        <section className="card-v2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h2 className="font-serif text-lg text-[#7a5638] font-bold m-0">
                Collection
              </h2>
              <span className="text-xs font-mono font-bold text-[#b23a6b]">
                {foundPins} of {totalPins} found
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3.5 w-full rounded-full bg-[#f9f4e6] overflow-hidden my-3 p-0.5 border border-[#e9b3ad]/30">
              <div
                className="h-full rounded-full bg-[#b23a6b] transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-[#6b4f35] mb-3">
              Newest discoverable item: <strong>Starry Cloud Lantern</strong>
            </p>
          </div>

          <div>
            <Link to="/map" className="btn-v2 btn-v2-olive w-full text-center">
              View collection
            </Link>
          </div>
        </section>

        {/* Recent on Instagram */}
        <section className="card-v2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h2 className="font-serif text-lg text-[#7a5638] font-bold m-0 flex items-center gap-1.5">
                <span>Recent on Instagram</span>
              </h2>
              <a
                href="https://www.instagram.com/hey.bunnyxo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-sans font-bold text-[#b23a6b] hover:underline"
              >
                @hey.bunnyxo ↗
              </a>
            </div>

            {/* 4-column thumbnail grid */}
            <div className="grid grid-cols-4 gap-2">
              {gridPosts.slice(0, 4).map((post, idx) => {
                const img = post.thumbnail_url || post.media_url;
                return (
                  <a
                    key={post.id || idx}
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={post.caption || 'Instagram Post'}
                    className="aspect-square rounded-xl overflow-hidden bg-[#e9b3ad]/40 relative group border border-[#e9b3ad]/50 hover:scale-105 transition-transform"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt="Instagram thumbnail"
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-heading font-bold text-[#b23a6b] text-sm bg-gradient-to-br from-[#fbd5e1] to-[#f6c9b8]">
                        🌸
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold transition-opacity">
                        ↗
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
