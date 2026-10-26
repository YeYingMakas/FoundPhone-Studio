import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
import type { SceneDelivery } from "./unpublishedLoverDelivery";
import scene24 from "../../stories/unpublished-lover/data/scene24.json";

type Branch = keyof typeof scene24.branches;
const branches: Branch[] = ["A", "B", "C"];
const gap = scene24.typingBeforeEachMs;
const now = (runtime: Runtime) => runtime.elapsedMs ?? 0;

export function scene24Choices(runtime: Runtime): { label: string; target: string }[] {
  if (runtime.variables.ep01Scene24OpeningDone !== true || runtime.variables.ep01Scene24Branch) return [];
  return branches.map((branch) => ({
    label: scene24.branches[branch].player.ko + "\n" + scene24.branches[branch].player.zh,
    target: "ep01-scene24-" + branch,
  }));
}

export function sendScene24Choice(runtime: Runtime, target: string): Runtime {
  const branch = target.slice("ep01-scene24-".length) as Branch;
  if (!scene24Choices(runtime).some((choice) => choice.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables, ep01Scene24Branch: branch, ep01Scene24ChoiceAt: now(runtime), ep01Scene24ReplyDelivered: 0,
  } };
}

export function blockScene24Kakao(runtime: Runtime): Runtime {
  if (runtime.variables.ep01Scene24Branch !== "A" || runtime.variables.ep01KakaoBlocked === true) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01KakaoBlocked: true, ep01Scene24WasBlocked: true, ep01Scene24ChoiceAt: now(runtime) } };
}

export function unblockScene24Kakao(runtime: Runtime): Runtime {
  if (runtime.variables.ep01KakaoBlocked !== true) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01KakaoBlocked: false } };
}

export function advanceScene24(runtime: Runtime): Runtime {
  if (runtime.variables.ep01Scene24Ready !== true) return runtime;
  const elapsed = now(runtime);
  const openingCount = Number(runtime.variables.ep01Scene24OpeningDelivered ?? 0);
  if (openingCount < scene24.opening.length) {
    const started = runtime.variables.ep01Scene24OpeningAt;
    if (typeof started !== "number") return { ...runtime, variables: { ...runtime.variables, ep01Scene24OpeningAt: elapsed } };
    if (elapsed < started + (openingCount + 1) * gap) return runtime;
    const scene: SceneDelivery = { app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹", lines: scene24.opening, delivered: openingCount, blocked: false };
    const result = appendStoryDelivery(runtime, scene, runtime.date ?? "2026-10-23", runtime.time);
    return { ...result.runtime, variables: { ...result.runtime.variables,
      ep01Scene24OpeningDelivered: result.scene.delivered,
      ep01Scene24OpeningDone: result.scene.delivered === scene24.opening.length,
    } };
  }
  const branch = runtime.variables.ep01Scene24Branch;
  if (typeof branch !== "string" || !branches.includes(branch as Branch)) return runtime;
  if (branch === "A" && runtime.variables.ep01Scene24WasBlocked !== true) return runtime;
  const replies = scene24.branches[branch as Branch].replies;
  const delivered = Number(runtime.variables.ep01Scene24ReplyDelivered ?? 0);
  const started = Number(runtime.variables.ep01Scene24ChoiceAt ?? elapsed);
  if (delivered >= replies.length) {
    if (runtime.variables.ep01Scene24Finished !== true) {
      return { ...runtime, variables: { ...runtime.variables, ep01Scene24Finished: true, ep01Scene24FinishedAt: elapsed } };
    }
    if (runtime.variables.ep01Scene25Ready !== true && elapsed >= Number(runtime.variables.ep01Scene24FinishedAt ?? elapsed) + scene24.callDelayMs) {
      return { ...runtime, variables: { ...runtime.variables, ep01Scene25Ready: true } };
    }
    return runtime;
  }
  if (elapsed < started + (delivered + 1) * gap) return runtime;
  if (branch === "A") {
    return { ...runtime, variables: { ...runtime.variables, ep01Scene24ReplyDelivered: delivered + 1 } };
  }
  const scene: SceneDelivery = { app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹", lines: replies, delivered, blocked: false };
  const result = appendStoryDelivery(runtime, scene, runtime.date ?? "2026-10-23", runtime.time);
  return { ...result.runtime, variables: { ...result.runtime.variables, ep01Scene24ReplyDelivered: result.scene.delivered } };
}
