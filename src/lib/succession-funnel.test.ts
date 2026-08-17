import { describe, expect, it } from "vitest";
import {
  SESSION_RULE,
  nextSessionDate,
  sessionDateISO,
  upcomingSessions,
} from "./succession-funnel";

// The session date is computed rather than hardcoded so it can never advertise
// a date in the past. That only holds if the rolling logic is right, and
// fortnightly arithmetic across month and year boundaries is where it breaks.

const iso = (d: Date) => sessionDateISO(d);
const at = (s: string) => new Date(s + "T00:00:00Z");

describe("nextSessionDate", () => {
  it("returns the anchor when asked before the first session", () => {
    expect(iso(nextSessionDate(at("2026-08-17")))).toBe("2026-08-20");
  });

  it("returns the session on the day itself, rather than skipping it", () => {
    expect(iso(nextSessionDate(at("2026-08-20")))).toBe("2026-08-20");
  });

  it("rolls to the next fortnight the day after", () => {
    expect(iso(nextSessionDate(at("2026-08-21")))).toBe("2026-09-03");
  });

  it("steps by exactly 14 days across a month boundary", () => {
    expect(iso(nextSessionDate(at("2026-09-04")))).toBe("2026-09-17");
    expect(iso(nextSessionDate(at("2026-09-18")))).toBe("2026-10-01");
  });

  it("crosses a year boundary without drifting off Thursday", () => {
    const next = nextSessionDate(at("2026-12-31"));
    expect(next.getUTCDay()).toBe(4);
    expect(next.getTime()).toBeGreaterThan(at("2026-12-31").getTime());
  });

  it("never returns a date before the reference date, and always a Thursday", () => {
    // Two years, day by day. These are the only two invariants the page relies
    // on: the advertised session is never past, and it is always a Thursday.
    const start = at("2026-08-01");
    for (let i = 0; i < 730; i++) {
      const day = new Date(start.getTime() + i * 86_400_000);
      const next = nextSessionDate(day);
      expect(next.getTime()).toBeGreaterThanOrEqual(day.getTime());
      expect(next.getUTCDay()).toBe(4);
    }
  });

  it("lands on a multiple of the interval from the anchor", () => {
    const anchor = at(SESSION_RULE.anchorISO);
    for (const d of ["2026-08-25", "2027-01-14", "2027-06-30"]) {
      const gap = (nextSessionDate(at(d)).getTime() - anchor.getTime()) / 86_400_000;
      expect(gap % SESSION_RULE.intervalDays).toBe(0);
    }
  });
});

describe("upcomingSessions", () => {
  it("lists consecutive fortnightly dates from the next one", () => {
    expect(upcomingSessions(3, at("2026-08-17")).map(iso)).toEqual([
      "2026-08-20",
      "2026-09-03",
      "2026-09-17",
    ]);
  });
});
