import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import scene24 from "../../stories/unpublished-lover/data/scene24.json";
import { advanceScene24, blockScene24Kakao, unblockScene24Kakao } from "./unpublishedLoverScene24";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;

describe("scene 24 blocked branch", () => {
  it("requires manual blocking and does not deliver rejected messages", () => {
    let runtime: Runtime = {
      ...initialRuntime(work),
      variables: { ep01Scene24Ready: true, ep01Scene24OpeningDelivered: scene24.opening.length,
        ep01Scene24Branch: "A", ep01Scene24ChoiceAt: 0, ep01Scene24ReplyDelivered: 0 },
    };
    expect(advanceScene24({ ...runtime, elapsedMs: 50000 })).toBe(runtime);
    runtime = blockScene24Kakao(runtime);
    expect(runtime.variables.ep01KakaoBlocked).toBe(true);
    expect(runtime.variables.ep01Scene24WasBlocked).toBe(true);
    runtime = advanceScene24({ ...runtime, elapsedMs: 50000 });
    expect(runtime.variables.ep01Scene24ReplyDelivered).toBe(1);
    expect(runtime.messages.kakao).toBeUndefined();
    runtime = unblockScene24Kakao(runtime);
    for (let i = 1; i < scene24.branches.A.replies.length; i++) {
      runtime = advanceScene24({ ...runtime, elapsedMs: 50000 + i * 2000 });
    }
    expect(runtime.variables.ep01Scene24ReplyDelivered).toBe(scene24.branches.A.replies.length);
    expect(runtime.messages.kakao).toBeUndefined();
  });
});
