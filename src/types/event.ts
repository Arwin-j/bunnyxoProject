export type EventPlatform = 'discord' | 'heartopia' | 'petit_planet' | 'loftia';
export type EventVisibility = 'draft' | 'published';
export type EventSource = 'manual' | 'discord';

export interface HeartopiaEvent {
  id: string;
  title: string;
  platform: EventPlatform;
  location: string;
  starts_at: string; // ISO string in UTC
  ends_at: string;   // ISO string in UTC
  details: string;
  prize: string | null;
  image_url?: string | null;
  visibility: EventVisibility;
  source: EventSource;
  updated_at: string; // ISO string in UTC
}

export type EventStatus = 'live' | 'upcoming' | 'ended';

export interface EventPlatformMeta {
  emoji: string;
  label: string;
  bgClass: string;
  defaultLocations: string[];
}

export const PLATFORM_CONFIG: Record<EventPlatform, EventPlatformMeta> = {
  heartopia: {
    emoji: '🌸',
    label: 'Heartopia',
    bgClass: 'bg-accent',
    defaultLocations: [
      'Flower Field',
      'Forest',
      'Onsen Mountain',
      'Central Area',
      'Fishing Village',
      'Blossom Meadow',
      'Blueberry Hills',
    ],
  },
  discord: {
    emoji: '💬',
    label: 'Discord',
    bgClass: 'bg-lilac',
    defaultLocations: [
      '#events',
      'Stage channel',
      'Voice lounge',
      '#cozy-cinema',
      '#general',
    ],
  },
  petit_planet: {
    emoji: '🪐',
    label: 'Petit Planet',
    bgClass: 'bg-sky',
    defaultLocations: [
      'Moonpetal Plaza',
      'Starfall Beach',
      'Floating Observatory',
    ],
  },
  loftia: {
    emoji: '✨',
    label: 'Loftia',
    bgClass: 'bg-butter',
    defaultLocations: [
      'Community Loft #3',
      'Hydroponic Rooftop',
      'Central Plaza',
    ],
  },
};

export const DEFAULT_PLATFORM_IMAGES: Record<EventPlatform, string> = {
  heartopia: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=600&auto=format&fit=crop&q=80',
  discord: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  petit_planet: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop&q=80',
  loftia: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
};

export function getEventImage(event: { platform: EventPlatform; image_url?: string | null }): string {
  if (event.image_url && event.image_url.trim()) {
    return event.image_url.trim();
  }
  return DEFAULT_PLATFORM_IMAGES[event.platform] || DEFAULT_PLATFORM_IMAGES.heartopia;
}
