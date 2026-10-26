import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RedemptionCode {
  id: string;
  title: string;
  code: string;
  rewards: string;
  expiry: string;
  isHistory?: boolean;
  createdAt: string;
}

export const DEFAULT_CODES: RedemptionCode[] = [
  // Active Codes
  {
    id: 'code-heartopia2026',
    title: 'Heartopia Welcome Gift',
    code: 'HEARTOPIA2026',
    rewards: '150x Wishing Stars, 10,000x Gold & 5x Tulip Seeds',
    expiry: 'Dec 31, 2026',
    isHistory: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'code-cozybunny',
    title: 'Bunny Hub Cozy Outfit Pack',
    code: 'COZYBUNNY',
    rewards: 'Exclusive Bunny Beret & Pastel Floral Apron',
    expiry: 'Nov 30, 2026',
    isHistory: false,
    createdAt: '2026-10-05T00:00:00.000Z',
  },
  {
    id: 'code-springtulip',
    title: 'Tulip Garden Mystery Box',
    code: 'SPRINGTULIP',
    rewards: '30x Rare Pink Tulip Bulbs & Cozy Watering Can',
    expiry: 'Nov 15, 2026',
    isHistory: false,
    createdAt: '2026-10-10T00:00:00.000Z',
  },
  {
    id: 'code-heartbeach',
    title: 'Heart Beach Vacation Supplies',
    code: 'HEARTBEACH',
    rewards: 'Shell Collector Basket & Tropical Sunhat',
    expiry: 'Dec 15, 2026',
    isHistory: false,
    createdAt: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'code-starlight',
    title: 'Starlight Wishing Bundle',
    code: 'STARLIGHTGIFT',
    rewards: '200x Wishing Stars & Constellation Nightlamp',
    expiry: 'Dec 31, 2026',
    isHistory: false,
    createdAt: '2026-10-15T00:00:00.000Z',
  },
  {
    id: 'code-islandcozy',
    title: 'Permanent Explorer Kit',
    code: 'ISLANDCOZY',
    rewards: '50x Energy Juices & Campfire Furniture Decor',
    expiry: 'Permanent (No Expiration)',
    isHistory: false,
    createdAt: '2026-10-18T00:00:00.000Z',
  },

  // History Codes (Expired)
  {
    id: 'code-autumnleaves',
    title: 'Autumn Harvest Picnic Gift',
    code: 'AUTUMNLEAVES',
    rewards: '50x Maple Leaves & Harvest Basket Decor',
    expiry: 'Oct 15, 2026',
    isHistory: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'code-summerbreeze',
    title: 'Summer Beach Festival Pack',
    code: 'SUMMERBREEZE',
    rewards: '100x Wishing Stars & Coconut Drink Hat',
    expiry: 'Sep 30, 2026',
    isHistory: true,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'code-bunnyfriends',
    title: 'Closed Beta Pioneer Bundle',
    code: 'BUNNYFRIENDS',
    rewards: 'Exclusive Beta Tester Badge & Cozy Tea Table',
    expiry: 'Aug 31, 2026',
    isHistory: true,
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'code-heartopia100k',
    title: '100K Pre-Registration Milestone',
    code: 'HEARTOPIA100K',
    rewards: 'Gold Explorer Frame & 5000x Gold',
    expiry: 'Jul 15, 2026',
    isHistory: true,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

const STORAGE_KEY = 'hh.redemption_codes.v1';

export const useRedemptionCodes = () => {
  const [codes, setCodes] = useState<RedemptionCode[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_CODES;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return DEFAULT_CODES;
    } catch {
      return DEFAULT_CODES;
    }
  });

  // Fetch from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let mounted = true;
    supabase
      .from('redemption_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!mounted || error || !data || data.length === 0) return;
        const mapped: RedemptionCode[] = data.map((item) => ({
          id: item.id,
          code: item.code,
          title: item.title,
          rewards: item.rewards || '',
          expiry: item.expiry,
          isHistory: Boolean(item.is_history),
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setCodes(mapped);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Sync to localStorage as backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    } catch {}
  }, [codes]);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setCodes(updated);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addCode = useCallback(
    (data: Omit<RedemptionCode, 'id' | 'createdAt'>) => {
      const newCode: RedemptionCode = {
        ...data,
        id: 'code-' + Date.now(),
        code: data.code.trim().toUpperCase(),
        createdAt: new Date().toISOString(),
      };
      setCodes((prev) => [newCode, ...prev]);

      if (isSupabaseConfigured()) {
        supabase
          .from('redemption_codes')
          .insert([
            {
              id: newCode.id,
              code: newCode.code,
              title: newCode.title,
              rewards: newCode.rewards,
              expiry: newCode.expiry,
              is_history: Boolean(newCode.isHistory),
              created_at: newCode.createdAt,
            },
          ])
          .then(({ error }) => {
            if (error) console.warn('Supabase addCode error:', error.message);
          });
      }

      return newCode;
    },
    []
  );

  const updateCode = useCallback(
    (id: string, patch: Partial<RedemptionCode>) => {
      setCodes((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...patch,
                code: patch.code ? patch.code.trim().toUpperCase() : c.code,
              }
            : c
        )
      );

      if (isSupabaseConfigured()) {
        interface CodePayload {
          code?: string;
          title?: string;
          rewards?: string;
          expiry?: string;
          is_history?: boolean;
        }
        const payload: CodePayload = {};
        if (patch.code) payload.code = patch.code.trim().toUpperCase();
        if (patch.title !== undefined) payload.title = patch.title;
        if (patch.rewards !== undefined) payload.rewards = patch.rewards;
        if (patch.expiry !== undefined) payload.expiry = patch.expiry;
        if (patch.isHistory !== undefined) payload.is_history = patch.isHistory;

        supabase
          .from('redemption_codes')
          .update(payload)
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('Supabase updateCode error:', error.message);
          });
      }
    },
    []
  );

  const deleteCode = useCallback((id: string) => {
    setCodes((prev) => prev.filter((c) => c.id !== id));

    if (isSupabaseConfigured()) {
      supabase
        .from('redemption_codes')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteCode error:', error.message);
        });
    }
  }, []);

  const toggleHistory = useCallback((id: string) => {
    setCodes((prev) => {
      const target = prev.find((c) => c.id === id);
      if (target && isSupabaseConfigured()) {
        supabase
          .from('redemption_codes')
          .update({ is_history: !target.isHistory })
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('Supabase toggleHistory error:', error.message);
          });
      }
      return prev.map((c) => (c.id === id ? { ...c, isHistory: !c.isHistory } : c));
    });
  }, []);

  const activeCodes = codes.filter((c) => !c.isHistory);
  const historyCodes = codes.filter((c) => c.isHistory);

  return {
    codes,
    activeCodes,
    historyCodes,
    addCode,
    updateCode,
    deleteCode,
    toggleHistory,
    toggleCodeHistory: toggleHistory,
  };
};

export default useRedemptionCodes;
