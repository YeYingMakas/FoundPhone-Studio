import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
import type { SceneDelivery } from "./unpublishedLoverDelivery";

// Opening messages recovered from the original MyPhone_UNLISTED_LOVE script.
// The sighting-post wording is not available in the approved source, so this
// gate deliberately does not invent a screenshot or substitute post text.
const opening = [
  { id: "opening-jeongwoo-1", ko: "자기야아", zh: "宝宝呀——" },
  { id: "opening-jeongwoo-2", ko: "뭐 해 ㅎㅎ", zh: "在干嘛呢ㅎㅎ" },
  { id: "opening-jeongwoo-3", ko: "나 이제 숙소 왔어", zh: "我刚回宿舍啦" },
  { id: "opening-jeongwoo-4", ko: "오늘 진짜 피곤하다ㅠㅠ", zh: "今天真的好累ㅠㅠ" },
  { id: "opening-jeongwoo-5", ko: "자기 보고 싶어...", zh: "想宝宝了……" },
];

export function showEp01Sighting(runtime: Runtime): Runtime {
  if (runtime.workId !== "unpublished-lover-ep01" || runtime.variables.ep01PlayerSetupDone !== true ||
    runtime.variables.ep01SightingDismissed === true || runtime.variables.ep01SightingShown === true) return runtime;
  return { ...runtime, variables: { ...runtime.variables, ep01SightingShown: true } };
}

export function dismissEp01Sighting(runtime: Runtime): Runtime {
  if (runtime.variables.ep01SightingShown !== true || runtime.variables.ep01SightingDismissed === true) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables, ep01SightingShown: false, ep01SightingDismissed: true,
    ep01OpeningMessagesStartedAt: (runtime.elapsedMs ?? 0) + 2000,
  } };
}

export function advanceEp01Opening(runtime: Runtime): Runtime {
  if (runtime.workId !== "unpublished-lover-ep01" || runtime.variables.ep01SightingDismissed !== true ||
    runtime.variables.ep01OpeningFinished === true) return runtime;
  const delivered = Number(runtime.variables.ep01OpeningDelivered ?? 0);
  if (delivered >= opening.length) return runtime;
  const started = runtime.variables.ep01OpeningMessagesStartedAt;
  if (typeof started !== "number" || (runtime.elapsedMs ?? 0) < started + (delivered + 1) * 800) return runtime;
  const scene: SceneDelivery = {
    app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹",
    lines: opening, delivered, blocked: false,
  };
  const result = appendStoryDelivery(runtime, scene, runtime.date ?? "2026-10-23", runtime.time);
  return { ...result.runtime, variables: {
    ...result.runtime.variables, ep01OpeningDelivered: result.scene.delivered,
    ep01OpeningFinished: result.scene.delivered === opening.length,
  } };
}
