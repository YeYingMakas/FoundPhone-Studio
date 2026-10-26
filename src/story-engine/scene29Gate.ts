import type { Runtime } from "../schema";

export function openPublicPost(runtime: Runtime, id: string): Runtime {
  if (id !== "scene27-public-post" || runtime.variables.ep01PublicPostUnlocked !== true || runtime.variables.ep01PostOpenedAt !== undefined) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01PostOpenedAt: runtime.elapsedMs ?? 0 } };
}

export function advanceInstagramStart(runtime: Runtime): Runtime {
  const started = runtime.variables.ep01PostOpenedAt;
  if (typeof started !== "number" || runtime.variables.ep01InstagramStarted === true || (runtime.elapsedMs ?? 0) < started + 2000) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01InstagramStarted: true, ep01InstagramStartAt: runtime.elapsedMs ?? 0 } };
}
