import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
import type { SceneDelivery } from "./unpublishedLoverDelivery";

const rejectionLines = [
  { id: "scene25-reject-1", ko: "자기야 전화 한 번만 받아 줘ㅠㅠ", zh: "宝宝，接我一次电话好不好ㅠㅠ" },
  { id: "scene25-reject-2", ko: "제발... 목소리라도 듣게 해 줘...", zh: "求你了……至少让我听听你的声音……" },
  { id: "scene25-reject-3", ko: "나 진짜 무서워... 제발 나랑 얘기 좀 해 줘ㅠㅠ", zh: "我真的很害怕……求你跟我说句话吧ㅠㅠ" },
];

export function advanceScene25Incoming(runtime: Runtime): Runtime {
  if (runtime.variables.ep01Scene25Ready !== true || runtime.variables.ep01Scene25Answered === true || runtime.variables.ep01Scene25Finished === true || runtime.incomingCall) return runtime;
  return {
    ...runtime,
    incomingCall: { caller: "朴炡禹", target: "ep01-scene25", status: "ringing" },
    variables: { ...runtime.variables, ep01Scene25Ringing: true },
  };
}

export function rejectScene25Incoming(runtime: Runtime): Runtime {
  if (runtime.incomingCall?.target !== "ep01-scene25" || runtime.incomingCall.status !== "ringing") return runtime;
  const rejected = Number(runtime.variables.ep01Scene25Rejected ?? 0) + 1;
  const withoutCall: Runtime = { ...runtime, incomingCall: null, variables: { ...runtime.variables, ep01Scene25Rejected: rejected, ep01Scene25Ringing: false } };
  if (rejected > rejectionLines.length || runtime.variables.ep01KakaoBlocked === true) return advanceScene25Incoming(withoutCall);
  const scene: SceneDelivery = { app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹", lines: rejectionLines, delivered: rejected - 1, blocked: false };
  return advanceScene25Incoming(appendStoryDelivery(withoutCall, scene, runtime.date ?? "2026-10-23", runtime.time).runtime);
}

export function answerScene25Incoming(runtime: Runtime): Runtime {
  if (runtime.incomingCall?.target !== "ep01-scene25" || runtime.incomingCall.status !== "ringing") return runtime;
  return {
    ...runtime,
    incomingCall: { ...runtime.incomingCall, status: "answered" },
    variables: { ...runtime.variables, ep01Scene25Answered: true, ep01Scene25Route: runtime.variables.ep01Scene24Branch ?? "B" },
  };
}
