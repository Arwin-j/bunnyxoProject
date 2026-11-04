import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { uploadMedia } from '../services/storageService';

export interface CommunitySpotlight {
  id: string;
  name: string;
  username: string;
  title: string;
  imageUrl: string;
  isFeatured: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'bunny_community_spotlights';
const EVENT_NAME = 'bunny_community_spotlights_changed';

function loadFromLocal(): CommunitySpotlight[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

function saveToLocal(items: CommunitySpotlight[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {}
}

export function useCommunitySpotlights() {
  const [spotlights, setSpotlights] = useState<CommunitySpotlight[]>(() => loadFromLocal());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state from Supabase / localStorage
  const refreshSpotlights = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSpotlights(loadFromLocal());
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('community_spotlights')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error for community_spotlights, falling back to local:', error.message);
        setSpotlights(loadFromLocal());
      } else if (data) {
        const mapped: CommunitySpotlight[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          username: item.username,
          title: item.title,
          imageUrl: item.image_url,
          isFeatured: Boolean(item.is_featured),
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setSpotlights(mapped);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to load spotlights:', err);
      setSpotlights(loadFromLocal());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSpotlights();

    const handleSync = () => {
      setSpotlights(loadFromLocal());
    };

    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshSpotlights]);

  // Active featured spotlight (put up by Admin)
  const featuredSpotlight = spotlights.find((s) => s.isFeatured) || null;

  // Submit a new spotlight entry
  const submitSpotlight = useCallback(
    async (params: {
      name: string;
      username: string;
      title: string;
      imageFile?: File;
      imageUrl?: string;
    }): Promise<CommunitySpotlight> => {
      let finalImageUrl = params.imageUrl?.trim() || '';

      if (params.imageFile) {
        finalImageUrl = await uploadMedia(params.imageFile, 'community-spotlights');
      }

      if (!finalImageUrl) {
        throw new Error('Please upload an image for your submission.');
      }

      const newId = `spotlight-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newEntry: CommunitySpotlight = {
        id: newId,
        name: params.name.trim() || 'Anonymous Bunny',
        username: params.username.trim() || 'cozy_player',
        title: params.title.trim() || 'Cozy Creation',
        imageUrl: finalImageUrl,
        isFeatured: false,
        createdAt: new Date().toISOString(),
      };

      // 1. Save locally first for instant feedback
      const current = loadFromLocal();
      const updated = [newEntry, ...current];
      saveToLocal(updated);
      setSpotlights(updated);

      // 2. Persist to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const { error } = await supabase.from('community_spotlights').insert([
            {
              id: newEntry.id,
              name: newEntry.name,
              username: newEntry.username,
              title: newEntry.title,
              image_url: newEntry.imageUrl,
              is_featured: false,
              created_at: newEntry.createdAt,
            },
          ]);
          if (error) {
            console.warn('Supabase insert error for community_spotlights:', error.message);
          }
        } catch (err) {
          console.warn('Supabase insert failed:', err);
        }
      }

      return newEntry;
    },
    []
  );

  // Admin action: Put up the best work (set as featured)
  const setFeaturedSpotlight = useCallback(
    async (id: string) => {
      const current = loadFromLocal();
      const updated = current.map((item) => ({
        ...item,
        isFeatured: item.id === id,
      }));

      saveToLocal(updated);
      setSpotlights(updated);

      if (isSupabaseConfigured()) {
        try {
          // Unfeature all
          await supabase.from('community_spotlights').update({ is_featured: false }).neq('id', '');
          // Feature target
          await supabase.from('community_spotlights').update({ is_featured: true }).eq('id', id);
        } catch (err) {
          console.warn('Supabase update featured error:', err);
        }
      }
    },
    []
  );

  // Admin action: Remove from featured spotlight
  const unfeatureSpotlight = useCallback(
    async (id: string) => {
      const current = loadFromLocal();
      const updated = current.map((item) =>
        item.id === id ? { ...item, isFeatured: false } : item
      );

      saveToLocal(updated);
      setSpotlights(updated);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('community_spotlights').update({ is_featured: false }).eq('id', id);
        } catch (err) {
          console.warn('Supabase unfeature error:', err);
        }
      }
    },
    []
  );

  // Admin action: Delete a submission
  const deleteSpotlight = useCallback(
    async (id: string) => {
      const current = loadFromLocal();
      const updated = current.filter((item) => item.id !== id);

      saveToLocal(updated);
      setSpotlights(updated);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('community_spotlights').delete().eq('id', id);
        } catch (err) {
          console.warn('Supabase delete error:', err);
        }
      }
    },
    []
  );

  return {
    spotlights,
    featuredSpotlight,
    isLoading,
    submitSpotlight,
    setFeaturedSpotlight,
    unfeatureSpotlight,
    deleteSpotlight,
    refreshSpotlights,
  };
}

