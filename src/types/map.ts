import islandMapUrl from '../assets/heartopia-island-map.jpg';

export const MAP_IMAGE_URL = islandMapUrl;
export const MAP_SIZE = 3364;

export type GameId = 'heartopia' | 'loftia' | 'petit';
export type HeartopiaMapId = 'island' | 'whalefall';

export interface GameConfig {
  id: GameId;
  name: string;
  icon: string;
  badge?: string;
}

export interface MapConfig {
  id: HeartopiaMapId;
  name: string;
  icon: string;
  badge?: string;
  subtitle: string;
}

export const GAMES: GameConfig[] = [
  { id: 'heartopia', name: 'Heartopia', icon: '🌸' },
  { id: 'loftia', name: 'Loftia', icon: '✨', badge: 'Soon' },
  { id: 'petit', name: 'Petit Planet', icon: '🪐', badge: 'Soon' },
];

export const HEARTOPIA_MAPS: MapConfig[] = [
  {
    id: 'island',
    name: 'Island Map',
    icon: '🏝️',
    subtitle: 'Main island map — explore, filter resources, and inspect custom locations.',
  },
  {
    id: 'whalefall',
    name: 'Whalefall Canyon',
    icon: '🏜️',
    badge: 'Soon',
    subtitle: 'Whalefall Canyon area — map charting in progress.',
  },
];

export interface PinCategory {
  id: string;
  label: string;
  color: string;
  icon: string;
  image?: string | null;
  size?: number;
}

export const PIN_CATEGORIES: Record<string, PinCategory> = {
  landmark: { id: 'landmark', label: 'Landmarks', color: '#c3a468', icon: '★', size: 28 },
  region: { id: 'region', label: 'Regions', color: '#6b8f5e', icon: '◆', size: 28 },
  chest: { id: 'chest', label: 'Chests', color: '#e2932a', icon: '🎁', size: 26 },
};

export interface PinTagDef {
  key: string;
  label: string;
  icon: string;
}

export const PIN_TAGS: PinTagDef[] = [
  { key: 'sunny', label: 'Sunny', icon: '☀️' },
  { key: 'rainy', label: 'Rainy', icon: '🌧️' },
  { key: 'rainbow', label: 'Rainbow', icon: '🌈' },
  { key: 'night', label: 'Night', icon: '🌙' },
  { key: 'early-morning', label: 'Early Morning', icon: '🌅' },
  { key: 'morning', label: 'Morning', icon: '🌄' },
  { key: 'evening', label: 'Evening', icon: '🌆' },
];

export interface InteractivePin {
  id: string;
  name: string;
  cat: string;
  subcat?: string;
  owned?: boolean;
  tags?: string[];
  desc?: string;
  image?: string | null;
  x: number;
  y: number;
  game?: GameId;
  mapId?: HeartopiaMapId;
  createdAt?: string;
}

/**
 * Compresses an image File or image URL using an HTML5 Canvas,
 * reducing its dimensions to match the pin marker size (e.g. max 320px)
 * and compressing as JPEG at 0.82 quality.
 */
export async function compressImageToPinSize(
  input: File | string,
  maxDim: number = 320,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (typeof input === 'string') return resolve(input);
          return reject(new Error('Canvas context not available'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        if (typeof input === 'string') {
          resolve(input);
        } else {
          reject(err);
        }
      }
    };

    img.onerror = () => {
      if (typeof input === 'string') {
        resolve(input);
      } else {
        reject(new Error('Could not load image'));
      }
    };

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(input);
    }
  });
}

// Normalized to 3364x3364 map space (offset by 394px ocean border from 2576 inner island)
const OFFSET = 394;
export const DEFAULT_ISLAND_PINS: InteractivePin[] = [
  {
    id: 'region_onsen',
    name: 'Onsen Mountain',
    cat: 'region',
    x: 1125.6 + OFFSET,
    y: 384.8 + OFFSET,
    desc: 'Volcanic highlands with hot spring pools, north of the main island.',
    tags: ['sunny', 'morning'],
    game: 'heartopia',
    mapId: 'island',
  },
  {
    id: 'region_central',
    name: 'Central Area',
    cat: 'region',
    x: 1154.1 + OFFSET,
    y: 1018.9 + OFFSET,
    desc: 'The walled town at the heart of the island.',
    tags: ['sunny'],
    game: 'heartopia',
    mapId: 'island',
  },
  {
    id: 'region_suburbs',
    name: 'Suburbs',
    cat: 'region',
    x: 1125.6 + OFFSET,
    y: 1325.2 + OFFSET,
    desc: 'Residential ring surrounding the Central Area.',
    tags: ['evening'],
    game: 'heartopia',
    mapId: 'island',
  },
  {
    id: 'region_flower',
    name: 'Flower Field',
    cat: 'region',
    x: 427.5 + OFFSET,
    y: 1161.4 + OFFSET,
    desc: 'Open blooming fields on the western side of the island.',
    tags: ['sunny', 'rainbow'],
    game: 'heartopia',
    mapId: 'island',
  },
  {
    id: 'region_forest',
    name: 'Forest',
    cat: 'region',
    x: 1852.3 + OFFSET,
    y: 1125.8 + OFFSET,
    desc: 'Wooded region on the eastern side of the island.',
    tags: ['night'],
    game: 'heartopia',
    mapId: 'island',
  },
  {
    id: 'region_fishing',
    name: 'Fishing Village',
    cat: 'region',
    x: 1068.6 + OFFSET,
    y: 1553.2 + OFFSET,
    desc: 'Coastal settlement to the south.',
    tags: ['morning', 'rainy'],
    game: 'heartopia',
    mapId: 'island',
  },
  {
    id: 'plot_01',
    name: 'Plot 01',
    cat: 'landmark',
    x: 769.4 + OFFSET,
    y: 1460.6 + OFFSET,
    desc: 'Numbered plot near Fishing Village.',
    game: 'heartopia',
    mapId: 'island',
  },
  {
    id: 'plot_02',
    name: 'Plot 02',
    cat: 'landmark',
    x: 683.9 + OFFSET,
    y: 1246.9 + OFFSET,
    desc: 'Numbered plot in the southwest ring.',
    game: 'heartopia',
    mapId: 'island',
  },
  {
    id: 'plot_05',
    name: 'Plot 05',
    cat: 'landmark',
    x: 854.9 + OFFSET,
    y: 584.2 + OFFSET,
    desc: 'Numbered plot at northern edge, near Onsen Mountain.',
    game: 'heartopia',
    mapId: 'island',
  },
  {
    id: 'chest_01',
    name: 'Hidden Island Chest',
    cat: 'chest',
    subcat: 'Rare',
    x: 1185.9 + OFFSET,
    y: 1009.2 + OFFSET,
    desc: 'Treasure chest spawn point in the suburban grove.',
    tags: ['rainy'],
    game: 'heartopia',
    mapId: 'island',
  },
];
