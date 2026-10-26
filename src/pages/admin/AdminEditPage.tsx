import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEvents } from '../../hooks/useEvents';
import {
  HeartopiaEvent,
  EventPlatform,
  EventVisibility,
  PLATFORM_CONFIG,
} from '../../types/event';
import {
  toDateInputValue,
  toTimeInputValue,
  combineDateTimeToUTC,
  getWeekdayName,
  getCommonTimeZones,
} from '../../utils/dateTime';
import { Toast, ToastMessage } from '../../components/admin/Toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { AdminEditTabs } from '../../components/admin/AdminEditTabs';

interface FormState {
  title: string;
  platform: EventPlatform;
  locationChoice: string;
  customLocation: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timeZone: string;
  details: string;
  prize: string;
  imageUrl: string;
  visibility: EventVisibility;
}

const DEFAULT_FORM_STATE = (): FormState => {
  const now = new Date();
  const later = new Date(now.getTime() + 2 * 3600 * 1000);

  return {
    title: '',
    platform: 'heartopia',
    locationChoice: 'Blossom Meadow',
    customLocation: '',
    startDate: toDateInputValue(now),
    startTime: toTimeInputValue(now),
    endDate: toDateInputValue(later),
    endTime: toTimeInputValue(later),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    details: '',
    prize: '',
    imageUrl: '',
    visibility: 'published',
  };
};

