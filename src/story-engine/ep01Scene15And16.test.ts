import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { chooseScene15Reply, advanceScene15And16, scene16Count } from "./ep01Scene15And16";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 scene15 to scene16", () => {
  it("requires a selected call branch, automatically hangs up after two seconds, then sends 15 individual bilingual messages", () => {
    let s: Runtime = initialRuntime(work);
    expect(chooseScene15Reply(s)).toBe(s);
    s = { ...s, elapsedMs: 1000, variables: { ep01Scene14Answered: true, ep01Scene14RepliesFinished: true } };
    s = chooseScene15Reply(s);
    expect(s.variables.ep01Scene15HangupDueAt).toBe(3000);
    s = advanceScene15And16({ ...s, elapsedMs: 2999 });
    expect(s.variables.ep01Scene14Answered).toBe(true);
    s = advanceScene15And16({ ...s, elapsedMs: 3000 });
    expect(s.variables.ep01Scene14Ended).toBe(true);
    expect(s.variables.ep01Scene16StartedAt).toBe(6000);
    expect(s.variables.ep01FirstCallRejectedCount).toBeUndefined();
    for (let i = 0; i < scene16Count; i++) {
      s = advanceScene15And16({ ...s, elapsedMs: 6000 + i * 2000 });
      expect(s.messages.kakao).toHaveLength(i + 1);
      expect(s.messages.kakao[i].body).toContain("\n");
      expect(s.messages.kakao[i].read).toBe(false);
    }
    expect(s.variables.ep01Scene16Finished).toBe(true);
    expect(advanceScene15And16({ ...s, elapsedMs: 999999 }).messages.kakao).toHaveLength(15);
  });
});
