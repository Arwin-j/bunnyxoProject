import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Import custom bunny-eared social icons
import discordIcon from '../assets/social/discord.svg';
import instagramIcon from '../assets/social/instagram.svg';
import youtubeIcon from '../assets/social/youtube.svg';
import tiktokIcon from '../assets/social/tiktok.svg';
import threadsIcon from '../assets/social/threads.svg';
import pinterestIcon from '../assets/social/pinterest.svg';
import facebookIcon from '../assets/social/facebook.svg';

interface SocialPlatform {
  name: string;
  handle: string;
  url: string;
  icon: string;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: 'Discord',
    handle: 'Bunny Squad Community',
    url: 'https://discord.gg/9CNHMrX6A',
    icon: discordIcon,
  },
  {
    name: 'Instagram',
    handle: '@hey.bunnyxo',
    url: 'https://www.instagram.com/hey.bunnyxo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D',
    icon: instagramIcon,
  },
  {
    name: 'YouTube',
    handle: '@hey.bunnyxo',
    url: 'https://www.youtube.com/@hey.bunnyxo',
    icon: youtubeIcon,
  },
  {
    name: 'TikTok',
    handle: '@hey.bunny.xo',
    url: 'https://www.tiktok.com/@hey.bunny.xo?is_from_webapp=1&sender_device=pc',
    icon: tiktokIcon,
  },
  {
    name: 'Threads',
    handle: '@hey.bunnyxo',
    url: 'https://www.threads.net/@hey.bunnyxo',
    icon: threadsIcon,
  },
  {
    name: 'Pinterest',
    handle: 'heybunnyx0',
    url: 'https://in.pinterest.com/heybunnyx0/?invite_code=f37e124d3ff04a5c995a12d733ba2924&sender=1118792869839438298',
    icon: pinterestIcon,
  },
  {
    name: 'Facebook',
    handle: 'Hey Bunny XO',
    url: 'https://www.facebook.com/hey.bunnyX0/?rdid=T0DxngwsD1AEFmIF',
    icon: facebookIcon,
  },
];

const CORE_PILLARS = [
  {
    emoji: '🗺️',
    title: 'Interactive Maps',
    desc: 'Hidden chests, fishing spots & scenic viewpoints.',
  },
  {
    emoji: '🎁',
    title: 'Verified Codes',
    desc: 'Instant, clean redemption codes with 1-click copy.',
  },
  {
    emoji: '🎟️',
    title: 'Cozy Events',
    desc: 'Live seasonal festivals, photo gatherings & giveaways.',
  },
  {
    emoji: '🎀',
    title: 'Curated Collections',
    desc: 'Catalogs for outfits, furniture sets & island decor.',
  },
];

