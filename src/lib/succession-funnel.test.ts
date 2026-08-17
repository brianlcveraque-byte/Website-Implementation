import { describe, expect, it } from "vitest";
import {
  SESSION_RULE,
  nextSessionDate,
  nthWeekdayOfMonth,
  sessionDateISO,
} from "./succession-funnel";

// The session date is computed rather than hardcoded so it can never advertise
// a date in the past. That only holds if the rolling logic is right, and
// month-boundary arithmetic is exactly where this sort of thing breaks.

const iso = (d: Date) => sessionDateISO(d);

describe("nthWeekdayOfMonth", () => {
  it("finds the second Thursday of September 2026", () => {
    // September 2026: 1st is a Tuesday, so Thursdays fall on 3, 10, 17, 24.
    expect(iso(nthWeekdayOfMonth(2026, 8, 4, 2))).toBe("2026-09-10");
  });

  it("handles a month starting on the target weekday", () => {
    // October 2026 starts on a Thursday, so the first occurrence is the 1st
    // and the second is the 8th — the off-by-one case.
    expect(iso(nthWeekdayOfMonth(2026, 9, 4, 1))).toBe("2026-10-01");
    expect(iso(nthWeekdayOfMonth(2026, 9, 4, 2))).toBe("2026-10-08");
  });

  it("finds the first Sunday of a month", () => {
    expect(iso(nthWeekdayOfMonth(2026, 0, 0, 1))).toBe("2026-01-04");
  });
});

describe("nextSessionDate", () => {
  it("returns this month's session when it is still ahead", () => {
    expect(iso(nextSessionDate(new Date("2026-09-01T00:00:00Z")))).toBe("2026-09-10");
  });

  it("returns today's session on the day itself, rather than skipping it", () => {
    expect(iso(nextSessionDate(new Date("2026-09-10T23:00:00Z")))).toBe("2026-09-10");
  });

  it("rolls to next month once this month's has passed", () => {
    expect(iso(nextSessionDate(new Date("2026-09-11T00:00:00Z")))).toBe("2026-10-08");
  });

  it("rolls across a year boundary", () => {
    // December 2026: Thursdays are 3, 10 — so after the 10th it must land in
    // January 2027, not loop back to January 2026.
    expect(iso(nextSessionDate(new Date("2026-12-31T00:00:00Z")))).toBe("2027-01-14");
  });

  it("never returns a date before the reference date", () => {
    // Walk a full year day by day; the invariant the page depends on is simply
    // that the advertised session is never in the past.
    const start = new Date("2026-08-01T00:00:00Z");
    for (let i = 0; i < 365; i++) {
      const day = new Date(start.getTime() + i * 86_400_000);
      const next = nextSessionDate(day);
      const dayOnly = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
      );
      expect(next.getTime()).toBeGreaterThanOrEqual(dayOnly.getTime());
      expect(next.getUTCDay()).toBe(SESSION_RULE.weekday);
    }
  });
});
