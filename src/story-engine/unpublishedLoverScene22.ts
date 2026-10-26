import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
import type { SceneDelivery } from "./unpublishedLoverDelivery";
import scene22 from "../../stories/unpublished-lover/data/scene22.json";

const START_DELAY_MS = scene22.trigger.delayMs;
const INTER_MESSAGE_MS = scene22.typingBeforeEachMs;
const TOTAL = scene22.messages.length;

export function advanceScene22(runtime: Runtime): Runtime {
  if (runtime.variables.ep01Scene22Finished || runtime.variables.ep01Scene21SecondSent !== true) return runtime;
  const started = runtime.variables.ep01Scene22StartedAt;
  if (typeof started !== "number") {
    return {
      ...runtime,
      variables: { ...runtime.variables, ep01Scene22StartedAt: runtime.elapsedMs },
    };
  }
  const delivered = typeof runtime.variables.ep01Scene22Delivered === "number"
    ? runtime.variables.ep01Scene22Delivered
    : 0;
  if (delivered >= TOTAL) {
    return { ...runtime, variables: { ...runtime.variables, ep01Scene22Finished: true } };
  }
  const dueAt = started + START_DELAY_MS + delivered * INTER_MESSAGE_MS;
  if (runtime.elapsedMs < dueAt) return runtime;
  const scene: SceneDelivery = {
    app: "kakao",
    conversationId: "chat-junghwan",
    sender: "苏庭焕",
    lines: scene22.messages,
    delivered,
    blocked: false,
  };
  const next = appendStoryDelivery(runtime, scene, runtime.date || "2026-10-23", runtime.time);
  return {
    ...next.runtime,
    variables: {
      ...next.runtime.variables,
      ep01Scene22Delivered: next.scene.delivered,
      ep01Scene22Finished: next.scene.delivered === TOTAL,
    },
  };
}

export function scene22AllRead(runtime: Runtime): boolean {
  const items = (runtime.messages.kakao ?? []).filter((item) => item.meta.conversationId === "chat-junghwan");
  return runtime.variables.ep01Scene22Finished === true && items.length === TOTAL && items.every((item) => item.read);
}
