import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { ep01FirstCallChoices, sendEp01FirstCallRefusal, advanceEp01FirstCall, answerEp01FirstCall, endEp01FirstCall, rejectEp01FirstCall, advanceEp01FirstCallRetry } from "./ep01FirstCall";
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
  it("repeats rejected calls, preserves each of the first three pleas, then stops adding pleas", () => {
    let state: Runtime = { ...initialRuntime(work), elapsedMs: 1000, variables: { ep01FirstCallRinging: true } };
    for (let i = 1; i <= 4; i++) {
      state = rejectEp01FirstCall(state);
      expect(state.variables.ep01FirstCallRinging).toBe(false);
      expect(state.variables.ep01FirstCallRejectedCount).toBe(i);
      const due = Number(state.variables.ep01FirstCallRetryDueAt);
      state = advanceEp01FirstCallRetry({ ...state, elapsedMs: due - 1 });
      expect(state.variables.ep01FirstCallRinging).toBe(false);
      state = advanceEp01FirstCallRetry({ ...state, elapsedMs: due });
      expect(state.variables.ep01FirstCallRinging).toBe(true);
      expect(state.messages.kakao).toHaveLength(Math.min(i, 3));
      state = { ...state, elapsedMs: due };
    }
    expect(state.messages.kakao[0].body).toContain("전화 좀 받아 줘");
    expect(state.messages.kakao[2].body).toContain("진짜 미안해");
    state = answerEp01FirstCall(state);
    expect(rejectEp01FirstCall(state)).toBe(state);
  });
});
