import { describe, expect, it } from "vitest";
import { initialRuntime, type Work } from "../schema";
import { completeEp01PlayerSetup, validateEp01PlayerSetup } from "./ep01PlayerSetup";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;

describe("EP01 player setup before unlocking", () => {
  it("requires a name and exactly four birth-year digits", () => {
    for (const [name, year] of [["", "2005"], ["   ", "2005"], ["안안", "05"], ["안안", "2005.0"], ["안안", "1899"], ["안안", "2027"], ["안안", "2005x"]]) {
      expect(validateEp01PlayerSetup(name, year).ok).toBe(false);
    }
    expect(validateEp01PlayerSetup("  안안  ", "2005")).toEqual({ ok: true, name: "안안", birthYear: 2005 });
  });
  it("records player identity once and preserves progress", () => {
    const state = initialRuntime(work);
    expect(completeEp01PlayerSetup(state, "", "2005")).toBe(state);
    const saved = completeEp01PlayerSetup(state, "안안", "2005");
    expect(saved.variables).toMatchObject({ ep01PlayerSetupDone: true, ep01PlayerName: "안안", ep01BirthYear: 2005 });
    expect(completeEp01PlayerSetup(saved, "other", "2000")).toBe(saved);
    expect(saved.elapsedMs).toBe(0);
  });
  it("does not alter another FoundPhone story", () => {
    const other = { ...initialRuntime(work), workId: "another-story" };
    expect(completeEp01PlayerSetup(other, "안안", "2005")).toBe(other);
  });
});
