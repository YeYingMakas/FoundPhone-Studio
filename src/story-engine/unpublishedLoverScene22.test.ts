import { describe, expect, it } from "vitest";
import type { Runtime, Work } from "../schema";
import { initialRuntime } from "../schema";
import { advanceScene22, scene22AllRead, markScene22ListReturn, markScene23ManualOpen } from "./unpublishedLoverScene22";
import { readStoryConversation } from "./unpublishedLoverRuntime";

const work = {
  id: "unpublished-lover-ep01",
  updatedAt: 1,
  phone: { date: "2026-10-23", time: "22:00" },
  variables: {},
} as Work;

function at(runtime: Runtime, ms: number): Runtime {
  return advanceScene22({ ...runtime, elapsedMs: ms });
}

describe("EP01 approved scene 22", () => {
  it("does not deliver before scene 21 second reply", () => {
    expect(at(initialRuntime(work), 100000).messages.kakao).toBeUndefined();
  });

  it("delivers all 15 messages after 3s and then at 2s intervals", () => {
    let runtime = at({
      ...initialRuntime(work),
      variables: { ep01Scene21SecondSent: true },
    }, 0);
    expect(runtime.variables.ep01Scene22StartedAt).toBe(0);
    runtime = at(runtime, 2999);
    expect(runtime.messages.kakao).toBeUndefined();
    runtime = at(runtime, 3000);
    expect(runtime.messages.kakao).toHaveLength(1);
    expect(runtime.messages.kakao[0].body).toBe("네???\n什么？？？");
    for (let index = 1; index < 15; index++) {
      runtime = at(runtime, 3000 + index * 2000);
    }
    expect(runtime.messages.kakao).toHaveLength(15);
    expect(runtime.variables.ep01Scene22Finished).toBe(true);
    expect(scene22AllRead(runtime)).toBe(false);
    runtime = readStoryConversation(runtime, "kakao", "苏庭焕");
    expect(scene22AllRead(runtime)).toBe(true);
    expect(at(runtime, 100000).messages.kakao).toHaveLength(15);
  });
  it("requires all messages read, return to list, then manual Jeongwoo open", () => {
    let runtime = at({ ...initialRuntime(work), variables: { ep01Scene21SecondSent: true } }, 0);
    runtime = at(runtime, 3000);
    expect(markScene22ListReturn(runtime)).toBe(runtime);
    expect(markScene23ManualOpen(runtime, "쩡쩡❤️")).toBe(runtime);
    for (let index = 1; index < 15; index++) runtime = at(runtime, 3000 + index * 2000);
    runtime = readStoryConversation(runtime, "kakao", "苏庭焕");
    expect(markScene23ManualOpen(runtime, "쩡쩡❤️")).toBe(runtime);
    runtime = markScene22ListReturn(runtime);
    expect(runtime.variables.ep01Scene22ReturnedToList).toBe(true);
    expect(markScene23ManualOpen(runtime, "闺蜜")).toBe(runtime);
    runtime = markScene23ManualOpen(runtime, "쩡쩡❤️");
    expect(runtime.variables.ep01Scene23Ready).toBe(true);
  });

});
