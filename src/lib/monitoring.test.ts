import { describe, expect, it } from "vitest";
import { fromDb, nextStatus, parseTrackerPaste } from "./monitoring";

/**
 * The fixture is lifted from the real tracker, including the rows that broke
 * the first version of the parser. Inventing tidy sample data would have hidden
 * the only bug that mattered.
 */
const REAL_SHEET = [
  "Focus Projects\tStatus\tRemarks\tDate of Completion",
  "NIH Tobacco Policy Research\tCompleted\tMock Presentation on 27\t1:30PM-3PM",
  "\tCompleted\tPresentation to DOH Nov. 3\tWhole day",
  "\tOn-hold\tSchedule for WAVES (tentative dates)",
  "\tNot Yet Started\tOD Project\tOctober",
  // Column A here is a note that overflowed, NOT a project. It has no status.
  "To conduct KIIs based on recommended sample size from Ma'am Haidee\t\t",
  "To message Ma'am Pabi.\t\t",
  "CSMC\tOngoing\tAwaiting FGD/KII schedule",
  "\tCompleted\tBill for PVS 2nd tranche",
  "Adventist Institutions\tNot Yet Started\tProposals for AIIAS / SSD",
  "201 file\t\t",
  "applicant search\t\t",
].join("\n");

describe("parseTrackerPaste", () => {
  const rows = parseTrackerPaste(REAL_SHEET);

  it("finds only the real projects, not notes that spilled into column A", () => {
    // The bug this guards: keying on "column A is filled" produced eight
    // projects from a sheet that has three, and scattered the tasks between
    // them. A project heading carries a real status on the same row.
    expect([...new Set(rows.map((r) => r.project))]).toEqual([
      "NIH Tobacco Policy Research",
      "CSMC",
      "Adventist Institutions",
    ]);
  });

  it("carries the project forward down a block of blank cells", () => {
    const nih = rows.filter((r) => r.project === "NIH Tobacco Policy Research");
    expect(nih.length).toBeGreaterThan(3);
    expect(nih.map((r) => r.title)).toContain("Presentation to DOH Nov. 3");
  });

  it("keeps a stray column-A note as a task under the current project", () => {
    const titles = rows.filter((r) => r.project === "Adventist Institutions").map((r) => r.title);
    expect(titles).toContain("201 file");
    expect(titles).toContain("applicant search");
  });

  it("maps the sheet's four words onto the four statuses", () => {
    const find = (title: string) => rows.find((r) => r.title === title)?.status;
    expect(find("Mock Presentation on 27")).toBe("completed");
    expect(find("Schedule for WAVES (tentative dates)")).toBe("on_hold");
    expect(find("OD Project")).toBe("not_started");
    expect(find("Awaiting FGD/KII schedule")).toBe("in_progress");
  });

  it("drops the header row", () => {
    expect(rows.map((r) => r.title)).not.toContain("Remarks");
    expect(rows.map((r) => r.project)).not.toContain("Focus Projects");
  });

  it("keeps the extra column as a note rather than discarding it", () => {
    expect(rows.find((r) => r.title === "Mock Presentation on 27")?.note).toBe("1:30PM-3PM");
  });
});

describe("status handling", () => {
  it("folds the statuses the old screens could write into the four", () => {
    expect(fromDb("for_review")).toBe("in_progress");
    expect(fromDb("awaiting_client")).toBe("in_progress");
    expect(fromDb("deferred")).toBe("on_hold");
    expect(fromDb("cancelled")).toBe("on_hold");
    expect(fromDb(null)).toBe("not_started");
  });

  it("cycles in the order work actually moves, and returns to the start", () => {
    expect(nextStatus("not_started")).toBe("in_progress");
    expect(nextStatus("in_progress")).toBe("completed");
    expect(nextStatus("completed")).toBe("on_hold");
    expect(nextStatus("on_hold")).toBe("not_started");
  });
});
