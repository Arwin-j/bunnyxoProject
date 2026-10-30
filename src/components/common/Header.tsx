import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useGame, GAME_OPTIONS } from '../../hooks/useGame';
import { useDiscordPresence } from '../../hooks/useDiscordPresence';

const NAV_LINKS = [
  { to: '/events', label: 'Collection' },
  { to: '/map', label: 'Map' },
  { to: '/updates', label: 'Games' },
  { to: '/codes', label: 'Codes' },
  { to: '/feed', label: 'Feed' },
  { to: '/about', label: 'About us' },
];

const DISCORD_LINK = 'https://discord.gg/9CNHMrX6A';
const INSTAGRAM_LINK =
  'https://www.instagram.com/hey.bunnyxo?utm_source=ig_web_button_share_sheet&mdxt=ZDNlZDc0MzIxNw==';

export const Header: React.FC = () => {
  const location = useLocation();
  const { selectedGame, setSelectedGame } = useGame();
  const { onlineCount: discordOnline } = useDiscordPresence();

  // Dropdown state for game selector
  const [gameDropdownOpen, setGameDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close game dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setGameDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Universal UTC Countdown for Petit Planet (December 4, 2026 00:00:00 UTC)
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    min: number;
    sec: number;
  }>({ days: 0, hours: 0, min: 0, sec: 0 });

  useEffect(() => {
    const targetUTC = new Date('2026-12-04T00:00:00Z').getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, targetUTC - now);
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

  const isCodesActive =
    location.pathname.startsWith('/codes') ||
    location.pathname.startsWith('/redemption-codes');

  const selectedGameIcon =
    GAME_OPTIONS.find((g) => g.name === selectedGame)?.icon || '🌸';

  return (
    <header
      style={{
        padding: '16px 24px 0',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Green Navigation Bar */}
      <nav
        className="top"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          background: '#a9ad73',
          borderRadius: '26px',
          padding: '10px 18px',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Circular Dashed Logo - Navigates to Home on click */}
        <Link
          to="/home"
          aria-label="Bunny xo Home"
          title="Home"
          className="logo"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fbd5e1',
            border: '3px dashed #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
        >
          <img
            src="/bunny-logo.webp"
            alt="Bunny Logo"
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'contain',
              userSelect: 'none',
              display: 'block',
            }}
          />
        </Link>

        {/* Navigation Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {NAV_LINKS.map((link) => {
            const isActive =
              link.to === '/codes'
                ? isCodesActive
                : link.to === '/events'
                ? location.pathname.startsWith('/events') || location.pathname.startsWith('/collection')
                : link.to === '/updates'
                ? location.pathname.startsWith('/updates') || location.pathname.startsWith('/games')
                : location.pathname.startsWith(link.to);

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`nv ${isActive ? 'on active' : ''}`}
                style={{
                  background: isActive ? '#b23a6b' : '#f3ecda',
                  color: isActive ? '#ffffff' : '#b23a6b',
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  borderRadius: '999px',
                  padding: '9px 16px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  border: 0,
                  cursor: 'pointer',
                }}
              >
                {link.label}
              </NavLink>
            );
          })}
        </div>

        {/* Spacer on right */}
        <div style={{ flex: 1 }} />
      </nav>

      {/* Persistent Two Cards: Welcome back Bunny + Live Petit Planet Update */}
      <div className="v2-hero-grid" style={{ marginTop: '16px', marginBottom: '20px' }}>
        {/* Left Card: Welcome Card with Game Dropdown & Discord Widget */}
        <section
          className="card"
          style={{
            background: 'linear-gradient(120deg, #fbd5e1, #f6c9b8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderRadius: '24px',
            padding: '18px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Game Selector Dropdown Menu */}
          <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setGameDropdownOpen(!gameDropdownOpen)}
              className="tab"
              aria-haspopup="true"
              aria-expanded={gameDropdownOpen}
              style={{
                border: '2px solid #fbd5e1',
                borderRadius: '999px',
                padding: '8px 18px',
                fontFamily: 'Fredoka, sans-serif',
                fontWeight: 600,
                fontSize: '15px',
                minHeight: '40px',
                background: '#fff3f0',
                color: '#b23a6b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 8px rgba(178, 58, 107, 0.08)',
              }}
            >
              <span>{selectedGameIcon}</span>
              <span>{selectedGame}</span>
              <span
                style={{
                  fontSize: '10px',
                  transition: 'transform 0.15s ease',
                  transform: gameDropdownOpen ? 'rotate(180deg)' : 'none',
                }}
              >
                ▼
              </span>
            </button>

            {/* Dropdown Menu Options */}
            {gameDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  background: '#fff3f0',
                  borderRadius: '18px',
                  border: '2px solid #fbd5e1',
                  boxShadow: '0 10px 25px rgba(107, 79, 53, 0.15)',
                  zIndex: 60,
                  padding: '6px',
                  minWidth: '190px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {GAME_OPTIONS.map((g) => {
                  const isSelected = selectedGame === g.name;
                  return (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => {
                        setSelectedGame(g.name);
                        setGameDropdownOpen(false);
                      }}
                      style={{
                        background: isSelected ? '#b23a6b' : 'transparent',
                        color: isSelected ? '#ffffff' : '#6b4f35',
                        border: 0,
                        borderRadius: '12px',
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontFamily: 'Fredoka, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.12s ease',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      <span>{g.icon}</span>
                      <span>{g.name}</span>
                      {isSelected && (
                        <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 'bold' }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <h1
            style={{
              margin: '4px 0 0',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '38px',
              color: '#b23a6b',
              lineHeight: 1.15,
            }}
          >
            Welcome Back, Bunny!
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              color: '#6b4f35',
            }}
          >
            Your cozy corner for relaxing games, secret spots, giveaways, and fluffy friends 🐰🌸
          </p>

          {/* Action Buttons: Join Discord (with embedded Widget) & Instagram */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginTop: '6px',
              position: 'relative',
            }}
          >
            {/* Join Discord Button with Live Active Members from Discord widget.json */}
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn g"
              style={{
                background: '#6e7a3c',
                color: '#fff',
                border: 0,
                borderRadius: '999px',
                padding: '8px 18px',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '13px',
                minHeight: '38px',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(110, 122, 60, 0.2)',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  display: 'inline-block',
                  boxShadow: '0 0 8px rgba(74, 222, 128, 0.8)',
                }}
              />
              <span>
                Join Discord · {discordOnline !== null ? `${discordOnline} online` : 'Online now'}
              </span>
            </a>

            {/* Instagram Link Button */}
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: '#b23a6b',
                color: '#fff',
                border: 0,
                borderRadius: '999px',
                padding: '8px 18px',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '13px',
                minHeight: '38px',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Follow Instagram
            </a>
          </div>
        </section>

        {/* Right Card: Countdown Card for December 4th Universal UTC Launch */}
        <section
          className="card"
          style={{
            background: '#6e7a3c',
            color: '#fff',
            borderRadius: '24px',
            padding: '18px',
            boxSizing: 'border-box',
          }}
        >
          <h2
            style={{
              color: '#fff',
              margin: '0 0 10px',
              fontFamily: 'Lora, serif',
              fontSize: '19px',
            }}
          >
            Petit Planet · December 4th
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
            }}
          >
            <div
              className="tm"
              style={{
                background: '#f3ecda',
                color: '#b23a6b',
                borderRadius: '16px',
                padding: '10px 0',
                textAlign: 'center',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '28px',
                lineHeight: 1,
              }}
            >
              {String(timeLeft.days).padStart(2, '0')}
              <small
                style={{
                  display: 'block',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '11px',
                  color: '#6b4f35',
                  marginTop: '4px',
                }}
              >
                days
              </small>
            </div>
            <div
              className="tm"
              style={{
                background: '#f3ecda',
                color: '#b23a6b',
                borderRadius: '16px',
                padding: '10px 0',
                textAlign: 'center',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '28px',
                lineHeight: 1,
              }}
            >
              {String(timeLeft.hours).padStart(2, '0')}
              <small
                style={{
                  display: 'block',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '11px',
                  color: '#6b4f35',
                  marginTop: '4px',
                }}
              >
                hours
              </small>
            </div>
            <div
              className="tm"
              style={{
                background: '#f3ecda',
                color: '#b23a6b',
                borderRadius: '16px',
                padding: '10px 0',
                textAlign: 'center',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '28px',
                lineHeight: 1,
              }}
            >
              {String(timeLeft.min).padStart(2, '0')}
              <small
                style={{
                  display: 'block',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '11px',
                  color: '#6b4f35',
                  marginTop: '4px',
                }}
              >
                min
              </small>
            </div>
            <div
              className="tm"
              style={{
                background: '#f3ecda',
                color: '#b23a6b',
                borderRadius: '16px',
                padding: '10px 0',
                textAlign: 'center',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '28px',
                lineHeight: 1,
              }}
            >
              {String(timeLeft.sec).padStart(2, '0')}
              <small
                style={{
                  display: 'block',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '11px',
                  color: '#6b4f35',
                  marginTop: '4px',
                }}
              >
                sec
              </small>
            </div>
          </div>
          <p
            className="sub"
            style={{
              margin: '12px 0 10px',
              color: '#fff',
              fontSize: '13px',
              lineHeight: 1.4,
            }}
          >
            Meet the community before launch day.
            <br />
            <span style={{ opacity: 0.92, fontSize: '12px', fontWeight: 600 }}>
              🌐 Universal Launch: Dec 4, 2026 · 00:00 UTC
            </span>
          </p>
          <a
            href={DISCORD_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn w"
            style={{
              background: '#f3ecda',
              color: '#b23a6b',
              border: 0,
              borderRadius: '999px',
              padding: '8px 16px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              minHeight: '38px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Join early
          </a>
        </section>
      </div>
    </header>
  );
};

export default Header;
