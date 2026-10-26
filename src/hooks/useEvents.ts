import { useState, useEffect, useCallback } from 'react';
import { HeartopiaEvent } from '../types/event';
import { eventsRepository, ListEventsFilter } from '../data';

export function useEvents(filter?: ListEventsFilter) {
  const [events, setEvents] = useState<HeartopiaEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await eventsRepository.list(filter);
      setEvents(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [filter?.publishedOnly]);

  useEffect(() => {
    fetchEvents();

    const handleUpdate = () => {
      fetchEvents();
    };

    window.addEventListener('hh:events-updated', handleUpdate);
    return () => {
      window.removeEventListener('hh:events-updated', handleUpdate);
    };
  }, [fetchEvents]);

  const createEvent = async (data: Omit<HeartopiaEvent, 'id' | 'updated_at'>) => {
    const created = await eventsRepository.create(data);
    await fetchEvents();
    return created;
  };

  const updateEvent = async (id: string, data: Partial<Omit<HeartopiaEvent, 'id'>>) => {
    const updated = await eventsRepository.update(id, data);
    await fetchEvents();
    return updated;
  };

  const deleteEvent = async (id: string) => {
    await eventsRepository.delete(id);
    await fetchEvents();
  };

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
