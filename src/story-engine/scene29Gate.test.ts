import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { openPublicPost, advanceInstagramDMs } from "./scene29Gate";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
const tick = (runtime: Runtime, time: number) => advanceInstagramDMs({ ...runtime, elapsedMs: time });

describe("EP01 Instagram DM queue", () => {
  it("requires the actual X post detail to be opened", () => {
    const runtime = initialRuntime(work);
    expect(openPublicPost(runtime, "scene27-public-post")).toBe(runtime);
    expect(tick(runtime, 99999).messages.instagram).toBeUndefined();
  });
  it("delivers sixty unique conversations at six tenths of a second", () => {
    let runtime = openPublicPost({ ...initialRuntime(work), variables: { ep01PublicPostUnlocked: true }, elapsedMs: 1000 }, "scene27-public-post");
    runtime = tick(runtime, 2999);
    expect(runtime.messages.instagram).toBeUndefined();
    for (let i = 0; i < 60; i++) {
      runtime = tick(runtime, 3000 + i * 600);
      expect(runtime.messages.instagram).toHaveLength(i + 1);
    }
    expect(new Set(runtime.messages.instagram.map((item) => item.title)).size).toBe(60);
    expect(runtime.messages.instagram.every((item) => item.read === false)).toBe(true);
    expect(runtime.variables.ep01InstagramFinished).toBe(true);
    expect(tick(runtime, 99999).messages.instagram).toHaveLength(60);
  });
});
