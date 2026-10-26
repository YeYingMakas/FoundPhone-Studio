import { describe, expect, it } from "vitest";
import { continueExploringPhone, deliverApologyMessage, deliverReplyMessage, firstInstagramDmOpened, initialEp01EndingState, sendPlayerReply, setKakaoBlocked } from "./unpublishedLoverEnding";
describe("unpublished lover scene30-31 progression", () => {
  it.each(["A", "B", "C"] as const)("shows ending only after every %s reply", branch => {
    let state = initialEp01EndingState();
    let effects;
    [state, effects] = firstInstagramDmOpened(state);
    expect(effects).toEqual([{ type: "schedule-apology", delayMs: 2000, messageCount: 13 }]);
    expect(firstInstagramDmOpened(state)[1]).toEqual([]);
    for (let i = 0; i < 13; i++) [state, effects] = deliverApologyMessage(state);
    expect(effects).toEqual([{ type: "show-player-choices", count: 3 }]);
    [state, effects] = sendPlayerReply(state, branch);
    const count = branch === "C" ? 12 : 11;
    expect(effects).toEqual([{ type: "schedule-replies", branch, count }]);
    for (let i = 0; i < count - 1; i++) {
      [state, effects] = deliverReplyMessage(state);
      expect(effects).toEqual([]);
      expect(state.endingUnlocked).toBe(false);
    }
    [state, effects] = deliverReplyMessage(state);
    expect(effects).toEqual([{ type: "show-ending", branch, delayMs: 3000 }]);
    expect(state.endingUnlocked).toBe(true);
    [state, effects] = continueExploringPhone(state);
    expect(state.stage).toBe("exploring");
    expect(effects).toEqual([{ type: "dismiss-ending" }]);
    expect(deliverReplyMessage(state)[1]).toEqual([]);
  });
  it("never bypasses a manual KakaoTalk block", () => {
    let state = initialEp01EndingState(true);
    [state] = firstInstagramDmOpened(state);
    expect(deliverApologyMessage(state)[1]).toEqual([]);
    expect(state.apologyDelivered).toBe(0);
    state = setKakaoBlocked(state, false);
    for (let i = 0; i < 13; i++) [state] = deliverApologyMessage(state);
    expect(state.stage).toBe("awaiting-reply");
    state = setKakaoBlocked(state, true);
    expect(sendPlayerReply(state, "A")[1]).toEqual([]);
  });
  it("cannot send an option before the player receives all 13 messages", () => {
    let state = initialEp01EndingState();
    [state] = firstInstagramDmOpened(state);
    expect(sendPlayerReply(state, "B")[1]).toEqual([]);
    expect(continueExploringPhone(state)[1]).toEqual([]);
  });
});
