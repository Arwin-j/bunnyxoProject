import { isSupabaseConfigured } from '../lib/supabase';
import { LocalEventsRepository } from './localEventsRepository';
import { SupabaseEventsRepository } from './supabaseEventsRepository';
import { EventsRepository } from './eventsRepository';

export * from './eventsRepository';
export * from './localEventsRepository';
export * from './supabaseEventsRepository';
export * from './sampleEvents';

const localRepo = new LocalEventsRepository();
const supabaseRepo = new SupabaseEventsRepository(localRepo);

export const eventsRepository: EventsRepository = isSupabaseConfigured()
  ? supabaseRepo
  : localRepo;

export default eventsRepository;
