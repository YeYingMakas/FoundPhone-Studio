import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

const contacts = [
  { id: "jaehyuk", title: "尹材赫", year: 2001, offset: 0, lines: [
    ["{name} 괜찮아?", "{name}，还好吗？"],
    ["정우랑 무슨 일 있었다고 들었어...", "听说你和炡禹之间出了点事……"],
    ["무슨 일인지 굳이 말 안 해도 돼", "不想说发生什么也没关系"],
    ["그냥 걱정돼서 연락했어", "只是担心你才联系的"],
  ] },
  { id: "jihoon", title: "朴志焄", year: 2000, offset: 5000, lines: [
    ["{name}", "{name}"],
    ["정우랑 싸웠다며", "听说你和炡禹吵架了"],
    ["걔가 또 뭔 짓 했냐", "那家伙又干什么了"],
    ["너 괜찮은 거 맞아?", "你真的还好吗？"],
  ] },
  { id: "junghwan", title: "苏庭焕", year: 2005, offset: 10000, lines: [
    ["{name}...", "{name}……"],
    ["정우 형이랑 무슨 일 있으셨어요?", "你和炡禹哥之间发生什么事了吗？"],
    ["괜히 연락드리는 건가 싶었는데...", "我还在想这样突然联系你会不会不太好……"],
    ["그래도 걱정돼서요ㅠㅠ", "但还是有点担心你ㅠㅠ"],
  ] },
] as const;

export function advanceEp01Scene17(runtime: Runtime): Runtime {
  if (runtime.workId !== "unpublished-lover-ep01" ||
      runtime.variables.ep01FirstCallEnded !== true ||
      runtime.variables.ep01Scene15ReplySent !== true) return runtime;
  const hangup = runtime.variables.ep01Scene16StartedAt;
  if (typeof hangup !== "number") return runtime;
  const now = runtime.elapsedMs ?? 0;
  for (const contact of contacts) {
    const key = "ep01Scene17_" + contact.id;
    const index = Number(runtime.variables[key] ?? 0);
    if (index >= contact.lines.length) continue;
    if (now < hangup + contact.offset + index * 2000) continue;
    const name = String(runtime.variables.ep01PlayerName ?? "").trim();
    const year = Number(runtime.variables.ep01BirthYear ?? 0);
    const displayName = name + (year <= contact.year ? " 누나" : "");
    const [rawKo, rawZh] = contact.lines[index];
    const result = appendStoryDelivery(runtime, {
      app: "kakao", conversationId: "chat-" + contact.id, sender: contact.title,
      lines: [{
        id: "scene17-" + contact.id + "-" + (index + 1),
        ko: rawKo.replace("{name}", displayName),
        zh: rawZh.replace("{name}", displayName),
      }],
      delivered: 0, blocked: false,
    }, runtime.date ?? "2026-10-23", runtime.time);
    const vars = { ...result.runtime.variables, [key]: index + 1 };
    vars.ep01Scene17Finished = contacts.every((c) =>
      Number(c.id === contact.id ? index + 1 : vars["ep01Scene17_" + c.id] ?? 0) >= c.lines.length);
    return { ...result.runtime, variables: vars };
  }
  return runtime;
}
