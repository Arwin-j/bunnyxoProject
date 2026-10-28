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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/20 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Overview</h1>
          <p className="mt-1 font-mono text-xs sm:text-sm text-muted-foreground">
            Developer console for managing Bunny Hub events and schedule.
          </p>
        </div>

        <Link
          to="/admin/edit"
          className="sticker shadow-ink inline-flex items-center gap-2 rounded-xl border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold hover:bg-accent transition-all active:translate-y-0.5"
        >
          <span>➕</span>
          <span>New Event</span>
        </Link>
      </div>

      {/* Summary Counters: Live, Upcoming, Ended */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sticker rounded-xl border-[3px] border-foreground bg-card p-4 shadow-[3px_3px_0_var(--mint)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              status.live
            </span>
            <span className="inline-block size-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{counters.live}</span>
            <span className="text-xs text-muted-foreground">in session now</span>
          </div>
        </div>

        <div className="sticker rounded-xl border-[3px] border-foreground bg-card p-4 shadow-[3px_3px_0_var(--sky)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              status.upcoming
            </span>
            <span className="font-mono text-xs text-sky-700 font-bold">NEXT</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{counters.upcoming}</span>
            <span className="text-xs text-muted-foreground">scheduled ahead</span>
          </div>
        </div>

        <div className="sticker rounded-xl border-[3px] border-foreground bg-card p-4 shadow-[3px_3px_0_var(--muted)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              status.ended
            </span>
            <span className="font-mono text-xs text-muted-foreground">ARCHIVED</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{counters.ended}</span>
            <span className="text-xs text-muted-foreground">past events</span>
          </div>
        </div>
      </section>

      {/* Events Table Section */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold tracking-tight">Events</h2>
          <span className="font-mono text-xs text-muted-foreground">
            Showing {filteredEvents.length} of {events.length}
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border-2 border-foreground/30 bg-muted/40 p-3">
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
              className="w-full rounded-lg border-2 border-foreground/30 bg-background px-3 py-1.5 font-mono text-xs sm:text-sm focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              aria-label="Filter by platform"
              className="rounded-lg border-2 border-foreground/30 bg-background px-2.5 py-1.5 font-mono text-xs sm:text-sm focus:border-foreground focus:outline-none cursor-pointer"
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
              className="rounded-lg border-2 border-foreground/30 bg-background px-2.5 py-1.5 font-mono text-xs sm:text-sm focus:border-foreground focus:outline-none cursor-pointer"
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
              className="rounded-lg border-2 border-foreground/30 bg-background px-2.5 py-1.5 font-mono text-xs sm:text-sm focus:border-foreground focus:outline-none cursor-pointer"
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
                className="cursor-pointer rounded-lg border border-foreground/30 px-2.5 py-1 font-mono text-xs hover:bg-card"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto rounded-xl border-[3px] border-foreground bg-card shadow-sm">
          <table className="w-full min-w-[760px] text-left text-xs sm:text-sm">
            <thead className="border-b-2 border-foreground bg-accent/60 font-mono text-xs text-foreground">
              <tr>
                <th className="px-3 py-3 font-bold">id</th>
                <th className="px-3 py-3 font-bold">title</th>
                <th className="px-3 py-3 font-bold">platform</th>
                <th className="px-3 py-3 font-bold">location</th>
                <th className="px-3 py-3 font-bold">date</th>
                <th className="px-3 py-3 font-bold">time</th>
                <th className="px-3 py-3 font-bold">day</th>
                <th className="px-3 py-3 font-bold">status</th>
                <th className="px-3 py-3 font-bold">visibility</th>
                <th className="px-3 py-3 font-bold text-right">actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/15 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center font-mono text-muted-foreground">
                    Loading events data...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center font-mono text-muted-foreground">
                    {events.length === 0 ? 'No events yet.' : 'No events match your search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const status = getEventStatus(ev, now);
                  const isLive = status === 'live';
                  const isUpcoming = status === 'upcoming';
                  const isEnded = status === 'ended';

                  return (
                    <tr
                      key={ev.id}
                      className="hover:bg-accent/20 transition-colors"
                    >
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground" title={ev.id}>
                        {ev.id.slice(0, 8)}…
                      </td>

                      <td className="px-3 py-3 font-semibold max-w-[200px] truncate" title={ev.title}>
                        {ev.title}
                      </td>

                      <td className="px-3 py-3">
                        <PlatformChip platform={ev.platform} className="text-xs px-2 py-0.5" />
                      </td>

                      <td className="px-3 py-3 max-w-[150px] truncate text-muted-foreground" title={ev.location}>
                        {ev.location}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap font-mono text-xs">
                        {formatDateOnly(ev.starts_at)}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {formatTimeOnly(ev.starts_at)} - {formatTimeOnly(ev.ends_at)}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap font-mono text-xs">
                        {getWeekdayName(ev.starts_at)}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold border ${
                            isLive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                              : isUpcoming
                              ? 'bg-sky-100 text-sky-800 border-sky-400'
                              : 'bg-muted text-muted-foreground border-foreground/20'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isLive
                                ? 'bg-emerald-500 animate-pulse'
                                : isUpcoming
                                ? 'bg-sky-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          {status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold border ${
                            ev.visibility === 'published'
                              ? 'bg-mint/80 border-foreground/30 text-foreground'
                              : 'bg-butter/80 border-foreground/30 text-foreground'
                          }`}
                        >
                          {ev.visibility}
                        </span>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/edit?id=${ev.id}`)}
                            title={`Edit ${ev.title}`}
                            className="cursor-pointer rounded-lg border border-foreground/30 bg-background px-2.5 py-1 text-xs font-mono font-semibold hover:bg-accent transition-colors active:translate-y-0.5"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingEvent(ev)}
                            title={`Delete ${ev.title}`}
                            className="cursor-pointer rounded-lg border border-foreground/30 bg-background px-2 py-1 text-xs font-mono text-rose-700 hover:bg-rose-100 hover:border-rose-400 transition-colors active:translate-y-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
