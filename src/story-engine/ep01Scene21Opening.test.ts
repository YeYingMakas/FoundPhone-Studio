import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { scene21OpeningChoices, sendScene21Opening, advanceScene21OpeningReplies } from "./ep01Scene21Opening";
import { scene21Choices } from "./scene21Handoff";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 full scene21", () => {
  it("requires six separate manual sends, eleven separate replies, then unlocks the final two messages", () => {
    let s: Runtime = initialRuntime(work);
    expect(scene21OpeningChoices(s)).toHaveLength(0);
    s = { ...s, elapsedMs: 1000, variables: { ep01Scene20Finished: true } };
    for (let i = 0; i < 6; i++) {
      const choices = scene21OpeningChoices(s);
      expect(choices).toHaveLength(1);
      s = sendScene21Opening(s, choices[0].target);
      expect(scene21Choices(s)).toHaveLength(0);
    }
    expect(scene21OpeningChoices(s)).toHaveLength(0);
    for (let i = 0; i < 11; i++) {
      s = advanceScene21OpeningReplies({ ...s, elapsedMs: 3000 + i * 2000 });
      expect(s.messages.kakao).toHaveLength(i + 1);
      if (i < 10) expect(scene21Choices(s)).toHaveLength(0);
    }
    expect(s.variables.ep01Scene21OpeningFinished).toBe(true);
    expect(scene21Choices(s)).toHaveLength(1);
    expect(s.messages.kakao.every(x => x.title === "苏庭焕" && x.body.includes("\n"))).toBe(true);
  });
});
