import type { Runtime } from "../schema";
import scene30 from "../../stories/unpublished-lover/data/scene30.json";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
import type { SceneDelivery } from "./unpublishedLoverDelivery";

export function advanceScene30Opening(runtime: Runtime): Runtime {
  const openedAt = runtime.variables.ep01FirstInstagramThreadOpenedAt;
  if (typeof openedAt !== "number" || runtime.variables.ep01Scene30Finished === true) return runtime;
  const delivered = Number(runtime.variables.ep01Scene30OpeningDelivered ?? 0);
  if (delivered >= scene30.opening.length) return runtime;
  const due = runtime.variables.ep01Scene30NextDueAt;
  const nextDue = typeof due === "number" ? due : openedAt + 2000 + delivered * 2000;
  if ((runtime.elapsedMs ?? 0) < nextDue) return runtime;
  if (runtime.variables.ep01KakaoBlocked === true) {
    return { ...runtime, variables: { ...runtime.variables, ep01Scene30WaitingForUnblock: true, ep01Scene30NextDueAt: runtime.elapsedMs ?? 0 } };
  }
  const scene: SceneDelivery = {
    app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹",
    lines: scene30.opening, delivered, blocked: false,
  };
  const result = appendStoryDelivery(runtime, scene, runtime.date ?? "2026-10-23", runtime.time);
  return { ...result.runtime, variables: {
    ...result.runtime.variables,
    ep01Scene30OpeningDelivered: result.scene.delivered,
    ep01Scene30NextDueAt: (runtime.elapsedMs ?? 0) + 2000,
    ep01Scene30WaitingForUnblock: false,
    ep01Scene30OpeningFinished: result.scene.delivered === scene30.opening.length,
  } };
}
