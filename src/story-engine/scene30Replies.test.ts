import { describe, expect, it } from "vitest";
import { initialRuntime, type Work, type Runtime } from "../schema";
import scene30 from "../../stories/unpublished-lover/data/scene30.json";
import { scene30Choices, sendScene30Choice, advanceScene30Replies } from "./scene30Replies";
import { advanceScene31, dismissScene31 } from "./scene31Ending";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;

describe("EP01 scene 30 branches and ending", () => {
  it.each(["A", "B", "C"] as const)("requires manual choice and delivers all %s replies", (branch) => {
    let runtime: Runtime = { ...initialRuntime(work), elapsedMs: 1000, variables: { ep01Scene30OpeningFinished: true } };
    expect(scene30Choices(runtime)).toHaveLength(3);
    runtime = sendScene30Choice(runtime, "ep01-scene30-" + branch);
    expect(runtime.variables.ep01Scene30Branch).toBe(branch);
    expect(scene30Choices(runtime)).toHaveLength(0);
    const count = scene30.branches[branch].replies.length;
    for (let i = 0; i < count; i++) {
      runtime = advanceScene30Replies({ ...runtime, elapsedMs: 3000 + i * 2000 });
      expect(runtime.messages.kakao).toHaveLength(i + 1);
    }
    expect(runtime.variables.ep01Scene30Finished).toBe(true);
    const at = Number(runtime.variables.ep01Scene30FinishedAt);
    runtime = advanceScene31({ ...runtime, elapsedMs: at + 2999 });
    expect(runtime.variables.ep01Scene31Visible).not.toBe(true);
    runtime = advanceScene31({ ...runtime, elapsedMs: at + 3000 });
    expect(runtime.variables.ep01Scene31Visible).toBe(true);
    expect(runtime.endings).toContain("ENDING_01");
    runtime = dismissScene31(runtime);
    expect(runtime.variables.ep01Scene31Visible).toBe(false);
    expect(runtime.messages.kakao).toHaveLength(count);
  });
});
