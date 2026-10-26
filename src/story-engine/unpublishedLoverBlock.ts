export type Scene24Branch = "A" | "B" | "C";
export interface Scene24State {
  stage: "opening" | "awaiting-choice" | "awaiting-manual-block" | "replying" | "complete";
  branch: Scene24Branch | null;
  openingDelivered: number;
  replyDelivered: number;
  kakaoBlocked: boolean;
}
export type Scene24Effect =
  | { type: "show-choices" }
  | { type: "wait-for-manual-block" }
  | { type: "deliver-failed-attempt"; index: number; playerVisible: false; unreadDelta: 0 }
  | { type: "deliver-reply"; branch: "B" | "C"; index: number }
  | { type: "schedule-scene25"; delayMs: 5000 };

export const createScene24 = (): Scene24State => ({
  stage: "opening", branch: null, openingDelivered: 0, replyDelivered: 0, kakaoBlocked: false,
});
export function openingDelivered(state: Scene24State): [Scene24State, Scene24Effect[]] {
  if (state.stage !== "opening") return [state, []];
  const count = state.openingDelivered + 1;
  if (count > 7) return [state, []];
  return [{ ...state, openingDelivered: count, stage: count === 7 ? "awaiting-choice" : "opening" }, count === 7 ? [{ type: "show-choices" }] : []];
}
export function sendScene24Choice(state: Scene24State, branch: Scene24Branch): [Scene24State, Scene24Effect[]] {
  if (state.stage !== "awaiting-choice") return [state, []];
  if (branch === "A") return [{ ...state, branch, stage: "awaiting-manual-block" }, [{ type: "wait-for-manual-block" }]];
  return [{ ...state, branch, stage: "replying" }, []];
}
export function manuallyBlockKakao(state: Scene24State): Scene24State {
  return { ...state, kakaoBlocked: true, stage: state.stage === "awaiting-manual-block" ? "replying" : state.stage };
}
export function manuallyUnblockKakao(state: Scene24State): Scene24State {
  return { ...state, kakaoBlocked: false };
}
export function deliverScene24Reply(state: Scene24State): [Scene24State, Scene24Effect[]] {
  if (state.stage !== "replying" || !state.branch) return [state, []];
  const count = state.branch === "A" ? 6 : 10;
  if (state.replyDelivered >= count) return [state, []];
  const index = state.replyDelivered;
  const reply: Scene24Effect = state.branch === "A"
    ? { type: "deliver-failed-attempt", index, playerVisible: false, unreadDelta: 0 }
    : { type: "deliver-reply", branch: state.branch, index };
  const finished = index + 1 === count;
  return [{ ...state, replyDelivered: index + 1, stage: finished ? "complete" : "replying" },
    finished ? [reply, { type: "schedule-scene25", delayMs: 5000 }] : [reply]];
}
