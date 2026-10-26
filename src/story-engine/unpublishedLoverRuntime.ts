import type { Item, Runtime } from "../schema";
import { countUnread, type SceneDelivery, deliverNext } from "./unpublishedLoverDelivery";

export function appendStoryDelivery(
  runtime: Runtime,
  scene: SceneDelivery,
  date: string,
  time: string,
): { runtime: Runtime; scene: SceneDelivery } {
  const result = deliverNext(scene, date, time);
  if (!result.item) return { runtime, scene: result.next };
  const item = { ...result.item, title: scene.conversationId === "chat-jeongwoo" ? "쩡쩡❤️" : scene.conversationId === "chat-friend" ? "闺蜜" : scene.conversationId === "chat-junghwan" ? "苏庭焕" : scene.conversationId === "chat-jaehyuk" ? "尹材赫" : scene.conversationId === "chat-jihoon" ? "朴志焄" : result.item.title };
  return {
    scene: result.next,
    runtime: {
      ...runtime,
      messages: {
        ...runtime.messages,
        [scene.app]: [...(runtime.messages[scene.app] ?? []), item],
      },
      notifications: [
        ...runtime.notifications,
        scene.sender + ": " + result.item.body.split("\n")[0],
      ],
    },
  };
}

export function readStoryMessage(runtime: Runtime, app: string, id: string): Runtime {
  const items = runtime.messages[app];
  if (!items?.some((item) => item.id === id && !item.read)) return runtime;
  return {
    ...runtime,
    messages: {
      ...runtime.messages,
      [app]: items.map((item: Item) => item.id === id ? { ...item, read: true } : item),
    },
  };
}

export function storyAppUnread(runtime: Runtime, app: string): number {
  return countUnread(runtime.messages[app] ?? []);
}

export function readStoryConversation(runtime: Runtime, app: string, title: string): Runtime {
  const items = runtime.messages[app];
  if (!items?.some((item) => item.title === title && !item.read && !item.outgoing)) return runtime;
  return {
    ...runtime,
    messages: {
      ...runtime.messages,
      [app]: items.map((item: Item) =>
        item.title === title && !item.outgoing ? { ...item, read: true } : item,
      ),
    },
  };
}
