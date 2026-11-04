import React, { useState, useMemo } from 'react';
import { useGame, GameName, GAME_OPTIONS } from '../hooks/useGame';

export interface CollectionItem {
  id: string;
  name: string;
  game: GameName;
  category: 'outfits' | 'furniture' | 'outdoor' | 'special';
  categoryLabel: string;
  rarity: 'Common' | 'Rare' | 'Legendary' | 'Event';
  icon: string;
  obtainedFrom: string;
  description: string;
}

const GAME_DESCRIPTIONS: Record<GameName, string> = {
  Heartopia:
    'Browse Heartopia fashion sets, cozy cottage furniture, secret tulip garden blueprints, and rare seasonal stars.',
  'Petit Planet':
    'Explore upcoming Petit Planet cosmic items, interstellar greenhouse modules, starlight domes, and astronaut outfits before launch.',
  Loftia:
    'Discover sustainable city loft decor, rooftop hydroponic gardens, solar-powered gadgets, and eco-friendly cozy fashion in Loftia.',
};

const GAME_COLLECTION_DATA: CollectionItem[] = [
  // --- Heartopia Items ---
  {
    id: 'h-01',
    name: 'Spring Blossom Kimono',
    game: 'Heartopia',
    category: 'outfits',
    categoryLabel: 'Outfits',
    rarity: 'Event',
    icon: '👘',
    obtainedFrom: 'Spring Blossom Festival Event',
    description: 'A traditional pastel silk kimono woven with real cherry blossom petals.',
  },
  {
    id: 'h-02',
    name: 'Cozy Bunny Ears Beret',
    game: 'Heartopia',
    category: 'outfits',
    categoryLabel: 'Outfits',
    rarity: 'Rare',
    icon: '🐰',
    obtainedFrom: 'Bunny Squad Welcome Box',
    description: 'Fluffy warm wool beret with floppy bunny ears. Increases island movement speed by 5%.',
  },
  {
    id: 'h-03',
    name: 'Floral Tea Party Table',
    game: 'Heartopia',
    category: 'furniture',
    categoryLabel: 'Furniture',
    rarity: 'Rare',
    icon: '🫖',
    obtainedFrom: 'Crafting Table (Lv. 4)',
    description: 'Carved rosewood table set with porcelain teacups, berry pies, and fresh chamomile.',
  },
  {
    id: 'h-04',
    name: 'Sakura Canopy Bed',
    game: 'Heartopia',
    category: 'furniture',
    categoryLabel: 'Furniture',
    rarity: 'Legendary',
    icon: '🛏️',
    obtainedFrom: 'Blossom Meadow Treasure Chest',
    description: 'Handcrafted four-poster bed draped in translucent pink chiffon and fairy lights.',
  },
  {
    id: 'h-05',
    name: 'Rainbow Tulip Bulbs',
    game: 'Heartopia',
    category: 'outdoor',
    categoryLabel: 'Outdoor',
    rarity: 'Common',
    icon: '🌷',
    obtainedFrom: 'Botanist Flora Shop',
    description: 'Magical tulip bulbs that bloom in alternating pastel hues under full moonlight.',
  },
  {
    id: 'h-06',
    name: 'Whale Bay Stone Fountain',
    game: 'Heartopia',
    category: 'outdoor',
    categoryLabel: 'Outdoor',
    rarity: 'Rare',
    icon: '⛲',
    obtainedFrom: 'Town Hall Renovation Prize',
    description: 'Carved seaside marble fountain that attracts singing songbirds every morning.',
  },
  {
    id: 'h-07',
    name: 'Star Coin Music Box',
    game: 'Heartopia',
    category: 'special',
    categoryLabel: 'Special',
    rarity: 'Legendary',
    icon: '✨',
    obtainedFrom: 'Hidden Cliffside Cavern',
    description: 'Plays the soothing Heartopia main theme. Glows warmly in dark rooms.',
  },
  {
    id: 'h-08',
    name: 'Golden Watering Can',
    game: 'Heartopia',
    category: 'special',
    categoryLabel: 'Special',
    rarity: 'Event',
    icon: '🪙',
    obtainedFrom: 'Greenhouse Mastery Milestone',
    description: 'Waters a 3x3 garden grid in a single shower and increases harvest yield.',
  },

  // --- Petit Planet Items ---
  {
    id: 'p-01',
    name: 'Cosmic Pioneer Suit',
    game: 'Petit Planet',
    category: 'outfits',
    categoryLabel: 'Outfits',
    rarity: 'Legendary',
    icon: '👨‍🚀',
    obtainedFrom: 'Dec 4 Launch Pre-Registration',
    description: 'Pressurized explorer suit with gold-tinted starlight visor and zero-G magnetic boots.',
  },
  {
    id: 'p-02',
    name: 'Lunar Bunny Helmet',
    game: 'Petit Planet',
    category: 'outfits',
    categoryLabel: 'Outfits',
    rarity: 'Event',
    icon: '🌙',
    obtainedFrom: 'Discord Early Supporter Role',
    description: 'Custom tinted space helmet featuring radar antennas styled like bunny ears.',
  },
  {
    id: 'p-03',
    name: 'Hydroponic Sprout Pod',
    game: 'Petit Planet',
    category: 'furniture',
    categoryLabel: 'Furniture',
    rarity: 'Common',
    icon: '🌱',
    obtainedFrom: 'Starter Hab Unit Blueprint',
    description: 'Self-watering modular sprout cabinet for cultivating fresh cosmic herbs in space.',
  },
  {
    id: 'p-04',
    name: 'Oxygen Bubble Dome',
    game: 'Petit Planet',
    category: 'furniture',
    categoryLabel: 'Furniture',
    rarity: 'Rare',
    icon: '🫧',
    obtainedFrom: 'Planetary Science Lab',
    description: 'Transparent bio-dome lounge with panoramic views of neighboring orbiting moons.',
  },
  {
    id: 'p-05',
    name: 'Solar Crystal Lantern',
    game: 'Petit Planet',
    category: 'outdoor',
    categoryLabel: 'Outdoor',
    rarity: 'Rare',
    icon: '🏮',
    obtainedFrom: 'Asteroid Field Mining',
    description: 'Charges during solar flare passes to cast soft warm amber illumination over surface camps.',
  },
  {
    id: 'p-06',
    name: 'Gravity Hammock',
    game: 'Petit Planet',
    category: 'outdoor',
    categoryLabel: 'Outdoor',
    rarity: 'Common',
    icon: '🪐',
    obtainedFrom: 'Outpost Fabricator',
    description: 'Suspended microgravity lounger perfect for stargazing while drifting above dust clouds.',
  },
  {
    id: 'p-07',
    name: 'Stardust Compass',
    game: 'Petit Planet',
    category: 'special',
    categoryLabel: 'Special',
    rarity: 'Legendary',
    icon: '🧭',
    obtainedFrom: 'Comet Dust Collector Mission',
    description: 'Ancient magnetic relic pointing to undiscovered hidden space stations and wrecks.',
  },

  // --- Loftia Items ---
  {
    id: 'l-01',
    name: 'Upcycled Denim Overalls',
    game: 'Loftia',
    category: 'outfits',
    categoryLabel: 'Outfits',
    rarity: 'Common',
    icon: '👖',
    obtainedFrom: 'Community Thrift Co-op',
    description: 'Repurposed denim with hand-embroidered sprout patches and deep gardening tool pockets.',
  },
  {
    id: 'l-02',
    name: 'Solar Knit Beanie',
    game: 'Loftia',
    category: 'outfits',
    categoryLabel: 'Outfits',
    rarity: 'Rare',
    icon: '🧶',
    obtainedFrom: 'Rooftop Craft Collective',
    description: 'Handmade organic cotton beanie equipped with microscopic photovoltaic fibers.',
  },
  {
    id: 'l-03',
    name: 'Reclaimed Timber Coffee Bar',
    game: 'Loftia',
    category: 'furniture',
    categoryLabel: 'Furniture',
    rarity: 'Rare',
    icon: '☕',
    obtainedFrom: 'Downtown Salvage Yard',
    description: 'Rustic espresso counter built from salvaged shipping pallets and recycled brass taps.',
  },
  {
    id: 'l-04',
    name: 'Hydroponic Herb Tower',
    game: 'Loftia',
    category: 'furniture',
    categoryLabel: 'Furniture',
    rarity: 'Common',
    icon: '🪴',
    obtainedFrom: 'Vertical Farming Guild',
    description: 'A 6-tier vertical farming tower growing basil, mint, and dwarf strawberries indoors.',
  },
  {
    id: 'l-05',
    name: 'Rooftop Wind Chime Turbine',
    game: 'Loftia',
    category: 'outdoor',
    categoryLabel: 'Outdoor',
    rarity: 'Rare',
    icon: '🎐',
    obtainedFrom: 'Clean Energy Workshop',
    description: 'Generates clean community power while playing melodious soothing tones in the breeze.',
  },
  {
    id: 'l-06',
    name: 'Solar Electric Scooter',
    game: 'Loftia',
    category: 'special',
    categoryLabel: 'Special',
    rarity: 'Legendary',
    icon: '🛴',
    obtainedFrom: 'City Transportation Quest',
    description: 'Whisper-quiet eco-scooter that charges in the sun and navigates sky bridges with ease.',
  },
];

