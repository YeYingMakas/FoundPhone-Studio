import { describe, expect, it } from "vitest";
import type { Runtime, Work } from "../schema";
import { initialRuntime } from "../engine";
import { advanceScene26, manuallyOpenScene27X } from "./unpublishedLoverScene26";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
const tick = (runtime: Runtime, ms: number) => advanceScene26({ ...runtime, elapsedMs: ms });

describe("EP01 friend scene 26 and manual X unlock", () => {
  it("never delivers before the call has ended", () => {
    const initial = initialRuntime(work);
    expect(tick(initial, 999999).messages.kakao).toBeUndefined();
    expect(manuallyOpenScene27X(initial)).toBe(initial);
  });
  it("waits two seconds, delivers six distinct bilingual messages, and never auto-opens X", () => {
    let runtime = { ...initialRuntime(work), variables: { ep01Scene25Finished: true, ep01Scene25HungUpAt: 10000 } };
    runtime = tick(runtime, 11999);
    expect(runtime.messages.kakao).toBeUndefined();
    for (let i = 0; i < 6; i++) {
      runtime = tick(runtime, 12000 + i * 2000);
      expect(runtime.messages.kakao).toHaveLength(i + 1);
      expect(runtime.messages.kakao[i].body).toContain("\n");
      expect(runtime.messages.kakao[i].title).toBe("闺蜜");
      expect(runtime.messages.kakao[i].read).toBe(false);
    }
    expect(runtime.variables.ep01Scene26Finished).toBe(true);
    expect(runtime.variables.ep01PublicPostUnlocked).not.toBe(true);
    expect(tick(runtime, 999999).messages.kakao).toHaveLength(6);
    runtime = manuallyOpenScene27X(runtime);
    expect(runtime.variables.ep01PublicPostUnlocked).toBe(true);
    expect(runtime.variables.ep01Scene27OpenedManually).toBe(true);
  });
});
