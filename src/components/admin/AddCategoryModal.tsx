import React, { useState, useRef, useEffect } from 'react';
import { compressImageToPinSize } from '../../types/map';

export interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: {
    label: string;
    image?: string | null;
    color: string;
    icon: string;
  }) => void;
}

const PRESET_COLORS = [
  { name: 'Gold', hex: '#c3a468' },
  { name: 'Forest', hex: '#6b8f5e' },
  { name: 'Amber', hex: '#e2932a' },
  { name: 'Blossom', hex: '#f48fb1' },
  { name: 'Mint', hex: '#86efac' },
  { name: 'Sky', hex: '#7dd3fc' },
  { name: 'Lavender', hex: '#d8b4fe' },
  { name: 'Peach', hex: '#fed7aa' },
];

const PRESET_ICONS = ['★', '◆', '🎁', '💎', '🌸', '🍄', '🐟', '🐾', '🍎', '⛏️', '🌿', '📍'];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [label, setLabel] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#c3a468');
  const [selectedIcon, setSelectedIcon] = useState<string>('★');
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [urlDraft, setUrlDraft] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Floating Draggable Position
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const initialWidth = 420;
      const initialHeight = 540;
      return {
        x: Math.max(16, Math.round((window.innerWidth - initialWidth) / 2)),
        y: Math.max(30, Math.round((window.innerHeight - initialHeight) / 2)),
      };
    }
    return { x: 80, y: 80 };
  });

  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLabel('');
      setSelectedColor('#f48fb1');
      setSelectedIcon('★');
      setCategoryImage(null);
      setUrlDraft('');
      setErrorMsg('');
      // Recenter lightly
      if (typeof window !== 'undefined') {
        const initialWidth = 420;
        const initialHeight = 540;
        setPosition({
          x: Math.max(16, Math.round((window.innerWidth - initialWidth) / 2)),
          y: Math.max(30, Math.round((window.innerHeight - initialHeight) / 2)),
        });
      }
    }
  }, [isOpen]);

  // Handle Drag Events
  const handleDragStart = (clientX: number, clientY: number, target: EventTarget | null) => {
    if ((target as HTMLElement)?.closest('button, input, select, textarea, label')) {
      return;
    }
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY, e.target);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const modalWidth = 420;
      const maxX = Math.max(20, window.innerWidth - modalWidth - 20);
      const maxY = Math.max(20, window.innerHeight - 120);

      setPosition({
        x: Math.min(maxX, Math.max(10, dragStartRef.current.posX + dx)),
        y: Math.min(maxY, Math.max(10, dragStartRef.current.posY + dy)),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !e.touches[0]) return;
      const dx = e.touches[0].clientX - dragStartRef.current.mouseX;
      const dy = e.touches[0].clientY - dragStartRef.current.mouseY;
      const modalWidth = 420;
      const maxX = Math.max(20, window.innerWidth - modalWidth - 20);
      const maxY = Math.max(20, window.innerHeight - 120);

      setPosition({
        x: Math.min(maxX, Math.max(10, dragStartRef.current.posX + dx)),
        y: Math.min(maxY, Math.max(10, dragStartRef.current.posY + dy)),
      });
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  // Handle local image file upload & compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMsg('');
      const compressed = await compressImageToPinSize(file, 240, 0.85);
      setCategoryImage(compressed);
    } catch {
      setErrorMsg('Could not read or process image file.');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  // Handle URL image attachment
  const handleApplyUrl = async () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;

    try {
      setIsCompressing(true);
      setErrorMsg('');
      const compressed = await compressImageToPinSize(trimmed, 240, 0.85);
      setCategoryImage(compressed);
      setUrlDraft('');
    } catch {
      // Fallback: save raw URL
      setCategoryImage(trimmed);
      setUrlDraft('');
    } finally {
      setIsCompressing(false);
    }
  };

  // Submit and save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      setErrorMsg('Category name is required.');
      return;
    }

    onSave({
      label: trimmed,
      image: categoryImage,
      color: selectedColor,
      icon: selectedIcon,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none">
      {/* Draggable Window Container */}
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          width: '92vw',
          maxWidth: '430px',
        }}
        className="pointer-events-auto absolute top-0 left-0 rounded-[28px] border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_#4a2835] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Draggable Title Bar / Header */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="flex items-center justify-between px-4 py-3 bg-[#fdf2f6] border-b-2 border-foreground cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-mono tracking-tighter" title="Drag window">
              ⋮⋮
            </span>
            <span className="text-lg">🏷️</span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground font-sans leading-tight">
                Add New Category
              </h3>
              <p className="text-[10px] text-muted-foreground font-sans">
                Drag bar to reposition anywhere
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full border-2 border-foreground bg-background hover:bg-accent text-xs font-bold text-foreground flex items-center justify-center cursor-pointer active:translate-y-0.5 shadow-xs transition-all"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* 1. Category Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              maxLength={40}
              required
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Fishing Spot, Secret Caves, Fruit"
              className="w-full rounded-xl border-2 border-foreground bg-background px-3 py-1.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            />
          </div>

          {/* 2. Category Image Attachment */}
          <div className="rounded-2xl border-2 border-foreground/30 bg-[#FFF9F2] p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category Image (optional)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                    imageInputMode === 'upload'
                      ? 'bg-primary border-foreground text-foreground shadow-xs'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Local File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                    imageInputMode === 'url'
                      ? 'bg-primary border-foreground text-foreground shadow-xs'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Web URL
                </button>
              </div>
            </div>

            {imageInputMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isCompressing}
                  className="block w-full text-xs text-muted-foreground file:mr-2.5 file:rounded-full file:border-2 file:border-foreground file:bg-card file:px-3 file:py-1 file:text-xs file:font-bold file:text-foreground hover:file:bg-accent cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Pins in this category will display this image as their marker.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  className="flex-1 rounded-xl border border-foreground/40 bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={isCompressing || !urlDraft.trim()}
                  className="shrink-0 rounded-xl border-2 border-foreground bg-primary px-3 py-1 text-xs font-bold text-foreground hover:bg-accent disabled:opacity-50 cursor-pointer shadow-xs active:translate-y-0.5"
                >
                  {isCompressing ? '...' : 'Attach'}
                </button>
              </div>
            )}

            {/* Thumbnail Preview with Delete */}
            {categoryImage && (
              <div className="flex items-center gap-3 pt-1">
                <div className="relative inline-block">
                  <img
                    src={categoryImage}
                    alt="Category thumbnail"
                    className="size-14 object-cover rounded-xl border-2 border-foreground shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setCategoryImage(null)}
                    title="Remove image"
                    className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-rose-600 text-white font-mono text-[10px] flex items-center justify-center border border-white cursor-pointer hover:bg-rose-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs font-semibold text-emerald-800">
                  ✓ Image attached
                </div>
              </div>
            )}
          </div>

          {/* 3. Color & Icon Selection */}
          <div className="grid grid-cols-2 gap-3">
            {/* Color Palette */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Badge Color
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`size-6 rounded-full border-2 border-foreground transition-transform ${
                      selectedColor === c.hex ? 'scale-115 ring-2 ring-primary' : 'hover:scale-105'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Fallback Icon / Emoji */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Icon Emoji
              </label>
              <div className="flex flex-wrap gap-1">
                {PRESET_ICONS.slice(0, 8).map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setSelectedIcon(ic)}
                    className={`size-6 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
                      selectedIcon === ic
                        ? 'bg-primary border-foreground shadow-xs scale-110'
                        : 'border-foreground/30 hover:bg-accent'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Live Teardrop Marker Preview */}
          <div className="rounded-2xl border-2 border-dashed border-foreground/30 bg-[#FFFDF7] p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Marker Preview
              </span>
              <span className="text-xs font-bold text-foreground">
                {label.trim() || 'New Category'}
              </span>
            </div>

            {/* Teardrop Leaflet Marker Simulation */}
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: selectedColor,
                  backgroundImage: categoryImage ? `url('${categoryImage}')` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                className="interactive-pin flex items-center justify-center text-sm shadow-xs"
              >
                {!categoryImage && <span>{selectedIcon}</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-dashed border-foreground/30">
            <button
              type="submit"
              disabled={!label.trim() || isCompressing}
              className="flex-1 rounded-2xl border-2 border-foreground bg-[#86efac] hover:bg-[#4ade80] py-2.5 px-4 font-sans text-sm font-extrabold text-foreground shadow-ink active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              Save Category
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border-2 border-foreground bg-card hover:bg-accent py-2.5 px-4 font-sans text-sm font-bold text-foreground active:translate-y-0.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
