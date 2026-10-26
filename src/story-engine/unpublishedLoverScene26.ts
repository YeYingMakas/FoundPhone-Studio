import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
import type { SceneDelivery } from "./unpublishedLoverDelivery";
import scene26 from "../../stories/unpublished-lover/data/scene26.json";

const DELAY_MS = scene26.trigger.delayMs;
const GAP_MS = 2000;
const TOTAL = scene26.messages.length;

export function advanceScene26(runtime: Runtime): Runtime {
  if (runtime.variables.ep01Scene25Finished !== true || runtime.variables.ep01Scene26Finished === true) return runtime;
  const hungUpAt = runtime.variables.ep01Scene25HungUpAt;
  if (typeof hungUpAt !== "number") return runtime;
  const elapsed = runtime.elapsedMs ?? 0;
  const delivered = Number(runtime.variables.ep01Scene26Delivered ?? 0);
  if (delivered >= TOTAL) {
    return { ...runtime, variables: { ...runtime.variables, ep01Scene26Finished: true } };
  }
  if (elapsed < hungUpAt + DELAY_MS + delivered * GAP_MS) return runtime;
  const scene: SceneDelivery = {
    app: "kakao",
    conversationId: "chat-friend",
    sender: "闺蜜",
    lines: scene26.messages,
    delivered,
    blocked: false,
  };
  const result = appendStoryDelivery(runtime, scene, runtime.date ?? "2026-10-23", runtime.time);
  return {
    ...result.runtime,
    variables: {
      ...result.runtime.variables,
      ep01Scene26Delivered: result.scene.delivered,
      ep01Scene26Finished: result.scene.delivered === TOTAL,
    },
  };
}

/** X is unlocked by the player opening it, never by incoming Kakao notifications. */
export function manuallyOpenScene27X(runtime: Runtime): Runtime {
  if (runtime.variables.ep01Scene26Finished !== true || runtime.variables.ep01PublicPostUnlocked === true) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01PublicPostUnlocked: true, ep01Scene27OpenedManually: true } };
}
