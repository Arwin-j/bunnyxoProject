import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 1. Automatic cleanup & storage reset after every test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // Ignore if storage is unavailable
  }
});

// 2. Mock localStorage & sessionStorage fallback if not in jsdom window
const createMemoryStorage = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = String(value);
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
    get length(): number {
      return Object.keys(store).length;
    },
  };
};

if (!window.localStorage || typeof window.localStorage.getItem !== 'function') {
  Object.defineProperty(window, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
  });
}

if (!window.sessionStorage || typeof window.sessionStorage.getItem !== 'function') {
  Object.defineProperty(window, 'sessionStorage', {
    value: createMemoryStorage(),
    configurable: true,
  });
}

// 3. window.matchMedia Polyfill (Required for WelcomePage.tsx:42)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 4. ResizeObserver Polyfill (Required for MapPage.tsx:265 and AdminEditMapsPage.tsx:288)
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

// 5. IntersectionObserver Polyfill
class IntersectionObserverMock {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

// 6. window.scrollTo & window.scroll Polyfills (Required for AdminEditCodesPage.tsx:80)
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});
Object.defineProperty(window, 'scroll', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

// 7. navigator.clipboard Polyfill (Required for HomePage.tsx & RedemptionCodesPage.tsx)
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  });
}

// 8. HTMLCanvasElement getContext Polyfill (Required for Leaflet map containers)
HTMLCanvasElement.prototype.getContext = vi.fn();
