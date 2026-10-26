import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { advanceScene24, blockScene24Kakao, scene24Choices, sendScene24Choice, unblockScene24Kakao } from "./unpublishedLoverScene24";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
const tick = (runtime: Runtime, ms: number) => advanceScene24({ ...runtime, elapsedMs: ms });

describe("EP01 scene 24", () => {
  it("does not open before the prior branch completes", () => {
    expect(tick(initialRuntime(work), 999999).messages.kakao).toBeUndefined();
  });
  for (const [branch, count] of [["A", 6], ["B", 10], ["C", 10]] as const) {
    it("handles branch " + branch + " without leaking blocked messages", () => {
      let runtime = tick({ ...initialRuntime(work), variables: { ep01Scene24Ready: true } }, 0);
      for (let index = 1; index <= 7; index++) runtime = tick(runtime, index * 2000);
      expect(runtime.messages.kakao).toHaveLength(7);
      expect(scene24Choices(runtime)).toHaveLength(3);
      runtime = sendScene24Choice(runtime, "ep01-scene24-" + branch);
      if (branch === "A") {
        expect(tick(runtime, 16000).messages.kakao).toHaveLength(7);
        runtime = blockScene24Kakao(runtime);
        expect(runtime.variables.ep01KakaoBlocked).toBe(true);
      }
      for (let index = 1; index <= count; index++) runtime = tick(runtime, 14000 + index * 2000);
      expect(runtime.messages.kakao).toHaveLength(branch === "A" ? 7 : 7 + count);
      runtime = tick(runtime, 14000 + (count + 1) * 2000);
      expect(runtime.variables.ep01Scene24Finished).toBe(true);
      runtime = tick(runtime, 14000 + (count + 1) * 2000 + 5000);
      expect(runtime.variables.ep01Scene25Ready).toBe(true);
      if (branch === "A") {
        expect(runtime.variables.ep01KakaoBlocked).toBe(true);
        runtime = unblockScene24Kakao(runtime);
        expect(runtime.variables.ep01KakaoBlocked).toBe(false);
      }
    });
  }
});
