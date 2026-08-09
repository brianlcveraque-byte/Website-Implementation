import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  badgeTone,
  daysUntil,
  formatCurrency,
  isDueSoon,
  isOverdue,
  titleCase,
} from "./utils";

describe("date helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T00:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("daysUntil returns null for missing dates", () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil(undefined)).toBeNull();
  });

  it("daysUntil is negative for past dates and positive for future dates", () => {
    expect(daysUntil("2026-08-01")).toBe(-8);
    expect(daysUntil("2026-08-16")).toBe(7);
    expect(daysUntil("2026-08-09")).toBe(0);
  });

  it("isOverdue is true only for strictly past dates", () => {
    expect(isOverdue("2026-08-08")).toBe(true);
    expect(isOverdue("2026-08-09")).toBe(false);
    expect(isOverdue("2026-08-10")).toBe(false);
    expect(isOverdue(null)).toBe(false);
  });

  it("isDueSoon covers today through the window, not before or after", () => {
    expect(isDueSoon("2026-08-09", 7)).toBe(true);
    expect(isDueSoon("2026-08-16", 7)).toBe(true);
    expect(isDueSoon("2026-08-17", 7)).toBe(false);
    expect(isDueSoon("2026-08-08", 7)).toBe(false);
  });
});

describe("formatCurrency", () => {
  it("renders an em dash for missing amounts", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
  });

  it("formats PHP amounts without decimals", () => {
    expect(formatCurrency(850000)).toContain("850,000");
  });
});

describe("titleCase", () => {
  it("converts snake_case to Title Case", () => {
    expect(titleCase("under_evaluation")).toBe("Under Evaluation");
    expect(titleCase("won")).toBe("Won");
  });
});

describe("badgeTone", () => {
  it("maps known statuses to the SPEC.md red/amber/green/gray scheme", () => {
    expect(badgeTone("won")).toBe("green");
    expect(badgeTone("lost")).toBe("red");
    expect(badgeTone("negotiation")).toBe("amber");
    expect(badgeTone("on_hold")).toBe("gray");
  });

  it("falls back to blue for anything unmapped", () => {
    expect(badgeTone("some_new_status")).toBe("blue");
  });
});
