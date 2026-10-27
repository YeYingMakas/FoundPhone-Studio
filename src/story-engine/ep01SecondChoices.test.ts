import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { ep01SecondChoices, sendEp01SecondChoice, advanceEp01SecondChoice } from "./ep01SecondChoices";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 second player question", () => {
  it("only appears after the first two replies and requires explicit send", () => {
    let state: Runtime = initialRuntime(work);
    expect(ep01SecondChoices(state)).toEqual([]);
    state = { ...state, variables: { ep01OpeningReplyFinished: true, ep01OpeningChoiceIndex: "A" }, elapsedMs: 5000 };
    const choices = ep01SecondChoices(state);
    expect(choices).toHaveLength(3);
    expect(sendEp01SecondChoice(state, "bad-target")).toBe(state);
    state = sendEp01SecondChoice(state, choices[1].target);
    expect(state.variables.ep01SecondChoiceIndex).toBe(1);
    expect(ep01SecondChoices(state)).toEqual([]);
    expect(advanceEp01SecondChoice({ ...state, elapsedMs: 6999 }).messages.kakao).toBeUndefined();
    for (let i = 0; i < 3; i++) {
      state = advanceEp01SecondChoice({ ...state, elapsedMs: 7000 + i * 2000 });
      expect(state.messages.kakao).toHaveLength(i + 1);
    }
    expect(state.variables.ep01SecondReplyFinished).toBe(true);
    expect(advanceEp01SecondChoice(state)).toBe(state);
  });
});
