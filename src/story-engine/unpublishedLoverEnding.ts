export type Ep01Branch = "A" | "B" | "C";
export type Ep01Stage = "waiting-for-dm" | "apology-queued" | "awaiting-reply" | "reply-queued" | "ending-visible" | "exploring";
export interface Ep01EndingState {
  stage: Ep01Stage;
  selectedBranch: Ep01Branch | null;
  firstDmOpened: boolean;
  kakaoBlocked: boolean;
  apologyDelivered: number;
  replyDelivered: number;
  endingUnlocked: boolean;
}
export type Ep01Effect =
  | { type: "schedule-apology"; delayMs: 2000; messageCount: 13 }
  | { type: "show-player-choices"; count: 3 }
  | { type: "schedule-replies"; branch: Ep01Branch; count: number }
  | { type: "show-ending"; branch: Ep01Branch; delayMs: 3000 }
  | { type: "dismiss-ending" };

export const replyCounts: Record<Ep01Branch, number> = { A: 11, B: 11, C: 12 };
export function initialEp01EndingState(kakaoBlocked = false): Ep01EndingState {
  return { stage: "waiting-for-dm", selectedBranch: null, firstDmOpened: false, kakaoBlocked, apologyDelivered: 0, replyDelivered: 0, endingUnlocked: false };
}
export function firstInstagramDmOpened(state: Ep01EndingState): [Ep01EndingState, Ep01Effect[]] {
  if (state.firstDmOpened) return [state, []];
  return [{ ...state, firstDmOpened: true, stage: "apology-queued" }, [{ type: "schedule-apology", delayMs: 2000, messageCount: 13 }]];
}
export function setKakaoBlocked(state: Ep01EndingState, blocked: boolean): Ep01EndingState {
  return { ...state, kakaoBlocked: blocked };
}
export function deliverApologyMessage(state: Ep01EndingState): [Ep01EndingState, Ep01Effect[]] {
  if (state.stage !== "apology-queued" || state.kakaoBlocked || state.apologyDelivered >= 13) return [state, []];
  const apologyDelivered = state.apologyDelivered + 1;
  const finished = apologyDelivered === 13;
  return [{ ...state, apologyDelivered, stage: finished ? "awaiting-reply" : state.stage }, finished ? [{ type: "show-player-choices", count: 3 }] : []];
}
export function sendPlayerReply(state: Ep01EndingState, branch: Ep01Branch): [Ep01EndingState, Ep01Effect[]] {
  if (state.stage !== "awaiting-reply" || state.kakaoBlocked) return [state, []];
  return [{ ...state, selectedBranch: branch, stage: "reply-queued" }, [{ type: "schedule-replies", branch, count: replyCounts[branch] }]];
}
export function deliverReplyMessage(state: Ep01EndingState): [Ep01EndingState, Ep01Effect[]] {
  if (state.stage !== "reply-queued" || state.kakaoBlocked || !state.selectedBranch) return [state, []];
  const replyDelivered = state.replyDelivered + 1;
  const finished = replyDelivered === replyCounts[state.selectedBranch];
  return [{ ...state, replyDelivered, stage: finished ? "ending-visible" : state.stage, endingUnlocked: finished }, finished ? [{ type: "show-ending", branch: state.selectedBranch, delayMs: 3000 }] : []];
}
export function continueExploringPhone(state: Ep01EndingState): [Ep01EndingState, Ep01Effect[]] {
  if (state.stage !== "ending-visible") return [state, []];
  return [{ ...state, stage: "exploring" }, [{ type: "dismiss-ending" }]];
}
