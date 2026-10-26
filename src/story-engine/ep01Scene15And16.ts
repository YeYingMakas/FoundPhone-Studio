import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

export const scene15Reply = {
  ko: "지금은 오빠 말 듣고 싶지 않아.",
  zh: "我现在不想听欧巴说话。",
};
const scene16Lines = [
  ["자기야...", "宝宝呀……"],
  ["화난 거 알아ㅠㅠ", "我知道你生气了ㅠㅠ"],
  ["근데 나 좀 봐주면 안 돼...?ㅠㅠ", "但是不能稍微理理我吗……？ㅠㅠ"],
  ["자기야 나 진짜 미안해", "宝宝，我真的对不起"],
  ["제발 나한테 화 풀어 줘ㅠㅠ", "求你消消气吧ㅠㅠ"],
  ["나 일부러 자기 속상하게 하려고 그런 거 아니야...", "我真的不是故意让你难过的……"],
  ["자기야 왜 아무 말도 없어ㅠㅠ", "宝宝为什么一句话都不说ㅠㅠ"],
  ["나 지금 너무 불안해...", "我现在真的很不安……"],
  ["나한테 화내도 되니까 제발 답장만 해 줘", "你骂我也可以，求你回我一句"],
  ["자기야아ㅠㅠㅠ", "宝宝呀ㅠㅠㅠ"],
  ["나 진짜 어떡해야 할지 모르겠어", "我真的不知道该怎么办了"],
  ["제발 나 무시하지 마...", "求你不要不理我……"],
  ["자기야 나 버리는 거 아니지...?ㅠㅠ", "宝宝，你不会不要我吧……？ㅠㅠ"],
  ["나 진짜 무서워...", "我真的很害怕……"],
  ["우리 이렇게 끝나는 거 아니지? 제발...", "我们不会就这样结束吧？求你了……"],
] as const;
export const scene16Count = scene16Lines.length;

export function chooseScene15Reply(runtime: Runtime): Runtime {
  if (runtime.workId !== "unpublished-lover-ep01" ||
      runtime.variables.ep01Scene14Answered !== true ||
      runtime.variables.ep01Scene14RepliesFinished !== true ||
      runtime.variables.ep01Scene15ReplySent === true) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables,
    ep01Scene15ReplySent: true,
    ep01Scene15HangupDueAt: (runtime.elapsedMs ?? 0) + 2000,
  } };
}

export function advanceScene15And16(runtime: Runtime): Runtime {
  if (runtime.workId !== "unpublished-lover-ep01") return runtime;
  const now = runtime.elapsedMs ?? 0;
  if (runtime.variables.ep01Scene15ReplySent !== true) return runtime;
  if (runtime.variables.ep01Scene14Ended !== true) {
    const due = runtime.variables.ep01Scene15HangupDueAt;
    if (typeof due !== "number" || now < due) return runtime;
    return { ...runtime, variables: {
      ...runtime.variables,
      ep01Scene14Answered: false,
      ep01Scene14Ringing: false,
      ep01Scene14Ended: true,
      ep01Scene16StartedAt: now + 3000,
    } };
  }
  const started = runtime.variables.ep01Scene16StartedAt;
  if (typeof started !== "number" || now < started) return runtime;
  const index = Number(runtime.variables.ep01Scene16MessageIndex ?? 0);
  if (index >= scene16Lines.length) return runtime;
  // One message per tick, spaced apart so each can create its own notification.
  const due = started + index * 2000;
  if (now < due) return runtime;
  const [ko, zh] = scene16Lines[index];
  const result = appendStoryDelivery(runtime, {
    app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹",
    lines: [{ id: "scene16-" + (index + 1), ko, zh }],
    delivered: 0, blocked: false,
  }, runtime.date ?? "2026-10-23", runtime.time);
  return { ...result.runtime, variables: {
    ...result.runtime.variables,
    ep01Scene16MessageIndex: index + 1,
    ep01Scene16Finished: index + 1 === scene16Lines.length,
  } };
}
