import { makeItem, type Runtime } from "../schema";

export function openPublicPost(runtime: Runtime, id: string): Runtime {
  if (id !== "scene27-public-post" || runtime.variables.ep01PublicPostUnlocked !== true || runtime.variables.ep01PostOpenedAt !== undefined) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01PostOpenedAt: runtime.elapsedMs ?? 0 } };
}

export function advanceInstagramStart(runtime: Runtime): Runtime {
  const started = runtime.variables.ep01PostOpenedAt;
  if (typeof started !== "number" || runtime.variables.ep01InstagramStarted === true || (runtime.elapsedMs ?? 0) < started + 2000) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01InstagramStarted: true, ep01InstagramStartAt: runtime.elapsedMs ?? 0 } };
}

const previews = [
  ["혹시 그분 맞으세요?", "请问是那位吗？"],
  ["정우 여자친구 맞아요?", "你真的是炡禹女朋友吗？"],
  ["기사 보고 왔어요...", "看了新闻过来的……"],
  ["와 진짜 3년이요?", "哇，真的三年了吗？"],
  ["행복하세요ㅠㅠ", "祝你幸福ㅠㅠ"],
  ["이거 실화예요?", "这是真的吗？"],
  ["갑자기 너무 놀랐어요", "突然真的吓了一跳"],
  ["답장해 주실 수 있나요?", "可以回复我吗？"],
  ["그동안 비밀이었구나", "原来一直是秘密啊"],
  ["축하드려요!", "恭喜！"],
] as const;

export function advanceInstagramDMs(runtime: Runtime): Runtime {
  const ready = advanceInstagramStart(runtime);
  const start = ready.variables.ep01InstagramStartAt;
  if (typeof start !== "number") return ready;
  const delivered = Number(ready.variables.ep01InstagramDelivered ?? 0);
  if (delivered >= 60 || (ready.elapsedMs ?? 0) < start + delivered * 600) return ready;
  const [ko, zh] = previews[delivered % previews.length];
  const title = "instagram_user_" + String(delivered + 1).padStart(2, "0");
  const item = makeItem({
    title,
    body: ko + "\n" + zh,
    sender: title,
    time: (ready.date ?? "2026-10-23") + " " + ready.time,
    read: false,
    outgoing: false,
    meta: { source: "ep01-scene29", conversationId: title, draft: "true" },
  });
  return {
    ...ready,
    messages: { ...ready.messages, instagram: [...(ready.messages.instagram ?? []), item] },
    notifications: [...ready.notifications, title + ": " + ko],
    variables: { ...ready.variables, ep01InstagramDelivered: delivered + 1, ep01InstagramFinished: delivered + 1 === 60 },
  };
}
