import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { showEp01Sighting, dismissEp01Sighting, advanceEp01Opening } from "./ep01Opening";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;

describe("EP01 opening sighting and messages", () => {
  it("requires completed setup, unlock and explicit popup dismissal", () => {
    let state: Runtime = initialRuntime(work);
    expect(showEp01Sighting(state)).toBe(state);
    state = { ...state, variables: { ep01PlayerSetupDone: true } };
    state = showEp01Sighting(state);
    expect(state.variables.ep01SightingShown).toBe(true);
    expect(advanceEp01Opening({ ...state, elapsedMs: 10000 }).messages.kakao).toBeUndefined();
    state = dismissEp01Sighting({ ...state, elapsedMs: 10000 });
    expect(state.variables.ep01SightingDismissed).toBe(true);
    expect(state.variables.ep01OpeningMessagesStartedAt).toBe(10000);
    expect(showEp01Sighting(state)).toBe(state);
    for (let i = 0; i < 3; i++) {
      state = advanceEp01Opening({ ...state, elapsedMs: 10800 + i * 800 });
      expect(state.messages.kakao).toHaveLength(i + 1);
    }
    expect(state.messages.kakao.map((m) => m.body.split("\n")[0])).toEqual([
      "자기야 뭐 해?ㅎㅎ", "나 지금 숙소야", "우리 자기 보고 싶다ㅠㅠ",
    ]);
    expect(state.variables.ep01OpeningFinished).toBe(true);
    expect(advanceEp01Opening(state)).toBe(state);
  });
});
