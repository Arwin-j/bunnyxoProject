import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface FeedPost {
  id: string;
  media_type: 'VIDEO' | 'IMAGE' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption: string;
  timestamp: string; // ISO 8601 string
  author: string;
  author_handle: string;
  author_avatar?: string;
  likes: number;
  comments: number;
  tags: string[];
}

// Generate an ISO timestamp relative to current time so the 24h timer is active
const getRecentTimestamp = (hoursAgo: number): string => {
  return new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
};

export const DEFAULT_FEED_POSTS: FeedPost[] = [
  // 1. Top Featured Daily Spotlight (Index 0) - Video with 24h timer (e.g. posted 5.5 hours ago)
  {
    id: 'post-daily-spotlight-1',
    media_type: 'VIDEO',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    permalink: 'https://www.instagram.com',
    caption: '🌸 24H Spotlight: Exploring the new Spring Tulip gardens, cozy café terrace builds, and secret cliffside sunset viewpoints in Heartopia! What is your favorite spot on the island? Let us know in the comments! 🐰🌷✨',
    timestamp: getRecentTimestamp(5.5), // ~18.5 hours remaining
    author: 'Bunny Hub Official',
    author_handle: '@bunnyhub.heartopia',
    author_avatar: '🐰',
    likes: 1420,
    comments: 86,
    tags: ['Heartopia', 'CozyGaming', 'IslandTour', 'SpringUpdate'],
  },

  // 2. Posts 1 through N (3-Column Grid)
  {
    id: 'post-cottage-decor',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://www.instagram.com',
    caption: '🌿 Cozy attic bedroom inspo! Added pastel pink curtains, wooden bookshelves, and plush bunny cushions. Would you stay here? ☕📖',
    timestamp: getRecentTimestamp(28),
    author: 'Bunny Hub Official',
    author_handle: '@bunnyhub.heartopia',
    author_avatar: '🐰',
    likes: 892,
    comments: 42,
    tags: ['HomeDecor', 'HeartopiaHome', 'PastelAesthetic'],
  },
  {
    id: 'post-tulip-bakery',
    media_type: 'VIDEO',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://www.instagram.com',
    caption: '🥐 Fresh strawberry tarts & matcha latte morning at the town bakery! Step-by-step recipe unlock guide linked in bio. 🍓🍵',
    timestamp: getRecentTimestamp(45),
    author: 'Bunny Hub Official',
    author_handle: '@bunnyhub.heartopia',
    author_avatar: '🐰',
    likes: 1105,
    comments: 53,
    tags: ['CozyCooking', 'BakingGuide', 'HeartopiaFood'],
  },
  {
    id: 'post-fashion-ootd',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://www.instagram.com',
    caption: '👗 OOTD: Sweet Tulip Beret paired with oversized knit cardigan & strawberry milk socks! Which color palette should we style next? 🎀',
    timestamp: getRecentTimestamp(62),
    author: 'Bunny Hub Official',
    author_handle: '@bunnyhub.heartopia',
    author_avatar: '🐰',
    likes: 954,
    comments: 61,
    tags: ['HeartopiaOOTD', 'CuteOutfits', 'CozyFashion'],
  },
  {
    id: 'post-fishing-secret',
    media_type: 'VIDEO',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://www.instagram.com',
    caption: '🎣 Secret fishing cove near Heart Beach lighthouse! Rain weather gives a +40% chance for Rainbow Trout & Golden Starfish. 🌊✨',
    timestamp: getRecentTimestamp(78),
    author: 'Bunny Hub Official',
    author_handle: '@bunnyhub.heartopia',
    author_avatar: '🐰',
    likes: 1240,
    comments: 77,
    tags: ['FishingTips', 'SecretSpots', 'HeartopiaGuide'],
  },
  {
    id: 'post-sunset-gathering',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://www.instagram.com',
    caption: '🌅 Sunset fireworks festival with the guild! Thanks to everyone who joined our weekend picnic on the hill. See you next Saturday! 🎆🧺',
    timestamp: getRecentTimestamp(96),
    author: 'Bunny Hub Official',
    author_handle: '@bunnyhub.heartopia',
    author_avatar: '🐰',
    likes: 1530,
    comments: 114,
    tags: ['GuildNight', 'Fireworks', 'CommunityMoments'],
  },
  {
    id: 'post-garden-harvest',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://www.instagram.com',
    caption: '🧺 5-Star Botanical Greenhouse showcase! Giant pumpkins, glowing lavender, and rare rainbow roses are finally in bloom! 🌹🎃',
    timestamp: getRecentTimestamp(118),
    author: 'Bunny Hub Official',
    author_handle: '@bunnyhub.heartopia',
    author_avatar: '🐰',
    likes: 880,
    comments: 38,
    tags: ['GreenhouseTour', 'GardeningMastery', 'Flowers'],
  },
];

const FEED_STORAGE_KEY = 'hh.feed_posts.v1';

export const useFeedPosts = () => {
  const [posts, setPosts] = useState<FeedPost[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_FEED_POSTS;
    try {
      const raw = localStorage.getItem(FEED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_FEED_POSTS;
  });

  // Fetch from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let mounted = true;
    supabase
      .from('feed_posts')
      .select('*')
      .order('timestamp', { ascending: false })
      .then(({ data, error }) => {
        if (!mounted || error || !data || data.length === 0) return;
        setPosts(data as FeedPost[]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // ignore
    }
  }, [posts]);

  // Index 0 is the featured top post
  const featuredPost = posts[0] || null;

  // Elements 1 through N form the 3-column grid
  const gridPosts = posts.slice(1);

  const resetToDefault = () => {
    // Re-fresh timestamps so the countdown timer remains active
    const refreshed = DEFAULT_FEED_POSTS.map((p, idx) => ({
      ...p,
      timestamp: getRecentTimestamp(idx === 0 ? 5.5 : 20 + idx * 15),
    }));
    setPosts(refreshed);
    localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(refreshed));
  };

  return {
    posts,
    featuredPost,
    gridPosts,
    setPosts,
    resetToDefault,
  };
};

export default useFeedPosts;
