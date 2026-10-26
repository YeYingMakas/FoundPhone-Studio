import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

const playerLines = [
  ["정환아... 나 이제 정우 오빠를 어떻게 믿어야 할지 모르겠어ㅠㅠ", "庭焕啊……我现在真的不知道该怎么相信炡禹欧巴了ㅠㅠ"],
  ["우리 3년이나 만났잖아...", "我们都交往三年了啊……"],
  ["그동안 남들한테 남자친구 있다고 말도 못 했는데...", "这三年来，我连跟别人说自己有男朋友都不行……"],
  ["친구들 앞에서도 계속 없는 척해야 했고ㅠㅠ", "就连在朋友面前，也得一直装作没有男朋友ㅠㅠ"],
  ["근데 이제 오빠가 다른 여자랑 열애설까지 나니까...", "可现在，欧巴却跟别的女生传出恋爱绯闻……"],
  ["나 진짜 어떻게 해야 할지 모르겠어...", "我真的不知道该怎么办了……"],
] as const;
const replies = [
  ["누나...", "姐姐……"],
  ["그동안 많이 참으셨죠...", "这段时间一直忍耐了很多吧……"],
  ["아무한테도 말 못 하고 혼자 감당하신 거잖아요", "不能告诉任何人，只能自己承受这些啊。"],
  ["그건 진짜 쉽지 않은 일인데...", "那真的不是件容易的事……"],
  ["근데 누나, 제가 한 가지만 말씀드려도 돼요?", "不过姐姐，我能跟你说一句吗？"],
  ["정우 형이 누나를 가볍게 생각하는 건 절대 아니에요", "炡禹哥绝对没有不重视姐姐。"],
  ["그건 제가 옆에서 봐서 알아요", "这一点，我一直在旁边看着，所以知道。"],
  ["물론 거짓말한 건 형이 잘못한 거 맞고요", "当然，哥撒谎这件事确实是他做错了。"],
  ["그러니까 누나도 지금 당장 괜찮아질 필요 없어요", "所以姐姐也不用现在立刻原谅他。"],
  ["형이 직접 제대로 설명할 때까지 기다려 봐요", "等哥亲自好好解释吧。"],
  ["저는 누나 편이에요ㅎㅎ", "我是站在姐姐这边的ㅎㅎ"],
] as const;
export function scene21OpeningChoices(runtime: Runtime) {
  if (runtime.workId !== "unpublished-lover-ep01" ||
      runtime.variables.ep01Scene20Finished !== true ||
      runtime.variables.ep01Scene21OpeningFinished === true) return [];
  const index = Number(runtime.variables.ep01Scene21OpeningSent ?? 0);
  if (index >= playerLines.length) return [];
  const [ko, zh] = playerLines[index];
  return [{ target: "ep01-scene21-opening-" + (index + 1), label: ko + "\n" + zh }];
}
export function sendScene21Opening(runtime: Runtime, target: string): Runtime {
  if (!scene21OpeningChoices(runtime).some(x => x.target === target)) return runtime;
  const index = Number(runtime.variables.ep01Scene21OpeningSent ?? 0) + 1;
  return { ...runtime, variables: {
    ...runtime.variables, ep01Scene21OpeningSent: index,
    ...(index === playerLines.length ? { ep01Scene21ReplyStartedAt: runtime.elapsedMs ?? 0 } : {}),
  } };
}
export function advanceScene21OpeningReplies(runtime: Runtime): Runtime {
  if (runtime.variables.ep01Scene21OpeningSent !== playerLines.length ||
      runtime.variables.ep01Scene21OpeningFinished === true) return runtime;
  const index = Number(runtime.variables.ep01Scene21OpeningRepliesDelivered ?? 0);
  const started = runtime.variables.ep01Scene21ReplyStartedAt;
  if (typeof started !== "number" || (runtime.elapsedMs ?? 0) < started + (index + 1) * 2000) return runtime;
  const [ko, zh] = replies[index];
  const delivered = appendStoryDelivery(runtime, {
    app: "kakao", conversationId: "chat-junghwan", sender: "苏庭焕",
    lines: [{ id: "scene21-opening-reply-" + (index + 1), ko, zh }],
    delivered: 0, blocked: false,
  }, runtime.date ?? "2026-10-23", runtime.time).runtime;
  return { ...delivered, variables: {
    ...delivered.variables,
    ep01Scene21OpeningRepliesDelivered: index + 1,
    ep01Scene21OpeningFinished: index + 1 === replies.length,
    ep01Scene21Ready: index + 1 === replies.length,
  } };
}
