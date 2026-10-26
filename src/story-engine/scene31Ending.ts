import type { Runtime } from "../schema";
import scene31 from "../../stories/unpublished-lover/data/scene31.json";

export function advanceScene31(runtime: Runtime): Runtime {
  const finishedAt = runtime.variables.ep01Scene30FinishedAt;
  if (typeof finishedAt !== "number" || runtime.variables.ep01Scene31Unlocked === true ||
      (runtime.elapsedMs ?? 0) < finishedAt + scene31.trigger.delayMs) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01Scene31Unlocked: true, ep01Scene31Visible: true },
    endings: runtime.endings.includes(scene31.endingId) ? runtime.endings : [...runtime.endings, scene31.endingId] };
}

export function dismissScene31(runtime: Runtime): Runtime {
  if (runtime.variables.ep01Scene31Visible !== true) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01Scene31Visible: false } };
}
