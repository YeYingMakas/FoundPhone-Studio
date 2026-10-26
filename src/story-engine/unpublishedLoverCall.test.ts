import { describe, expect, it } from "vitest";
import {
  answerCall,
  chooseCallReply,
  completeHangUp,
  createCallState,
  rejectCall,
  speakFinalLine,
} from "./unpublishedLoverCall";

describe("unpublished lover scene25 calls", () => {
  it.each(["A", "B", "C"] as const)("keeps ringing after rejecting route %s", (route) => {
    let state = createCallState(route);
    for (let i = 1; i <= 5; i++) {
      const [next, effects] = rejectCall(state);
      state = next;
      expect(state.rejectedCalls).toBe(i);
      expect(effects.at(-1)).toEqual({ type: "ring" });
      const message = effects.find((e) => e.type === "show-rejection-line");
      if (i <= 3) {
        expect(message).toEqual({ type: "show-rejection-line", index: i - 1, visible: route !== "A" });
      } else {
        expect(message).toBeUndefined();
      }
    }
    const [answered, effects] = answerCall(state);
    expect(answered.answered).toBe(true);
    expect(effects).toEqual([{ type: "show-answer-dialogue", route }]);
    expect(rejectCall(answered)[1]).toEqual([]);
  });

  it.each(["A", "B", "C"] as const)("supports all three reply choices in route %s", (route) => {
    for (const choice of [1, 2, 3] as const) {
      const [answered] = answerCall(createCallState(route));
      const [chosen, effects] = chooseCallReply(answered, choice);
      expect(effects).toEqual([{ type: "show-choice-dialogue", route, choice }]);
      const [spoken, hangup] = speakFinalLine(chosen);
      expect(hangup).toEqual([{ type: "hang-up-after", delayMs: 2000 }]);
      const [ended, scene26] = completeHangUp(spoken);
      expect(ended.ended).toBe(true);
      expect(scene26).toEqual([{ type: "start-scene26-after", delayMs: 2000 }]);
      expect(completeHangUp(ended)[1]).toEqual([]);
    }
  });

  it("never unblocks KakaoTalk on answer", () => {
    const [state] = answerCall(createCallState("A"));
    expect(state.kakaoBlocked).toBe(true);
  });

  it("requires answer and reply before final line", () => {
    const initial = createCallState("B");
    expect(speakFinalLine(initial)[1]).toEqual([]);
    const [answered] = answerCall(initial);
    expect(speakFinalLine(answered)[1]).toEqual([]);
    expect(chooseCallReply(initial, 1)[1]).toEqual([]);
  });
});
