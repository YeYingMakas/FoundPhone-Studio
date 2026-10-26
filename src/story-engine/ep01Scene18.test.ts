import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { scene18Choices, sendScene18Choice, advanceScene18 } from "./ep01Scene18";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 Jaehyuk scene18", () => {
  it.each([["A", 5], ["B", 7], ["C", 8]])("plays approved branch %s one message at a time", (branch, count) => {
    let s: Runtime = initialRuntime(work);
    expect(scene18Choices(s)).toHaveLength(0);
    s = { ...s, elapsedMs: 1000, variables: { ep01Scene17_jaehyuk: 4 } };
    expect(scene18Choices(s)).toHaveLength(3);
    s = sendScene18Choice(s, "ep01-scene18-" + branch);
    expect(scene18Choices(s)).toHaveLength(0);
    for (let i = 0; i < count; i++) {
      s = advanceScene18({ ...s, elapsedMs: 3000 + i * 2000 });
      expect(s.messages.kakao).toHaveLength(i + 1);
    }
    expect(s.variables.ep01Scene18Finished).toBe(true);
    expect(s.messages.kakao.every(x => x.title === "尹材赫" && x.body.includes("\n"))).toBe(true);
    expect(advanceScene18(s)).toBe(s);
  });
});