export const AdminEditPage: React.FC = () => {
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedEventId = searchParams.get('id');

  // Currently loaded event from DB/storage
  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Form State
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);

  // Refs for auto-opening native pickers when clicking anywhere on date & time pills
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);

  // Time zones list
  const timeZones = useMemo(() => getCommonTimeZones(), []);

  // Populate form when currentEvent changes or when switching to new event
  useEffect(() => {
    if (currentEvent) {
      const start = new Date(currentEvent.starts_at);
      const end = new Date(currentEvent.ends_at);

      const knownLocations = PLATFORM_CONFIG[currentEvent.platform]?.defaultLocations || [];
      const isKnown = knownLocations.includes(currentEvent.location);

      setForm({
        title: currentEvent.title,
        platform: currentEvent.platform,
        locationChoice: isKnown ? currentEvent.location : '__other__',
        customLocation: isKnown ? '' : currentEvent.location,
        startDate: toDateInputValue(start),
        startTime: toTimeInputValue(start),
        endDate: toDateInputValue(end),
        endTime: toTimeInputValue(end),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        details: currentEvent.details || '',
        prize: currentEvent.prize || '',
        imageUrl: currentEvent.image_url || '',
        visibility: currentEvent.visibility,
      });
      setIsDirty(false);
    } else {
      setForm(DEFAULT_FORM_STATE());
      setIsDirty(false);
    }
  }, [currentEvent]);

  // Generic form field updater
  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      // If platform changed, reset location choice if not valid
      if (key === 'platform') {
        const newPlatform = value as EventPlatform;
        const available = PLATFORM_CONFIG[newPlatform]?.defaultLocations || [];
        next.locationChoice = available[0] || '__other__';
        next.customLocation = '';
      }

      return next;
    });
    setIsDirty(true);
  };

  // Resolved location string
  const resolvedLocation = useMemo(() => {
    if (form.locationChoice === '__other__') {
      return form.customLocation.trim();
    }
    return form.locationChoice.trim();
  }, [form.locationChoice, form.customLocation]);

  // Derived start weekday name
  const startWeekday = useMemo(() => {
    return getWeekdayName(form.startDate);
  }, [form.startDate]);

  // End weekday name
  const endWeekday = useMemo(() => {
    return getWeekdayName(form.endDate);
  }, [form.endDate]);

  // Computed ISO UTC timestamps & validation
  const validation = useMemo(() => {
    const errors: Record<string, string> = {};

    // Title validation
    if (!form.title.trim()) {
      errors.title = 'Title is required.';
    } else if (form.title.length > 80) {
      errors.title = `Title must be 80 characters or less (currently ${form.title.length}).`;
    }

    // Platform validation
    if (!form.platform) {
      errors.platform = 'Platform is required.';
    }

    // Location validation
    if (!resolvedLocation) {
      errors.location = 'Location is required. Select an option or specify custom text.';
    }

    // Date & Time validation
    let startsAtUtc = '';
    let endsAtUtc = '';

    try {
      startsAtUtc = combineDateTimeToUTC(form.startDate, form.startTime, form.timeZone);
    } catch {
      errors.startDate = 'Invalid start date or time.';
    }

    try {
      endsAtUtc = combineDateTimeToUTC(form.endDate, form.endTime, form.timeZone);
    } catch {
      errors.endDate = 'Invalid end date or time.';
    }

    if (startsAtUtc && endsAtUtc) {
      const s = new Date(startsAtUtc).getTime();
      const e = new Date(endsAtUtc).getTime();
      if (e <= s) {
        errors.endDate = 'End time must be after start time.';
      }
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
      startsAtUtc,
      endsAtUtc,
    };
  }, [form, resolvedLocation]);

  // Live JSON Preview Object
  const jsonPreviewObject = useMemo(() => {
    return {
      id: currentEvent?.id || 'generated-uuid-v4',
      title: form.title.trim() || 'Untitled Event',
      platform: form.platform,
      location: resolvedLocation || '(unspecified)',
      starts_at: validation.startsAtUtc || 'YYYY-MM-DDTHH:mm:ss.sssZ',
      ends_at: validation.endsAtUtc || 'YYYY-MM-DDTHH:mm:ss.sssZ',
      details: form.details.trim(),
      prize: form.prize.trim() ? form.prize.trim() : null,
      image_url: form.imageUrl.trim() ? form.imageUrl.trim() : null,
      visibility: form.visibility,
      source: 'manual',
      updated_at: new Date().toISOString(),
    };
  }, [currentEvent, form, resolvedLocation, validation]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!validation.isValid) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: 'Please fix the validation errors before saving.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        platform: form.platform,
        location: resolvedLocation,
        starts_at: validation.startsAtUtc,
        ends_at: validation.endsAtUtc,
        details: form.details.trim(),
        prize: form.prize.trim() ? form.prize.trim() : null,
        image_url: form.imageUrl.trim() ? form.imageUrl.trim() : null,
        visibility: form.visibility,
        source: 'manual' as const,
      };

      if (currentEvent) {
        // Update existing
        await updateEvent(currentEvent.id, payload);
        setIsDirty(false);
        setToast({
          id: String(Date.now()),
          type: 'success',
          text: `Saved changes to "${payload.title}".`,
        });
      } else {
        // Create new
        const created = await createEvent(payload);
        setIsDirty(false);
        setSearchParams({ id: created.id });
        setToast({
          id: String(Date.now()),
          type: 'success',
          text: `Created new event "${created.title}".`,
        });
      }
    } catch (err) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save event.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validation, form, resolvedLocation, currentEvent, updateEvent, createEvent, setSearchParams]);

  // Duplicate / Save as new
  const handleSaveAsNew = async () => {
    if (!validation.isValid) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: 'Please fix validation errors before saving.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: `${form.title.trim()} (Copy)`,
        platform: form.platform,
        location: resolvedLocation,
        starts_at: validation.startsAtUtc,
        ends_at: validation.endsAtUtc,
        details: form.details.trim(),
        prize: form.prize.trim() ? form.prize.trim() : null,
        image_url: form.imageUrl.trim() ? form.imageUrl.trim() : null,
        visibility: form.visibility,
        source: 'manual' as const,
      };

      const created = await createEvent(payload);
      setSearchParams({ id: created.id });
      setIsDirty(false);
      setToast({
        id: String(Date.now()),
        type: 'success',
        text: `Duplicated as new event "${created.title}".`,
      });
    } catch (err) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to duplicate event.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset changes
  const handleReset = () => {
    if (currentEvent) {
      const start = new Date(currentEvent.starts_at);
      const end = new Date(currentEvent.ends_at);
      const knownLocations = PLATFORM_CONFIG[currentEvent.platform]?.defaultLocations || [];
      const isKnown = knownLocations.includes(currentEvent.location);

      setForm({
        title: currentEvent.title,
        platform: currentEvent.platform,
        locationChoice: isKnown ? currentEvent.location : '__other__',
        customLocation: isKnown ? '' : currentEvent.location,
        startDate: toDateInputValue(start),
        startTime: toTimeInputValue(start),
        endDate: toDateInputValue(end),
        endTime: toTimeInputValue(end),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        details: currentEvent.details || '',
        prize: currentEvent.prize || '',
        imageUrl: currentEvent.image_url || '',
        visibility: currentEvent.visibility,
      });
    } else {
      setForm(DEFAULT_FORM_STATE());
    }
    setIsDirty(false);
    setToast({
      id: String(Date.now()),
      type: 'info',
      text: 'Form reset to original state.',
    });
  };

  // Delete current event
  const handleDelete = async () => {
    if (!currentEvent) return;
    try {
      await deleteEvent(currentEvent.id);
      setSearchParams({});
      setForm(DEFAULT_FORM_STATE());
      setIsDirty(false);
      setToast({
        id: String(Date.now()),
        type: 'success',
        text: `Deleted event "${currentEvent.title}".`,
      });
    } catch (err) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete event.',
      });
    } finally {
      setConfirmDelete(false);
    }
  };

  // Keyboard shortcut Ctrl/Cmd + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const platformLocations = PLATFORM_CONFIG[form.platform]?.defaultLocations || [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      {/* Clickable Admin Tabs: Events, Codes */}
      <AdminEditTabs currentTab="events" />

      {/* Top Bar with "Edit Events" and "+ New event" Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
            <span>Edit Events</span>
            <span className="text-2xl" title="Tulip Garden Theme">🌷</span>
          </h1>
          {isDirty && (
            <span className="flex items-center gap-1.5 rounded-full border-2 border-amber-500 bg-amber-100 px-2.5 py-0.5 font-sans text-xs font-bold text-amber-900 shadow-xs">
              <span className="size-2 rounded-full bg-amber-500 animate-ping" />
              unsaved changes
            </span>
          )}
        </div>

        {/* Action Controls: Event Switcher & + New event */}
        <div className="flex flex-wrap items-center gap-2">
          {events.length > 0 && (
            <select
              id="event-selector"
              aria-label="Select existing event to edit"
              value={selectedEventId || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setSearchParams({ id: val });
                } else {
                  setSearchParams({});
                }
              }}
              className="rounded-xl border-2 border-foreground/50 bg-card px-3 py-2 font-sans text-xs sm:text-sm font-semibold text-foreground focus:border-foreground focus:outline-none cursor-pointer max-w-[200px] truncate shadow-xs"
            >
              <option value="">📂 Select record...</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({PLATFORM_CONFIG[ev.platform]?.label || ev.platform})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => {
              setSearchParams({});
              setForm(DEFAULT_FORM_STATE());
              setIsDirty(false);
            }}
            className="flex items-center gap-1.5 rounded-xl border-2 border-foreground bg-card hover:bg-[#fdf2f6] px-4 py-2 font-sans font-bold text-sm text-foreground shadow-xs active:translate-y-0.5 transition-all cursor-pointer"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>New event</span>
          </button>
        </div>
      </div>

      {/* Main Card: Styled exactly like the design reference with Tulip Pink drop-shadow */}
      <div className="rounded-[28px] border-[2.5px] border-foreground bg-card p-6 sm:p-9 shadow-[4px_4px_0_0_#f472b6]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          noValidate
        >
          {/* Card Sub-header: "New event" / "New record" */}
          <div className="flex items-center justify-between pb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-sans tracking-tight">
              {currentEvent ? 'Edit event' : 'New event'}
            </h2>
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground font-sans">
              {currentEvent ? `Record #${currentEvent.id.slice(0, 8)}` : 'New record'}
            </span>
          </div>

          <div className="space-y-5">
            {/* ROW 1: Event title + Platform */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              {/* Event title */}
              <div className="w-full sm:w-[62%]">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="field-title" className="font-sans font-bold text-sm sm:text-base text-foreground">
                    Event title
                  </label>
                  {form.title.length > 80 && (
                    <span className="text-xs font-bold text-rose-600">
                      {form.title.length}/80 max
                    </span>
                  )}
                </div>
                <input
                  id="field-title"
                  type="text"
                  maxLength={100}
                  required
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Cozy Blossom Picnic"
                  aria-invalid={!!validation.errors.title}
                  className="w-full rounded-full border-2 border-foreground bg-[#fdf2f6] px-5 py-2.5 text-sm sm:text-base font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#f472b6] transition-all"
                />
                {validation.errors.title && (
                  <p role="alert" className="mt-1 pl-4 text-xs font-bold text-rose-600">
                    ⚠️ {validation.errors.title}
                  </p>
                )}
              </div>

              {/* Platform */}
              <div className="w-full sm:w-[38%]">
                <label htmlFor="field-platform" className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                  Platform
                </label>
                <div className="relative">
                  <select
                    id="field-platform"
                    value={form.platform}
                    onChange={(e) => updateField('platform', e.target.value as EventPlatform)}
                    className="w-full appearance-none rounded-full border-2 border-foreground bg-[#fdf2f6] px-5 py-2.5 pr-10 text-sm sm:text-base font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#f472b6] cursor-pointer transition-all"
                  >
                    {Object.entries(PLATFORM_CONFIG).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Location + Prize */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              {/* Location */}
              <div className="w-full sm:w-[62%]">
                <label htmlFor="field-location" className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                  Location
                </label>
                <input
                  id="field-location"
                  type="text"
                  value={form.locationChoice === '__other__' ? form.customLocation : form.locationChoice}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (platformLocations.includes(val)) {
                      updateField('locationChoice', val);
                      updateField('customLocation', '');
                    } else {
                      updateField('locationChoice', '__other__');
                      updateField('customLocation', val);
                    }
                  }}
                  list="platform-locations-list"
                  placeholder="e.g. Blossom Meadow"
                  className="w-full rounded-full border-2 border-foreground bg-[#fdf2f6] px-5 py-2.5 text-sm sm:text-base font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#f472b6] transition-all"
                />
                <datalist id="platform-locations-list">
                  {platformLocations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>

                {/* Comfy light green chips for fast one-tap selection */}
                <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                  {platformLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        updateField('locationChoice', loc);
                        updateField('customLocation', '');
                      }}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all active:translate-y-0.5 cursor-pointer ${
                        resolvedLocation === loc
                          ? 'bg-[#bbf7d0] border-foreground text-foreground shadow-xs font-bold'
                          : 'bg-[#fdf2f6] border-foreground/30 text-muted-foreground hover:bg-[#dcfce7] hover:text-foreground'
                      }`}
                    >
                      📍 {loc}
                    </button>
                  ))}
                </div>
                {validation.errors.location && (
                  <p role="alert" className="mt-1 pl-4 text-xs font-bold text-rose-600">
                    ⚠️ {validation.errors.location}
                  </p>
                )}
              </div>

              {/* Prize */}
              <div className="w-full sm:w-[38%]">
                <label htmlFor="field-prize" className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                  Prize
                </label>
                <input
                  id="field-prize"
                  type="text"
                  value={form.prize}
                  onChange={(e) => updateField('prize', e.target.value)}
                  placeholder="e.g. Strawberry Basket Decor"
                  className="w-full rounded-full border-2 border-foreground bg-[#fdf2f6] px-5 py-2.5 text-sm sm:text-base font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#f472b6] transition-all"
                />
              </div>
            </div>

            {/* ROW 3: Start date + Start time + Start day (Shorter Compact Pills) */}
            <div className="flex flex-wrap items-end gap-3 sm:gap-4">
              {/* Start date */}
              <div>
                <label htmlFor="field-start-date" className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                  Start date
                </label>
                <div
                  onClick={() => {
                    try {
                      startDateInputRef.current?.showPicker();
                    } catch {}
                    startDateInputRef.current?.focus();
                  }}
                  className="w-[145px] sm:w-[155px] h-[42px] relative flex items-center rounded-full border-2 border-foreground bg-[#fdf2f6] px-3.5 focus-within:ring-2 focus-within:ring-[#f472b6] cursor-pointer transition-all"
                >
                  <input
                    ref={startDateInputRef}
                    id="field-start-date"
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full bg-transparent font-sans text-xs sm:text-sm font-bold text-foreground focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Start time (Single clock icon, clicks open time picker) */}
              <div>
                <label htmlFor="field-start-time" className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                  Start time
                </label>
                <div
                  onClick={() => {
                    try {
                      startTimeInputRef.current?.showPicker();
                    } catch {}
                    startTimeInputRef.current?.focus();
                  }}
                  className="w-[145px] sm:w-[155px] h-[42px] relative flex items-center rounded-full border-2 border-foreground bg-[#fdf2f6] px-3.5 focus-within:ring-2 focus-within:ring-[#f472b6] cursor-pointer transition-all"
                >
                  <input
                    ref={startTimeInputRef}
                    id="field-start-time"
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => updateField('startTime', e.target.value)}
                    className="w-full bg-transparent font-sans text-xs sm:text-sm font-bold text-foreground focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Start day */}
              <div>
                <span className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                  Start day
                </span>
                <div className="w-[120px] sm:w-[130px] h-[42px] flex items-center justify-center rounded-full border-2 border-foreground bg-[#fdf2f6] px-3 font-sans font-bold text-xs sm:text-sm text-foreground select-none">
                  {startWeekday || '—'}
                </div>
              </div>
            </div>

            {/* ROW 4: End date + End time + End day (Shorter Compact Pills) */}
            <div className="flex flex-wrap items-end gap-3 sm:gap-4">
              {/* End date */}
              <div>
                <label htmlFor="field-end-date" className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                  End date
                </label>
                <div
                  onClick={() => {
                    try {
                      endDateInputRef.current?.showPicker();
                    } catch {}
                    endDateInputRef.current?.focus();
                  }}
                  className="w-[145px] sm:w-[155px] h-[42px] relative flex items-center rounded-full border-2 border-foreground bg-[#fdf2f6] px-3.5 focus-within:ring-2 focus-within:ring-[#f472b6] cursor-pointer transition-all"
                >
                  <input
                    ref={endDateInputRef}
                    id="field-end-date"
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full bg-transparent font-sans text-xs sm:text-sm font-bold text-foreground focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* End time (Single clock icon, clicks open time picker) */}
              <div>
                <label htmlFor="field-end-time" className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                  End time
                </label>
                <div
                  onClick={() => {
                    try {
                      endTimeInputRef.current?.showPicker();
                    } catch {}
                    endTimeInputRef.current?.focus();
                  }}
                  className="w-[145px] sm:w-[155px] h-[42px] relative flex items-center rounded-full border-2 border-foreground bg-[#fdf2f6] px-3.5 focus-within:ring-2 focus-within:ring-[#f472b6] cursor-pointer transition-all"
                >
                  <input
                    ref={endTimeInputRef}
                    id="field-end-time"
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => updateField('endTime', e.target.value)}
                    className="w-full bg-transparent font-sans text-xs sm:text-sm font-bold text-foreground focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* End day */}
              <div>
                <span className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                  End day
                </span>
                <div className="w-[120px] sm:w-[130px] h-[42px] flex items-center justify-center rounded-full border-2 border-foreground bg-[#fdf2f6] px-3 font-sans font-bold text-xs sm:text-sm text-foreground select-none">
                  {endWeekday || '—'}
                </div>
              </div>
            </div>

            {validation.errors.endDate && (
              <p role="alert" className="pl-4 text-xs font-bold text-rose-600">
                ⚠️ {validation.errors.endDate}
              </p>
            )}

            {/* ROW 5: Event details */}
            <div>
              <label htmlFor="field-details" className="block font-sans font-bold text-sm sm:text-base text-foreground mb-1.5">
                Event details
              </label>
              <textarea
                id="field-details"
                rows={4}
                value={form.details}
                onChange={(e) => updateField('details', e.target.value)}
                placeholder="Write down the cozy event description, activities, or guidelines..."
                className="w-full rounded-2xl sm:rounded-3xl border-2 border-foreground bg-[#fdf2f6] p-4 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#f472b6] transition-all resize-y min-h-[110px]"
              />
            </div>

            {/* Extra Options: Image URL & Visibility (with comfy green and tulip pink styling) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-1">
              <div>
                <label htmlFor="field-image-url" className="block font-sans font-bold text-sm text-foreground mb-1.5">
                  Event image <span className="text-xs font-normal text-muted-foreground">(optional URL)</span>
                </label>
                <div className="relative flex items-center rounded-full border-2 border-foreground bg-[#fdf2f6] px-4 py-2 focus-within:ring-2 focus-within:ring-[#f472b6] transition-all">
                  <span className="mr-2 text-foreground/80 select-none">🖼️</span>
                  <input
                    id="field-image-url"
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => updateField('imageUrl', e.target.value)}
                    placeholder="https://... (image URL)"
                    className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="block font-sans font-bold text-sm text-foreground mb-1.5">
                  Visibility
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('visibility', 'published')}
                    className={`flex-1 rounded-full border-2 border-foreground py-2 px-3 text-xs sm:text-sm font-bold transition-all active:translate-y-0.5 cursor-pointer ${
                      form.visibility === 'published'
                        ? 'bg-[#bbf7d0] text-foreground shadow-[2px_2px_0_0_#4a2835]'
                        : 'bg-[#fdf2f6] text-muted-foreground hover:bg-[#dcfce7] hover:text-foreground'
                    }`}
                  >
                    🌿 Published
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('visibility', 'draft')}
                    className={`flex-1 rounded-full border-2 border-foreground py-2 px-3 text-xs sm:text-sm font-bold transition-all active:translate-y-0.5 cursor-pointer ${
                      form.visibility === 'draft'
                        ? 'bg-[#fbcfe8] text-foreground shadow-[2px_2px_0_0_#4a2835]'
                        : 'bg-[#fdf2f6] text-muted-foreground hover:bg-[#fbcfe8]/40 hover:text-foreground'
                    }`}
                  >
                    📝 Draft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions: "💾 Save event" matching screenshot */}
          <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t-2 border-dashed border-foreground/20">
            <button
              type="submit"
              disabled={isSubmitting || !validation.isValid}
              className="flex items-center gap-2 rounded-xl border-2 border-foreground bg-[#f48fb1] hover:bg-[#f06292] px-6 py-2.5 font-sans font-bold text-sm sm:text-base text-foreground shadow-[3px_3px_0_0_#4a2835] active:translate-y-0.5 active:shadow-[1px_1px_0_0_#4a2835] disabled:opacity-50 transition-all cursor-pointer select-none"
            >
              <span className="text-base">💾</span>
              <span>Save event</span>
            </button>

            {currentEvent && (
              <button
                type="button"
                onClick={handleSaveAsNew}
                disabled={isSubmitting || !validation.isValid}
                className="flex items-center gap-1.5 rounded-xl border-2 border-foreground bg-[#bbf7d0] hover:bg-[#86efac] px-4 py-2.5 font-sans font-bold text-xs sm:text-sm text-foreground shadow-[3px_3px_0_0_#4a2835] active:translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer select-none"
              >
                <span>📋</span>
                <span>Save as new</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty}
              className="flex items-center gap-1 rounded-xl border-2 border-foreground/40 bg-card hover:bg-[#fdf2f6] px-4 py-2.5 font-sans font-bold text-xs sm:text-sm text-foreground active:translate-y-0.5 disabled:opacity-40 transition-all cursor-pointer"
            >
              <span>↺</span>
              <span>Reset</span>
            </button>

            {currentEvent && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="ml-auto flex items-center gap-1 rounded-xl border-2 border-rose-400 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 font-sans font-bold text-xs sm:text-sm text-rose-700 shadow-[2px_2px_0_0_#f43f5e] active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>🗑️</span>
                <span>Delete</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Collapsible Developer & Timezone Inspector */}
      <div className="mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setShowDevPanel(!showDevPanel)}
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/20 hover:border-foreground/50 transition-colors cursor-pointer select-none"
        >
          <span>{showDevPanel ? '▲ Hide' : '▼ View'}</span>
          <span>Timezone & Live JSON Preview</span>
        </button>

        {showDevPanel && (
          <div className="mt-4 w-full rounded-2xl border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_0_#bbf7d0] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-foreground/20 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Data Layer & Timezone
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="field-dev-tz" className="text-xs font-bold text-foreground">
                  Timezone:
                </label>
                <select
                  id="field-dev-tz"
                  value={form.timeZone}
                  onChange={(e) => updateField('timeZone', e.target.value)}
                  className="rounded-lg border-2 border-foreground/40 bg-[#fdf2f6] px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-foreground/30 bg-[#fdf2f6] p-3 font-mono text-xs">
              <pre className="text-foreground leading-relaxed">
                {JSON.stringify(jsonPreviewObject, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${currentEvent?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
};
