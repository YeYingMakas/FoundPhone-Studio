import type { Runtime } from "../schema";
import scene30 from "../../stories/unpublished-lover/data/scene30.json";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
import type { SceneDelivery } from "./unpublishedLoverDelivery";

export function scene30Choices(runtime: Runtime) {
  if (runtime.variables.ep01Scene30OpeningFinished !== true || runtime.variables.ep01Scene30Branch || runtime.variables.ep01KakaoBlocked === true) return [];
  return (["A", "B", "C"] as const).map((id) => ({
    label: scene30.branches[id].player.ko + "\n" + scene30.branches[id].player.zh,
    target: "ep01-scene30-" + id,
  }));
}

export function sendScene30Choice(runtime: Runtime, target: string): Runtime {
  if (!scene30Choices(runtime).some((choice) => choice.target === target)) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01Scene30Branch: target.slice(-1), ep01Scene30BranchStartedAt: runtime.elapsedMs ?? 0, ep01Scene30ReplyDelivered: 0 } };
}

export function advanceScene30Replies(runtime: Runtime): Runtime {
  const branch = runtime.variables.ep01Scene30Branch;
  if (branch !== "A" && branch !== "B" && branch !== "C") return runtime;
  if (runtime.variables.ep01Scene30Finished === true || runtime.variables.ep01KakaoBlocked === true) return runtime;
  const lines = scene30.branches[branch].replies;
  const delivered = Number(runtime.variables.ep01Scene30ReplyDelivered ?? 0);
  if (delivered >= lines.length) return runtime;
  const started = Number(runtime.variables.ep01Scene30BranchStartedAt ?? 0);
  if ((runtime.elapsedMs ?? 0) < started + (delivered + 1) * 2000) return runtime;
  const scene: SceneDelivery = { app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹", lines, delivered, blocked: false };
  const result = appendStoryDelivery(runtime, scene, runtime.date ?? "2026-10-23", runtime.time);
  const finished = result.scene.delivered === lines.length;
  return { ...result.runtime, variables: { ...result.runtime.variables,
    ep01Scene30ReplyDelivered: result.scene.delivered,
    ep01Scene30Finished: finished,
    ...(finished ? { ep01Scene30FinishedAt: runtime.elapsedMs ?? 0 } : {}),
  } };
}
