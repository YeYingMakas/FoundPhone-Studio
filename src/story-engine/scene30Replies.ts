import type { Runtime } from "../schema";
import scene30 from "../../stories/unpublished-lover/data/scene30.json";

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
