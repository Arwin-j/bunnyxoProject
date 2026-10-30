import React, { useState, useRef, useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import islandMapUrl from '../assets/heartopia-island-map.jpg';
import { Toast, ToastMessage } from '../components/admin/Toast';
import { useInteractivePins } from '../hooks/useInteractivePins';
import { useMapCategories } from '../hooks/useMapCategories';
import {
  GameId,
  HeartopiaMapId,
  GAMES,
  HEARTOPIA_MAPS,
  MAP_SIZE,
  PIN_TAGS,
  InteractivePin,
} from '../types/map';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const MapPage: React.FC = () => {
  // Game & Map Selection
  const [selectedGame, setSelectedGame] = useState<GameId>('heartopia');
  const [selectedMap, setSelectedMap] = useState<HeartopiaMapId>('island');
  const [isMapDropdownOpen, setIsMapDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Categories Hook
  const { categories } = useMapCategories();

  // Search Filter & Category Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Custom Interactive Pins Hook
  const { pins, toggleOwned } = useInteractivePins(selectedGame, selectedMap);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapReady, setMapReady] = useState<boolean>(false);

  // Close map dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMapDropdownOpen(false);
      }
    };
    if (isMapDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMapDropdownOpen]);

  // Create Teardrop Leaflet DivIcon
  const createPinIcon = (catKey: string, owned: boolean, image: string | null) => {
    const cat = categories[catKey] || categories.landmark || Object.values(categories)[0];
    const baseSize = cat?.size || 26;
    const opacity = owned ? 0.6 : 1;
    const effectiveImage = image || cat?.image || null;
    const hasImage = Boolean(effectiveImage);

    const imageStyle = hasImage
      ? `background-image:url('${effectiveImage}');background-size:cover;background-position:center;border-color:#4a2835;`
      : '';

    return L.divIcon({
      className: 'interactive-pin-container',
      html: `
        <div class="interactive-pin" style="width:${baseSize}px;height:${baseSize}px;background-color:${cat?.color || '#c3a468'};opacity:${opacity};${imageStyle};">
          <span>${hasImage ? '' : cat?.icon || '★'}</span>
        </div>
      `,
      iconSize: [baseSize, baseSize],
      iconAnchor: [baseSize / 2, baseSize],
      popupAnchor: [0, -baseSize],
    });
  };

  // Build Leaflet Popup HTML
  const buildPopupHtml = (pin: InteractivePin) => {
    const cat = categories[pin.cat] || categories.landmark || Object.values(categories)[0];
    const effectiveImg = pin.image || cat?.image || null;
    const imgHtml = effectiveImg
      ? `<img src="${effectiveImg}" alt="${escapeHtml(pin.name)}" style="width:100%;max-width:220px;max-height:140px;object-fit:cover;border-radius:12px;border:2px solid #4a2835;display:block;margin-bottom:8px;box-shadow:2px 2px 0px #4a2835;" />`
      : '';

    const tagsHtml =
      pin.tags && pin.tags.length > 0
        ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">` +
          pin.tags
            .map((t) => {
              const def = PIN_TAGS.find((x) => x.key === t);
              return `<span style="background:#ecfdf5;border:1.5px solid #4a2835;border-radius:9999px;padding:2px 7px;font-size:10px;font-weight:700;color:#065f46;">${
                def ? def.icon + ' ' + escapeHtml(def.label) : escapeHtml(t)
              }</span>`;
            })
            .join('') +
          `</div>`
        : '';

    const ownedBtnHtml = `
      <button
        type="button"
        onclick="window.__togglePinOwned && window.__togglePinOwned('${pin.id}')"
        style="width:100%;margin-top:10px;padding:6px 10px;border-radius:9999px;border:2px solid #4a2835;font-family:Fredoka,sans-serif;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.15s;${
          pin.owned
            ? 'background:#fef08a;color:#4a2835;box-shadow:1.5px 1.5px 0px #4a2835;'
            : 'background:#fdf2f6;color:#4a2835;box-shadow:1.5px 1.5px 0px #4a2835;'
        }"
      >
        ${pin.owned ? '✓ Marked as Found' : 'Mark as Found'}
      </button>
    `;

    return `
      <div style="min-width:180px;max-width:240px;font-family:Fredoka,sans-serif;">
        ${imgHtml}
        <div style="font-size:14px;font-weight:800;color:#4a2835;line-height:1.2;margin-bottom:2px;">
          ${escapeHtml(pin.name)}
        </div>
        <div style="display:inline-block;background:${cat?.color || '#c3a468'}25;color:#4a2835;border:1.5px solid #4a2835;border-radius:9999px;padding:1px 8px;font-size:10.5px;font-weight:700;margin-bottom:4px;">
          ${cat?.icon || '★'} ${escapeHtml(cat?.label || pin.cat)}${pin.subcat ? ' • ' + escapeHtml(pin.subcat) : ''}
        </div>
        ${pin.desc ? `<div style="font-size:11.5px;color:#4a2835;opacity:0.9;margin-top:4px;line-height:1.3;">${escapeHtml(pin.desc)}</div>` : ''}
        ${tagsHtml}
        ${ownedBtnHtml}
        <div style="margin-top:8px;font-size:10px;font-family:monospace;color:#6b7280;">
          Coordinates: (${Math.round(pin.x)}, ${Math.round(pin.y)})
        </div>
      </div>
    `;
  };

  // Selected pin for sidebar inspection
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const selectedPin = useMemo(() => {
    return pins.find((p) => p.id === selectedPinId) || null;
  }, [pins, selectedPinId]);

  // Handle toggling owned status
  const handleToggleFound = (id: string) => {
    toggleOwned(id);
    const pin = pins.find((p) => p.id === id);
    setToast({
      id: String(Date.now()),
      type: 'info',
      text: pin?.owned ? `Unmarked "${pin.name}".` : `Marked "${pin?.name}" as found!`,
    });
  };

  // Expose togglePinOwned globally for popup HTML click handler
  useEffect(() => {
    (window as any).__togglePinOwned = (id: string) => {
      handleToggleFound(id);
    };
    return () => {
      delete (window as any).__togglePinOwned;
    };
  }, [pins, toggleOwned]);

  // Fly to Pin on map
  const handleFlyToPin = (pin: InteractivePin) => {
    if (!mapInstanceRef.current) return;
    setSelectedPinId(pin.id);
    const currentZoom = mapInstanceRef.current.getZoom();
    const zoom = Math.max(currentZoom, 0.2);
    mapInstanceRef.current.setView([pin.y, pin.x], zoom, { animate: true });
    const marker = markersRef.current.get(pin.id);
    if (marker) {
      marker.openPopup();
    }
  };

  const handleSelectPinFromList = (pin: InteractivePin) => {
    handleFlyToPin(pin);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (selectedGame !== 'heartopia' || selectedMap !== 'island') {
      if (mapInstanceRef.current) {
        markersRef.current.clear();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setMapReady(false);
      return;
    }

    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const containerWidth = mapContainerRef.current.clientWidth || 700;
    const containerHeight = mapContainerRef.current.clientHeight || 460;

    const getCoverZoom = (w: number, h: number) => {
      const zoomX = Math.log2(w / MAP_SIZE);
      const zoomY = Math.log2(h / MAP_SIZE);
      return Math.max(zoomX, zoomY) + 0.12;
    };

    const initialCoverZoom = getCoverZoom(containerWidth, containerHeight);

    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      minZoom: initialCoverZoom - 0.8,
      maxZoom: 2.2,
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

    const mapBounds: L.LatLngBoundsExpression = [
      [0, 0],
      [MAP_SIZE, MAP_SIZE],
    ];

    const paddedBounds: L.LatLngBoundsExpression = [
      [-MAP_SIZE * 0.15, -MAP_SIZE * 0.15],
      [MAP_SIZE * 1.15, MAP_SIZE * 1.15],
    ];

    L.imageOverlay(islandMapUrl, mapBounds, {
      className: 'leaflet-image-layer',
    }).addTo(map);

    map.setMaxBounds(paddedBounds);
    map.setView([MAP_SIZE / 2, MAP_SIZE / 2], initialCoverZoom);

    mapInstanceRef.current = map;
    setMapReady(true);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleResize = () => {
      if (!mapContainerRef.current || !mapInstanceRef.current) return;
      mapInstanceRef.current.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current && mapContainerRef.current) {
        mapInstanceRef.current.invalidateSize();
        const w = mapContainerRef.current.clientWidth || containerWidth;
        const h = mapContainerRef.current.clientHeight || containerHeight;
        const settledCoverZoom = getCoverZoom(w, h);
        mapInstanceRef.current.setMinZoom(settledCoverZoom - 0.8);
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

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      markersRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [selectedGame, selectedMap]);

  // Filtered Pins list
  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      if (selectedCategoryFilter !== 'all' && p.cat !== selectedCategoryFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        p.cat.toLowerCase().includes(q) ||
        (p.subcat && p.subcat.toLowerCase().includes(q))
      );
    });
  }, [pins, selectedCategoryFilter, searchQuery]);

  // Sync Markers to Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const activeIds = new Set(filteredPins.map((p) => p.id));

    // Remove deleted or filtered markers
    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    filteredPins.forEach((pin) => {
      let marker = markersRef.current.get(pin.id);

      if (!marker) {
        marker = L.marker([pin.y, pin.x], {
          icon: createPinIcon(pin.cat, Boolean(pin.owned), pin.image || null),
          draggable: false,
          autoPan: true,
        });

        marker.on('click', () => {
          setSelectedPinId(pin.id);
        });

        marker.bindPopup(buildPopupHtml(pin), { className: 'bunny-map-popup' });
        marker.addTo(map);
        markersRef.current.set(pin.id, marker);
      } else {
        marker.setIcon(createPinIcon(pin.cat, Boolean(pin.owned), pin.image || null));
        marker.setPopupContent(buildPopupHtml(pin));
      }
    });
  }, [filteredPins, mapReady, categories]);

  // Reset Leaflet View
  const handleResetView = () => {
    if (!mapInstanceRef.current || !mapContainerRef.current) return;
    const w = mapContainerRef.current.clientWidth || 700;
    const h = mapContainerRef.current.clientHeight || 460;
    const zoomX = Math.log2(w / MAP_SIZE);
    const zoomY = Math.log2(h / MAP_SIZE);
    const coverZoom = Math.max(zoomX, zoomY) + 0.12;
    mapInstanceRef.current.setView([MAP_SIZE / 2, MAP_SIZE / 2], coverZoom, {
      animate: true,
    });
  };

  const currentGame = GAMES.find((g) => g.id === selectedGame) || GAMES[0];
  const currentMap = HEARTOPIA_MAPS.find((m) => m.id === selectedMap) || HEARTOPIA_MAPS[0];

  const availableCategories = useMemo(() => {
    return Object.values(categories);
  }, [categories]);

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-4 antialiased selection:bg-[#b23a6b] selection:text-white">
      {/* 1. Top "Map Navigation bar" */}
      <div className="card-v2 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Game Selector */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#8c6f55] mr-1 select-none">
            Game:
          </span>
          {GAMES.map((game) => {
            const isActive = selectedGame === game.id;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => {
                  setSelectedGame(game.id);
                  setIsMapDropdownOpen(false);
                }}
                className={`tab-v2 text-xs sm:text-sm py-1 px-3.5 min-h-[34px] flex items-center gap-1.5 ${
                  isActive ? 'on' : ''
                }`}
              >
                <span>{game.icon}</span>
                <span>{game.name}</span>
                {game.badge && (
                  <span className="rounded-full bg-[#fbd5e1] text-[#b23a6b] px-1.5 py-0.2 text-[10px] font-bold">
                    {game.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Center: Search & Reset Bar */}
        {selectedGame === 'heartopia' && selectedMap === 'island' && (
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs select-none">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pins on map…"
                className="w-full rounded-full border border-[#e9b3ad] bg-[#f9f4e6] pl-8 pr-7 py-1.5 font-sans text-xs font-medium text-[#6b4f35] placeholder:text-[#8c6f55]/70 focus:outline-none focus:ring-2 focus:ring-[#b23a6b] shadow-xs"
                autoComplete="off"
                spellCheck={false}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-[#e9b3ad] text-[10px] font-bold text-[#6b4f35] hover:bg-[#b23a6b] hover:text-white flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleResetView}
              title="Reset View"
              className="btn-v2 btn-v2-olive text-xs py-1.5 px-3 min-h-[32px] shrink-0"
            >
              <span>🎯</span>
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* Right: Map Dropdown (for Heartopia) */}
        {selectedGame === 'heartopia' && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMapDropdownOpen((prev) => !prev)}
              aria-expanded={isMapDropdownOpen}
              className="tab-v2 text-xs sm:text-sm py-1.5 px-3.5 min-h-[34px] flex items-center gap-2 bg-[#f9f4e6]"
            >
              <span>🗺️</span>
              <span className="text-[#8c6f55] font-normal">Map:</span>
              <span className="text-[#6b4f35] font-extrabold">{currentMap.name}</span>
              <span
                className={`text-[10px] transition-transform duration-200 ${
                  isMapDropdownOpen ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>

            {isMapDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 z-[1100] w-64 rounded-2xl bg-[#f3ecda] p-2 shadow-lg border border-[#e9b3ad]/40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[11px] font-heading font-bold uppercase tracking-wider text-[#8c6f55] border-b border-[#e9b3ad]/40">
                  Switch Heartopia Map
                </div>
                <div className="space-y-1 pt-1.5">
                  {HEARTOPIA_MAPS.map((mapOption) => {
                    const isSelected = selectedMap === mapOption.id;
                    return (
                      <button
                        key={mapOption.id}
                        type="button"
                        onClick={() => {
                          setSelectedMap(mapOption.id);
                          setIsMapDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left font-sans text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#b23a6b] text-white'
                            : 'hover:bg-[#f9f4e6] text-[#6b4f35]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{mapOption.icon}</span>
                          <div>
                            <div className="leading-snug">{mapOption.name}</div>
                            <div className="text-[10px] font-normal opacity-80 line-clamp-1">
                              {mapOption.subtitle}
                            </div>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="text-xs font-bold shrink-0 ml-2">✓</span>
                        ) : mapOption.badge ? (
                          <span className="rounded-full bg-[#fbd5e1] text-[#b23a6b] px-1.5 py-0.5 text-[9px] font-bold shrink-0 ml-2">
                            {mapOption.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Interactive Map Explorer (Exact same layout & container as admin page) */}
      {selectedGame === 'heartopia' && selectedMap === 'island' ? (
        <div className="heartopia-map-layout">
          {/* Left: Boxed Map Container & Controls (Exact same container as admin page) */}
          <section className="heartopia-map-main flex flex-col gap-3">
            {/* MAP BOX is right at the top of everything! */}
            <div
              className="heartopia-canvas-wrapper relative w-full overflow-hidden"
              style={{ height: '480px', minHeight: '400px' }}
            >
              <div
                ref={mapContainerRef}
                className="heartopia-map-canvas select-none w-full h-full"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                  cursor: 'grab',
                }}
              />
            </div>

            {/* Row under map box: Zoom controls, Reset View, and live pin count */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-2xl border-[2.5px] border-foreground bg-card shadow-ink overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => mapInstanceRef.current?.zoomIn()}
                    title="Zoom In (+)"
                    aria-label="Zoom In"
                    className="size-11 flex items-center justify-center font-mono text-xl font-bold text-foreground hover:bg-accent active:bg-primary border-r-2 border-foreground/30 transition-colors cursor-pointer select-none"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => mapInstanceRef.current?.zoomOut()}
                    title="Zoom Out (-)"
                    aria-label="Zoom Out"
                    className="size-11 flex items-center justify-center font-mono text-xl font-bold text-foreground hover:bg-accent active:bg-primary transition-colors cursor-pointer select-none"
                  >
                    −
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetView}
                  title="Reset View"
                  className="flex items-center gap-1.5 rounded-2xl border-[2.5px] border-foreground bg-card hover:bg-accent px-4 py-2 font-sans text-xs sm:text-sm font-extrabold text-foreground shadow-ink active:translate-y-0.5 transition-all cursor-pointer select-none"
                >
                  <span>🎯</span>
                  <span>Reset View</span>
                </button>
              </div>

              <span className="text-xs font-semibold text-muted-foreground font-sans">
                {filteredPins.length} of {pins.length} charted {pins.length === 1 ? 'pin' : 'pins'} shown
              </span>
            </div>
          </section>

          {/* Right: Boxed Sidebar (Explore Pins & Locations) */}
          <aside className="heartopia-map-sidebar">
            <div className="card-v2 p-4 sm:p-5 space-y-4">
              <div className="border-b border-[#e9b3ad]/40 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗺️</span>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#7a5638] tracking-tight m-0">
                    Explore Pins
                  </h3>
                </div>
                <span className="tag-v2" style={{ background: '#d9e0b4', color: '#6e7a3c' }}>
                  {filteredPins.length} Active
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`tab-v2 text-xs py-1 px-3 min-h-[30px] ${
                    selectedCategoryFilter === 'all' ? 'on' : ''
                  }`}
                >
                  All ({pins.length})
                </button>
                {availableCategories.map((c) => {
                  const count = pins.filter((p) => p.cat === c.id).length;
                  const isActive = selectedCategoryFilter === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(c.id)}
                      className={`tab-v2 text-xs py-1 px-2.5 min-h-[30px] flex items-center gap-1 ${
                        isActive ? 'on' : ''
                      }`}
                    >
                      <span>{c.icon || '★'}</span>
                      <span>{c.label}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Pin Details / Inspector */}
              {selectedPin && (
                <div className="rounded-2xl bg-[#f9f4e6] p-3.5 space-y-3 animate-in fade-in border border-[#e9b3ad]/40">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="tag-v2 text-[11px]">
                          {categories[selectedPin.cat]?.label || selectedPin.cat}
                        </span>
                        {selectedPin.owned && (
                          <span className="tag-v2 text-[11px]" style={{ background: '#d9e0b4', color: '#6e7a3c' }}>
                            ✓ Found
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading font-bold text-[#7a5638] text-sm mt-1 m-0">
                        {selectedPin.name}
                      </h4>
                      {selectedPin.desc && (
                        <p className="text-xs text-[#8c6f55] mt-0.5 line-clamp-2">
                          {selectedPin.desc}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPinId(null)}
                      className="size-6 rounded-full bg-[#e9b3ad] text-xs font-bold text-[#6b4f35] hover:bg-[#b23a6b] hover:text-white flex items-center justify-center cursor-pointer"
                      title="Clear selection"
                    >
                      ✕
                    </button>
                  </div>

                  {selectedPin.image && (
                    <img
                      src={selectedPin.image}
                      alt={selectedPin.name}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleFound(selectedPin.id)}
                      className={`btn-v2 flex-1 text-xs py-1.5 ${
                        selectedPin.owned ? 'btn-v2-olive' : ''
                      }`}
                    >
                      <span>{selectedPin.owned ? '✓' : '🐾'}</span>
                      <span>{selectedPin.owned ? 'Marked as Found' : 'Mark as Found'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFlyToPin(selectedPin)}
                      className="btn-v2 btn-v2-white text-xs py-1.5 px-3"
                      title="Center on pin"
                    >
                      🎯 Center
                    </button>
                  </div>
                </div>
              )}

              {/* Scrollable Pins Directory List */}
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {filteredPins.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#8c6f55] font-sans">
                    No pins found matching your filter.
                  </div>
                ) : (
                  filteredPins.map((pin) => {
                    const isSelected = selectedPinId === pin.id;
                    const cat = categories[pin.cat] || categories.landmark || Object.values(categories)[0];
                    return (
                      <div
                        key={pin.id}
                        onClick={() => handleSelectPinFromList(pin)}
                        className={`row-v2 text-xs py-2 px-3 m-0 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#b23a6b] text-white'
                            : 'hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="size-5 rounded-full flex items-center justify-center text-[10px] text-white shrink-0"
                            style={{ backgroundColor: cat?.color || '#c3a468' }}
                          >
                            {cat?.icon || '★'}
                          </span>
                          <span className="truncate font-medium">{pin.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {pin.owned ? (
                            <span className="text-[10px] font-bold text-white bg-[#6e7a3c] rounded-full px-1.5 py-0.2">
                              ✓
                            </span>
                          ) : null}
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-[#8c6f55]'}`}>
                            ({Math.round(pin.x)}, {Math.round(pin.y)})
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* Placeholder View for Whalefall Canyon or other games */
        <div className="card-v2 p-10 sm:p-14 text-center max-w-2xl mx-auto my-8 space-y-4">
          <div className="text-6xl">{selectedGame === 'heartopia' ? '🏜️' : currentGame.icon}</div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#7a5638]">
            {selectedGame === 'heartopia' ? currentMap.name : `${currentGame.name} Map`}
          </h2>
          <p className="text-sm sm:text-base font-medium text-[#8c6f55] font-sans max-w-md mx-auto">
            {selectedGame === 'heartopia'
              ? 'Whalefall Canyon map image is coming soon. Check back soon to explore charted pins!'
              : `Map charting for ${currentGame.name} is currently in progress. Check back soon for the interactive map!`}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedGame('heartopia');
                setSelectedMap('island');
              }}
              className="btn-v2"
            >
              ← Back to Heartopia Island Map
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
};

export default MapPage;
