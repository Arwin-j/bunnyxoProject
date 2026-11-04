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

export const DEFAULT_ISLAND_PINS: InteractivePin[] = [];
