import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import islandMapUrl from '../../assets/heartopia-island-map.jpg';
import { AdminEditTabs } from '../../components/admin/AdminEditTabs';
import { Toast, ToastMessage } from '../../components/admin/Toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { AddCategoryModal } from '../../components/admin/AddCategoryModal';
import { useInteractivePins } from '../../hooks/useInteractivePins';
import { useMapCategories } from '../../hooks/useMapCategories';
import {
  GameId,
  HeartopiaMapId,
  GAMES,
  HEARTOPIA_MAPS,
  MAP_SIZE,
  PIN_CATEGORIES,
  PIN_TAGS,
  InteractivePin,
  compressImageToPinSize,
} from '../../types/map';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface ActivePinEditState {
  id?: string;
  name: string;
  cat: string;
  subcat: string;
  owned: boolean;
  tags: string[];
  desc: string;
  image: string | null;
  x: number;
  y: number;
  isNew: boolean;
}

export const AdminEditMapsPage: React.FC = () => {
  // Game & Map Selection
  const [selectedGame, setSelectedGame] = useState<GameId>('heartopia');
  const [selectedMap, setSelectedMap] = useState<HeartopiaMapId>('island');
  const [isMapDropdownOpen, setIsMapDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Categories Hook
  const { categories, addCategory } = useMapCategories();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);

  // Edit Mode ("Adjust Pins" toggle)
  const [adjustPinsMode, setAdjustPinsMode] = useState<boolean>(false);
  const adjustPinsModeRef = useRef<boolean>(false);
  adjustPinsModeRef.current = adjustPinsMode;

  // Search Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Pin being created or edited in EDIT PINS box
  const [editingPin, setEditingPin] = useState<ActivePinEditState | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlDraft, setImageUrlDraft] = useState<string>('');
  const [isCompressingImage, setIsCompressingImage] = useState<boolean>(false);

  // Draft marker on map for newly dropped pins
  const draftMarkerRef = useRef<L.Marker | null>(null);

  // Confirmation & Toast states
  const [deletingPinId, setDeletingPinId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Custom Interactive Pins Hook
  const { pins, allPins, addPin, updatePin, deletePin, resetPins, importPins } = useInteractivePins(
    selectedGame,
    selectedMap
  );

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapReady, setMapReady] = useState<boolean>(false);

  // File import ref
  const importFileRef = useRef<HTMLInputElement>(null);
  const editBoxRef = useRef<HTMLDivElement>(null);

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
  const createPinIcon = (
    catKey: string,
    owned: boolean,
    image: string | null,
    isEditable: boolean,
    isDraft: boolean = false
  ) => {
    const cat = categories[catKey] || categories.landmark || Object.values(categories)[0];
    const baseSize = cat?.size || 26;
    const opacity = isDraft ? 0.9 : owned ? 0.6 : 1;
    const effectiveImage = image || cat?.image || null;
    const hasImage = Boolean(effectiveImage);

    const imageStyle = hasImage
      ? `background-image:url('${effectiveImage}');background-size:cover;background-position:center;border-color:#4a2835;`
      : '';

    const draftAnimation = isDraft ? 'animation: bounce 1.2s infinite;' : '';

    return L.divIcon({
      className: 'interactive-pin-container',
      html: `
        <div class="interactive-pin ${isEditable ? 'editable' : ''}" style="width:${baseSize}px;height:${baseSize}px;background-color:${cat?.color || '#c3a468'};opacity:${opacity};${imageStyle};${draftAnimation}">
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

    return `
      <div style="min-width:180px;max-width:240px;font-family:Fredoka,sans-serif;">
        ${imgHtml}
        <div style="font-size:14px;font-weight:800;color:#4a2835;line-height:1.2;margin-bottom:2px;">
          ${escapeHtml(pin.name)}
        </div>
        <div style="display:inline-block;background:${cat.color}25;color:#4a2835;border:1.5px solid #4a2835;border-radius:9999px;padding:1px 8px;font-size:10.5px;font-weight:700;margin-bottom:4px;">
          ${cat.icon} ${escapeHtml(cat.label)}${pin.subcat ? ' • ' + escapeHtml(pin.subcat) : ''}
        </div>
        ${pin.desc ? `<div style="font-size:11.5px;color:#4a2835;opacity:0.9;margin-top:4px;line-height:1.3;">${escapeHtml(pin.desc)}</div>` : ''}
        ${tagsHtml}
        <div style="margin-top:8px;font-size:10px;font-family:monospace;color:#6b7280;">
          Coordinates: (${Math.round(pin.x)}, ${Math.round(pin.y)})
        </div>
      </div>
    `;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (selectedGame !== 'heartopia' || selectedMap !== 'island') {
      if (mapInstanceRef.current) {
        markersRef.current.clear();
        if (draftMarkerRef.current) {
          draftMarkerRef.current.remove();
          draftMarkerRef.current = null;
        }
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

    const getCoverZoom = (w: number, h: number) => {
      const zoomX = Math.log2(w / MAP_SIZE);
      const zoomY = Math.log2(h / MAP_SIZE);
      return Math.max(zoomX, zoomY) + 0.12;
    };

    const containerWidth =
      mapContainerRef.current.clientWidth > 0 ? mapContainerRef.current.clientWidth : 700;
    const containerHeight =
      mapContainerRef.current.clientHeight > 0 ? mapContainerRef.current.clientHeight : 460;

    const initialCoverZoom = getCoverZoom(containerWidth, containerHeight);

    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      minZoom: initialCoverZoom - 0.8,
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

    // Map click handler in "Adjust Pins" mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (!adjustPinsModeRef.current) return;
      const x = Math.round(e.latlng.lng * 10) / 10;
      const y = Math.round(e.latlng.lat * 10) / 10;

      setEditingPin({
        name: 'New Pin',
        cat: 'landmark',
        subcat: '',
        owned: false,
        tags: [],
        desc: '',
        image: null,
        x,
        y,
        isNew: true,
      });
      setImageInputMode('upload');
      setImageUrlDraft('');

      if (editBoxRef.current) {
        editBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

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
      if (draftMarkerRef.current) {
        draftMarkerRef.current.remove();
        draftMarkerRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [selectedGame, selectedMap]);

  // Sync Markers to Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // Filter by search query if present
    const visiblePins = pins.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        p.cat.toLowerCase().includes(q) ||
        (p.subcat && p.subcat.toLowerCase().includes(q))
      );
    });

    const activeIds = new Set(visiblePins.map((p) => p.id));

    // Remove deleted or filtered markers
    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    visiblePins.forEach((pin) => {
      let marker = markersRef.current.get(pin.id);

      if (!marker) {
        marker = L.marker([pin.y, pin.x], {
          icon: createPinIcon(pin.cat, Boolean(pin.owned), pin.image || null, adjustPinsMode),
          draggable: adjustPinsMode,
          autoPan: true,
        });

        // Click on pin: in adjust mode, open edit form in side box; in normal mode, open popup
        marker.on('click', (e) => {
          if (adjustPinsModeRef.current) {
            L.DomEvent.stopPropagation(e);
            setEditingPin({
              id: pin.id,
              name: pin.name,
              cat: pin.cat,
              subcat: pin.subcat || '',
              owned: Boolean(pin.owned),
              tags: pin.tags || [],
              desc: pin.desc || '',
              image: pin.image || null,
              x: pin.x,
              y: pin.y,
              isNew: false,
            });
            setImageInputMode('upload');
            setImageUrlDraft(pin.image || '');

            if (editBoxRef.current) {
              editBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        });

        // Drag end: save new coordinates
        marker.on('dragend', (e) => {
          const targetMarker = e.target as L.Marker;
          const ll = targetMarker.getLatLng();
          const newX = Math.round(ll.lng * 10) / 10;
          const newY = Math.round(ll.lat * 10) / 10;
          updatePin(pin.id, { x: newX, y: newY });
          if (editingPin?.id === pin.id) {
            setEditingPin((prev) => (prev ? { ...prev, x: newX, y: newY } : null));
          }
          setToast({
            id: String(Date.now()),
            type: 'info',
            text: `Repositioned "${pin.name}" to (${Math.round(newX)}, ${Math.round(newY)})`,
          });
        });

        marker.bindPopup(buildPopupHtml(pin), { className: 'bunny-map-popup' });
        marker.addTo(map);
        markersRef.current.set(pin.id, marker);
      } else {
        marker.setIcon(createPinIcon(pin.cat, Boolean(pin.owned), pin.image || null, adjustPinsMode));
        if (marker.dragging) {
          if (adjustPinsMode) marker.dragging.enable();
          else marker.dragging.disable();
        }
        marker.setPopupContent(buildPopupHtml(pin));
      }
    });
  }, [pins, mapReady, adjustPinsMode, searchQuery, updatePin, categories]);

  // Sync Draft Marker while adding a new pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (editingPin?.isNew) {
      const draftIcon = createPinIcon(
        editingPin.cat,
        editingPin.owned,
        editingPin.image,
        true,
        true
      );

      if (!draftMarkerRef.current) {
        draftMarkerRef.current = L.marker([editingPin.y, editingPin.x], {
          icon: draftIcon,
          draggable: true,
        }).addTo(map);

        draftMarkerRef.current.on('dragend', (e) => {
          const m = e.target as L.Marker;
          const ll = m.getLatLng();
          setEditingPin((prev) =>
            prev
              ? {
                  ...prev,
                  x: Math.round(ll.lng * 10) / 10,
                  y: Math.round(ll.lat * 10) / 10,
                }
              : null
          );
        });
      } else {
        draftMarkerRef.current.setLatLng([editingPin.y, editingPin.x]);
        draftMarkerRef.current.setIcon(draftIcon);
      }
    } else {
      if (draftMarkerRef.current) {
        draftMarkerRef.current.remove();
        draftMarkerRef.current = null;
      }
    }
  }, [editingPin, mapReady]);

  // Handle Local File Image Upload & Auto-reduction
  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPin) return;

    try {
      setIsCompressingImage(true);
      const compressed = await compressImageToPinSize(file, 320, 0.82);
      setEditingPin((prev) => (prev ? { ...prev, image: compressed } : null));
      setToast({
        id: String(Date.now()),
        type: 'success',
        text: 'Image attached and optimized for pin!',
      });
    } catch {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: 'Could not read and compress that image file.',
      });
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  // Handle URL Image Attachment & Auto-reduction
  const handleApplyImageUrl = async () => {
    const trimmed = imageUrlDraft.trim();
    if (!trimmed || !editingPin) return;

    try {
      setIsCompressingImage(true);
      const optimized = await compressImageToPinSize(trimmed, 320, 0.82);
      setEditingPin((prev) => (prev ? { ...prev, image: optimized } : null));
      setToast({
        id: String(Date.now()),
        type: 'success',
        text: 'Internet image attached to pin!',
      });
    } catch {
      setEditingPin((prev) => (prev ? { ...prev, image: trimmed } : null));
    } finally {
      setIsCompressingImage(false);
    }
  };

  // Save Pin from Edit Box
  const handleSavePin = async () => {
    if (!editingPin) return;

    const trimmedName = editingPin.name.trim() || 'Unnamed Pin';

    if (editingPin.isNew) {
      await addPin({
        name: trimmedName,
        cat: editingPin.cat,
        subcat: editingPin.subcat.trim(),
        owned: editingPin.owned,
        tags: editingPin.tags,
        desc: editingPin.desc.trim(),
        image: editingPin.image,
        x: editingPin.x,
        y: editingPin.y,
        game: selectedGame,
        mapId: selectedMap,
      });

      if (draftMarkerRef.current) {
        draftMarkerRef.current.remove();
        draftMarkerRef.current = null;
      }

      setToast({
        id: String(Date.now()),
        type: 'success',
        text: `Created new pin "${trimmedName}"!`,
      });
    } else if (editingPin.id) {
      await updatePin(editingPin.id, {
        name: trimmedName,
        cat: editingPin.cat,
        subcat: editingPin.subcat.trim(),
        owned: editingPin.owned,
        tags: editingPin.tags,
        desc: editingPin.desc.trim(),
        image: editingPin.image,
      });

      setToast({
        id: String(Date.now()),
        type: 'success',
        text: `Saved changes to "${trimmedName}"!`,
      });
    }

    setEditingPin(null);
  };

  // Delete Pin Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingPinId) return;
    const pin = pins.find((p) => p.id === deletingPinId);
    await deletePin(deletingPinId);
    setToast({
      id: String(Date.now()),
      type: 'success',
      text: `Deleted pin "${pin?.name || 'Pin'}".`,
    });
    setDeletingPinId(null);
    if (editingPin?.id === deletingPinId) {
      setEditingPin(null);
    }
  };

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

  // Export Data JSON
  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allPins, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `bunny_map_pins_${selectedGame}_${selectedMap}.json`);
    dlAnchor.click();
    setToast({
      id: String(Date.now()),
      type: 'success',
      text: `Exported ${allPins.length} pins to JSON file!`,
    });
  };

  // Import Data JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          importPins(parsed);
          setToast({
            id: String(Date.now()),
            type: 'success',
            text: `Imported ${parsed.length} pins successfully!`,
          });
        }
      } catch {
        setToast({
          id: String(Date.now()),
          type: 'error',
          text: 'Invalid JSON file.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save to HTML (Standalone interactive map file baking current pins)
  const handleSaveToHtml = async () => {
    try {
      let template = '';
      try {
        const res = await fetch('/island_map_template.html');
        if (res.ok) {
          template = await res.text();
        }
      } catch {}

      const savedAt = Date.now();
      const dataJson = JSON.stringify({
        categories,
        places: pins.map((p) => ({
          id: p.id,
          name: p.name,
          cat: p.cat,
          subcat: p.subcat || '',
          owned: Boolean(p.owned),
          tags: p.tags || [],
          desc: p.desc || '',
          image: p.image || null,
          x: p.x,
          y: p.y,
        })),
        subcatState: {},
        ownershipFilter: { owned: true, notOwned: true },
        savedAt,
      }).replace(/</g, '\\u003c');

      let finalHtml = '';
      if (template && template.includes('id="embeddedData"')) {
        finalHtml = template.replace(
          /(<script id="embeddedData" type="application\/json">)[\s\S]*?(<\/script>)/,
          `$1${dataJson}$2`
        );
      } else {
        finalHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bunny Interactive Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script id="embeddedData" type="application/json">${dataJson}</script>
</head>
<body style="margin:0;padding:0;background:#f3dbe6;">
  <div id="map" style="width:100vw;height:100vh;"></div>
  <script>
    const data = JSON.parse(document.getElementById('embeddedData').textContent);
    const map = L.map('map', { crs: L.CRS.Simple, minZoom: -2, maxZoom: 2 });
    L.imageOverlay('/heartopia-island-map.jpg', [[-394,-394],[2970,2970]]).addTo(map);
    map.fitBounds([[0,0],[2576,2576]]);
    data.places.forEach(p => {
      L.marker([p.y, p.x]).bindPopup('<b>' + p.name + '</b><br>' + (p.desc||'')).addTo(map);
    });
  </script>
</body>
</html>`;
      }

      const blob = new Blob([finalHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `island_interactive_map_${Date.now()}.html`;
      a.click();
      URL.revokeObjectURL(url);

      setToast({
        id: String(Date.now()),
        type: 'success',
        text: 'Bake complete! Downloaded standalone HTML map file.',
      });
    } catch {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: 'Could not generate HTML file.',
      });
    }
  };

  // Toggle Adjust Pins Mode
  const handleToggleAdjustPins = () => {
    const nextState = !adjustPinsMode;
    setAdjustPinsMode(nextState);
    if (nextState) {
      // Immediately open the Edit Pins form with all fields ready for editing/new pin
      setEditingPin({
        name: 'New Pin',
        cat: 'landmark',
        subcat: '',
        owned: false,
        tags: [],
        desc: '',
        image: null,
        x: Math.round(MAP_SIZE / 2),
        y: Math.round(MAP_SIZE / 2),
        isNew: true,
      });
      setImageInputMode('upload');
      setImageUrlDraft('');
    } else {
      if (draftMarkerRef.current) {
        draftMarkerRef.current.remove();
        draftMarkerRef.current = null;
      }
      setEditingPin(null);
    }
  };

  const currentGame = GAMES.find((g) => g.id === selectedGame) || GAMES[0];
  const currentMap = HEARTOPIA_MAPS.find((m) => m.id === selectedMap) || HEARTOPIA_MAPS[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* 1. Admin Edit Tabs: Events, Codes, Maps */}
      <AdminEditTabs currentTab="maps" />

      {/* 2. Top "Map Navigation bar" (Matching diagram title & site layout) */}
      <div className="mb-4 rounded-[24px] border-[2.5px] border-foreground bg-card p-3 shadow-ink flex flex-wrap items-center justify-between gap-3">
        {/* Left: Game Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground mr-1 select-none">
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
                className={`flex items-center gap-1.5 rounded-full border-2 border-foreground px-3.5 py-1.5 font-sans text-xs sm:text-sm font-bold transition-all cursor-pointer select-none active:translate-y-0.5 ${
                  isActive
                    ? 'bg-primary text-foreground shadow-xs'
                    : 'bg-background hover:bg-accent text-foreground'
                }`}
              >
                <span>{game.icon}</span>
                <span>{game.name}</span>
                {game.badge && (
                  <span className="rounded-full bg-[#fef08a] border border-foreground/30 px-1.5 py-0.2 text-[10px] font-bold text-foreground">
                    {game.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Center: Search & Reset Bar directly inside Navigation bar */}
        {selectedGame === 'heartopia' && selectedMap === 'island' && (
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs select-none">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter pins on map…"
                className="w-full rounded-full border border-foreground/30 bg-background pl-8 pr-7 py-1 font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                autoComplete="off"
                spellCheck={false}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-accent text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleResetView}
              title="Reset View"
              className="shrink-0 rounded-full border border-foreground/40 bg-background hover:bg-accent px-2.5 py-1 font-sans text-[11px] font-bold text-foreground shadow-xs active:translate-y-0.5 transition-all cursor-pointer select-none"
            >
              Reset
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
              className="flex items-center gap-2 rounded-full border-2 border-foreground bg-[#fdf2f6] hover:bg-accent px-4 py-1.5 font-sans text-xs sm:text-sm font-bold text-foreground shadow-xs active:translate-y-0.5 transition-all cursor-pointer select-none"
            >
              <span>🗺️</span>
              <span className="text-muted-foreground font-normal">Map:</span>
              <span className="text-foreground font-extrabold">{currentMap.name}</span>
              <span
                className={`text-[10px] transition-transform duration-200 ${
                  isMapDropdownOpen ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>

            {isMapDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 z-[1100] w-64 rounded-2xl border-[2.5px] border-foreground bg-card p-2 shadow-[4px_4px_0_0_var(--foreground)] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-dashed border-foreground/20">
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
                            ? 'bg-primary text-foreground shadow-xs'
                            : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{mapOption.icon}</span>
                          <div>
                            <div className="leading-snug">{mapOption.name}</div>
                            <div className="text-[10px] font-normal text-muted-foreground line-clamp-1">
                              {mapOption.subtitle}
                            </div>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="text-xs font-bold text-foreground shrink-0 ml-2">✓</span>
                        ) : mapOption.badge ? (
                          <span className="rounded-full bg-[#fef08a] border border-foreground/30 px-1.5 py-0.5 text-[9px] font-bold text-foreground shrink-0 ml-2">
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

      {/* 3. Main Site Skeleton Layout (Exact implementation matching user diagram) */}
      {selectedGame === 'heartopia' && selectedMap === 'island' ? (
        <div className="heartopia-map-layout">
          {/* Left: Boxed Map Container & Controls */}
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
                  cursor: adjustPinsMode ? 'crosshair' : 'grab',
                }}
              />

              {/* Adjust Mode In-Map Badge */}
              {adjustPinsMode && (
                <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000] rounded-2xl border-2 border-foreground bg-[#fef08a] px-3 py-1.5 shadow-berry backdrop-blur-md flex items-center justify-between gap-2 pointer-events-auto">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4a2835] truncate">
                    <span className="text-base">📍</span>
                    <span className="truncate">
                      <strong>Adjust Active:</strong> Click map to place, drag to move, click to edit.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdjustPinsMode(false)}
                    className="shrink-0 rounded-full border border-foreground bg-[#4a2835] px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-black transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* ROW UNDER MAP BOX: [ + | - ] Zoom Button AND [ Adjust Pin Button ] */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* [ + | - ] Zoom Controls (Styled segmented pill) */}
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

              {/* [ Adjust Pin Button ] */}
              <button
                type="button"
                onClick={handleToggleAdjustPins}
                className={`flex items-center gap-2.5 rounded-2xl border-[3px] border-foreground px-6 py-2.5 font-sans text-sm sm:text-base font-extrabold shadow-ink active:translate-y-0.5 transition-all cursor-pointer select-none ${
                  adjustPinsMode
                    ? 'bg-[#4a2835] text-white ring-2 ring-[#f48fb1]'
                    : 'bg-[#f48fb1] hover:bg-[#f06292] text-foreground'
                }`}
              >
                <span className="text-lg">✎</span>
                <span>{adjustPinsMode ? '✓ Adjust Pins Active (Click to Exit)' : 'Adjust Pin Button'}</span>
              </button>

              <span className="text-xs font-semibold text-muted-foreground font-sans">
                {pins.length} charted {pins.length === 1 ? 'pin' : 'pins'}
              </span>
            </div>

            {/* TAB BELOW ADJUST PIN BUTTON: [ Export data ] [ Import data ] [ Reset ] (+ Save to HTML) */}
            {/* Opens/expands when Adjust Pin is active as requested by the downward arrow */}
            {adjustPinsMode && (
              <div className="rounded-2xl border-[2.5px] border-foreground bg-card p-3 shadow-ink animate-in fade-in zoom-in-95 duration-150">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 select-none">
                    Data Tools:
                  </span>

                  <button
                    type="button"
                    onClick={handleExportData}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-foreground bg-background hover:bg-accent px-3 py-1.5 text-xs font-bold text-foreground shadow-xs active:translate-y-0.5 transition-all cursor-pointer select-none"
                    title="Export pin locations to a JSON data file"
                  >
                    <span>📤</span>
                    <span>Export data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => importFileRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-foreground bg-background hover:bg-accent px-3 py-1.5 text-xs font-bold text-foreground shadow-xs active:translate-y-0.5 transition-all cursor-pointer select-none"
                    title="Import pins from a JSON file"
                  >
                    <span>📥</span>
                    <span>Import data</span>
                  </button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept="application/json"
                    onChange={handleImportFile}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={handleSaveToHtml}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-foreground bg-[#bbf7d0] hover:bg-[#86efac] px-3 py-1.5 text-xs font-bold text-foreground shadow-xs active:translate-y-0.5 transition-all cursor-pointer select-none"
                    title="Bake all current pins into a downloadable standalone HTML map file"
                  >
                    <span>💾</span>
                    <span>Save to HTML</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-foreground bg-white hover:bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 shadow-xs active:translate-y-0.5 transition-all cursor-pointer select-none"
                    title="Reset all pins back to default locations"
                  >
                    <span>🔄</span>
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Right: [ EDIT PINS ] (Tall box matching user diagram) */}
          <section className="heartopia-map-sidebar">
            <div
              ref={editBoxRef}
              className="rounded-[28px] border-[3px] border-foreground bg-[#FFFDF7] p-5 sm:p-6 shadow-ink min-h-[580px] space-y-4"
            >
              {/* Main Box Header */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl select-none">📌</span>
                  <h2 className="text-2xl font-black text-foreground font-sans tracking-tight uppercase">
                    EDIT PINS
                  </h2>
                </div>

                {editingPin && (
                  <button
                    type="button"
                    onClick={() => {
                      if (draftMarkerRef.current) {
                        draftMarkerRef.current.remove();
                        draftMarkerRef.current = null;
                      }
                      setEditingPin(null);
                    }}
                    title="Close Pin Editor"
                    className="size-7 rounded-full border-2 border-foreground bg-card hover:bg-accent text-xs font-bold text-foreground flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* When Adjust Pins Mode is Active */}
              {adjustPinsMode ? (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Pin Selection Toolbar: Create New Pin or Pick an Existing Pin to Edit */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFF9F2] p-2.5 rounded-2xl border-2 border-foreground/30">
                    <button
                      type="button"
                      onClick={() => {
                        if (draftMarkerRef.current) {
                          draftMarkerRef.current.remove();
                          draftMarkerRef.current = null;
                        }
                        setEditingPin({
                          name: 'New Pin',
                          cat: 'landmark',
                          subcat: '',
                          owned: false,
                          tags: [],
                          desc: '',
                          image: null,
                          x: Math.round(MAP_SIZE / 2),
                          y: Math.round(MAP_SIZE / 2),
                          isNew: true,
                        });
                        setImageInputMode('upload');
                        setImageUrlDraft('');
                      }}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border-2 border-foreground transition-all cursor-pointer select-none active:translate-y-0.5 ${
                        editingPin?.isNew !== false
                          ? 'bg-primary text-foreground shadow-xs'
                          : 'bg-card text-foreground hover:bg-accent'
                      }`}
                    >
                      <span>➕</span>
                      <span>New Pin</span>
                    </button>

                    <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase shrink-0">
                        Edit:
                      </span>
                      <select
                        value={editingPin?.isNew === false ? editingPin.id || '' : ''}
                        onChange={(e) => {
                          const targetId = e.target.value;
                          if (!targetId) return;
                          const found = pins.find((p) => p.id === targetId);
                          if (found) {
                            if (draftMarkerRef.current) {
                              draftMarkerRef.current.remove();
                              draftMarkerRef.current = null;
                            }
                            setEditingPin({
                              id: found.id,
                              name: found.name,
                              cat: found.cat,
                              subcat: found.subcat || '',
                              owned: Boolean(found.owned),
                              tags: found.tags || [],
                              desc: found.desc || '',
                              image: found.image || null,
                              x: found.x,
                              y: found.y,
                              isNew: false,
                            });
                            setImageInputMode('upload');
                            setImageUrlDraft('');
                            if (mapInstanceRef.current) {
                              mapInstanceRef.current.setView(
                                [found.y, found.x],
                                Math.max(mapInstanceRef.current.getZoom(), -0.8),
                                { animate: true }
                              );
                            }
                          }
                        }}
                        className="w-full rounded-xl border border-foreground/40 bg-background px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value="">(Pick existing pin to edit...)</option>
                        {pins.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({categories[p.cat]?.label || p.cat})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Pin Edit Form (Includes all fields from HTML like before) */}
                  {(() => {
                    const activePin = editingPin || {
                      name: 'New Pin',
                      cat: 'landmark',
                      subcat: '',
                      owned: false,
                      tags: [] as string[],
                      desc: '',
                      image: null as string | null,
                      x: Math.round(MAP_SIZE / 2),
                      y: Math.round(MAP_SIZE / 2),
                      isNew: true,
                    };

                    return (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {activePin.isNew ? '✨ Placing New Pin' : `Editing: ${activePin.name}`}
                          </span>
                          {activePin.isNew && (
                            <span className="rounded-full border border-foreground bg-[#bbf7d0] px-2 py-0.5 text-[10px] font-bold text-foreground">
                              Draft
                            </span>
                          )}
                        </div>

                        {/* Field 1: Name */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={activePin.name}
                            onChange={(e) =>
                              setEditingPin((prev) =>
                                prev
                                  ? { ...prev, name: e.target.value }
                                  : { ...activePin, name: e.target.value }
                              )
                            }
                            placeholder="e.g. Blossom Meadow"
                            className="w-full rounded-2xl border-2 border-foreground bg-[#FFF9F2] px-3.5 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>

                        {/* Field 2: Category with + Button */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Category
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              value={activePin.cat}
                              onChange={(e) =>
                                setEditingPin((prev) =>
                                  prev
                                    ? { ...prev, cat: e.target.value }
                                    : { ...activePin, cat: e.target.value }
                                )
                              }
                              className="flex-1 rounded-2xl border-2 border-foreground bg-[#FFF9F2] px-3.5 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            >
                              {Object.entries(categories).map(([catKey, cat]) => (
                                <option key={catKey} value={catKey}>
                                  {cat.icon ? cat.icon + ' ' : ''}{cat.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setIsAddCategoryOpen(true)}
                              title="Add new category"
                              className="size-10 shrink-0 rounded-2xl border-2 border-foreground bg-primary hover:bg-accent font-mono text-xl font-black text-foreground shadow-xs active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Field 3: Subcategory (optional) */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Subcategory (optional)
                          </label>
                          <input
                            type="text"
                            value={activePin.subcat}
                            onChange={(e) =>
                              setEditingPin((prev) =>
                                prev
                                  ? { ...prev, subcat: e.target.value }
                                  : { ...activePin, subcat: e.target.value }
                              )
                            }
                            placeholder="e.g. Rare, Common, Tier 2"
                            className="w-full rounded-2xl border-2 border-foreground bg-[#FFF9F2] px-3.5 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>

                        {/* Field 4: Owned Checkbox */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <input
                            id="editPinOwned"
                            type="checkbox"
                            checked={activePin.owned}
                            onChange={(e) =>
                              setEditingPin((prev) =>
                                prev
                                  ? { ...prev, owned: e.target.checked }
                                  : { ...activePin, owned: e.target.checked }
                              )
                            }
                            className="size-5 rounded border-2 border-foreground accent-primary cursor-pointer"
                          />
                          <label
                            htmlFor="editPinOwned"
                            className="text-sm font-bold text-foreground cursor-pointer select-none"
                          >
                            Owned
                          </label>
                        </div>

                        {/* Field 5: Tags */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Tags
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {PIN_TAGS.map((tag) => {
                              const isChecked = activePin.tags.includes(tag.key);
                              return (
                                <button
                                  key={tag.key}
                                  type="button"
                                  onClick={() => {
                                    setEditingPin((prev) => {
                                      const current = prev || activePin;
                                      const newTags = isChecked
                                        ? current.tags.filter((t) => t !== tag.key)
                                        : [...current.tags, tag.key];
                                      return { ...current, tags: newTags };
                                    });
                                  }}
                                  className={`flex items-center gap-1 rounded-full border-2 border-foreground px-2.5 py-1 text-xs font-bold transition-all cursor-pointer select-none ${
                                    isChecked
                                      ? 'bg-[#ecfdf5] border-emerald-700 text-emerald-800 shadow-xs'
                                      : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                                  }`}
                                >
                                  <span>{tag.icon}</span>
                                  <span>{tag.label}</span>
                                  {isChecked && <span className="text-[10px]">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Field 6: Description */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            value={activePin.desc}
                            onChange={(e) =>
                              setEditingPin((prev) =>
                                prev
                                  ? { ...prev, desc: e.target.value }
                                  : { ...activePin, desc: e.target.value }
                              )
                            }
                            placeholder="Describe this pin or landmark lore…"
                            className="w-full rounded-2xl border-2 border-foreground bg-[#FFF9F2] px-3.5 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            spellCheck={false}
                          />
                        </div>

                        {/* Field 7: Pin Image (Upload local file OR attach via URL, auto-downscaling) */}
                        <div className="rounded-2xl border-2 border-foreground bg-[#fdf2f6] p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                              Pin Image
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setImageInputMode('upload')}
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-all cursor-pointer ${
                                  imageInputMode === 'upload'
                                    ? 'bg-foreground text-white border-foreground'
                                    : 'bg-card text-muted-foreground border-foreground/30 hover:bg-accent'
                                }`}
                              >
                                📁 Local File
                              </button>
                              <button
                                type="button"
                                onClick={() => setImageInputMode('url')}
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-all cursor-pointer ${
                                  imageInputMode === 'url'
                                    ? 'bg-foreground text-white border-foreground'
                                    : 'bg-card text-muted-foreground border-foreground/30 hover:bg-accent'
                                }`}
                              >
                                🌐 Internet URL
                              </button>
                            </div>
                          </div>

                          {imageInputMode === 'upload' ? (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLocalImageUpload}
                                disabled={isCompressingImage}
                                className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-2 file:border-foreground file:bg-primary file:px-3 file:py-1 file:text-xs file:font-bold file:text-foreground hover:file:bg-accent cursor-pointer"
                              />
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {isCompressingImage
                                  ? 'Optimizing image size to match pin…'
                                  : 'Local images are automatically downsized to match the pin marker size.'}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="url"
                                  value={imageUrlDraft}
                                  onChange={(e) => setImageUrlDraft(e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                  className="flex-1 rounded-xl border-2 border-foreground bg-card px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                                  autoComplete="off"
                                  spellCheck={false}
                                />
                                <button
                                  type="button"
                                  onClick={handleApplyImageUrl}
                                  disabled={!imageUrlDraft.trim() || isCompressingImage}
                                  className="rounded-xl border-2 border-foreground bg-primary hover:bg-accent px-3 py-1.5 text-xs font-bold text-foreground disabled:opacity-50 cursor-pointer"
                                >
                                  {isCompressingImage ? '…' : 'Attach'}
                                </button>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Paste web image link. Automatically scaled for pin.
                              </p>
                            </div>
                          )}

                          {/* Image Preview & Remove button */}
                          {activePin.image && (
                            <div className="mt-2 space-y-2">
                              <div className="relative rounded-xl border-2 border-foreground overflow-hidden bg-white max-h-36">
                                <img
                                  src={activePin.image}
                                  alt="Pin preview"
                                  className="w-full h-32 object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPin((prev) =>
                                    prev ? { ...prev, image: null } : { ...activePin, image: null }
                                  );
                                  setImageUrlDraft('');
                                }}
                                className="w-full rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 py-1 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                              >
                                Remove image
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Coordinates Info */}
                        <div className="text-[11px] font-mono text-muted-foreground">
                          Coordinates: X: {Math.round(activePin.x)}, Y: {Math.round(activePin.y)}
                        </div>

                        {/* Action Buttons: Save, Delete, Cancel */}
                        <div className="flex items-center gap-2 pt-2 border-t-2 border-dashed border-foreground/20">
                          <button
                            type="button"
                            onClick={handleSavePin}
                            className="flex-1 rounded-2xl border-2 border-foreground bg-[#f48fb1] hover:bg-[#f06292] py-2.5 text-sm font-bold text-foreground shadow-ink active:translate-y-0.5 transition-all cursor-pointer"
                          >
                            Save Pin
                          </button>

                          {!activePin.isNew && activePin.id && (
                            <button
                              type="button"
                              onClick={() => setDeletingPinId(activePin.id || null)}
                              className="flex-1 rounded-2xl border-2 border-foreground bg-[#fee2e2] hover:bg-[#fca5a5] py-2.5 text-sm font-bold text-[#991b1b] shadow-ink active:translate-y-0.5 transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          )}

                      <button
                        type="button"
                        onClick={() => {
                          if (draftMarkerRef.current) {
                            draftMarkerRef.current.remove();
                            draftMarkerRef.current = null;
                          }
                          // Reset to a clean draft pin
                          setEditingPin({
                            name: 'New Pin',
                            cat: 'landmark',
                            subcat: '',
                            owned: false,
                            tags: [],
                            desc: '',
                            image: null,
                            x: Math.round(MAP_SIZE / 2),
                            y: Math.round(MAP_SIZE / 2),
                            isNew: true,
                          });
                        }}
                        className="rounded-2xl border-2 border-foreground bg-card hover:bg-accent px-4 py-2.5 text-sm font-bold text-foreground active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        Reset Draft
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
                /* Inactive state: User has not clicked Adjust Pins yet */
                <div className="rounded-2xl border-2 border-dashed border-foreground/30 bg-[#FFF9F2] p-8 text-center space-y-4">
                  <div className="text-4xl select-none">🗺️</div>
                  <div>
                    <h4 className="text-base font-extrabold text-foreground">
                      Edit Pins Inactive
                    </h4>
                    <p className="mt-1 text-xs font-medium text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      Click the <strong className="text-foreground">"Adjust Pin Button"</strong> below the map to activate pin placement, drag-and-drop repositioning, and editing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAdjustPins}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-primary hover:bg-accent px-5 py-2 text-xs font-extrabold text-foreground shadow-ink active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>✎</span>
                    <span>Click to Adjust Pins</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        /* Placeholder View for Whalefall Canyon or other games */
        <div className="rounded-[28px] border-[3px] border-foreground bg-card p-10 sm:p-14 shadow-ink text-center max-w-2xl mx-auto my-8 space-y-4">
          <div className="text-6xl">{selectedGame === 'heartopia' ? '🏜️' : currentGame.icon}</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-sans">
            {selectedGame === 'heartopia' ? currentMap.name : `${currentGame.name} Map`}
          </h2>
          <p className="text-sm sm:text-base font-medium text-muted-foreground font-sans max-w-md mx-auto">
            {selectedGame === 'heartopia'
              ? 'Whalefall Canyon map image is coming soon. Once uploaded, pin placement, categorization, and editing will be fully enabled here!'
              : `Map charting for ${currentGame.name} is currently in progress. Check back soon for full interactive pin editing!`}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedGame('heartopia');
                setSelectedMap('island');
              }}
              className="rounded-full border-2 border-foreground bg-primary hover:bg-accent px-5 py-2 font-sans text-sm font-bold text-foreground shadow-ink active:translate-y-0.5 transition-all cursor-pointer"
            >
              ← Back to Heartopia Island Map
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPinId)}
        title="Delete Pin?"
        message="Are you sure you want to delete this pin? This action cannot be undone."
        confirmLabel="Delete Pin"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPinId(null)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Pins?"
        message="Are you sure you want to reset all pins back to the default map locations? Any custom pins will be replaced."
        confirmLabel="Reset Pins"
        onConfirm={() => {
          resetPins();
          setToast({
            id: String(Date.now()),
            type: 'info',
            text: 'Reset all pins to default positions.',
          });
          setIsResetConfirmOpen(false);
          setEditingPin(null);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Draggable Add Category Modal Window */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSave={(newCatData) => {
          const created = addCategory(newCatData);
          setEditingPin((prev) =>
            prev
              ? { ...prev, cat: created.id }
              : {
                  name: 'New Pin',
                  cat: created.id,
                  subcat: '',
                  owned: false,
                  tags: [],
                  desc: '',
                  image: null,
                  x: Math.round(MAP_SIZE / 2),
                  y: Math.round(MAP_SIZE / 2),
                  isNew: true,
                }
          );
          setToast({
            id: String(Date.now()),
            type: 'success',
            text: `Added new category "${created.label}"!`,
          });
        }}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
};
