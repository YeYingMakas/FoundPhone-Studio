import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { completeEp01PlayerSetup } from "./ep01PlayerSetup";
import { showEp01Sighting, dismissEp01Sighting, advanceEp01Opening } from "./ep01Opening";
import { ep01OpeningChoices, sendEp01OpeningChoice, advanceEp01OpeningChoice } from "./ep01OpeningChoices";
import { ep01SecondChoices, sendEp01SecondChoice, advanceEp01SecondChoice } from "./ep01SecondChoices";
import { ep01FirstCallChoices, sendEp01FirstCallRefusal, advanceEp01FirstCall, rejectEp01FirstCall, advanceEp01FirstCallRetry, answerEp01FirstCall, endEp01FirstCall } from "./ep01FirstCall";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
const at = (state: Runtime, ms: number): Runtime => ({ ...state, elapsedMs: ms });

describe("EP01 opening-to-first-call integration", () => {
  it("requires every player action and can survive a rejected call", () => {
    let s = initialRuntime(work);
    s = completeEp01PlayerSetup(s, "안안", "2005");
    s = showEp01Sighting(s);
    expect(ep01OpeningChoices(s)).toHaveLength(0);
    s = dismissEp01Sighting(s);
    for (let i = 1; i <= 3; i++) s = advanceEp01Opening(at(s, i * 800));
    expect(s.variables.ep01OpeningFinished).toBe(true);
    expect(s.messages.kakao).toHaveLength(3);
    s = sendEp01OpeningChoice(s, ep01OpeningChoices(s)[0].target);
    for (let i = 1; i <= 2; i++) s = advanceEp01OpeningChoice(at(s, 2400 + i * 950));
    expect(s.messages.kakao).toHaveLength(5);
    s = sendEp01SecondChoice(s, ep01SecondChoices(s)[1].target);
    for (let i = 1; i <= 3; i++) s = advanceEp01SecondChoice(at(s, 4300 + i * 900));
    expect(s.messages.kakao).toHaveLength(8);
    s = sendEp01FirstCallRefusal(s, ep01FirstCallChoices(s)[0].target);
    s = advanceEp01FirstCall(at(s, 8400));
    expect(s.variables.ep01FirstCallRinging).toBe(true);
    s = rejectEp01FirstCall(s);
    s = advanceEp01FirstCallRetry(at(s, 11400));
    expect(s.variables.ep01FirstCallRinging).toBe(true);
    expect(s.messages.kakao).toHaveLength(9);
    s = answerEp01FirstCall(s);
    s = endEp01FirstCall(s);
    expect(s.variables.ep01FirstCallEnded).toBe(true);
    expect(s.variables.ep01FirstCallRinging).toBe(false);
  });
});
