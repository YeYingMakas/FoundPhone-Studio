import type { Item } from "../schema";

export interface BilingualLine {
  id: string | number;
  ko: string;
  zh: string;
}
export interface SceneDelivery {
  app: "kakao" | "instagram" | "twitter";
  conversationId: string;
  sender: string;
  lines: BilingualLine[];
  delivered: number;
  blocked: boolean;
}
export function bilingualBody(line: BilingualLine): string {
  return line.ko + "\n" + line.zh;
}
export function toPhoneMessage(
  scene: SceneDelivery,
  line: BilingualLine,
  index: number,
  date: string,
  time: string,
): Item {
  return {
    id: "story-" + scene.conversationId + "-" + String(line.id) + "-" + index,
    title: scene.conversationId,
    body: bilingualBody(line),
    richText: "",
    meta: { conversationId: scene.conversationId, source: "unpublished-lover" },
    time: date + " " + time,
    sender: scene.sender,
    avatar: "",
    kind: "text",
    media: "",
    hidden: false,
    unlock: "",
    password: "",
    folder: "",
    favorite: false,
    outgoing: false,
    read: false,
    likes: 0,
    comments: [],
  };
}
export function deliverNext(
  scene: SceneDelivery,
  date: string,
  time: string,
): { next: SceneDelivery; item: Item | null; unreadDelta: number } {
  if (scene.blocked || scene.delivered >= scene.lines.length)
    return { next: scene, item: null, unreadDelta: 0 };
  const index = scene.delivered;
  return {
    next: { ...scene, delivered: index + 1 },
    item: toPhoneMessage(scene, scene.lines[index], index, date, time),
    unreadDelta: 1,
  };
}
export function markConversationRead(items: Item[], conversationId: string): Item[] {
  return items.map(item => item.meta.conversationId === conversationId ? { ...item, read: true } : item);
}
export function countUnread(items: Item[], conversationId?: string): number {
  return items.filter(item => !item.read && !item.outgoing &&
    (!conversationId || item.meta.conversationId === conversationId)).length;
}
export function badgeCount(unread: number): string {
  return unread > 99 ? "99+" : unread > 0 ? String(unread) : "";
}
