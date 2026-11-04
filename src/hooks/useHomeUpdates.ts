import { useState, useEffect, useCallback } from 'react';

export interface HomeVersionUpdate {
  id: string;
  version: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY_VERSIONS = 'bunny_home_versions';
const STORAGE_KEY_ACTIVE = 'bunny_home_active_version_id';
const EVENT_NAME = 'bunny_home_updates_changed';

const DEFAULT_VERSIONS: HomeVersionUpdate[] = [
  {
    id: 'ver-default-1',
    version: '1.2',
    name: 'Phantom Glow Patch · Heartopia',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ver-default-2',
    version: '1.1',
    name: 'Spring Blossom Festival',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ver-default-3',
    version: '1.0',
    name: 'Island Launch Release',
    createdAt: new Date().toISOString(),
  },
];

function loadSavedVersions(): HomeVersionUpdate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VERSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_VERSIONS;
}

function loadSavedActiveId(versions: HomeVersionUpdate[]): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (saved && versions.some((v) => v.id === saved)) {
      return saved;
    }
  } catch {}
  return versions[0]?.id || '';
}

export function useHomeUpdates() {
  const [versions, setVersions] = useState<HomeVersionUpdate[]>(() => loadSavedVersions());
  const [activeVersionId, setActiveVersionIdState] = useState<string>(() =>
    loadSavedActiveId(loadSavedVersions())
  );

  // Sync state across tabs and local events
  useEffect(() => {
    const handleSync = () => {
      const loaded = loadSavedVersions();
      setVersions(loaded);
      setActiveVersionIdState(loadSavedActiveId(loaded));
    };

    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const notifyChange = () => {
    try {
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch {}
  };

  const addVersion = useCallback((versionNum: string, updateName: string) => {
    // Strip any leading "v." or "V." and non-numeric/dot characters
    const cleanVersion = versionNum.replace(/^[vV]\.?\s*/, '').replace(/[^0-9.]/g, '') || '1.0';
    const cleanName = updateName.trim() || 'New Update';

    const newVersion: HomeVersionUpdate = {
      id: `ver-${Date.now()}`,
      version: cleanVersion,
      name: cleanName,
      createdAt: new Date().toISOString(),
    };

    setVersions((prev) => {
      const next = [newVersion, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(next));
        localStorage.setItem(STORAGE_KEY_ACTIVE, newVersion.id);
      } catch {}
      return next;
    });

    setActiveVersionIdState(newVersion.id);
    notifyChange();
    return newVersion;
  }, []);

  const setActiveVersionId = useCallback((id: string) => {
    setActiveVersionIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, id);
    } catch {}
    notifyChange();
  }, []);

  const deleteVersion = useCallback((id: string): HomeVersionUpdate | null => {
    let deletedItem: HomeVersionUpdate | null = null;
    setVersions((prev) => {
      deletedItem = prev.find((v) => v.id === id) || null;
      const next = prev.filter((v) => v.id !== id);
      const remaining = next.length > 0 ? next : DEFAULT_VERSIONS;
      try {
        localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(remaining));
      } catch {}

      setActiveVersionIdState((currActive) => {
        let nextActive = currActive;
        if (currActive === id) {
          nextActive = remaining[0]?.id || '';
          try {
            localStorage.setItem(STORAGE_KEY_ACTIVE, nextActive);
          } catch {}
        }
        return nextActive;
      });

      return remaining;
    });

    notifyChange();
    return deletedItem;
  }, []);

  const activeUpdate: HomeVersionUpdate =
    versions.find((v) => v.id === activeVersionId) ||
    versions[0] || {
      id: 'fallback',
      version: '1.2',
      name: 'Phantom Glow Patch · Heartopia',
      createdAt: '',
    };

  return {
    versions,
    activeVersionId,
    activeUpdate,
    addVersion,
    deleteVersion,
    setActiveVersionId,
  };
}
