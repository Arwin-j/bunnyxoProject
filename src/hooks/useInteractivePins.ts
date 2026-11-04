import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { InteractivePin, DEFAULT_ISLAND_PINS, GameId, HeartopiaMapId } from '../types/map';

const STORAGE_KEY = 'hh.interactive_pins.v6';

export function useInteractivePins(
  selectedGame: GameId = 'heartopia',
  selectedMap: HeartopiaMapId = 'island'
) {
  const [pins, setPins] = useState<InteractivePin[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      // Clear previous versions
      for (let i = 1; i <= 5; i++) {
        localStorage.removeItem(`hh.interactive_pins.v${i}`);
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
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
        const fetchPromise = supabase
          .from('map_pins')
          .select('*')
          .order('created_at', { ascending: false });

        const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('Supabase map_pins timeout')), 2500)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

        if (!mounted) return;
        setLoading(false);
        if (error || !data || data.length === 0) {
          return;
        }

        // Filter out legacy test pins
        const legacyPinIds = new Set([
          'pin_1793145615709_7298',
          'pin_1793152627094_420',
          'pin_1793156220299_2455',
          'pin_1793157685887_9458',
          'pin_1793157846976_7268',
          'pin_1793157621460_3055',
        ]);

        // Map Supabase rows into InteractivePin
        const supabasePins: InteractivePin[] = data
          .filter((item: any) => !legacyPinIds.has(item.id))
          .map((item: any) => ({
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

        setPins(supabasePins);
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

  // Reset to empty pins
  const resetPins = useCallback(() => {
    setPins([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
    if (isSupabaseConfigured()) {
      try {
        supabase.from('map_pins').delete().neq('id', '').then(() => {});
      } catch {}
    }
  }, []);

  // Clear all pins
  const clearAllPins = useCallback(async () => {
    setPins([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('map_pins').delete().neq('id', '');
      } catch (err) {
        console.warn('Supabase clear all pins warning:', err);
      }
    }
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
    clearAllPins,
    importPins,
  };
}