export const AboutPage: React.FC = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFeedbackOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFeedbackOpen]);

  const handleCloseModal = () => {
    setIsFeedbackOpen(false);
    setIsSubmitted(false);
    setTopicTitle('');
    setDescription('');
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const feedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      topicTitle: topicTitle.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    // 1. Save to localStorage
    try {
      const existingRaw = localStorage.getItem('bunny_feedback_submissions');
      const list = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift(feedbackItem);
      localStorage.setItem('bunny_feedback_submissions', JSON.stringify(list));
    } catch (err) {
      console.warn('Could not save feedback to localStorage:', err);
    }

    // 2. Attempt sync with Supabase if configured (silently catches if table does not exist)
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('feedback').insert([
          {
            id: feedbackItem.id,
            topic: feedbackItem.topicTitle,
            description: feedbackItem.description,
            created_at: feedbackItem.createdAt,
          },
        ]);
      } catch {
        // Ignore remote error if feedback table not yet initialized
      }
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <main
      className="mx-auto px-4 sm:px-6 py-6 space-y-6 antialiased selection:bg-[#b23a6b] selection:text-white"
      style={{
        maxWidth: '760px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Hero Card: About Bunny xo (resized snugly based on content) */}
      <section
        className="card-v2"
        style={{
          background: 'linear-gradient(125deg, #fbd5e1 0%, #f6c9b8 50%, #f9e2d8 100%)',
          borderRadius: '24px',
          border: '2px solid rgba(233, 179, 173, 0.6)',
          padding: '20px 24px',
          boxShadow: '0 6px 20px rgba(178, 58, 107, 0.12)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Bunny Mascot Logo */}
          <div
            style={{
              width: '82px',
              height: '82px',
              minWidth: '82px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '3px dashed #b23a6b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(178, 58, 107, 0.16)',
              flexShrink: 0,
            }}
          >
            <img
              src="/bunny-logo.webp"
              alt="Bunny xo Mascot"
              style={{
                width: '56px',
                height: '56px',
                objectFit: 'contain',
                userSelect: 'none',
              }}
            />
          </div>

          {/* Heading and Intro Text */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.85)',
                padding: '3px 12px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#b23a6b',
                fontFamily: 'Fredoka, sans-serif',
                boxShadow: '0 1px 4px rgba(178, 58, 107, 0.08)',
              }}
            >
              <span>🌸</span>
              <span>The Cozy Gaming Hub</span>
            </div>

            <h1
              style={{
                margin: '2px 0 0',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '28px',
                lineHeight: 1.2,
                color: '#b23a6b',
                fontWeight: 700,
              }}
            >
              Welcome to Bunny xo
            </h1>

            <p
              style={{
                margin: 0,
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                color: '#6b4f35',
                lineHeight: 1.55,
              }}
            >
              Your warm, wholesome haven for relaxing life sims, secret spots, active redemption codes,
              and fluffy friends. Built with love for the cozy gaming community.
            </p>

            {/* Contribute Button */}
            <div style={{ paddingTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="cursor-pointer transition-all active:scale-95 hover:shadow-md inline-flex items-center gap-2"
                style={{
                  background: '#b23a6b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '7px 18px',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: '0 3px 8px rgba(178, 58, 107, 0.22)',
                }}
              >
                <span>💌</span>
                <span>Contribute</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Purpose & Story Section (compact, snug padding, content-driven) */}
      <section
        style={{
          background: '#f3ecda',
          borderRadius: '24px',
          padding: '22px 24px',
          border: '1.5px solid rgba(233, 179, 173, 0.5)',
          boxShadow: '0 4px 16px rgba(107, 79, 53, 0.06)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: '20px' }}>✨</span>
          <h2
            style={{
              margin: 0,
              fontFamily: 'Lora, serif',
              fontSize: '20px',
              color: '#7a5638',
              fontWeight: 700,
            }}
          >
            The Purpose of This Website
          </h2>
        </div>

        <p
          style={{
            margin: '0 0 12px',
            fontFamily: 'Nunito, sans-serif',
            fontSize: '14px',
            color: '#6b4f35',
            lineHeight: 1.6,
          }}
        >
          Cozy games bring serenity, creativity, and relief to our busy days. But as our favorite worlds
          grow—from the blossoming meadows of <strong>Heartopia</strong> to upcoming adventures in{' '}
          <strong>Petit Planet</strong> and <strong>Loftia</strong>—helpful resources were scattered across
          countless chat rooms and expiring links.
        </p>

        <p
          style={{
            margin: 0,
            fontFamily: 'Nunito, sans-serif',
            fontSize: '14px',
            color: '#6b4f35',
            lineHeight: 1.6,
          }}
        >
          <strong>Bunny xo</strong> brings everything into one clean, aesthetic sanctuary. Players can
          instantly find verified gift codes without intrusive ads, explore custom interactive maps with
          secret locations, track seasonal community events, and share design inspiration with friends.
        </p>

        {/* Wholesome Promise Box (sized to its text) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e9b3ad',
            padding: '12px 16px',
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 6px rgba(107, 79, 53, 0.04)',
          }}
        >
          <span style={{ fontSize: '26px', flexShrink: 0 }}>🍵</span>
          <div>
            <strong
              style={{
                display: 'block',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '13px',
                color: '#b23a6b',
              }}
            >
              Our Community Promise
            </strong>
            <span
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '12px',
                color: '#8c6f55',
                lineHeight: 1.45,
              }}
            >
              100% free, forever cozy, kindness-first, and zero paywalls. Just honest community passion and
              lots of carrot tea!
            </span>
            <div style={{ marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="cursor-pointer"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#b23a6b',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>💌 Have feedback, ideas, or missing spots? Contribute here &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What You Can Explore (Compact, snug tile cards) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span style={{ fontSize: '18px' }}>🌱</span>
          <h2
            style={{
              margin: 0,
              fontFamily: 'Lora, serif',
              fontSize: '19px',
              color: '#7a5638',
              fontWeight: 700,
            }}
          >
            What You Can Explore
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
          }}
        >
          {CORE_PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="card-v2"
              style={{
                background: '#f9f4e6',
                borderRadius: '18px',
                border: '1.5px solid rgba(233, 179, 173, 0.45)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(107, 79, 53, 0.05)',
              }}
            >
              <span style={{ fontSize: '24px' }}>{pillar.emoji}</span>
              <h3
                style={{
                  margin: 0,
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '14px',
                  color: '#7a5638',
                  fontWeight: 600,
                }}
              >
                {pillar.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '12px',
                  color: '#8c6f55',
                  lineHeight: 1.45,
                }}
              >
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Social Links (Only the icons centered in the middle, no separate boxes) */}
      <section
        style={{
          textAlign: 'center',
          padding: '16px 0 8px',
        }}
      >
        <div style={{ marginBottom: '14px' }}>
          <h2
            style={{
              margin: '0 0 4px',
              fontFamily: 'Lora, serif',
              fontSize: '20px',
              color: '#7a5638',
              fontWeight: 700,
            }}
          >
            Join Our Social Community
          </h2>
          <p
            style={{
              margin: 0,
              fontFamily: 'Nunito, sans-serif',
              fontSize: '13px',
              color: '#8c6f55',
            }}
          >
            Connect with @hey.bunnyxo across the web
          </p>
        </div>

        {/* Centered Icons in the Middle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {SOCIAL_PLATFORMS.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${platform.name} (${platform.handle})`}
              aria-label={platform.name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'transform 0.15s ease, filter 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <img
                src={platform.icon}
                alt={platform.name}
                style={{
                  width: '56px',
                  height: '56px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 3px 6px rgba(74, 40, 53, 0.18))',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              />
            </a>
          ))}
        </div>
      </section>

      {/* 5. Quick Links / Ready to explore (compact banner) */}
      <section
        style={{
          background: 'linear-gradient(120deg, #fbd5e1, #f6c9b8)',
          borderRadius: '22px',
          padding: '16px 20px',
          border: '1.5px solid rgba(233, 179, 173, 0.6)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 3px 12px rgba(178, 58, 107, 0.1)',
        }}
      >
        <div style={{ flex: '1 1 200px' }}>
          <h3
            style={{
              margin: 0,
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '16px',
              color: '#b23a6b',
              fontWeight: 700,
            }}
          >
            Ready to explore?
          </h3>
          <p
            style={{
              margin: '2px 0 0',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '12px',
              color: '#6b4f35',
            }}
          >
            Jump into upcoming events, interactive maps, or free gifts.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <Link
            to="/events"
            style={{
              background: '#b23a6b',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '6px 14px',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(178, 58, 107, 0.18)',
            }}
          >
            🎟️ Events
          </Link>
          <Link
            to="/map"
            style={{
              background: '#f3ecda',
              color: '#b23a6b',
              borderRadius: '999px',
              padding: '6px 14px',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid #e9b3ad',
            }}
          >
            🗺️ Map
          </Link>
          <Link
            to="/codes"
            style={{
              background: '#f3ecda',
              color: '#b23a6b',
              borderRadius: '999px',
              padding: '6px 14px',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid #e9b3ad',
            }}
          >
            🎁 Codes
          </Link>
          <Link
            to="/collection"
            style={{
              background: '#f3ecda',
              color: '#b23a6b',
              borderRadius: '999px',
              padding: '6px 14px',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid #e9b3ad',
            }}
          >
            🎀 Collection
          </Link>
          <Link
            to="/feed"
            style={{
              background: '#f3ecda',
              color: '#b23a6b',
              borderRadius: '999px',
              padding: '6px 14px',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid #e9b3ad',
            }}
          >
            📰 Feed
          </Link>
        </div>
      </section>

      {/* Footer Signature */}
      <footer
        style={{
          textAlign: 'center',
          padding: '12px 0 6px',
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '12px',
          color: '#8c6f55',
        }}
      >
        <span>Crafted with 💖 and lots of carrot tea for the bunny squad · Bunny xo</span>
      </footer>

      {/* Feedback / Contribute Pop-up Modal */}
      {isFeedbackOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-7 border-2 border-[#e9b3ad] shadow-2xl relative"
            style={{
              background: '#fbf8f0',
              color: '#6b4f35',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#8c6f55] hover:text-[#b23a6b] hover:bg-[#f3ecda] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Modal Heading: Feedback */}
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: '24px' }}>💌</span>
              <h2
                id="feedback-modal-title"
                style={{
                  margin: 0,
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '24px',
                  color: '#b23a6b',
                  fontWeight: 700,
                }}
              >
                Feedback
              </h2>
            </div>
            <p
              style={{
                margin: '0 0 18px',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                color: '#8c6f55',
              }}
            >
              Help us make Bunny xo even cozier! Share your ideas, report missing items, or suggest improvements.
            </p>

            {isSubmitted ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  border: '1.5px solid #e9b3ad',
                }}
              >
                <div style={{ fontSize: '38px', marginBottom: '8px' }}>🎉🐰✨</div>
                <h3
                  style={{
                    fontFamily: 'Fredoka, sans-serif',
                    fontSize: '18px',
                    color: '#b23a6b',
                    margin: '0 0 6px',
                  }}
                >
                  Thank You for Your Feedback!
                </h3>
                <p
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '13px',
                    color: '#6b4f35',
                    margin: '0 0 16px',
                  }}
                >
                  Your contribution has been received! The Bunny Squad truly appreciates your support.
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cursor-pointer transition-all active:scale-95"
                  style={{
                    background: '#b23a6b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '8px 26px',
                    fontFamily: 'Fredoka, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    boxShadow: '0 2px 6px rgba(178, 58, 107, 0.2)',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {/* Sub input: Topic/Title */}
                <div>
                  <label
                    htmlFor="feedback-topic"
                    style={{
                      display: 'block',
                      fontFamily: 'Fredoka, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#7a5638',
                      marginBottom: '6px',
                    }}
                  >
                    Topic / Title <span style={{ color: '#b23a6b' }}>*</span>
                  </label>
                  <input
                    id="feedback-topic"
                    type="text"
                    required
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    placeholder="e.g. Missing secret chest location, new code, feature idea..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #e9b3ad',
                      background: '#ffffff',
                      color: '#6b4f35',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Sub input: Description box */}
                <div>
                  <label
                    htmlFor="feedback-description"
                    style={{
                      display: 'block',
                      fontFamily: 'Fredoka, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#7a5638',
                      marginBottom: '6px',
                    }}
                  >
                    Description <span style={{ color: '#b23a6b' }}>*</span>
                  </label>
                  <textarea
                    id="feedback-description"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us all the details, coordinates, links, or ideas..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #e9b3ad',
                      background: '#ffffff',
                      color: '#6b4f35',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '110px',
                    }}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="cursor-pointer"
                    style={{
                      background: '#f3ecda',
                      color: '#7a5638',
                      border: '1px solid #e9b3ad',
                      borderRadius: '999px',
                      padding: '8px 18px',
                      fontFamily: 'Fredoka, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      background: '#b23a6b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '8px 22px',
                      fontFamily: 'Fredoka, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      boxShadow: '0 3px 8px rgba(178, 58, 107, 0.2)',
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback ✨'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default AboutPage;
