// Recurring live-session dates, shared by every funnel that sells a seat.
//
// Expressed as an anchor date plus an interval rather than "the nth weekday of
// the month": that makes it arithmetic instead of calendar-walking, so there
// are no month lengths, leap years, or drift to get wrong.
//
// Resolved in the browser, never at build time. The site is a static export —
// a date baked in at build would silently go stale the first time a fortnight
// passed without a deploy, and a page advertising a session that already
// happened is worse than one showing no date at all.

export type SessionRule = {
  /** First session, ISO date. Every later one is this plus a multiple of intervalDays. */
  anchorISO: string;
  intervalDays: number;
  /** Display only — the authoritative time goes in the calendar invite. */
  timeLabel: string;
  weekdayLabel: string;
  cadenceLabel: string;
};

const DAY_MS = 86_400_000;

/** Strips the time, so comparisons are date-to-date and timezone-stable. */
function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** The next session on or after `from`. Never returns a past date. */
export function nextSessionDate(rule: SessionRule, from: Date = new Date()): Date {
  const anchor = new Date(rule.anchorISO + "T00:00:00Z");
  const today = utcMidnight(from);
  if (today <= anchor) return anchor;

  const elapsed = (today.getTime() - anchor.getTime()) / DAY_MS;
  const cycles = Math.ceil(elapsed / rule.intervalDays);
  return new Date(anchor.getTime() + cycles * rule.intervalDays * DAY_MS);
}

/** The next `count` sessions, for an upcoming-dates list. */
export function upcomingSessions(rule: SessionRule, count: number, from: Date = new Date()): Date[] {
  const first = nextSessionDate(rule, from);
  return Array.from({ length: count }, (_, i) => new Date(first.getTime() + i * rule.intervalDays * DAY_MS));
}

/** "Thursday, 20 August 2026" — options pinned so it reads the same everywhere. */
export function formatSessionDate(d: Date): string {
  return d.toLocaleDateString("en-PH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** ISO date (YYYY-MM-DD) — what gets stored against an order. */
export function sessionDateISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
