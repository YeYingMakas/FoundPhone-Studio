import { describe, expect, it } from "vitest";
import type { Work } from "../schema";
import { initialRuntime } from "../schema";
import { advanceScene25Incoming, answerScene25Incoming, rejectScene25Incoming } from "./unpublishedLoverScene25";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;

describe("EP01 scene 25 incoming calls", () => {
  it("does not call before scene 24 finishes", () => {
    expect(advanceScene25Incoming(initialRuntime(work)).incomingCall).toBeNull();
  });
  it("rings again after every rejection but sends only three visible lines", () => {
    let runtime = advanceScene25Incoming({ ...initialRuntime(work), variables: { ep01Scene25Ready: true, ep01Scene24Branch: "B" } });
    expect(runtime.incomingCall?.status).toBe("ringing");
    for (let index = 1; index <= 5; index++) {
      runtime = rejectScene25Incoming(runtime);
      expect(runtime.incomingCall?.status).toBe("ringing");
      expect(runtime.messages.kakao ?? []).toHaveLength(Math.min(index, 3));
    }
    runtime = answerScene25Incoming(runtime);
    expect(runtime.incomingCall?.status).toBe("answered");
    expect(runtime.variables.ep01Scene25Answered).toBe(true);
    expect(rejectScene25Incoming(runtime)).toBe(runtime);
  });
  it("allows a call while Kakao is blocked without exposing failed messages", () => {
    let runtime = advanceScene25Incoming({ ...initialRuntime(work), variables: { ep01Scene25Ready: true, ep01Scene24Branch: "A", ep01KakaoBlocked: true } });
    runtime = rejectScene25Incoming(runtime);
    expect(runtime.messages.kakao ?? []).toHaveLength(0);
    expect(runtime.incomingCall?.status).toBe("ringing");
    runtime = answerScene25Incoming(runtime);
    expect(runtime.variables.ep01KakaoBlocked).toBe(true);
    expect(runtime.variables.ep01Scene25Route).toBe("A");
  });
});
