-- ==============================================================================
-- BUNNY HUB / HEARTOPIA DATABASE SCHEMA FOR SUPABASE
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- A. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('heartopia', 'discord', 'petit_planet', 'loftia')),
  location TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  details TEXT DEFAULT '',
  prize TEXT,
  image_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'published' CHECK (visibility IN ('draft', 'published')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'discord')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. REDEMPTION CODES TABLE
CREATE TABLE IF NOT EXISTS public.redemption_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  rewards TEXT DEFAULT '',
  expiry TEXT NOT NULL,
  is_history BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. FEED POSTS TABLE (Instagram Style Daily Spotlight & Grid)
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id TEXT PRIMARY KEY,
  media_type TEXT NOT NULL CHECK (media_type IN ('VIDEO', 'IMAGE', 'CAROUSEL_ALBUM')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  permalink TEXT NOT NULL,
  caption TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author TEXT DEFAULT 'Bunny Hub Official',
  author_handle TEXT DEFAULT '@bunnyhub.heartopia',
  author_avatar TEXT DEFAULT '🐰',
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. MAP PINS TABLE
CREATE TABLE IF NOT EXISTS public.map_pins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_pins ENABLE ROW LEVEL SECURITY;

-- 1) Public Read Access (Anyone can view events, codes, feed, and pins)
CREATE POLICY "Public users can read events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Public users can read redemption codes" ON public.redemption_codes
  FOR SELECT USING (true);

CREATE POLICY "Public users can read feed posts" ON public.feed_posts
  FOR SELECT USING (true);

CREATE POLICY "Public users can read map pins" ON public.map_pins
  FOR SELECT USING (true);

-- 2) Admin Write Access (Only authenticated users can insert, update, or delete)
CREATE POLICY "Admins can insert events" ON public.events
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update events" ON public.events
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can insert codes" ON public.redemption_codes
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update codes" ON public.redemption_codes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete codes" ON public.redemption_codes
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can insert feed posts" ON public.feed_posts
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update feed posts" ON public.feed_posts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete feed posts" ON public.feed_posts
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can insert map pins" ON public.map_pins
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update map pins" ON public.map_pins
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete map pins" ON public.map_pins
  FOR DELETE TO authenticated USING (true);

-- ==============================================================================
-- 4. STORAGE BUCKETS CONFIGURATION
-- ==============================================================================

-- Create buckets for uploads (if they do not already exist)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('event-banners', 'event-banners', true),
  ('map-media', 'map-media', true),
  ('feed-media', 'feed-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Anyone can view images/media
CREATE POLICY "Public can view event banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-banners');

CREATE POLICY "Public can view map media" ON storage.objects
  FOR SELECT USING (bucket_id = 'map-media');

CREATE POLICY "Public can view feed media" ON storage.objects
  FOR SELECT USING (bucket_id = 'feed-media');

-- Storage RLS: Authenticated admins can upload media
CREATE POLICY "Admins can upload event banners" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-banners');

CREATE POLICY "Admins can upload map media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'map-media');

CREATE POLICY "Admins can upload feed media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'feed-media');

-- ==============================================================================
-- 5. INITIAL SEED DATA
-- ==============================================================================

-- Initial Events
INSERT INTO public.events (id, title, platform, location, starts_at, ends_at, details, prize, image_url, visibility, source)
VALUES
  ('1e8a937a-49cf-4ef8-a5f1-01b3ad852e01', 'Cozy Friday Picnic', 'heartopia', 'Blossom Meadow', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'Bring snacks, wear your comfiest outfit and hang out by the lake.', 'Strawberry Basket Decor', 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=600&auto=format&fit=crop&q=80', 'published', 'manual'),
  ('1f9b848b-59df-4fa2-b6f2-02c4be963f02', 'Lofi Voice & Sketch Hangout', 'discord', 'Voice lounge', NOW() - INTERVAL '90 minutes', NOW() + INTERVAL '3.5 hours', 'Chilling in the voice lounge listening to relaxing lofi beats, sketching cozy art, and hanging out with the community.', 'Artist Bunny Role', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 'published', 'manual'),
  ('1d7a737c-68ef-4eb3-c7e3-03d5cf854e03', 'Floating Garden Bloom Fest', 'petit_planet', 'Floating Observatory', NOW() - INTERVAL '45 minutes', NOW() + INTERVAL '2.5 hours', 'Special flower bloom festival on the floating observatory! Harvest glowing petals with fellow planet keepers.', 'Celestial Petal Crown', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop&q=80', 'published', 'manual'),
  ('2d7c826b-38be-4de7-94e0-f0a2bc741d02', 'Discord Movie Night', 'discord', '#cozy-cinema', NOW() + INTERVAL '27 hours', NOW() + INTERVAL '30 hours', 'Watching a Ghibli classic together with voice chat.', 'Popcorn Emote Pack', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 'published', 'manual')
ON CONFLICT (id) DO NOTHING;

-- Initial Redemption Codes
INSERT INTO public.redemption_codes (id, code, title, rewards, expiry, is_history)
VALUES
  ('code-heartopia2026', 'HEARTOPIA2026', 'Heartopia Welcome Gift', '150x Wishing Stars, 10,000x Gold & 5x Tulip Seeds', 'Dec 31, 2026', false),
  ('code-cozybunny', 'COZYBUNNY', 'Bunny Hub Cozy Outfit Pack', 'Exclusive Bunny Beret & Pastel Floral Apron', 'Nov 30, 2026', false),
  ('code-springtulip', 'SPRINGTULIP', 'Tulip Garden Mystery Box', '30x Rare Pink Tulip Bulbs & Cozy Watering Can', 'Nov 15, 2026', false),
  ('code-heartbeach', 'HEARTBEACH', 'Heart Beach Vacation Supplies', 'Shell Collector Basket & Tropical Sunhat', 'Dec 15, 2026', false),
  ('code-starlight', 'STARLIGHTGIFT', 'Starlight Wishing Bundle', '200x Wishing Stars & Constellation Nightlamp', 'Dec 31, 2026', false),
  ('code-islandcozy', 'ISLANDCOZY', 'Permanent Explorer Kit', '50x Energy Juices & Campfire Furniture Decor', 'Permanent (No Expiration)', false),
  ('code-autumnleaves', 'AUTUMNLEAVES', 'Autumn Harvest Picnic Gift', '50x Maple Leaves & Harvest Basket Decor', 'Oct 15, 2026', true),
  ('code-summerbreeze', 'SUMMERBREEZE', 'Summer Beach Festival Pack', '100x Wishing Stars & Coconut Drink Hat', 'Sep 30, 2026', true),
  ('code-bunnyfriends', 'BUNNYFRIENDS', 'Closed Beta Pioneer Bundle', 'Exclusive Beta Tester Badge & Cozy Tea Table', 'Aug 31, 2026', true),
  ('code-heartopia100k', 'HEARTOPIA100K', '100K Pre-Registration Milestone', 'Gold Explorer Frame & 5000x Gold', 'Jul 15, 2026', true)
ON CONFLICT (id) DO NOTHING;
