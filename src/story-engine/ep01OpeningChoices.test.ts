import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { ep01OpeningChoices, sendEp01OpeningChoice, advanceEp01OpeningChoice } from "./ep01OpeningChoices";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 first player reply", () => {
  it("requires completed opening and an explicit valid choice", () => {
    let state: Runtime = initialRuntime(work);
    expect(ep01OpeningChoices(state)).toHaveLength(0);
    state = { ...state, variables: { ep01OpeningFinished: true }, elapsedMs: 2000 };
    const choices = ep01OpeningChoices(state);
    expect(choices).toHaveLength(3);
    expect(sendEp01OpeningChoice(state, "unrecognized")).toBe(state);
    state = sendEp01OpeningChoice(state, choices[1].target);
    expect(state.variables.ep01OpeningChoiceIndex).toBe("B");
    expect(ep01OpeningChoices(state)).toHaveLength(0);
    expect(advanceEp01OpeningChoice({ ...state, elapsedMs: 3999 }).messages.kakao).toBeUndefined();
    state = advanceEp01OpeningChoice({ ...state, elapsedMs: 4000 });
    expect(state.messages.kakao).toHaveLength(1);
    state = advanceEp01OpeningChoice({ ...state, elapsedMs: 6000 });
    expect(state.messages.kakao).toHaveLength(2);
    state = advanceEp01OpeningChoice({ ...state, elapsedMs: 8000 });
    expect(state.messages.kakao).toHaveLength(3);
    expect(state.variables.ep01OpeningReplyFinished).toBe(true);
  });
});
