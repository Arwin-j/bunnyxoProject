import { HeartopiaEvent } from '../types/event';
import { EventsRepository, ListEventsFilter } from './eventsRepository';
import { supabase } from '../lib/supabase';
import { LocalEventsRepository } from './localEventsRepository';

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

      const { data, error } = await query;
      if (error) {
        console.warn('SupabaseEventsRepository.list error, falling back to local storage:', error.message);
        return this.fallbackRepo.list(filter);
      }

      if (!data || data.length === 0) {
        // If Supabase table is empty, seed with fallback events
        const localList = await this.fallbackRepo.list(filter);
        return localList;
      }

      // Check if Supabase returned any ongoing or upcoming events
      const now = Date.now();
      const hasActiveOrUpcoming = data.some((e) => new Date(e.ends_at).getTime() > now);

      if (!hasActiveOrUpcoming) {
        // Supabase only contains past/expired events; provide fresh local sample events
        // so the home and events calendar are never empty
        const localList = await this.fallbackRepo.list(filter);
        // Combine any unique custom events with fresh active sample events
        const localIds = new Set(localList.map((e) => e.id));
        const customPastEvents = data.filter((e) => !localIds.has(e.id));
        return [...localList, ...customPastEvents] as HeartopiaEvent[];
      }

      return data as HeartopiaEvent[];
    } catch (err) {
      console.warn('SupabaseEventsRepository.list network exception, falling back:', err);
      return this.fallbackRepo.list(filter);
    }
  }

  async get(id: string): Promise<HeartopiaEvent | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

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
      const { error } = await supabase.from('events').insert([record]);
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
      const { data, error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

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
      const { error } = await supabase.from('events').delete().eq('id', id);
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
