import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRedemptionCodes } from '../hooks/useRedemptionCodes';
import { useGame } from '../hooks/useGame';
import { useDiscordPresence } from '../hooks/useDiscordPresence';

const DISCORD_LINK = 'https://discord.gg/9CNHMrX6A';
const INSTAGRAM_LINK =
  'https://www.instagram.com/hey.bunnyxo?utm_source=ig_web_button_share_sheet&mdxt=ZDNlZDc0MzIxNw==';

export const HomePage: React.FC = () => {
  const { activeCodes } = useRedemptionCodes();
  const { selectedGame } = useGame();
  const { onlineCount: discordOnline } = useDiscordPresence();

  // Copied state for individual code rows
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Copied state for the "New code" card in "This week at Bunny xo"
  const [newCodeCopied, setNewCodeCopied] = useState<boolean>(false);

  // Latest active redemption code
  const latestCode = activeCodes[0]?.code || 'HEARTOPIA2026';

  const handleCopy = async (id: string, text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 1800);
    } catch {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 1800);
    }
  };

  const handleCopyNewCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(latestCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = latestCode;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setNewCodeCopied(true);
      setTimeout(() => setNewCodeCopied(false), 2000);
    } catch {
      setNewCodeCopied(true);
      setTimeout(() => setNewCodeCopied(false), 2000);
    }
  };

  // Codes to display in the Codes card
  const displayCodes =
    activeCodes.length > 0
      ? activeCodes.slice(0, 3)
      : [
          {
            id: 'c1',
            code: 'HEARTOPIA2026',
            title: 'Welcome Gift',
            expiry: 'Dec 31',
          },
          {
            id: 'c2',
            code: 'COZYBUNNY',
            title: 'Bunny Outfit Pack',
            expiry: 'Nov 30',
          },
          {
            id: 'c3',
            code: 'SPRINGTULIP',
            title: 'Tulip Garden Box',
            expiry: 'Nov 15',
          },
        ];

  return (
    <main
      className="pg"
      style={{
        background: '#f3d2cb',
        minHeight: '600px',
        fontFamily: 'Nunito, sans-serif',
        color: '#6b4f35',
        padding: '0 24px 28px',
        boxSizing: 'border-box',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* If Petit Planet or Loftia is selected, show Work in Progress */}
      {selectedGame === 'Petit Planet' && (
        <section
          style={{
            background: '#f3ecda',
            borderRadius: '24px',
            padding: '64px 24px',
            textAlign: 'center',
            margin: '16px 0',
            color: '#6b4f35',
            boxSizing: 'border-box',
            border: '2px dashed #6e7a3c',
          }}
        >
          <div style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>🪐🌱✨</div>
          <h2
            style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '32px',
              color: '#6e7a3c',
              margin: '0 0 12px',
            }}
          >
            Petit Planet · Work in Progress
          </h2>
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '16px',
              maxWidth: '540px',
              margin: '0 auto 20px',
              lineHeight: 1.6,
              color: '#6b4f35',
            }}
          >
            We are preparing secret spot coordinates, cozy codes, and community spotlights for Petit Planet. Everything will unlock right here as launch day approaches! 🐰🌸
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#6e7a3c',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            <span>🌐 Universal Launch Date: December 4, 2026 · 00:00 UTC</span>
          </div>
        </section>
      )}

      {selectedGame === 'Loftia' && (
        <section
          style={{
            background: '#f3ecda',
            borderRadius: '24px',
            padding: '64px 24px',
            textAlign: 'center',
            margin: '16px 0',
            color: '#6b4f35',
            boxSizing: 'border-box',
            border: '2px dashed #b23a6b',
          }}
        >
          <div style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>☁️🌸🐰</div>
          <h2
            style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '32px',
              color: '#b23a6b',
              margin: '0 0 12px',
            }}
          >
            Loftia · Work in Progress
          </h2>
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '16px',
              maxWidth: '540px',
              margin: '0 auto 20px',
              lineHeight: 1.6,
              color: '#6b4f35',
            }}
          >
            We are designing cozy rooftop garden blueprints, community crafting guides, and upcoming event tickets for Loftia. Stay tuned! ☁️✨
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#b23a6b',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            <span>🌿 Loftia Section in Active Development</span>
          </div>
        </section>
      )}

      {/* When Heartopia is selected, render Heartopia cards */}
      {selectedGame === 'Heartopia' && (
        <>
          {/* 1. "This week at Bunny xo" */}
          <h2
            style={{
              fontFamily: 'Lora, serif',
              fontSize: '20px',
              color: '#7a5638',
              margin: '8px 4px 10px',
            }}
          >
            This week at Bunny xo
          </h2>

          <div className="v2-week-grid-3">
            {/* Card 1: Official Patch Game update */}
            <Link
              to="/updates"
              className="wk"
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                background: '#f3ecda',
                borderRadius: '20px',
                padding: '14px',
                boxSizing: 'border-box',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.15s ease',
              }}
            >
              <div
                className="ic"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: '#e9b3ad',
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🌸
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#7a5638' }}>Game update</strong>
                <br />
                <span className="sub" style={{ fontSize: '13px', color: '#8c6f55' }}>
                  Phantom Glow Patch · Heartopia
                </span>
              </div>
            </Link>

            {/* Card 2: New code (clickable to copy) */}
            <div
              onClick={handleCopyNewCode}
              className="wk"
              role="button"
              tabIndex={0}
              title="Click anywhere to copy code"
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                background: newCodeCopied ? '#dcfce7' : '#f3ecda',
                border: newCodeCopied ? '1.5px solid #22c55e' : 'none',
                borderRadius: '20px',
                padding: '14px',
                boxSizing: 'border-box',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <div
                className="ic"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: newCodeCopied ? '#86efac' : '#e9b3ad',
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {newCodeCopied ? '✨' : '🎁'}
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: newCodeCopied ? '#166534' : '#7a5638' }}>
                  {newCodeCopied ? 'Copied to clipboard! ✨' : `New code · ${latestCode}`}
                </strong>
                <br />
                <span className="sub" style={{ fontSize: '13px', color: newCodeCopied ? '#15803d' : '#8c6f55' }}>
                  {newCodeCopied ? 'Ready to redeem in-game' : 'Click anywhere on card to copy'}
                </span>
              </div>
            </div>

            {/* Card 3: Event */}
            <Link
              to="/events"
              className="wk"
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                background: '#f3ecda',
                borderRadius: '20px',
                padding: '14px',
                boxSizing: 'border-box',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.15s ease',
              }}
            >
              <div
                className="ic"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: '#e9b3ad',
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🎫
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#7a5638' }}>Event</strong>
                <br />
                <span className="sub" style={{ fontSize: '13px', color: '#8c6f55' }}>
                  Tea Party Meetup · Coming soon
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Three Middle Cards: Latest Find, Discord Feed, Codes */}
          <div className="v2-middle-grid">
            {/* Card 1: Latest find */}
            <section
              className="card"
              style={{
                background: '#f3ecda',
                borderRadius: '24px',
                padding: '18px',
                boxSizing: 'border-box',
              }}
            >
              <h2
                style={{
                  margin: '0 0 10px',
                  fontFamily: 'Lora, serif',
                  fontSize: '19px',
                  color: '#7a5638',
                }}
              >
                Latest find{' '}
                <span
                  className="tag"
                  style={{
                    background: '#e9b3ad',
                    color: '#6b4f35',
                    borderRadius: '999px',
                    padding: '2px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    marginLeft: '6px',
                  }}
                >
                  Heartopia
                </span>
              </h2>
              <div
                className="ph"
                style={{
                  height: '210px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f6c9b8, #e9b3ad)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '10px',
                  boxSizing: 'border-box',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#6b4f35',
                }}
              >
                [BIG IMAGE: new item or secret spot]
              </div>
              <p
                className="sub"
                style={{
                  margin: '8px 0 10px',
                  fontSize: '13px',
                  color: '#6b4f35',
                }}
              >
                <strong>Crystal Cavern Waterfall</strong> · Hidden behind the eastern cliffside
              </p>
              <Link
                to="/map"
                style={{
                  color: '#b23a6b',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                View all finds
              </Link>
            </section>

            {/* Card 2: Discord feed */}
            <section
              className="card"
              style={{
                background: '#f3ecda',
                borderRadius: '24px',
                padding: '18px',
                boxSizing: 'border-box',
              }}
            >
              <h2
                style={{
                  margin: '0 0 10px',
                  fontFamily: 'Lora, serif',
                  fontSize: '19px',
                  color: '#7a5638',
                }}
              >
                Discord feed
              </h2>
              <div
                className="row"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  background: '#f9f4e6',
                  borderRadius: '14px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#6b4f35',
                }}
              >
                <strong style={{ color: '#7a5638' }}>Spring Blossom Gala Announcement</strong>
                <span className="sub" style={{ fontSize: '13px', color: '#8c6f55' }}>
                  Join us this Friday for photo sessions and star coin raffles!
                </span>
              </div>

              <div
                className="row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f9f4e6',
                  borderRadius: '14px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#6b4f35',
                }}
              >
                <span>Phantom Glow Patch release</span>
                <span
                  className="tag"
                  style={{
                    background: '#e9b3ad',
                    color: '#6b4f35',
                    borderRadius: '999px',
                    padding: '2px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Heartopia
                </span>
              </div>

              <div
                className="row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f9f4e6',
                  borderRadius: '14px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#6b4f35',
                }}
              >
                <span>Sky Island housing preview</span>
                <span
                  className="tag"
                  style={{
                    background: '#d9e0b4',
                    color: '#6e7a3c',
                    borderRadius: '999px',
                    padding: '2px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Loftia
                </span>
              </div>

              <div
                className="row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f9f4e6',
                  borderRadius: '14px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#6b4f35',
                }}
              >
                <span>Next community event coming soon</span>
                <span className="sub" style={{ fontSize: '13px', color: '#8c6f55' }}>
                  Nov 2nd
                </span>
              </div>

              <a
                href={DISCORD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn g"
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: '#6e7a3c',
                  color: '#fff',
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
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#4ade80',
                    display: 'inline-block',
                  }}
                />
                <span>Open Discord {discordOnline !== null ? `(${discordOnline} online)` : ''}</span>
              </a>
            </section>

            {/* Card 3: Codes */}
            <section
              className="card"
              style={{
                background: '#f3ecda',
                borderRadius: '24px',
                padding: '18px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontFamily: 'Lora, serif',
                    fontSize: '19px',
                    color: '#7a5638',
                  }}
                >
                  Codes
                </h2>
                <Link
                  to="/codes"
                  style={{
                    fontSize: '13px',
                    color: '#b23a6b',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  See all ({activeCodes.length || 6}) →
                </Link>
              </div>

              {displayCodes.map((item) => (
                <div
                  key={item.id}
                  className="row"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#f9f4e6',
                    borderRadius: '14px',
                    padding: '10px 12px',
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#6b4f35',
                  }}
                >
                  <div>
                    <strong style={{ color: '#7a5638' }}>{item.code}</strong>
                    <br />
                    <span className="sub" style={{ fontSize: '12px', color: '#8c6f55' }}>
                      expires {item.expiry || 'soon'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.code)}
                    className="btn"
                    style={{
                      background: copiedCodeId === item.id ? '#22c55e' : '#b23a6b',
                      color: '#ffffff',
                      border: 0,
                      borderRadius: '999px',
                      padding: '4px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      minHeight: '28px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {copiedCodeId === item.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </section>
          </div>

          {/* 3. Three Bottom Cards: Community spotlight, Collection, Recent on Instagram */}
          <div className="v2-bottom-grid">
            {/* Card 1: Community spotlight */}
            <section
              className="card"
              style={{
                background: '#f3ecda',
                borderRadius: '24px',
                padding: '18px',
                boxSizing: 'border-box',
              }}
            >
              <h2
                style={{
                  margin: '0 0 10px',
                  fontFamily: 'Lora, serif',
                  fontSize: '19px',
                  color: '#7a5638',
                }}
              >
                Community spotlight
              </h2>
              <div
                className="ph"
                style={{
                  height: '140px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #fbd5e1, #f6c9b8)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '10px',
                  boxSizing: 'border-box',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#6b4f35',
                }}
              >
                🌸 Cozy Bakery Garden Build
              </div>
              <p
                className="sub"
                style={{
                  margin: '10px 0 0',
                  fontSize: '13px',
                  color: '#6b4f35',
                }}
              >
                By <strong>@cozycottage</strong> ·{' '}
                <a
                  href={DISCORD_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#b23a6b',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Submit yours
                </a>
              </p>
            </section>

            {/* Card 2: Collection */}
            <section
              className="card"
              style={{
                background: '#f3ecda',
                borderRadius: '24px',
                padding: '18px',
                boxSizing: 'border-box',
              }}
            >
              <h2
                style={{
                  margin: '0 0 8px',
                  fontFamily: 'Lora, serif',
                  fontSize: '19px',
                  color: '#7a5638',
                }}
              >
                Collection
              </h2>
              <p
                className="sub"
                style={{
                  fontSize: '13px',
                  color: '#6b4f35',
                  margin: '0 0 8px',
                }}
              >
                16 of 34 items found
              </p>
              <div
                style={{
                  background: '#f9f4e6',
                  borderRadius: '999px',
                  height: '10px',
                  overflow: 'hidden',
                  margin: '6px 0 12px',
                }}
              >
                <div
                  style={{
                    background: '#b23a6b',
                    height: '100%',
                    width: '47%',
                    borderRadius: '999px',
                  }}
                />
              </div>
              <p
                className="sub"
                style={{
                  fontSize: '13px',
                  color: '#6b4f35',
                  margin: '0 0 14px',
                }}
              >
                Newest: <strong>Starry Cloud Lantern</strong>
              </p>
              <Link
                to="/events"
                className="btn g"
                style={{
                  background: '#6e7a3c',
                  color: '#ffffff',
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
                View collection
              </Link>
            </section>

            {/* Card 3: Recent on Instagram */}
            <section
              className="card"
              style={{
                background: '#f3ecda',
                borderRadius: '24px',
                padding: '18px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontFamily: 'Lora, serif',
                    fontSize: '19px',
                    color: '#7a5638',
                  }}
                >
                  Recent on Instagram
                </h2>
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '13px',
                    color: '#b23a6b',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  @hey.bunnyxo ↗
                </a>
              </div>

              {/* 4-column thumbnail placeholder grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}
              >
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ph"
                  style={{
                    aspectRatio: '1',
                    textDecoration: 'none',
                    color: '#6b4f35',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f6c9b8, #e9b3ad)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                >
                  🌸
                </a>
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ph"
                  style={{
                    aspectRatio: '1',
                    textDecoration: 'none',
                    color: '#6b4f35',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #fbd5e1, #f6c9b8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                >
                  🎀
                </a>
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ph"
                  style={{
                    aspectRatio: '1',
                    textDecoration: 'none',
                    color: '#6b4f35',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f6c9b8, #e9b3ad)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                >
                  ☕
                </a>
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ph"
                  style={{
                    aspectRatio: '1',
                    textDecoration: 'none',
                    color: '#6b4f35',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #fbd5e1, #f6c9b8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                >
                  ✨
                </a>
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
};

export default HomePage;
