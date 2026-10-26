import { describe, expect, it } from "vitest";
import { initialRuntime, type Work } from "../schema";
import { scene21Choices, sendScene21Choice } from "./scene21Handoff";
import { advanceScene22 } from "./unpublishedLoverScene22";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;

describe("scene 21 handoff", () => {
  it("does not skip the required previous scene", () => {
    const state = initialRuntime(work);
    expect(scene21Choices(state)).toHaveLength(0);
    expect(sendScene21Choice(state, "ep01-scene21-second")).toBe(state);
    expect(advanceScene22(state)).toBe(state);
  });
  it("requires both player sends in order before scene 22 can begin", () => {
    let state = { ...initialRuntime(work), variables: { ep01Scene21Ready: true } };
    expect(scene21Choices(state)[0].target).toBe("ep01-scene21-first");
    state = sendScene21Choice(state, "ep01-scene21-first");
    expect(state.variables.ep01Scene21FirstSent).toBe(true);
    expect(scene21Choices(state)[0].target).toBe("ep01-scene21-second");
    state = sendScene21Choice(state, "ep01-scene21-second");
    expect(state.variables.ep01Scene21SecondSent).toBe(true);
    expect(scene21Choices(state)).toHaveLength(0);
    expect(advanceScene22(state).variables.ep01Scene22StartedAt).toBe(0);
  });
});
