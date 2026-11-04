import { HeartopiaEvent } from '../types/event';
import { EventsRepository, ListEventsFilter } from './eventsRepository';
import { supabase } from '../lib/supabase';
import { LocalEventsRepository } from './localEventsRepository';

/**
 * Races a promise against a timeout in milliseconds.
 * Prevents requests from hanging indefinitely when remote services are unresponsive.
 */
function withTimeout<T>(promise: PromiseLike<T>, ms = 2500): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Supabase request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export class SupabaseEventsRepository implements EventsRepository {
  private fallbackRepo: LocalEventsRepository;

  constructor(fallbackRepo?: LocalEventsRepository) {
    this.fallbackRepo = fallbackRepo || new LocalEventsRepository();
  }

  async list(filter?: ListEventsFilter): Promise<HeartopiaEvent[]> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: true });

      if (filter?.publishedOnly) {
        query = query.eq('visibility', 'published');
      }

      const { data, error } = await withTimeout(query, 2500);
      if (error) {
        console.warn('SupabaseEventsRepository.list error, falling back to local storage:', error.message);
        return this.fallbackRepo.list(filter);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Filter out legacy test event
      const legacyEventIds = new Set(['891f9ff9-75dc-4ba5-978b-e8dd66a18880']);
      const activeEvents = (data as HeartopiaEvent[]).filter(
        (e) => !legacyEventIds.has(e.id)
      );

      return activeEvents;
    } catch (err) {
      console.warn('SupabaseEventsRepository.list network exception, falling back:', err);
      return this.fallbackRepo.list(filter);
    }
  }

  async get(id: string): Promise<HeartopiaEvent | null> {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single(),
        2500
      );

      if (error || !data) {
        return this.fallbackRepo.get(id);
      }

      return data as HeartopiaEvent;
    } catch {
      return this.fallbackRepo.get(id);
    }
  }

  async create(data: Omit<HeartopiaEvent, 'id' | 'updated_at'>): Promise<HeartopiaEvent> {
    const newId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const record: HeartopiaEvent = {
      ...data,
      id: newId,
      updated_at: nowIso,
    };

    try {
      const { error } = await withTimeout(
        supabase.from('events').insert([record]),
        2500
      );
      if (error) {
        console.warn('Supabase create error, saving locally:', error.message);
      }
    } catch (err) {
      console.warn('Supabase create network exception:', err);
    }

    // Keep local storage in sync as a backup
    await this.fallbackRepo.create(data);
    return record;
  }

  async update(id: string, patch: Partial<Omit<HeartopiaEvent, 'id'>>): Promise<HeartopiaEvent> {
    const updated_at = new Date().toISOString();
    const payload = { ...patch, updated_at };

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('events')
          .update(payload)
          .eq('id', id)
          .select()
          .single(),
        2500
      );

      if (error || !data) {
        console.warn('Supabase update error, applying locally:', error?.message);
        return this.fallbackRepo.update(id, patch);
      }

      await this.fallbackRepo.update(id, patch);
      return data as HeartopiaEvent;
    } catch {
      return this.fallbackRepo.update(id, patch);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await withTimeout(
        supabase.from('events').delete().eq('id', id),
        2500
      );
      if (error) {
        console.warn('Supabase delete error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
    await this.fallbackRepo.delete(id);
  }
}

export default SupabaseEventsRepository;
