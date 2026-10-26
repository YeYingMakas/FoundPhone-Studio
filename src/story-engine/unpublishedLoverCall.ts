export type Scene25Route = "A" | "B" | "C";
export type Scene25Choice = 1 | 2 | 3;
export interface CallState {
  route: Scene25Route;
  rejectedCalls: number;
  answered: boolean;
  choice: Scene25Choice | null;
  finalLineSpoken: boolean;
  ended: boolean;
  kakaoBlocked: boolean;
}
export type CallTransition =
  | { type: "ring" }
  | { type: "show-rejection-line"; index: 0 | 1 | 2; visible: boolean }
  | { type: "show-answer-dialogue"; route: Scene25Route }
  | { type: "show-choice-dialogue"; route: Scene25Route; choice: Scene25Choice }
  | { type: "hang-up-after"; delayMs: 2000 }
  | { type: "start-scene26-after"; delayMs: 2000 };

export const createCallState = (route: Scene25Route): CallState => ({
  route,
  rejectedCalls: 0,
  answered: false,
  choice: null,
  finalLineSpoken: false,
  ended: false,
  kakaoBlocked: route === "A",
});

export function rejectCall(state: CallState): [CallState, CallTransition[]] {
  if (state.answered || state.ended) return [state, []];
  const rejectedCalls = state.rejectedCalls + 1;
  const effects: CallTransition[] = [];
  if (rejectedCalls <= 3) {
    effects.push({
      type: "show-rejection-line",
      index: (rejectedCalls - 1) as 0 | 1 | 2,
      visible: !state.kakaoBlocked,
    });
  }
  effects.push({ type: "ring" });
  return [{ ...state, rejectedCalls }, effects];
}

export function answerCall(state: CallState): [CallState, CallTransition[]] {
  if (state.answered || state.ended) return [state, []];
  return [{ ...state, answered: true }, [{ type: "show-answer-dialogue", route: state.route }]];
}

export function chooseCallReply(state: CallState, choice: Scene25Choice): [CallState, CallTransition[]] {
  if (!state.answered || state.choice !== null || state.ended) return [state, []];
  return [{ ...state, choice }, [{ type: "show-choice-dialogue", route: state.route, choice }]];
}

export function speakFinalLine(state: CallState): [CallState, CallTransition[]] {
  if (!state.answered || state.choice === null || state.finalLineSpoken || state.ended) return [state, []];
  return [{ ...state, finalLineSpoken: true }, [{ type: "hang-up-after", delayMs: 2000 }]];
}

export function completeHangUp(state: CallState): [CallState, CallTransition[]] {
  if (!state.finalLineSpoken || state.ended) return [state, []];
  return [{ ...state, ended: true }, [{ type: "start-scene26-after", delayMs: 2000 }]];
}
