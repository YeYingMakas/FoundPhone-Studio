import { describe, expect, it } from "vitest";
import { initialRuntime, makeItem, type Work } from "../schema";
import scene22 from "../../stories/unpublished-lover/data/scene22.json";
import { advanceScene22, scene22AllRead, markScene22ListReturn, markScene23ManualOpen } from "./unpublishedLoverScene22";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;

describe("scene 22 existing chat history", () => {
  it("keeps older Junghwan messages without blocking the manual scene 23 gate", () => {
    const old = makeItem({ title: "苏庭焕", sender: "苏庭焕", body: "old", read: false, meta: { conversationId: "chat-junghwan" } });
    let state = { ...initialRuntime(work), elapsedMs: 3000, messages: { kakao: [old] }, variables: { ep01Scene21SecondSent: true, ep01Scene22StartedAt: 0 } };
    for (let i = 0; i < scene22.messages.length; i++) {
      state = advanceScene22({ ...state, elapsedMs: 3000 + i * scene22.typingBeforeEachMs });
    }
    expect(state.messages.kakao).toHaveLength(scene22.messages.length + 1);
    expect(scene22AllRead(state)).toBe(false);
    state = { ...state, messages: { kakao: state.messages.kakao.map((item) => item.id === old.id ? item : { ...item, read: true }) } };
    expect(scene22AllRead(state)).toBe(true);
    expect(markScene23ManualOpen(state, "쩡쩡❤️")).toBe(state);
    state = markScene22ListReturn(state);
    expect(markScene23ManualOpen(state, "쩡쩡❤️").variables.ep01Scene23Ready).toBe(true);
  });
});
