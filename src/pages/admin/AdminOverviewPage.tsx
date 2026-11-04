import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvents } from '../../hooks/useEvents';
import { useNow } from '../../hooks/useNow';
import { HeartopiaEvent, EventPlatform, PLATFORM_CONFIG } from '../../types/event';
import {
  getEventStatus,
  formatDateOnly,
  formatTimeOnly,
  getWeekdayName,
} from '../../utils/dateTime';
import { PlatformChip } from '../../components/common/PlatformChip';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { Toast, ToastMessage } from '../../components/admin/Toast';

export const AdminOverviewPage: React.FC = () => {
  const { events, loading, deleteEvent } = useEvents();
  const now = useNow();
  const navigate = useNavigate();

  // Filters state
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Delete modal state
  const [deletingEvent, setDeletingEvent] = useState<HeartopiaEvent | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Compute live / upcoming / ended counters
  const counters = useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let ended = 0;

    events.forEach((ev) => {
      const status = getEventStatus(ev, now);
      if (status === 'live') live++;
      else if (status === 'upcoming') upcoming++;
      else if (status === 'ended') ended++;
    });

    return { live, upcoming, ended };
  }, [events, now]);

  // Filtered & sorted events list
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Platform filter
        if (platformFilter !== 'all' && ev.platform !== platformFilter) {
          return false;
        }

        // Status filter
        const status = getEventStatus(ev, now);
        if (statusFilter !== 'all' && status !== statusFilter) {
          return false;
        }

        // Visibility filter
        if (visibilityFilter !== 'all' && ev.visibility !== visibilityFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            ev.title.toLowerCase().includes(q) ||
            ev.location.toLowerCase().includes(q) ||
            ev.details.toLowerCase().includes(q) ||
            ev.id.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }, [events, now, platformFilter, statusFilter, visibilityFilter, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    try {
      await deleteEvent(deletingEvent.id);
      setToast({
        id: String(Date.now()),
        type: 'success',
        text: `Deleted event "${deletingEvent.title}".`,
      });
    } catch (err) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete event.',
      });
    } finally {
      setDeletingEvent(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9b3ad]/40 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#6b4f35] font-heading">Overview</h1>
          <p className="mt-1 font-mono text-xs sm:text-sm text-[#8c6f55]">
            Developer console for managing Bunny Hub events and schedule.
          </p>
        </div>

        <Link
          to="/admin/edit"
          className="btn-v2"
        >
          <span>➕</span>
          <span>New Event</span>
        </Link>
      </div>

      {/* Summary Counters: Live, Upcoming, Ended (Shrunk to match content) */}
      <section className="mt-6 flex flex-wrap items-center gap-3">
        {/* status.live */}
        <div
          className="rounded-2xl border-2 border-[#e9b3ad] bg-[#f3ecda] px-4 py-2.5 shadow-xs"
          style={{ width: 'fit-content', minWidth: '160px' }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8c6f55]">
              status.live
            </span>
            <span className="inline-block size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#6b4f35] font-heading">{counters.live}</span>
            <span className="text-xs text-[#8c6f55] font-sans">in session</span>
          </div>
        </div>

        {/* status.upcoming */}
        <div
          className="rounded-2xl border-2 border-[#e9b3ad] bg-[#f3ecda] px-4 py-2.5 shadow-xs"
          style={{ width: 'fit-content', minWidth: '160px' }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8c6f55]">
              status.upcoming
            </span>
            <span className="font-mono text-[10px] text-sky-700 font-bold bg-sky-100 px-1.5 py-0.5 rounded-full">
              NEXT
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#6b4f35] font-heading">{counters.upcoming}</span>
            <span className="text-xs text-[#8c6f55] font-sans">scheduled</span>
          </div>
        </div>

        {/* status.ended */}
        <div
          className="rounded-2xl border-2 border-[#e9b3ad] bg-[#f3ecda] px-4 py-2.5 shadow-xs"
          style={{ width: 'fit-content', minWidth: '160px' }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8c6f55]">
              status.ended
            </span>
            <span className="font-mono text-[10px] text-[#8c6f55] font-semibold bg-[#e9dcc5] px-1.5 py-0.5 rounded-full">
              PAST
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#6b4f35] font-heading">{counters.ended}</span>
            <span className="text-xs text-[#8c6f55] font-sans">archived</span>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold tracking-tight text-[#6b4f35] font-heading">Events</h2>
          <span className="font-mono text-xs text-[#8c6f55]">
            Showing {filteredEvents.length} of {events.length}
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-[#e9b3ad] bg-[#f3ecda] p-3 shadow-xs">
          <div className="flex-1 min-w-[200px]">
            <input
              type="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              placeholder="Search by title, location, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#e9b3ad] bg-white px-3 py-1.5 font-sans text-xs sm:text-sm text-[#6b4f35] placeholder:text-[#8c6f55]/60 focus:outline-none focus:ring-2 focus:ring-[#b23a6b]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              aria-label="Filter by platform"
              className="rounded-xl border border-[#e9b3ad] bg-white px-2.5 py-1.5 font-sans text-xs sm:text-sm text-[#6b4f35] focus:outline-none focus:ring-2 focus:ring-[#b23a6b] cursor-pointer"
            >
              <option value="all">Platform: All</option>
              {Object.entries(PLATFORM_CONFIG).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.emoji} {meta.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by time status"
              className="rounded-xl border border-[#e9b3ad] bg-white px-2.5 py-1.5 font-sans text-xs sm:text-sm text-[#6b4f35] focus:outline-none focus:ring-2 focus:ring-[#b23a6b] cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="live">🟢 Live</option>
              <option value="upcoming">🔵 Upcoming</option>
              <option value="ended">⚪ Ended</option>
            </select>

            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              aria-label="Filter by visibility"
              className="rounded-xl border border-[#e9b3ad] bg-white px-2.5 py-1.5 font-sans text-xs sm:text-sm text-[#6b4f35] focus:outline-none focus:ring-2 focus:ring-[#b23a6b] cursor-pointer"
            >
              <option value="all">Visibility: All</option>
              <option value="published">✅ Published</option>
              <option value="draft">📝 Draft</option>
            </select>

            {(platformFilter !== 'all' ||
              statusFilter !== 'all' ||
              visibilityFilter !== 'all' ||
              searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setPlatformFilter('all');
                  setStatusFilter('all');
                  setVisibilityFilter('all');
                  setSearchQuery('');
                }}
                className="cursor-pointer rounded-xl border border-[#e9b3ad] bg-white px-2.5 py-1 font-sans text-xs font-semibold text-[#6b4f35] hover:bg-[#fbd5e1]/40 transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* List of Events remade as Content-Shrunk Boxes */}
        {loading ? (
          <div
            className="rounded-2xl border-2 border-[#e9b3ad] bg-[#f3ecda] p-6 text-center text-[#8c6f55]"
            style={{ width: 'fit-content', minWidth: '240px' }}
          >
            <span className="font-mono text-xs">Loading events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-[#e9b3ad] bg-[#f3ecda] p-6 text-center text-[#8c6f55]"
            style={{ width: 'fit-content', minWidth: '260px' }}
          >
            <span className="text-2xl block mb-1">🌸</span>
            <p className="font-heading font-bold text-sm text-[#6b4f35]">No events found</p>
            <p className="text-xs text-[#8c6f55] mt-1 font-sans">
              {events.length === 0
                ? 'All events have been deleted.'
                : 'No events match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {filteredEvents.map((ev) => {
              const status = getEventStatus(ev, now);
              const isLive = status === 'live';
              const isUpcoming = status === 'upcoming';

              return (
                <div
                  key={ev.id}
                  className="rounded-2xl border-2 border-[#e9b3ad] bg-[#f3ecda] p-4 shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5"
                  style={{ width: 'fit-content', minWidth: '260px', maxWidth: '340px' }}
                >
                  {/* Top row: Platform chip & Status badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <PlatformChip platform={ev.platform} className="text-[11px] px-2 py-0.5" />
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold border ${
                            isLive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                              : isUpcoming
                              ? 'bg-sky-100 text-sky-800 border-sky-400'
                              : 'bg-stone-200 text-stone-600 border-stone-300'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isLive
                                ? 'bg-emerald-500 animate-pulse'
                                : isUpcoming
                                ? 'bg-sky-500'
                                : 'bg-stone-400'
                            }`}
                          />
                          {status.toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold border ${
                            ev.visibility === 'published'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'bg-amber-50 border-amber-300 text-amber-700'
                          }`}
                        >
                          {ev.visibility}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="font-heading font-bold text-base text-[#6b4f35] leading-snug line-clamp-2"
                      title={ev.title}
                    >
                      {ev.title}
                    </h3>

                    {/* Location */}
                    <p className="text-xs text-[#8c6f55] mt-1 flex items-center gap-1 font-sans">
                      <span>📍</span>
                      <span className="truncate">{ev.location}</span>
                    </p>

                    {/* Date & Time */}
                    <div className="mt-2 text-[11px] font-mono text-[#8c6f55] bg-white/70 rounded-xl p-2 border border-[#e9b3ad]/40 space-y-0.5">
                      <div>
                        📅 {formatDateOnly(ev.starts_at)} ({getWeekdayName(ev.starts_at)})
                      </div>
                      <div>
                        🕒 {formatTimeOnly(ev.starts_at)} – {formatTimeOnly(ev.ends_at)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-3 pt-3 border-t border-[#e9b3ad]/40 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-[#8c6f55]" title={ev.id}>
                      {ev.id.slice(0, 8)}…
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/edit?id=${ev.id}`)}
                        className="cursor-pointer rounded-xl border border-[#e9b3ad] bg-white px-3 py-1 text-xs font-heading font-bold text-[#b23a6b] hover:bg-[#fbd5e1]/40 transition-colors active:translate-y-0.5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingEvent(ev)}
                        className="cursor-pointer rounded-xl border border-rose-300 bg-white px-2.5 py-1 text-xs font-mono font-bold text-rose-700 hover:bg-rose-50 transition-colors active:translate-y-0.5"
                        title="Delete event"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingEvent}
        title="Delete Event"
        message={`Are you sure you want to delete "${deletingEvent?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingEvent(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
};

export default AdminOverviewPage;
