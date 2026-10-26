import type { Runtime } from "../schema";

// Original source stage 4: the player refuses further discussion, then the
// first call begins. Call UI is a separate gate; never silently skip it.
const line = {
  label: "나 지금 오빠 말 듣고 싶지 않아.\n我现在不想听欧巴说话。",
  target: "ep01-first-call-refusal",
};
export function ep01FirstCallChoices(runtime: Runtime) {
  if (runtime.workId !== "unpublished-lover-ep01" ||
    runtime.variables.ep01SecondReplyFinished !== true ||
    runtime.variables.ep01FirstCallRefusalSent === true) return [];
  return [line];
}
export function sendEp01FirstCallRefusal(runtime: Runtime, target: string): Runtime {
  if (!ep01FirstCallChoices(runtime).some((choice) => choice.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables,
    ep01FirstCallRefusalSent: true,
    ep01FirstCallDueAt: (runtime.elapsedMs ?? 0) + 1400,
  } };
}
export function advanceEp01FirstCall(runtime: Runtime): Runtime {
  if (runtime.variables.ep01FirstCallRefusalSent !== true ||
    runtime.variables.ep01FirstCallTriggered === true ||
    (runtime.elapsedMs ?? 0) < Number(runtime.variables.ep01FirstCallDueAt ?? Infinity)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables,
    ep01FirstCallTriggered: true,
    ep01FirstCallRinging: true,
  } };
}
export function answerEp01FirstCall(runtime: Runtime): Runtime {
  if (runtime.variables.ep01FirstCallRinging !== true ||
    runtime.variables.ep01FirstCallAnswered === true) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables,
    ep01FirstCallRinging: false,
    ep01FirstCallAnswered: true,
  } };
}
export function endEp01FirstCall(runtime: Runtime): Runtime {
  if (runtime.variables.ep01FirstCallAnswered !== true ||
    runtime.variables.ep01FirstCallEnded === true) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables,
    ep01FirstCallAnswered: false,
    ep01FirstCallEnded: true,
  } };
}
