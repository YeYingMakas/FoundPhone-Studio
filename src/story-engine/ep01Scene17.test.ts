import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { advanceEp01Scene17 } from "./ep01Scene17";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 scene17 three independent contacts", () => {
  it("delivers four bilingual messages per contact with staggered first messages and independent unread state", () => {
    let s: Runtime = initialRuntime(work);
    s = { ...s, variables: { ep01FirstCallEnded: true, ep01Scene15ReplySent: true, ep01Scene16StartedAt: 1000, ep01PlayerName: "安安", ep01BirthYear: 2005 } };
    expect(advanceEp01Scene17({ ...s, elapsedMs: 999 })).toBe(s);
    for (let now = 1000; now <= 19000; now += 200) {
      s = advanceEp01Scene17({ ...s, elapsedMs: now });
    }
    const items = s.messages.kakao;
    expect(items).toHaveLength(12);
    expect(items.filter(x => x.title === "尹材赫")).toHaveLength(4);
    expect(items.filter(x => x.title === "朴志焄")).toHaveLength(4);
    expect(items.filter(x => x.title === "苏庭焕")).toHaveLength(4);
    expect(items[0].body).toContain("安安 누나");
    expect(items.find(x => x.title === "苏庭焕")?.body).toContain("安安 누나");
    expect(items.every(x => !x.read && x.body.includes("\n"))).toBe(true);
    expect(s.variables.ep01Scene17Finished).toBe(true);
    expect(advanceEp01Scene17({ ...s, elapsedMs: 100000 }).messages.kakao).toHaveLength(12);
  });
});
