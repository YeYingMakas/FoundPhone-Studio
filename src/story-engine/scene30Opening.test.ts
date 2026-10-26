import { describe, expect, it } from "vitest";
import { initialRuntime, type Work, type Runtime } from "../schema";
import { openInstagramThread, sendInstagramReply } from "./scene29Gate";
import { advanceScene30Opening } from "./scene30Opening";
import { makeItem } from "../schema";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
const item = makeItem({ title: "instagram_user_01", body: "안녕하세요\n你好", sender: "instagram_user_01", read: false, outgoing: false, meta: { source: "ep01-scene29" } });

describe("EP01 Instagram chat and scene 30 trigger", () => {
  it("only opens existing conversations and marks that conversation read", () => {
    const runtime = { ...initialRuntime(work), messages: { instagram: [item] }, elapsedMs: 1000 };
    expect(openInstagramThread(runtime, "missing")).toBe(runtime);
    const opened = openInstagramThread(runtime, item.title);
    expect(opened.messages.instagram[0].read).toBe(true);
    expect(opened.variables.ep01FirstInstagramThreadOpenedAt).toBe(1000);
    const sent = sendInstagramReply(opened, item.title, "hello");
    expect(sent.messages.instagram).toHaveLength(2);
    expect(sent.messages.instagram[1].outgoing).toBe(true);
    expect(sent.messages.instagram[1].body).toBe("hello");
  });
  it("starts apologies after two seconds and waits if Kakao is blocked", () => {
    let runtime: Runtime = { ...initialRuntime(work), elapsedMs: 1000, variables: { ep01FirstInstagramThreadOpenedAt: 1000, ep01KakaoBlocked: true } };
    runtime = advanceScene30Opening({ ...runtime, elapsedMs: 3000 });
    expect(runtime.messages.kakao).toBeUndefined();
    expect(runtime.variables.ep01Scene30WaitingForUnblock).toBe(true);
    expect(advanceScene30Opening(runtime)).toBe(runtime);
    runtime = advanceScene30Opening({ ...runtime, elapsedMs: 3200, variables: { ...runtime.variables, ep01KakaoBlocked: false } });
    expect(runtime.messages.kakao).toHaveLength(1);
  });
});
