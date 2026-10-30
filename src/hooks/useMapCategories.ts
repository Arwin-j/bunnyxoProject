import { useState, useEffect, useCallback } from 'react';
import { PinCategory, PIN_CATEGORIES } from '../types/map';

const CATEGORIES_STORAGE_KEY = 'hh.map_categories.v2';

export function useMapCategories() {
  const [categories, setCategories] = useState<Record<string, PinCategory>>(() => {
    if (typeof window === 'undefined') return PIN_CATEGORIES;
    try {
      const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          // Merge with PIN_CATEGORIES to ensure defaults always exist
          return { ...PIN_CATEGORIES, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved map categories:', e);
    }
    return PIN_CATEGORIES;
  });

  // Sync categories state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (err) {
      console.warn('Failed to save map categories to localStorage:', err);
    }
  }, [categories]);

  // Add a new custom category
  const addCategory = useCallback(
    (newCatData: {
      label: string;
      image?: string | null;
      color?: string;
      icon?: string;
    }): PinCategory => {
      const trimmedLabel = newCatData.label.trim();
      // Generate clean key: e.g. cat_fruit_trees_173000...
      const slug = trimmedLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 20);
      const id = `cat_${slug || 'item'}_${Date.now()}`;

      const newCategory: PinCategory = {
        id,
        label: trimmedLabel,
        color: newCatData.color || '#f48fb1',
        icon: newCatData.icon || (newCatData.image ? '' : '★'),
        image: newCatData.image || null,
        size: 26,
      };

      setCategories((prev) => ({
        ...prev,
        [id]: newCategory,
      }));

      return newCategory;
    },
    []
  );

  // Delete a custom category (only allow deleting custom ones, keep base 3)
  const deleteCategory = useCallback((id: string) => {
    if (id === 'landmark' || id === 'region' || id === 'chest') {
      return; // Protected default categories
    }
    setCategories((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  // Reset to default 3 categories
  const resetCategories = useCallback(() => {
    setCategories(PIN_CATEGORIES);
    try {
      localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    } catch {}
  }, []);

  return {
    categories,
    addCategory,
    deleteCategory,
    resetCategories,
  };
}
