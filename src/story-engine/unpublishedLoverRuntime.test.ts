import { describe, expect, it } from "vitest";
import { initialRuntime, type Work } from "../schema";
import { appendStoryDelivery, readStoryConversation, readStoryMessage, storyAppUnread } from "./unpublishedLoverRuntime";
import type { SceneDelivery } from "./unpublishedLoverDelivery";

describe("EP01 phone runtime bridge", () => {
  const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
  const scene: SceneDelivery = {
    app: "kakao",
    conversationId: "jeongwoo",
    sender: "朴炡禹",
    lines: [{ id: "first", ko: "자기야아", zh: "宝宝呀" }],
    delivered: 0,
    blocked: false,
  };
  it("appends an original-format item and updates read status", () => {
    const first = appendStoryDelivery(initialRuntime(work), scene, "2026-10-23", "22:00");
    expect(first.runtime.messages.kakao).toHaveLength(1);
    expect(first.runtime.notifications).toHaveLength(1);
    expect(storyAppUnread(first.runtime, "kakao")).toBe(1);
    const itemId = first.runtime.messages.kakao[0].id;
    const read = readStoryMessage(first.runtime, "kakao", itemId);
    expect(storyAppUnread(read, "kakao")).toBe(0);
    expect(read.messages.kakao[0].body).toBe("자기야아\n宝宝呀");
  });
  it("marks one conversation read without clearing another contact", () => {
    const jeongwoo = appendStoryDelivery(initialRuntime(work), {
      ...scene,
      conversationId: "chat-jeongwoo",
    }, "2026-10-23", "22:00");
    const friend = appendStoryDelivery(jeongwoo.runtime, {
      ...scene,
      conversationId: "chat-friend",
      sender: "闺蜜",
      lines: [{ id: "friend-first", ko: "야", zh: "喂" }],
    }, "2026-10-23", "22:01");
    expect(storyAppUnread(friend.runtime, "kakao")).toBe(2);
    const opened = readStoryConversation(friend.runtime, "kakao", "쩡쩡❤️");
    expect(storyAppUnread(opened, "kakao")).toBe(1);
    expect(opened.messages.kakao.find((item) => item.title === "쩡쩡❤️")?.read).toBe(true);
    expect(opened.messages.kakao.find((item) => item.title === "闺蜜")?.read).toBe(false);
  });
  it("does not deliver blocked messages", () => {
    const result = appendStoryDelivery(initialRuntime(work), { ...scene, blocked: true }, "2026-10-23", "22:00");
    expect(result.runtime.messages.kakao).toBeUndefined();
    expect(result.runtime.notifications).toHaveLength(0);
  });
});