const RARITY_COLORS: Record<string, { bg: string; text: string }> = {
  Common: { bg: '#f3ecda', text: '#7a5638' },
  Rare: { bg: '#e0f2fe', text: '#0284c7' },
  Legendary: { bg: '#fef3c7', text: '#d97706' },
  Event: { bg: '#fbd5e1', text: '#b23a6b' },
};

export const CollectionPage: React.FC = () => {
  const { selectedGame, setSelectedGame } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // User-collected item tracking via localStorage
  const [collectedIds, setCollectedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_collected_items_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleCollected = (id: string) => {
    setCollectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem('bunny_collected_items_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filter items by current game
  const gameItems = useMemo(() => {
    return GAME_COLLECTION_DATA.filter((item) => item.game === selectedGame);
  }, [selectedGame]);

  // Filter by category and search query
  const filteredItems = useMemo(() => {
    return gameItems.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.obtainedFrom.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [gameItems, selectedCategory, searchQuery]);

  // Collection progress for current game
  const collectedInGame = gameItems.filter((item) => collectedIds.includes(item.id)).length;
  const progressPercent = gameItems.length > 0 ? Math.round((collectedInGame / gameItems.length) * 100) : 0;

  const currentGameOption = GAME_OPTIONS.find((g) => g.name === selectedGame) || GAME_OPTIONS[0];

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 py-6 space-y-6 antialiased selection:bg-[#b23a6b] selection:text-white">
      {/* 1. Top Header Banner with Game Switcher Dropdown & Dynamic Description */}
      <section
        className="card-v2 p-5 sm:p-6"
        style={{
          background: 'linear-gradient(120deg, #fbd5e1, #f6c9b8)',
          borderRadius: '26px',
          border: '2px solid rgba(233, 179, 173, 0.6)',
          boxShadow: '0 6px 20px rgba(178, 58, 107, 0.1)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl select-none" aria-hidden="true">
                🎀
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#b23a6b] m-0">
                Collection Catalog
              </h1>

              {/* Game Selector Dropdown on Collection Page */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e9b3ad',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontFamily: 'Fredoka, sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#b23a6b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(178, 58, 107, 0.1)',
                  }}
                >
                  <span>{currentGameOption.icon}</span>
                  <span>{selectedGame}</span>
                  <span style={{ fontSize: '10px' }}>▼</span>
                </button>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e9b3ad',
                      boxShadow: '0 8px 24px rgba(107, 79, 53, 0.15)',
                      zIndex: 50,
                      padding: '6px',
                      minWidth: '170px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    {GAME_OPTIONS.map((g) => (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => {
                          setSelectedGame(g.name);
                          setIsDropdownOpen(false);
                          setSelectedCategory('all');
                        }}
                        style={{
                          background: selectedGame === g.name ? '#fbd5e1' : 'transparent',
                          color: selectedGame === g.name ? '#b23a6b' : '#6b4f35',
                          border: 0,
                          borderRadius: '10px',
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontFamily: 'Fredoka, sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                        }}
                      >
                        <span>{g.icon}</span>
                        <span>{g.name}</span>
                        {selectedGame === g.name && (
                          <span style={{ marginLeft: 'auto', fontWeight: 700 }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Description based on Selected Game */}
            <p
              style={{
                margin: '6px 0 0',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                color: '#6b4f35',
                maxWidth: '680px',
                lineHeight: 1.55,
              }}
            >
              {GAME_DESCRIPTIONS[selectedGame]}
            </p>
          </div>

          {/* Collection Progress Pill */}
          <div
            style={{
              background: '#f3ecda',
              borderRadius: '18px',
              border: '1.5px solid rgba(233, 179, 173, 0.6)',
              padding: '10px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '150px',
            }}
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#6b4f35] font-sans">
              <span>{currentGameOption.icon} Collected</span>
              <span className="font-mono text-[#b23a6b]">
                {collectedInGame} / {gameItems.length}
              </span>
            </div>
            <div className="h-2 w-full bg-[#fbd5e1] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b23a6b] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-[#8c6f55] font-mono text-right">
              {progressPercent}% Complete
            </span>
          </div>
        </div>
      </section>

      {/* 2. Controls & Search Filter Bar */}
      <section className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9b3ad]/40 pb-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'all', label: 'All Items' },
            { key: 'outfits', label: 'Outfits 👗' },
            { key: 'furniture', label: 'Furniture 🪑' },
            { key: 'outdoor', label: 'Outdoor 🌿' },
            { key: 'special', label: 'Special ⭐' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`tab-v2 text-xs py-1 px-3 min-h-[32px] ${
                selectedCategory === cat.key ? 'on' : ''
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, lore..."
            style={{
              width: '100%',
              borderRadius: '999px',
              border: '1.5px solid #e9b3ad',
              background: '#ffffff',
              padding: '6px 14px 6px 32px',
              fontSize: '12px',
              fontFamily: 'Nunito, sans-serif',
              color: '#6b4f35',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '11px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '12px',
              userSelect: 'none',
            }}
          >
            🔍
          </span>
        </div>
      </section>

      {/* 3. Items Catalog Grid */}
      {filteredItems.length === 0 ? (
        <div
          style={{
            background: '#f3ecda',
            borderRadius: '24px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '2px dashed #e9b3ad',
          }}
        >
          <span style={{ fontSize: '36px' }}>🧺</span>
          <p
            style={{
              margin: '8px 0 0',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '16px',
              color: '#7a5638',
              fontWeight: 600,
            }}
          >
            No items found matching your filter in {selectedGame}.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredItems.map((item) => {
            const isCollected = collectedIds.includes(item.id);
            const rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.Common;

            return (
              <div
                key={item.id}
                className="card-v2"
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: isCollected
                    ? '2px solid #b23a6b'
                    : '1.5px solid rgba(233, 179, 173, 0.6)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: isCollected
                    ? '0 4px 16px rgba(178, 58, 107, 0.15)'
                    : '0 3px 10px rgba(107, 79, 53, 0.06)',
                  position: 'relative',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div>
                  {/* Top Bar: Icon + Title + Rarity Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '14px',
                          background: '#f3ecda',
                          border: '1px solid #e9b3ad',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontFamily: 'Fredoka, sans-serif',
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#6b4f35',
                            lineHeight: 1.25,
                          }}
                        >
                          {item.name}
                        </h3>
                        <span
                          style={{
                            fontFamily: 'Nunito, sans-serif',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#8c6f55',
                          }}
                        >
                          {item.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Rarity Pill */}
                    <span
                      style={{
                        background: rarityStyle.bg,
                        color: rarityStyle.text,
                        fontFamily: 'Fredoka, sans-serif',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        flexShrink: 0,
                      }}
                    >
                      {item.rarity}
                    </span>
                  </div>

                  {/* Description / Lore */}
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '12px',
                      color: '#6b4f35',
                      lineHeight: 1.45,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Bottom Source & Collect Toggle */}
                <div
                  style={{
                    paddingTop: '8px',
                    borderTop: '1px dashed rgba(233, 179, 173, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '10px',
                      color: '#8c6f55',
                      fontWeight: 600,
                      maxWidth: '65%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.obtainedFrom}
                  >
                    📍 {item.obtainedFrom}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleCollected(item.id)}
                    style={{
                      background: isCollected ? '#b23a6b' : '#f3ecda',
                      color: isCollected ? '#ffffff' : '#b23a6b',
                      border: '1px solid #e9b3ad',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      fontFamily: 'Fredoka, sans-serif',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <span>{isCollected ? '✓ Owned' : '+ Collect'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default CollectionPage;
