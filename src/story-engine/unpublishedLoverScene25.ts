import type { Runtime } from "../schema";
import scene25 from "../../stories/unpublished-lover/data/scene25.json";
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
    variables: { ...runtime.variables, ep01Scene25Answered: true, ep01Scene25Route: runtime.variables.ep01Scene24Branch ?? "B", ep01Scene25AnsweredAt: runtime.elapsedMs ?? 0, ep01Scene25OpeningDelivered: 0 },
  };
}

type Route = keyof typeof scene25.opening;
const routes: Route[] = ["A", "B", "C"];
const now = (runtime: Runtime) => runtime.elapsedMs ?? 0;
const gapMs = 2000;

export function scene25Transcript(runtime: Runtime): { ko: string; zh: string; speaker: "朴炡禹" | "玩家" }[] {
  const route = runtime.variables.ep01Scene25Route as Route;
  if (!routes.includes(route)) return [];
  const openingCount = Number(runtime.variables.ep01Scene25OpeningDelivered ?? 0);
  const transcript: { ko: string; zh: string; speaker: "朴炡禹" | "玩家" }[] = scene25.opening[route].slice(0, openingCount).map((line) => ({ ko: line.ko, zh: line.zh, speaker: "朴炡禹" }));
  const choice = Number(runtime.variables.ep01Scene25Choice ?? 0);
  if (choice >= 1 && choice <= 3) {
    transcript.push({ ...scene25.choices[choice - 1], speaker: "玩家" });
    const count = Number(runtime.variables.ep01Scene25ReplyDelivered ?? 0);
    transcript.push(...scene25.replies[route][choice - 1].slice(0, count).map((line) => ({ ko: line.ko, zh: line.zh, speaker: "朴炡禹" as const })));
  }
  if (runtime.variables.ep01Scene25FinalSpoken === true) transcript.push({ ...scene25.final, speaker: "玩家" });
  return transcript;
}

export function chooseScene25Reply(runtime: Runtime, choice: number): Runtime {
  const route = runtime.variables.ep01Scene25Route as Route;
  if (!routes.includes(route) || runtime.variables.ep01Scene25Answered !== true ||
      Number(runtime.variables.ep01Scene25OpeningDelivered ?? 0) !== scene25.opening[route].length ||
      runtime.variables.ep01Scene25Choice || ![1, 2, 3].includes(choice)) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01Scene25Choice: choice, ep01Scene25ChoiceAt: now(runtime), ep01Scene25ReplyDelivered: 0 } };
}

export function speakScene25Final(runtime: Runtime): Runtime {
  const route = runtime.variables.ep01Scene25Route as Route;
  const choice = Number(runtime.variables.ep01Scene25Choice ?? 0);
  if (!routes.includes(route) || ![1, 2, 3].includes(choice) || runtime.variables.ep01Scene25FinalSpoken === true ||
      Number(runtime.variables.ep01Scene25ReplyDelivered ?? 0) !== scene25.replies[route][choice - 1].length) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01Scene25FinalSpoken: true, ep01Scene25FinalAt: now(runtime) } };
}

export function advanceScene25Dialogue(runtime: Runtime): Runtime {
  const route = runtime.variables.ep01Scene25Route as Route;
  if (!routes.includes(route) || runtime.variables.ep01Scene25Answered !== true || runtime.variables.ep01Scene25Finished === true) return runtime;
  const elapsed = now(runtime);
  const openingCount = Number(runtime.variables.ep01Scene25OpeningDelivered ?? 0);
  if (openingCount < scene25.opening[route].length) {
    if (elapsed < Number(runtime.variables.ep01Scene25AnsweredAt ?? elapsed) + (openingCount + 1) * gapMs) return runtime;
    return { ...runtime, variables: { ...runtime.variables, ep01Scene25OpeningDelivered: openingCount + 1 } };
  }
  const choice = Number(runtime.variables.ep01Scene25Choice ?? 0);
  if (![1, 2, 3].includes(choice)) return runtime;
  const replyCount = Number(runtime.variables.ep01Scene25ReplyDelivered ?? 0);
  if (replyCount < scene25.replies[route][choice - 1].length) {
    if (elapsed < Number(runtime.variables.ep01Scene25ChoiceAt ?? elapsed) + (replyCount + 1) * gapMs) return runtime;
    return { ...runtime, variables: { ...runtime.variables, ep01Scene25ReplyDelivered: replyCount + 1 } };
  }
  if (runtime.variables.ep01Scene25FinalSpoken !== true) return runtime;
  if (elapsed < Number(runtime.variables.ep01Scene25FinalAt ?? elapsed) + scene25.hangupDelayMs) return runtime;
  return { ...runtime, incomingCall: null, variables: { ...runtime.variables, ep01Scene25Finished: true, ep01Scene25HungUpAt: elapsed } };
}
