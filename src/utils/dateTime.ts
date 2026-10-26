import { HeartopiaEvent, EventStatus } from '../types/event';

export function getEventStatus(event: HeartopiaEvent, now: number = Date.now()): EventStatus {
  const start = new Date(event.starts_at).getTime();
  const end = new Date(event.ends_at).getTime();

  if (now >= start && now <= end) {
    return 'live';
  } else if (now < start) {
    return 'upcoming';
  } else {
    return 'ended';
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function getWeekdayName(dateStringOrObj: string | Date): string {
  try {
    const d = typeof dateStringOrObj === 'string' ? new Date(dateStringOrObj) : dateStringOrObj;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { weekday: 'long' });
  } catch {
    return '';
  }
}

export function formatRelativeTime(isoString: string, now: number = Date.now()): string {
  try {
    const time = new Date(isoString).getTime();
    const diffMs = time - now;
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour');
    }
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return rtf.format(diffDays, 'day');
  } catch {
    return '';
  }
}

/**
 * Returns date as YYYY-MM-DD for standard HTML <input type="date">
 */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns time as HH:MM for standard HTML <input type="time">
 */
export function toTimeInputValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Combine date string (YYYY-MM-DD) and time string (HH:MM) in a given IANA timezone
 * into a UTC ISO string.
 */
export function combineDateTimeToUTC(
  dateStr: string,
  timeStr: string,
  timeZone?: string
): string {
  if (!dateStr || !timeStr) {
    throw new Error('Both date and time are required.');
  }

  // Create date object
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    isNaN(hours) || isNaN(minutes)
  ) {
    throw new Error('Invalid date or time values.');
  }

  // If timeZone is specified and Intl is available, handle offset if different
  // Otherwise default to local Date conversion to UTC ISO
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (isNaN(localDate.getTime())) {
    throw new Error('Invalid date construct.');
  }

  return localDate.toISOString();
}

/**
 * Common time zones list for dropdown selection
 */
export function getCommonTimeZones(): string[] {
  try {
    const intlAny = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    if (typeof intlAny.supportedValuesOf === 'function') {
      const all = intlAny.supportedValuesOf('timeZone');
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const popular = [
        userTz,
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Asia/Singapore',
        'Australia/Sydney',
      ];
      // dedupe popular + all
      return Array.from(new Set([...popular, ...all]));
    }
  } catch {
    // fallback
  }

  return [
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
  ];
}
