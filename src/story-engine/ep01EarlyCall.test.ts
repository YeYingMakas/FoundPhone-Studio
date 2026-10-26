import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { ep01EarlyCallChoices, sendEp01EarlyCallChoice, advanceEp01EarlyCallAftermath } from "./ep01EarlyCall";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 opening call remains distinct from later scene14", () => {
  it.each(["A", "B", "C"])("ends early call with response %s and delivers seventeen messages", branch => {
    let s: Runtime = initialRuntime(work);
    expect(ep01EarlyCallChoices(s)).toHaveLength(0);
    s = { ...s, elapsedMs: 1000, variables: { ep01FirstCallAnswered: true } };
    expect(ep01EarlyCallChoices(s)).toHaveLength(3);
    s = sendEp01EarlyCallChoice(s, "ep01-early-call-" + branch);
    expect(s.variables.ep01FirstCallEnded).toBe(true);
    expect(s.variables.ep01Scene15ReplySent).not.toBe(true);
    for (let i = 0; i < 17; i++) {
      s = advanceEp01EarlyCallAftermath({ ...s, elapsedMs: 3000 + i * 2000 });
      expect(s.messages.kakao).toHaveLength(i + 1);
    }
    expect(s.variables.ep01EarlyCallAftermathFinished).toBe(true);
    expect(s.messages.kakao.every(x => x.title === "쩡쩡❤️" && x.body.includes("\n"))).toBe(true);
  });
});
