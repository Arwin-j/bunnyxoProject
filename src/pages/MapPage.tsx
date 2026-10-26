import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import islandMapUrl from '../assets/heartopia-island-map.jpg';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// High-resolution map image dimensions (3364 x 3364 px)
const MAP_SIZE = 3364;

export interface MapPin {
  id: string;
  name: string;
  x: number; // lng
  y: number; // lat
  createdAt: string;
}

export interface EditingPinState {
  id: string;
  name: string;
  x: number;
  y: number;
  isNew: boolean;
}

const STORAGE_KEY = 'hh.map_pins.v1';

// Initial sample pins for first-time visitors
const DEFAULT_PINS: MapPin[] = [
  {
    id: 'pin-blossom-meadow',
    name: 'Blossom Meadow',
    x: 1680,
    y: 1850,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pin-heart-beach',
    name: 'Heart Beach',
    x: 2150,
    y: 1250,
    createdAt: new Date().toISOString(),
  },
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const createPinIcon = (pinName: string) => {
  return L.divIcon({
    className: 'heartopia-pin-container',
    html: `
      <div class="heartopia-map-pin">
        <div class="pin-icon-wrap">
          <svg width="32" height="38" viewBox="0 0 32 38" fill="none">
            <path d="M16 22L16 36" stroke="#4a2835" stroke-width="3" stroke-linecap="round"/>
            <path d="M16 4C10.5 4 6 8.5 6 14C6 19 11 23 16 25C21 23 26 19 26 14C26 8.5 21.5 4 16 4Z" fill="#f48fb1" stroke="#4a2835" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M11 9C12.5 13 14.5 16 16 17C17.5 16 19.5 13 21 9" stroke="#4a2835" stroke-width="2" stroke-linecap="round"/>
            <path d="M16 4V16" stroke="#4a2835" stroke-width="2" stroke-linecap="round"/>
            <path d="M16 23C12 23 10 21 9 19C9 23 12 25 16 25" fill="#86efac" stroke="#4a2835" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="pin-badge-name">${escapeHtml(pinName)}</div>
      </div>
    `,
    iconSize: [32, 60],
    iconAnchor: [16, 36],
  });
};

export const MapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapReady, setMapReady] = useState<boolean>(false);

  // Pins state loaded from LocalStorage
  const [pins, setPins] = useState<MapPin[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_PINS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_PINS;
    } catch {
      return DEFAULT_PINS;
    }
  });

  // Pin placement state
  const [isPlacingPin, setIsPlacingPin] = useState<boolean>(false);
  const isPlacingPinRef = useRef<boolean>(false);
  isPlacingPinRef.current = isPlacingPin;

  // Active pin editing state (form on the side below Map controls)
  const [editingPin, setEditingPin] = useState<EditingPinState | null>(null);
  const draftMarkerRef = useRef<L.Marker | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Sync pins to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
    } catch {}
  }, [pins]);

  // Fetch pins from Supabase on mount if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let mounted = true;

    supabase
      .from('map_pins')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!mounted || error || !data || data.length === 0) return;
        const mapped: MapPin[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          x: item.x,
          y: item.y,
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setPins(mapped);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize Boxed Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const getCoverZoom = (w: number, h: number) => {
      const zoomX = Math.log2(w / MAP_SIZE);
      const zoomY = Math.log2(h / MAP_SIZE);
      // Math.max guarantees the map image fully covers and fits the container dimensions edge-to-edge
      return Math.max(zoomX, zoomY) + 0.12;
    };

    const containerWidth =
      mapContainerRef.current.clientWidth > 0 ? mapContainerRef.current.clientWidth : 800;
    const containerHeight =
      mapContainerRef.current.clientHeight > 0 ? mapContainerRef.current.clientHeight : 580;

    const initialCoverZoom = getCoverZoom(containerWidth, containerHeight);

    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      minZoom: initialCoverZoom - 0.5,
      maxZoom: 2,
      zoomSnap: 0.05,
      zoomDelta: 0.5,
      attributionControl: false,
      zoomControl: false,
      maxBoundsViscosity: 0.7,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: true,
    });

    if (map.touchZoom) map.touchZoom.disable();
    if (map.doubleClickZoom) map.doubleClickZoom.disable();
    if (map.scrollWheelZoom) map.scrollWheelZoom.disable();
    if (map.boxZoom) map.boxZoom.disable();
    if (map.keyboard) map.keyboard.disable();

    const mapBounds: L.LatLngBoundsExpression = [
      [0, 0],
      [MAP_SIZE, MAP_SIZE],
    ];

    const paddedBounds: L.LatLngBoundsExpression = [
      [-MAP_SIZE * 0.1, -MAP_SIZE * 0.1],
      [MAP_SIZE * 1.1, MAP_SIZE * 1.1],
    ];

    // Map image overlay
    L.imageOverlay(islandMapUrl, mapBounds, {
      className: 'leaflet-image-layer',
    }).addTo(map);

    map.setMaxBounds(paddedBounds);

    // Initial view: centered on island and zoomed in to fill/fit container edge-to-edge
    map.setView([MAP_SIZE / 2, MAP_SIZE / 2], initialCoverZoom);

    mapInstanceRef.current = map;
    setMapReady(true);

    const handleResize = () => {
      if (!mapContainerRef.current || !mapInstanceRef.current) return;
      mapInstanceRef.current.invalidateSize();
    };

    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current && mapContainerRef.current) {
        mapInstanceRef.current.invalidateSize();
        const w = mapContainerRef.current.clientWidth || containerWidth;
        const h = mapContainerRef.current.clientHeight || containerHeight;
        const settledCoverZoom = getCoverZoom(w, h);
        mapInstanceRef.current.setMinZoom(settledCoverZoom - 0.5);
        mapInstanceRef.current.setView([MAP_SIZE / 2, MAP_SIZE / 2], settledCoverZoom, {
          animate: false,
        });
      }
    }, 60);

    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      markersMapRef.current.clear();
      if (draftMarkerRef.current) {
        draftMarkerRef.current.remove();
        draftMarkerRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Synchronize Leaflet markers with pins state
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const currentPinIds = new Set(pins.map((p) => p.id));

    // Remove deleted markers
    markersMapRef.current.forEach((marker, id) => {
      if (!currentPinIds.has(id)) {
        marker.remove();
        markersMapRef.current.delete(id);
      }
    });

    // Add or update markers
    pins.forEach((pin) => {
      let marker = markersMapRef.current.get(pin.id);
      if (!marker) {
        marker = L.marker([pin.y, pin.x], {
          icon: createPinIcon(pin.name),
          draggable: false, // Locked in place — cannot be dragged
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (isPlacingPinRef.current) return;
          setEditingPin({
            id: pin.id,
            name: pin.name,
            x: pin.x,
            y: pin.y,
            isNew: false,
          });
          map.setView([pin.y, pin.x], Math.max(map.getZoom(), -0.8), { animate: true });
        });

        marker.addTo(map);
        markersMapRef.current.set(pin.id, marker);
      } else {
        marker.setIcon(createPinIcon(pin.name));
      }
    });
  }, [pins, mapReady]);

  // Sync draft or active marker icon while typing in form
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (editingPin?.isNew) {
      if (!draftMarkerRef.current) {
        draftMarkerRef.current = L.marker([editingPin.y, editingPin.x], {
          icon: createPinIcon(editingPin.name || 'New Pin'),
          draggable: false,
        }).addTo(map);
      } else {
        draftMarkerRef.current.setLatLng([editingPin.y, editingPin.x]);
        draftMarkerRef.current.setIcon(createPinIcon(editingPin.name || 'New Pin'));
      }
    } else {
      if (draftMarkerRef.current) {
        draftMarkerRef.current.remove();
        draftMarkerRef.current = null;
      }
      if (editingPin) {
        const marker = markersMapRef.current.get(editingPin.id);
        if (marker) {
          marker.setIcon(createPinIcon(editingPin.name || 'Pin'));
        }
      }
    }
  }, [editingPin, mapReady]);

  // Map Click Listener when in "Add pin" Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isPlacingPin) {
        const x = Math.round(e.latlng.lng);
        const y = Math.round(e.latlng.lat);
        const newId = 'pin-' + Date.now();
        setEditingPin({
          id: newId,
          name: '',
          x,
          y,
          isNew: true,
        });
        setIsPlacingPin(false);
        map.setView([y, x], Math.max(map.getZoom(), -0.8), { animate: true });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPlacingPin]);

  // Pressing Escape cancels placement or closes the side form
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPlacingPin) {
          setIsPlacingPin(false);
        } else if (editingPin) {
          handleCloseForm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlacingPin, editingPin]);

  // Zoom In / Zoom Out controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Start "Add pin" mode
  const handleStartAddPin = () => {
    if (editingPin?.isNew) {
      setEditingPin(null);
    }
    setIsPlacingPin((prev) => !prev);
  };

  // Close the side form
  const handleCloseForm = () => {
    if (editingPin && !editingPin.isNew) {
      const orig = pins.find((p) => p.id === editingPin.id);
      if (orig) {
        const marker = markersMapRef.current.get(orig.id);
        if (marker) marker.setIcon(createPinIcon(orig.name));
      }
    }
    setEditingPin(null);
  };

  // Save pin from the side form
  const handleSaveEditingPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPin) return;

    const trimmedName =
      editingPin.name.trim() || (editingPin.isNew ? `Pin #${pins.length + 1}` : 'Pin');

    if (editingPin.isNew) {
      const newPin: MapPin = {
        id: editingPin.id,
        name: trimmedName,
        x: editingPin.x,
        y: editingPin.y,
        createdAt: new Date().toISOString(),
      };
      setPins((prev) => [...prev, newPin]);
      setEditingPin({ ...newPin, isNew: false });

      if (isSupabaseConfigured()) {
        supabase
          .from('map_pins')
          .insert([
            {
              id: newPin.id,
              name: newPin.name,
              x: newPin.x,
              y: newPin.y,
              created_at: newPin.createdAt,
            },
          ])
          .then(({ error }) => {
            if (error) console.warn('Supabase map pin insert error:', error.message);
          });
      }
    } else {
      setPins((prev) =>
        prev.map((p) => (p.id === editingPin.id ? { ...p, name: trimmedName } : p))
      );
      setEditingPin((prev) => (prev ? { ...prev, name: trimmedName } : null));

      if (isSupabaseConfigured()) {
        supabase
          .from('map_pins')
          .update({ name: trimmedName })
          .eq('id', editingPin.id)
          .then(({ error }) => {
            if (error) console.warn('Supabase map pin update error:', error.message);
          });
      }
    }
  };

  // Delete pin from the side form
  const handleDeleteEditingPin = () => {
    if (!editingPin) return;
    if (!editingPin.isNew) {
      handleDeletePin(editingPin.id);
    }
    setEditingPin(null);
  };

  // Delete a pin
  const handleDeletePin = (pinId: string) => {
    setPins((prev) => prev.filter((p) => p.id !== pinId));
    if (editingPin?.id === pinId) {
      setEditingPin(null);
    }

    if (isSupabaseConfigured()) {
      supabase
        .from('map_pins')
        .delete()
        .eq('id', pinId)
        .then(({ error }) => {
          if (error) console.warn('Supabase map pin delete error:', error.message);
        });
    }
  };

  // Pan to pin when clicked in list
  const handlePinListClick = (pin: MapPin) => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setView([pin.y, pin.x], Math.max(currentZoom, -0.8), {
        animate: true,
      });
    }
    setEditingPin({
      id: pin.id,
      name: pin.name,
      x: pin.x,
      y: pin.y,
      isNew: false,
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
            <span>Heartopia Map</span>
            <span className="text-2xl" title="Tulip Theme">🌷</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground font-sans">
            Explore the island, zoom with controls, and drop custom pins anywhere.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2">
          <span className="rounded-full border-2 border-foreground bg-[#bbf7d0] px-3.5 py-1 text-xs sm:text-sm font-bold text-foreground shadow-xs">
            📍 {pins.length} {pins.length === 1 ? 'Pin' : 'Pins'} saved
          </span>
        </div>
      </div>

      {/* Main Layout: Boxed Map (left) + Side Control Panel (right) */}
      <div className="heartopia-map-layout">
        {/* Left: Boxed Map Container */}
        <section className="heartopia-map-main">
          <div
            className={`heartopia-canvas-wrapper ${
              isPlacingPin ? 'cursor-placing-pin' : ''
            }`}
          >
            {/* Map Canvas */}
            <div
              ref={mapContainerRef}
              className="heartopia-map-canvas select-none"
              style={{ width: '100%', height: '100%', minHeight: '450px' }}
            />

            {/* Floating Banner when in "Add pin" Mode */}
            {isPlacingPin && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2.5 rounded-full border-[2.5px] border-foreground bg-card/95 px-4 py-2 shadow-berry backdrop-blur-md animate-bounce max-w-[90%]">
                <span className="text-base select-none">📍</span>
                <span className="font-sans font-bold text-xs sm:text-sm text-foreground truncate">
                  Click anywhere on the map to place your pin!
                </span>
                <button
                  type="button"
                  onClick={() => setIsPlacingPin(false)}
                  className="shrink-0 rounded-full border-2 border-foreground bg-primary hover:bg-accent px-2.5 py-0.5 text-xs font-bold text-foreground active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right: Side Control & Pins Panel */}
        <section className="heartopia-map-sidebar flex flex-col gap-5">
          {/* Box 1: Map Controls */}
          <div className="rounded-[28px] border-[3px] border-foreground bg-card p-5 sm:p-6 shadow-[5px_5px_0_0_var(--foreground)] space-y-6">
            {/* Panel Title */}
            <div className="border-b-2 border-dashed border-foreground/30 pb-3 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground font-sans">
                Map Controls
              </h2>
              <span className="text-xs font-bold text-muted-foreground font-sans">
                Island View
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="space-y-2">
              <span className="block text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
                Zoom
              </span>
              <div className="flex w-full items-center rounded-full border-[3px] border-foreground bg-card shadow-ink overflow-hidden">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  aria-label="Zoom In"
                  className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-l-full font-mono text-3xl font-bold text-foreground hover:bg-accent active:bg-primary border-r-2 border-foreground/40 transition-colors cursor-pointer select-none"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                  className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-r-full font-mono text-3xl font-bold text-foreground hover:bg-accent active:bg-primary transition-colors cursor-pointer select-none"
                >
                  −
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center font-sans">
                Tap + to zoom in, − to zoom out
              </p>
            </div>

            {/* "Add pin" Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleStartAddPin}
                aria-label={isPlacingPin ? 'Cancel pin placement' : 'Add pin to map'}
                title={isPlacingPin ? 'Cancel pin placement' : 'Add pin to map'}
                className={`flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-foreground py-2.5 px-4 font-sans text-sm sm:text-base font-bold shadow-ink active:translate-y-0.5 transition-all cursor-pointer select-none ${
                  isPlacingPin
                    ? 'bg-amber-200 text-amber-950 animate-pulse'
                    : 'bg-[#f48fb1] hover:bg-[#f06292] text-foreground'
                }`}
              >
                <span>📍</span>
                <span>{isPlacingPin ? 'Click map to place pin...' : 'Add pin'}</span>
              </button>
            </div>

            {/* Saved Pins List */}
            <div className="space-y-3 pt-2 border-t-2 border-dashed border-foreground/20">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
                  Saved Pins ({pins.length})
                </span>
                <span className="text-[11px] text-muted-foreground font-sans">
                  Click pin to focus
                </span>
              </div>

              {pins.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-foreground/30 bg-[#fdf2f6] p-4 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-muted-foreground font-sans">
                    No pins yet! Click <strong className="text-foreground">"Add pin"</strong> above, then click anywhere on the map to place your pin.
                  </p>
                </div>
              ) : (
                <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {pins.map((pin) => {
                    const isSelected = editingPin?.id === pin.id;
                    return (
                      <div
                        key={pin.id}
                        onClick={() => handlePinListClick(pin)}
                        className={`group flex items-center justify-between gap-2 rounded-2xl border-2 border-foreground p-2.5 shadow-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#fce7ef] border-[#f472b6] shadow-ink'
                            : 'bg-[#fdf2f6] hover:bg-[#fce7ef]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm select-none">📍</span>
                          <span className="font-sans font-bold text-xs sm:text-sm text-foreground truncate">
                            {pin.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePin(pin.id);
                            }}
                            title="Delete pin"
                            aria-label={`Delete ${pin.name}`}
                            className="size-7 rounded-full flex items-center justify-center text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            🗑️
                          </button>
                          <span className="text-xs font-mono font-bold text-foreground/50 group-hover:text-foreground">
                            ▶
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Box 2: Small Pin Form below Map Controls (only appears when placed a pin or clicked on a pin) */}
          {editingPin && (
            <div
              ref={formRef}
              className="rounded-[28px] border-[3px] border-foreground bg-card p-5 shadow-[5px_5px_0_0_#f472b6] animate-in fade-in flex flex-col gap-4"
            >
              {/* Header */}
              <div className="border-b-2 border-dashed border-foreground/30 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground font-sans">
                    {editingPin.isNew ? 'New Pin' : 'Edit Pin'}
                  </h3>
                  {editingPin.isNew && (
                    <span className="rounded-full border border-foreground bg-[#bbf7d0] px-2 py-0.5 text-[11px] font-bold text-foreground">
                      Draft
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  title="Close form"
                  aria-label="Close form"
                  className="flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-foreground bg-background font-mono text-xs font-bold shadow-xs hover:bg-accent active:translate-y-0.5 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Form Body: Only name can be edited */}
              <form onSubmit={handleSaveEditingPin} className="flex flex-col gap-3.5">
                <div>
                  <label
                    htmlFor="sidebar-pin-name-input"
                    className="block font-sans font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5"
                  >
                    Name
                  </label>
                  <input
                    id="sidebar-pin-name-input"
                    type="text"
                    autoFocus
                    maxLength={60}
                    required
                    value={editingPin.name}
                    onChange={(e) => setEditingPin({ ...editingPin, name: e.target.value })}
                    placeholder="e.g. Cozy Camping Spot"
                    className="w-full rounded-full border-2 border-foreground bg-[#fdf2f6] px-3.5 py-2 font-sans font-bold text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#f472b6] transition-all"
                  />
                </div>

                {/* Small Save and Delete Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t-2 border-dashed border-foreground/20">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 border-foreground bg-[#f48fb1] hover:bg-[#f06292] py-2 px-3 font-sans font-bold text-xs sm:text-sm text-foreground shadow-[2px_2px_0_0_#4a2835] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer select-none"
                  >
                    <span>💾</span>
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteEditingPin}
                    className="flex items-center justify-center gap-1 rounded-xl border-2 border-rose-400 bg-rose-50 hover:bg-rose-100 py-2 px-3 font-sans font-bold text-xs text-rose-700 shadow-xs active:translate-y-0.5 transition-all cursor-pointer select-none"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MapPage;
