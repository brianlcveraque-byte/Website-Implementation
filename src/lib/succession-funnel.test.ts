import { describe, expect, it } from "vitest";
import { SESSION_RULE, nextSessionDate } from "./succession-funnel";
import {
  nextSessionDate as nextFor,
  sessionDateISO,
  upcomingSessions,
  type SessionRule,
} from "./session-schedule";

// Session dates are computed rather than hardcoded so a static export can never
// advertise a date in the past. That only holds if the rolling logic is right,
// and fortnightly arithmetic across month and year boundaries is where it breaks.

const iso = (d: Date) => sessionDateISO(d);
const at = (s: string) => new Date(s + "T00:00:00Z");

describe("nextSessionDate (succession rule: every other Thursday from 2026-08-20)", () => {
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

  it("never returns a past date, and always a Thursday, across two years", () => {
    const start = at("2026-08-01");
    for (let i = 0; i < 730; i++) {
      const day = new Date(start.getTime() + i * 86_400_000);
      const next = nextSessionDate(day);
      expect(next.getTime()).toBeGreaterThanOrEqual(day.getTime());
      expect(next.getUTCDay()).toBe(4); // Thursday
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

describe("the shared schedule works for any rule", () => {
  // Guards the generalisation: a second funnel with a different weekday and
  // cadence must not need its own copy of this arithmetic.
  const weekly: SessionRule = {
    anchorISO: "2026-09-01", // a Tuesday
    intervalDays: 7,
    timeLabel: "6:00–8:00 PM (PHT)",
    weekdayLabel: "Tuesday",
    cadenceLabel: "Every Tuesday",
  };

  it("honours a different anchor and interval", () => {
    expect(iso(nextFor(weekly, at("2026-08-30")))).toBe("2026-09-01");
    expect(iso(nextFor(weekly, at("2026-09-02")))).toBe("2026-09-08");
    expect(nextFor(weekly, at("2026-09-02")).getUTCDay()).toBe(2); // Tuesday
  });

  it("lists consecutive upcoming dates", () => {
    expect(upcomingSessions(SESSION_RULE, 3, at("2026-08-17")).map(iso)).toEqual([
      "2026-08-20",
      "2026-09-03",
      "2026-09-17",
    ]);
  });
});
