import { HeartopiaEvent } from '../types/event';

export interface ListEventsFilter {
  publishedOnly?: boolean;
}

export interface EventsRepository {
  list(filter?: ListEventsFilter): Promise<HeartopiaEvent[]>;
  get(id: string): Promise<HeartopiaEvent | null>;
  create(data: Omit<HeartopiaEvent, 'id' | 'updated_at'>): Promise<HeartopiaEvent>;
  update(id: string, data: Partial<Omit<HeartopiaEvent, 'id'>>): Promise<HeartopiaEvent>;
  delete(id: string): Promise<void>;
}
