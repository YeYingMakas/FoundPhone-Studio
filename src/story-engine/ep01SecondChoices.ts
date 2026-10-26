import type { Runtime } from "../schema";
import type { SceneDelivery } from "./unpublishedLoverDelivery";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

// Original simulator stage-3 player lines and stage-3 Jeongwoo messages.
const options = [
  { ko: "왜 숙소라고 했어?", zh: "为什么说自己在宿舍？" },
  { ko: "한서윤 선배랑 무슨 사이야?", zh: "你和韩瑞允前辈是什么关系？" },
  { ko: "나한테 할 말 없어?", zh: "你就没有什么话要说吗？" },
];
const replies = [
  { id: "opening-second-reply-1", ko: "...자기야ㅠㅠ", zh: "……亲爱的ㅠㅠ" },
  { id: "opening-second-reply-2", ko: "그 사진... 나도 방금 봤어", zh: "那张照片……我也刚刚看到了。" },
  { id: "opening-second-reply-3", ko: "나 진짜 바람피운 거 아니야ㅠㅠ", zh: "我真的没有出轨ㅠㅠ" },
];
export function ep01SecondChoices(runtime: Runtime) {
  if (runtime.variables.ep01OpeningReplyFinished !== true || runtime.variables.ep01SecondChoiceSent === true) return [];
  return options.map((line, i) => ({ label: line.ko + "\n" + line.zh, target: "ep01-second-choice-" + i }));
}
export function sendEp01SecondChoice(runtime: Runtime, target: string): Runtime {
  if (!ep01SecondChoices(runtime).some((choice) => choice.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables,
    ep01SecondChoiceSent: true,
    ep01SecondChoiceIndex: Number(target.slice(-1)),
    ep01SecondReplyStartedAt: runtime.elapsedMs ?? 0,
  } };
}
export function advanceEp01SecondChoice(runtime: Runtime): Runtime {
  if (runtime.variables.ep01SecondChoiceSent !== true || runtime.variables.ep01SecondReplyFinished === true) return runtime;
  const delivered = Number(runtime.variables.ep01SecondReplyDelivered ?? 0);
  const started = Number(runtime.variables.ep01SecondReplyStartedAt ?? 0);
  if ((runtime.elapsedMs ?? 0) < started + (delivered + 1) * 900) return runtime;
  const scene: SceneDelivery = {
    app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹",
    lines: replies, delivered, blocked: false,
  };
  const result = appendStoryDelivery(runtime, scene, runtime.date ?? "2026-10-23", runtime.time);
  return { ...result.runtime, variables: {
    ...result.runtime.variables,
    ep01SecondReplyDelivered: result.scene.delivered,
    ep01SecondReplyFinished: result.scene.delivered === replies.length,
  } };
}
