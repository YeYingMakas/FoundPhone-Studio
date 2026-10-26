import { describe, expect, it } from "vitest";
import { createScene24, deliverScene24Reply, manuallyBlockKakao, manuallyUnblockKakao, openingDelivered, sendScene24Choice } from "./unpublishedLoverBlock";

describe("scene24 delivery rules", () => {
  it.each(["A", "B", "C"] as const)("preserves branch %s and enters scene25", branch => {
    let state = createScene24();
    let effects;
    for (let i = 0; i < 7; i++) [state, effects] = openingDelivered(state);
    expect(effects).toEqual([{ type: "show-choices" }]);
    [state, effects] = sendScene24Choice(state, branch);
    if (branch === "A") {
      expect(effects).toEqual([{ type: "wait-for-manual-block" }]);
      expect(deliverScene24Reply(state)[1]).toEqual([]);
      state = manuallyBlockKakao(state);
      expect(state.kakaoBlocked).toBe(true);
    }
    const count = branch === "A" ? 6 : 10;
    for (let i = 0; i < count; i++) {
      [state, effects] = deliverScene24Reply(state);
      expect(effects[0]).toEqual(branch === "A"
        ? { type: "deliver-failed-attempt", index: i, playerVisible: false, unreadDelta: 0 }
        : { type: "deliver-reply", branch, index: i });
      if (i === count - 1) expect(effects[1]).toEqual({ type: "schedule-scene25", delayMs: 5000 });
    }
    expect(state.stage).toBe("complete");
    expect(deliverScene24Reply(state)[1]).toEqual([]);
  });
  it("requires a separate player action to unblock", () => {
    let state = createScene24();
    for (let i = 0; i < 7; i++) [state] = openingDelivered(state);
    [state] = sendScene24Choice(state, "A");
    state = manuallyBlockKakao(state);
    expect(state.kakaoBlocked).toBe(true);
    state = manuallyUnblockKakao(state);
    expect(state.kakaoBlocked).toBe(false);
  });
});
