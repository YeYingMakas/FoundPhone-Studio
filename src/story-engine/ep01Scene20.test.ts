import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { scene20Choices, sendScene20Choice, advanceScene20 } from "./ep01Scene20";
import { scene21Choices } from "./scene21Handoff";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 scene20 to 21 handoff", () => {
  it.each([["A", 7], ["B", 6], ["C", 6]])("finishes draft branch %s before opening scene21", (branch, count) => {
    let s: Runtime = initialRuntime(work);
    expect(scene20Choices(s)).toHaveLength(0);
    s = { ...s, elapsedMs: 1000, variables: { ep01Scene17_junghwan: 4 } };
    expect(scene20Choices(s)).toHaveLength(3);
    s = sendScene20Choice(s, "ep01-scene20-" + branch);
    expect(scene21Choices(s)).toHaveLength(0);
    for (let i = 0; i < count; i++) {
      s = advanceScene20({ ...s, elapsedMs: 3000 + i * 2000 });
      expect(s.messages.kakao).toHaveLength(i + 1);
      if (i < count - 1) expect(scene21Choices(s)).toHaveLength(0);
    }
    expect(s.variables.ep01Scene20Finished).toBe(true);
    expect(scene21Choices(s)).toHaveLength(0);
    expect(s.messages.kakao.every(x => x.title === "苏庭焕" && x.body.includes("\n"))).toBe(true);
  });
});
