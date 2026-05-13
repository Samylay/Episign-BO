const TZ = 'Europe/Paris';

/** YYYY-MM-DD in Paris time */
export function parisDate(d: Date): string {
  const p = new Intl.DateTimeFormat('en', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d);
  return `${p.find(x => x.type === 'year')!.value}-${p.find(x => x.type === 'month')!.value}-${p.find(x => x.type === 'day')!.value}`;
}

/** HH:mm in Paris time (24 h) */
export function parisTime(d: Date): string {
  const p = new Intl.DateTimeFormat('en', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d);
  return `${p.find(x => x.type === 'hour')!.value}:${p.find(x => x.type === 'minute')!.value}`;
}

/** "HH:mm – HH:mm" range in Paris time */
export function parisTimeRange(start: Date, end: Date): string {
  return `${parisTime(start)} – ${parisTime(end)}`;
}

/** Today's YYYY-MM-DD in Paris time */
export function todayParis(): string {
  return parisDate(new Date());
}

/**
 * Convert Paris local input ("2026-05-13", "09:00") to an ISO 8601 string
 * with the correct Paris UTC offset so Supabase stores the right UTC value.
 */
export function parisInputToISO(dateStr: string, timeStr: string): string {
  const offset = getParisTZOffset(new Date(`${dateStr}T12:00:00Z`));
  return `${dateStr}T${timeStr}:00${offset}`;
}

/** "+02:00" or "+01:00" depending on DST for the given date */
function getParisTZOffset(date: Date): string {
  const utcStr   = date.toLocaleString('sv-SE', { timeZone: 'UTC' });
  const parisStr = date.toLocaleString('sv-SE', { timeZone: TZ });
  const diffMin  = (new Date(parisStr.replace(' ', 'T') + 'Z').getTime()
                  - new Date(utcStr.replace(' ', 'T') + 'Z').getTime()) / 60000;
  const sign = diffMin >= 0 ? '+' : '-';
  const abs  = Math.abs(diffMin);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}
