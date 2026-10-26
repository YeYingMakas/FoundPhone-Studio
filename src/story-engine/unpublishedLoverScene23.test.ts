import { describe, expect, it } from "vitest";
import type { Runtime, Work } from "../schema";
import { initialRuntime } from "../engine";
import { advanceScene23, scene23Choices, sendScene23Choice } from "./unpublishedLoverScene23";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;

describe("EP01 scene 23 branches", () => {
  it("does not offer choices before manual opening", () => {
    expect(scene23Choices(initialRuntime(work))).toHaveLength(0);
  });

  for (const [branch, count] of [["A", 10], ["B", 10], ["C", 11]] as const) {
    it("sends branch " + branch + " manually and delivers " + count + " replies", () => {
      let runtime: Runtime = { ...initialRuntime(work), variables: { ep01Scene23Ready: true } };
      expect(scene23Choices(runtime)).toHaveLength(3);
      runtime = sendScene23Choice(runtime, "ep01-scene23-" + branch);
      expect(scene23Choices(runtime)).toHaveLength(0);
      for (let index = 1; index <= count; index++) {
        runtime = advanceScene23({ ...runtime, elapsedMs: index * 2000 });
      }
      expect(runtime.messages.kakao).toHaveLength(count);
      expect(runtime.messages.kakao.every((message) => message.title === "쩡쩡❤️")).toBe(true);
      runtime = advanceScene23({ ...runtime, elapsedMs: (count + 1) * 2000 });
      expect(runtime.variables.ep01Scene23Finished).toBe(true);
      expect(runtime.variables.ep01Scene24Ready).not.toBe(true);
      runtime = advanceScene23({ ...runtime, elapsedMs: (count + 1) * 2000 + 5000 });
      expect(runtime.variables.ep01Scene24Ready).toBe(true);
      expect(advanceScene23(runtime).messages.kakao).toHaveLength(count);
    });
  }
});
