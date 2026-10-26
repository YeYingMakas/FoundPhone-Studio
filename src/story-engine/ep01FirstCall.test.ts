import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { ep01FirstCallChoices, sendEp01FirstCallRefusal, advanceEp01FirstCall, answerEp01FirstCall, endEp01FirstCall } from "./ep01FirstCall";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 first call", () => {
  it("requires explicit refusal, waits 1.4 seconds, and cannot auto-answer", () => {
    let state: Runtime = initialRuntime(work);
    expect(ep01FirstCallChoices(state)).toHaveLength(0);
    state = { ...state, variables: { ep01SecondReplyFinished: true }, elapsedMs: 5000 };
    expect(ep01FirstCallChoices(state)).toHaveLength(1);
    expect(sendEp01FirstCallRefusal(state, "wrong")).toBe(state);
    state = sendEp01FirstCallRefusal(state, "ep01-first-call-refusal");
    expect(state.variables.ep01FirstCallDueAt).toBe(6400);
    expect(advanceEp01FirstCall({ ...state, elapsedMs: 6399 }).variables.ep01FirstCallRinging).not.toBe(true);
    state = advanceEp01FirstCall({ ...state, elapsedMs: 6400 });
    expect(state.variables.ep01FirstCallRinging).toBe(true);
    expect(state.variables.ep01FirstCallAnswered).not.toBe(true);
    state = answerEp01FirstCall(state);
    expect(state.variables.ep01FirstCallAnswered).toBe(true);
    expect(state.variables.ep01FirstCallRinging).toBe(false);
    state = endEp01FirstCall(state);
    expect(state.variables.ep01FirstCallEnded).toBe(true);
    expect(advanceEp01FirstCall(state)).toBe(state);
  });
});
