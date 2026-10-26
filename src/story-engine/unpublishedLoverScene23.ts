import type { Runtime } from "../schema";
import scene23 from "../../stories/unpublished-lover/data/scene23.json";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
import type { SceneDelivery } from "./unpublishedLoverDelivery";

type Branch = keyof typeof scene23.branches;
const branchIds: Branch[] = ["A", "B", "C"];
const intervalMs = scene23.typingBeforeEachReplyMs;

export function scene23Choices(runtime: Runtime): { label: string; target: string }[] {
  if (runtime.variables.ep01Scene23Ready !== true || runtime.variables.ep01Scene23Branch) return [];
  return branchIds.map((branch) => ({
    label: scene23.branches[branch].player.ko + "\n" + scene23.branches[branch].player.zh,
    target: "ep01-scene23-" + branch,
  }));
}

export function sendScene23Choice(runtime: Runtime, target: string): Runtime {
  const branch = target.slice("ep01-scene23-".length) as Branch;
  if (!scene23Choices(runtime).some((choice) => choice.target === target)) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01Scene23Branch: branch, ep01Scene23StartedAt: runtime.elapsedMs ?? 0, ep01Scene23Delivered: 0 } };
}

export function advanceScene23(runtime: Runtime): Runtime {
  const branch = runtime.variables.ep01Scene23Branch;
  if (typeof branch !== "string" || !branchIds.includes(branch as Branch)) return runtime;
  const replies = scene23.branches[branch as Branch].replies;
  const delivered = Number(runtime.variables.ep01Scene23Delivered ?? 0);
  const started = Number(runtime.variables.ep01Scene23StartedAt ?? 0);
  const elapsed = runtime.elapsedMs ?? 0;
  if (delivered >= replies.length) {
    if (runtime.variables.ep01Scene23Finished !== true) {
      return { ...runtime, variables: { ...runtime.variables, ep01Scene23Finished: true, ep01Scene23FinishedAt: elapsed } };
    }
    if (runtime.variables.ep01Scene24Ready !== true && elapsed >= Number(runtime.variables.ep01Scene23FinishedAt ?? elapsed) + 5000) {
      return { ...runtime, variables: { ...runtime.variables, ep01Scene24Ready: true } };
    }
    return runtime;
  }
  if (elapsed < started + (delivered + 1) * intervalMs) return runtime;
  const scene: SceneDelivery = { app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹", lines: replies, delivered, blocked: false };
  const next = appendStoryDelivery(runtime, scene, runtime.date ?? "2026-10-23", runtime.time);
  return { ...next.runtime, variables: { ...next.runtime.variables, ep01Scene23Delivered: next.scene.delivered } };
}
