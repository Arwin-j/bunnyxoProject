import React, { useState } from 'react';

interface GameUpdate {
  id: string;
  game: 'Heartopia' | 'Petit Planet' | 'Loftia' | 'Bunny xo';
  tagColor: string;
  textColor: string;
  version: string;
  title: string;
  date: string;
  summary: string;
  highlights: string[];
}

const UPDATES_DATA: GameUpdate[] = [
  {
    id: 'up-1',
    game: 'Heartopia',
    tagColor: '#e9b3ad',
    textColor: '#6b4f35',
    version: 'v1.4.0',
    title: 'Spring Festival & Cherry Blossom Grove',
    date: 'October 28, 2026',
    summary: 'The cherry blossoms are blooming across Whispering Pines! Collect fallen blossom petals to craft cozy picnic sets and traditional lanterns.',
    highlights: [
      'New secret fishing spot in the eastern waterfall grotto',
      '12 new craftable garden furniture items and floral tea sets',
      'Expanded island photo mode with cozy retro filters and bunny poses',
    ],
  },
  {
    id: 'up-2',
    game: 'Petit Planet',
    tagColor: '#d9e0b4',
    textColor: '#6e7a3c',
    version: 'Pioneer Beta',
    title: 'Starfall Beach & Moonstone Gathering',
    date: 'October 24, 2026',
    summary: 'Preview release for pioneer playtesters. Explore tidal pools, gather iridescent moonstones, and customize your cozy dome cottage.',
    highlights: [
      'Early access pioneer badges unlocked for registered community members',
      'Interactive celestial observatory stargazing mini-game',
      'Cross-play companion support for iOS and Android',
    ],
  },
  {
    id: 'up-3',
    game: 'Loftia',
    tagColor: '#fbd5e1',
    textColor: '#b23a6b',
    version: 'Alpha Preview',
    title: 'Hydroponic Sky Garden Showcase',
    date: 'October 19, 2026',
    summary: 'Community preview of rooftop farming and sustainable energy mechanics in the upper sky city district.',
    highlights: [
      'Automated watering and cozy plant nursery upgrades',
      'Community recycling station and upcycling crafting benches',
      'Co-op cooking kitchen with friendly robot helpers',
    ],
  },
  {
    id: 'up-4',
    game: 'Bunny xo',
    tagColor: '#a9ad73',
    textColor: '#ffffff',
    version: 'Hub 2.0',
    title: 'New V2 Design & Live Instagram Feed',
    date: 'October 30, 2026',
    summary: 'A warm, refreshed aesthetic crafted by the community with instant code copying, live Instagram Reels, and interactive map tracking.',
    highlights: [
      'Complete V2 warm blush and cream palette redesign',
      'Direct Instagram Graph API sync for reels and story guides',
      'Interactive pin collection tracker with instant progress updates',
    ],
  },
];

export const UpdatesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string>('All');

  const filteredUpdates = UPDATES_DATA.filter(
    (item) => selectedGame === 'All' || item.game === selectedGame
  );

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-6 antialiased selection:bg-[#b23a6b] selection:text-white">
      {/* 1. Hero Banner */}
      <section
        className="card-v2 p-5 sm:p-6"
        style={{ background: 'linear-gradient(120deg, #fbd5e1, #f6c9b8)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl select-none" aria-hidden="true">📣</span>
              <h1 className="font-heading text-2xl sm:text-4xl font-bold text-[#b23a6b]">
                Game Updates & Patch Notes
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#6b4f35] font-sans max-w-xl">
              Stay in the loop with recent patches, content drops, developer announcements, and community notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f3ecda] px-3.5 py-1 text-xs sm:text-sm font-bold text-[#6b4f35] shadow-xs">
              ✨ {UPDATES_DATA.length} Releases Logged
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#e9b3ad]/40">
          {['All', 'Heartopia', 'Petit Planet', 'Loftia', 'Bunny xo'].map((game) => (
            <button
              key={game}
              type="button"
              onClick={() => setSelectedGame(game)}
              className={`tab-v2 text-xs sm:text-sm py-1.5 px-3.5 min-h-[34px] ${
                selectedGame === game ? 'on' : ''
              }`}
            >
              {game}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Updates Timeline List */}
      <div className="space-y-4">
        {filteredUpdates.map((update) => (
          <article key={update.id} className="card-v2 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e9b3ad]/40 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="tag-v2"
                  style={{ background: update.tagColor, color: update.textColor }}
                >
                  {update.game}
                </span>
                <span className="font-mono text-xs font-bold text-[#b23a6b] bg-[#f9f4e6] px-2.5 py-0.5 rounded-full">
                  {update.version}
                </span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#7a5638] m-0">
                  {update.title}
                </h2>
              </div>
              <span className="text-xs font-mono font-medium text-[#8c6f55]">
                {update.date}
              </span>
            </div>

            <p className="text-sm text-[#6b4f35] leading-relaxed font-sans">
              {update.summary}
            </p>

            {/* Highlights List */}
            <div className="space-y-2">
              <span className="text-xs font-heading font-bold text-[#7a5638] uppercase tracking-wider block">
                Key Highlights:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {update.highlights.map((item, idx) => (
                  <div key={idx} className="row-v2 text-xs py-2 px-3 m-0">
                    <span className="mr-1 text-[#b23a6b]">🌸</span>
                    <span className="font-medium text-[#6b4f35]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export default UpdatesPage;
