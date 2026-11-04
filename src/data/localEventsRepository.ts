import { HeartopiaEvent } from '../types/event';
import { EventsRepository, ListEventsFilter } from './eventsRepository';
import { getInitialSampleEvents } from './sampleEvents';

export const EVENTS_STORAGE_KEY = 'hh.events.v2';

export class LocalEventsRepository implements EventsRepository {
  private storageKey: string;

  constructor(storageKey: string = EVENTS_STORAGE_KEY) {
    this.storageKey = storageKey;
    this.initSeedIfNeeded();
  }

  private initSeedIfNeeded(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('hh.events.v1');
      const existing = localStorage.getItem(this.storageKey);
      if (existing === null) {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
      }
    } catch (err) {
      console.warn('LocalEventsRepository failed to init storage:', err);
    }
  }

  private readAll(): HeartopiaEvent[] {
    if (typeof window === 'undefined') return [];

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as HeartopiaEvent[];
    } catch (err) {
      console.error('Failed to parse events from localStorage:', err);
      return [];
    }
  }

  private writeAll(events: HeartopiaEvent[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(events));
      // Dispatch storage event so tabs/windows and hooks synchronize
      window.dispatchEvent(new Event('hh:events-updated'));
    } catch (err) {
      console.error('Failed to persist events to localStorage:', err);
      throw new Error('Storage write failed. Quota exceeded or storage unavailable.');
    }
  }

  listSync(filter?: ListEventsFilter): HeartopiaEvent[] {
    const all = this.readAll();
    if (filter?.publishedOnly) {
      return all.filter((ev) => ev.visibility === 'published');
    }
    return all;
  }

  async list(filter?: ListEventsFilter): Promise<HeartopiaEvent[]> {
    return this.listSync(filter);
  }

  async get(id: string): Promise<HeartopiaEvent | null> {
    const all = this.readAll();
    const found = all.find((ev) => ev.id === id);
    return found || null;
  }

  async create(data: Omit<HeartopiaEvent, 'id' | 'updated_at'>): Promise<HeartopiaEvent> {
    const all = this.readAll();
    const newEvent: HeartopiaEvent = {
      ...data,
      id: crypto.randomUUID ? crypto.randomUUID() : `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      updated_at: new Date().toISOString(),
    };

    all.push(newEvent);
    this.writeAll(all);
    return newEvent;
  }

  async update(id: string, data: Partial<Omit<HeartopiaEvent, 'id'>>): Promise<HeartopiaEvent> {
    const all = this.readAll();
    const index = all.findIndex((ev) => ev.id === id);
    if (index === -1) {
      throw new Error(`Event with id "${id}" not found.`);
    }

    const updated: HeartopiaEvent = {
      ...all[index],
      ...data,
      id,
      updated_at: new Date().toISOString(),
    };

    all[index] = updated;
    this.writeAll(all);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const all = this.readAll();
    const filtered = all.filter((ev) => ev.id !== id);
    if (filtered.length === all.length) {
      throw new Error(`Event with id "${id}" not found.`);
    }
    this.writeAll(filtered);
  }
}

// Single instance of the repository exported for app-wide use
export const eventsRepository = new LocalEventsRepository();
