import { describe, expect, it } from "vitest";
import { formatSmartDate, formatWaitingDuration } from "@/lib/utils/date";

describe("date utils", () => {
  it("formats missing dates without throwing", () => {
    expect(formatSmartDate(null)).toBe("No deadline");
  });

  it("returns a waiting duration label", () => {
    expect(formatWaitingDuration("2026-09-07T10:00:00Z")).toContain("day");
  });
});
