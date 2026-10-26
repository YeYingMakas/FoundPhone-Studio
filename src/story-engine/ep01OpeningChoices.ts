import type { Runtime } from "../schema";
import type { SceneDelivery } from "./unpublishedLoverDelivery";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

// Recovered verbatim from the original simulator's stage-2 choices and stage-2 replies.
const choices = [
  { ko: "오빠 지금 어디야?", zh: "欧巴现在在哪里？" },
  { ko: "오빠, 인터넷에 올라온 사진 봤어?", zh: "欧巴看到网上的照片了吗？" },
  { ko: "오빠 나한테 거짓말한 거야?", zh: "欧巴骗我了吗？" },
];
const replies = [
  { id: "opening-choice-reply-1", ko: "자기야... 왜 그래?ㅠㅠ", zh: "亲爱的……怎么了？ㅠㅠ" },
  { id: "opening-choice-reply-2", ko: "나 진짜 너한테 할 말 있어...", zh: "我真的有话要跟你说……" },
];
export function ep01OpeningChoices(runtime: Runtime) {
  if (runtime.variables.ep01OpeningFinished !== true || runtime.variables.ep01OpeningChoiceSent === true) return [];
  return choices.map((line, i) => ({ label: line.ko + "\n" + line.zh, target: "ep01-opening-choice-" + i }));
}
export function sendEp01OpeningChoice(runtime: Runtime, target: string): Runtime {
  if (!ep01OpeningChoices(runtime).some((choice) => choice.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables, ep01OpeningChoiceSent: true,
    ep01OpeningChoiceIndex: Number(target.slice(-1)),
    ep01OpeningReplyStartedAt: runtime.elapsedMs ?? 0,
  } };
}
export function advanceEp01OpeningChoice(runtime: Runtime): Runtime {
  if (runtime.variables.ep01OpeningChoiceSent !== true || runtime.variables.ep01OpeningReplyFinished === true) return runtime;
  const delivered = Number(runtime.variables.ep01OpeningReplyDelivered ?? 0);
  const started = Number(runtime.variables.ep01OpeningReplyStartedAt ?? 0);
  if ((runtime.elapsedMs ?? 0) < started + (delivered + 1) * 950) return runtime;
  const scene: SceneDelivery = {
    app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹",
    lines: replies, delivered, blocked: false,
  };
  const result = appendStoryDelivery(runtime, scene, runtime.date ?? "2026-10-23", runtime.time);
  return { ...result.runtime, variables: {
    ...result.runtime.variables, ep01OpeningReplyDelivered: result.scene.delivered,
    ep01OpeningReplyFinished: result.scene.delivered === replies.length,
  } };
}
