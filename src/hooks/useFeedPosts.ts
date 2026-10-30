import { useState, useEffect, useCallback } from 'react';

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
  likes?: number;
  comments?: number;
  tags: string[];
}

export const INSTAGRAM_ACCESS_TOKEN =
  'IGAAbNK7hO6rlBZAFptYUVlYTcwQ090NWQ3RFZAIU3Y5NWhWZAG5PM01qSzBpMmdlQmZAiRk1CdHVkQXhZAQzlURGRQVmNzZA1poTEI1RFdRd3FBSzBMSHlkNk5UTWRuZAF91cHp1WEVtM0gybDhSODE3VVVWUWdPQW00eUtpNGR3TlFvMAZDZD';

export const INSTAGRAM_API_URL = `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,media_type,thumbnail_url&access_token=${INSTAGRAM_ACCESS_TOKEN}`;

const FEED_STORAGE_KEY = 'hh.feed_posts.v2';
const FEED_CACHE_TIMESTAMP_KEY = 'hh.feed_posts_timestamp.v2';

// Fallback cozy posts if offline or token expired
const FALLBACK_FEED_POSTS: FeedPost[] = [
  {
    id: 'fallback-01',
    media_type: 'VIDEO',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    permalink: 'https://www.instagram.com/hey.bunnyxo',
    caption: '🌸 24H Spotlight: Exploring the new Spring Tulip gardens, cozy café terrace builds, and secret cliffside sunset viewpoints in Heartopia! 🐰🌷✨',
    timestamp: new Date().toISOString(),
    author: 'Hey Bunny XO',
    author_handle: '@hey.bunnyxo',
    author_avatar: '🐰',
    likes: 1420,
    comments: 86,
    tags: ['Heartopia', 'CozyGaming', 'IslandTour', 'Giveaway'],
  },
];

// Helper to extract hashtags from Instagram caption text
function extractHashtags(caption?: string): string[] {
  if (!caption) return ['Heartopia', 'CozyGame', 'BunnySquad'];
  const matches = caption.match(/#[a-zA-Z0-9_.]+/g);
  if (!matches || matches.length === 0) {
    return ['Heartopia', 'CozyGame', 'BunnySquad'];
  }
  return matches
    .map((tag) => tag.replace(/^#/, ''))
    .filter((t) => t.length > 1)
    .slice(0, 5);
}

// Map raw Instagram Graph API item to FeedPost interface
interface InstagramRawItem {
  id: string;
  media_type: 'VIDEO' | 'IMAGE' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp?: string;
}

function mapInstagramItemToFeedPost(item: InstagramRawItem, index: number): FeedPost {
  const mediaUrl = item.media_url || item.thumbnail_url || '';
  const thumbnailUrl = item.thumbnail_url || (item.media_type === 'IMAGE' ? item.media_url : undefined);
  const caption = item.caption || 'Heartopia community post from @hey.bunnyxo ✨';
  const tags = extractHashtags(caption);

  return {
    id: item.id,
    media_type: item.media_type,
    media_url: mediaUrl,
    thumbnail_url: thumbnailUrl,
    permalink: item.permalink || 'https://www.instagram.com/hey.bunnyxo',
    caption,
    timestamp: item.timestamp || new Date().toISOString(),
    author: 'Hey Bunny XO',
    author_handle: '@hey.bunnyxo',
    author_avatar: '🐰',
    likes: 420 + ((index * 83) % 950),
    comments: 24 + ((index * 17) % 65),
    tags,
  };
}

export const useFeedPosts = () => {
  const [posts, setPosts] = useState<FeedPost[]>(() => {
    if (typeof window === 'undefined') return FALLBACK_FEED_POSTS;
    try {
      const cached = localStorage.getItem(FEED_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return FALLBACK_FEED_POSTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    const ts = localStorage.getItem(FEED_CACHE_TIMESTAMP_KEY);
    return ts ? new Date(ts) : null;
  });

  // Fetch live Instagram media from Graph API
  const fetchLiveInstagramFeed = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(INSTAGRAM_API_URL);

      if (!response.ok) {
        throw new Error(`Instagram API responded with status ${response.status}`);
      }

      const json = await response.json();

      if (!json || !Array.isArray(json.data) || json.data.length === 0) {
        throw new Error('No Instagram media items returned in response');
      }

      const livePosts: FeedPost[] = json.data.map((item: InstagramRawItem, idx: number) =>
        mapInstagramItemToFeedPost(item, idx)
      );

      setPosts(livePosts);
      setIsLive(true);
      const now = new Date();
      setLastFetched(now);

      try {
        localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(livePosts));
        localStorage.setItem(FEED_CACHE_TIMESTAMP_KEY, now.toISOString());
      } catch {
        // ignore localStorage quota error
      }
    } catch (err: unknown) {
      console.warn('Failed to fetch live Instagram feed, using cached/fallback posts:', err);
      const msg = err instanceof Error ? err.message : 'Could not fetch live Instagram feed';
      setError(msg);
      // If we already have posts in state or localStorage, keep them
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount: fetch fresh live posts
  useEffect(() => {
    fetchLiveInstagramFeed();
  }, [fetchLiveInstagramFeed]);

  // Index 0 is the featured top post
  const featuredPost = posts[0] || null;

  // Elements 1 through N form the community grid
  const gridPosts = posts.slice(1);

  return {
    posts,
    featuredPost,
    gridPosts,
    isLoading,
    isLive,
    error,
    lastFetched,
    refreshFeed: () => fetchLiveInstagramFeed(true),
  };
};

export default useFeedPosts;
