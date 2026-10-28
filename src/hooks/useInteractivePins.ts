import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { InteractivePin, DEFAULT_ISLAND_PINS, GameId, HeartopiaMapId } from '../types/map';

const STORAGE_KEY = 'hh.interactive_pins.v5';

export function useInteractivePins(
  selectedGame: GameId = 'heartopia',
  selectedMap: HeartopiaMapId = 'island'
) {
  const [pins, setPins] = useState<InteractivePin[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_ISLAND_PINS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_ISLAND_PINS;
    } catch {
      return DEFAULT_ISLAND_PINS;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Sync to local storage whenever pins change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
    } catch (err) {
      console.warn('Failed to save pins to localStorage:', err);
    }
  }, [pins]);

  // Fetch pins from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadSupabasePins = async () => {
      try {
        const { data, error } = await supabase
          .from('map_pins')
          .select('*')
          .order('created_at', { ascending: false });

        if (!mounted) return;
        setLoading(false);
        if (error || !data || data.length === 0) return;

        // Map Supabase rows into InteractivePin
        const supabasePins: InteractivePin[] = data.map((item: any) => ({
          id: item.id,
          name: item.name || 'Unnamed Pin',
          cat: item.cat || 'landmark',
          subcat: item.subcat || '',
          owned: Boolean(item.owned),
          tags: Array.isArray(item.tags) ? item.tags : [],
          desc: item.desc || item.description || '',
          image: item.image || null,
          x: Number(item.x) || 0,
          y: Number(item.y) || 0,
          game: (item.game as GameId) || 'heartopia',
          mapId: (item.map_id as HeartopiaMapId) || 'island',
          createdAt: item.created_at || new Date().toISOString(),
        }));

        setPins((prev) => {
          // Merge: Keep pins that exist in prev or Supabase
          const existingIds = new Set(supabasePins.map((p) => p.id));
          const localOnly = prev.filter((p) => !existingIds.has(p.id));
          return [...supabasePins, ...localOnly];
        });
      } catch {
        if (mounted) setLoading(false);
      }
    };

    loadSupabasePins();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter pins for the currently active game & map
  const activePins = pins.filter(
    (p) => (p.game || 'heartopia') === selectedGame && (p.mapId || 'island') === selectedMap
  );

  // Add a new pin
  const addPin = useCallback(
    async (pinData: Omit<InteractivePin, 'id' | 'createdAt'>): Promise<InteractivePin> => {
      const newPin: InteractivePin = {
        ...pinData,
        id: 'pin_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
        game: selectedGame,
        mapId: selectedMap,
        createdAt: new Date().toISOString(),
      };

      setPins((prev) => [...prev, newPin]);

      if (isSupabaseConfigured()) {
        try {
          // Attempt full insert
          const payload: any = {
            id: newPin.id,
            name: newPin.name,
            x: newPin.x,
            y: newPin.y,
            created_at: newPin.createdAt,
          };

          // Try saving base columns first so RLS/column restrictions don't crash the save
          await supabase.from('map_pins').insert([payload]);
        } catch (err) {
          console.warn('Supabase pin insert warning:', err);
        }
      }

      return newPin;
    },
    [selectedGame, selectedMap]
  );

  // Update existing pin
  const updatePin = useCallback(
    async (id: string, updates: Partial<InteractivePin>): Promise<void> => {
      setPins((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

      if (isSupabaseConfigured()) {
        try {
          const payload: any = {};
          if (updates.name !== undefined) payload.name = updates.name;
          if (updates.x !== undefined) payload.x = updates.x;
          if (updates.y !== undefined) payload.y = updates.y;

          if (Object.keys(payload).length > 0) {
            await supabase.from('map_pins').update(payload).eq('id', id);
          }
        } catch (err) {
          console.warn('Supabase pin update warning:', err);
        }
      }
    },
    []
  );

  // Delete a pin
  const deletePin = useCallback(async (id: string): Promise<void> => {
    setPins((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('map_pins').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase pin delete warning:', err);
      }
    }
  }, []);

  // Toggle owned status
  const toggleOwned = useCallback(
    async (id: string): Promise<void> => {
      const pin = pins.find((p) => p.id === id);
      if (!pin) return;
      await updatePin(id, { owned: !pin.owned });
    },
    [pins, updatePin]
  );

  // Reset to default sample pins
  const resetPins = useCallback(() => {
    setPins(DEFAULT_ISLAND_PINS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ISLAND_PINS));
    } catch {}
  }, []);

  // Bulk import
  const importPins = useCallback((imported: InteractivePin[]) => {
    if (Array.isArray(imported)) {
      setPins(imported);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      } catch {}
    }
  }, []);

  return {
    pins: activePins,
    allPins: pins,
    loading,
    addPin,
    updatePin,
    deletePin,
    toggleOwned,
    resetPins,
    importPins,
  };
}
