import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { scene19Choices, sendScene19Choice, advanceScene19 } from "./ep01Scene19";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 Jihoon scene19", () => {
  it.each([["A", 6], ["B", 7], ["C", 8]])("plays branch %s with %i bilingual replies", (branch, count) => {
    let s: Runtime = initialRuntime(work);
    expect(scene19Choices(s)).toHaveLength(0);
    s = { ...s, elapsedMs: 1000, variables: { ep01Scene17_jihoon: 4, ep01PlayerName: "安安" } };
    expect(scene19Choices(s)).toHaveLength(3);
    s = sendScene19Choice(s, "ep01-scene19-" + branch);
    for (let i = 0; i < count; i++) {
      s = advanceScene19({ ...s, elapsedMs: 3000 + i * 2000 });
      expect(s.messages.kakao).toHaveLength(i + 1);
    }
    expect(s.variables.ep01Scene19Finished).toBe(true);
    expect(s.messages.kakao.every(x => x.title === "朴志焄" && x.body.includes("\n"))).toBe(true);
    if (branch === "C") expect(s.messages.kakao[0].body).toContain("安安");
  });
});
