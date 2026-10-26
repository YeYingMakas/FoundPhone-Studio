import { describe, expect, it } from "vitest";
import { visible } from "../engine";
import type { Work } from "../schema";
import { initialRuntime } from "../schema";

describe("EP01 scene 27 spoiler protection", () => {
  const work = {
    id: "unpublished-lover-ep01",
    updatedAt: 1,
    phone: { date: "2026-10-23", time: "22:00" },
    variables: {},
  } as Work;
  const publicPost = {
    id: "scene27-public-post",
    hidden: false,
    unlock: "ep01PublicPostUnlocked",
  };

  it("keeps the public confession invisible before its trigger", () => {
    expect(visible(publicPost, initialRuntime(work))).toBe(false);
  });

  it("reveals the post only after the story sets the unlock flag", () => {
    const runtime = initialRuntime(work);
    expect(visible(publicPost, { ...runtime, variables: { ...runtime.variables, ep01PublicPostUnlocked: true } })).toBe(true);
  });
});
