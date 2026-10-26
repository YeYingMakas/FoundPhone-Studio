import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

// The first call occurs immediately after the initial Kakao exchange.
// It is NOT the later, separate scene-14 call.
export const ep01EarlyCallOpening = [
  { ko: "자기야... 여보세요?ㅠㅠ", zh: "宝宝……喂？ㅠㅠ" },
  { ko: "사진 봤지...? 나 진짜 설명하고 싶어", zh: "看到照片了吧……？我真的想解释" },
  { ko: "나 진짜 바람피운 거 아니야...", zh: "我真的没有出轨……" },
  { ko: "숙소에 있다고 거짓말한 건 미안해", zh: "骗你说我在宿舍，对不起" },
  { ko: "자기야 내 말 좀 들어 줄래?ㅠㅠ", zh: "宝宝，能听我说说吗？ㅠㅠ" },
] as const;
const answers = [
  { id: "A", ko: "왜 나한테 거짓말했어?", zh: "为什么骗我？" },
  { id: "B", ko: "그 선배님이랑 무슨 사이야?", zh: "你和那位前辈是什么关系？" },
  { id: "C", ko: "나 지금 오빠 말 듣고 싶지 않아.", zh: "我现在不想听你说话。" },
] as const;
const desperate = [
  ["자기야...", "宝宝呀……"],
  ["나 전화 끊고 나서도 계속 생각했어ㅠㅠ", "挂电话以后我也一直在想ㅠㅠ"],
  ["자기야 제발 내 말 좀 들어 줘...", "宝宝，拜托听我说说……"],
  ["나 진짜 다른 사람 만난 거 아니야", "我真的没有和别人交往"],
  ["네가 얼마나 속상했을지 알아...", "我知道你一定很难过……"],
  ["숙소에 있다고 거짓말한 건 내가 잘못했어", "骗你说我在宿舍是我不对"],
  ["자기야... 지금 울고 있어?ㅠㅠ", "宝宝……你现在在哭吗？ㅠㅠ"],
  ["제발 혼자 울지 마...", "求你不要一个人哭……"],
  ["나 지금 네가 너무 걱정돼", "我现在真的很担心你"],
  ["재혁이 형한테도 연락했어...", "我也联系材赫哥了……"],
  ["지훈이 형한테도 물어봤어", "也问过志焄哥了"],
  ["정환이한테도 연락했어", "也联系庭焕了"],
  ["다들 네 걱정하고 있어...", "大家都很担心你……"],
  ["나한테 화내도 괜찮아ㅠㅠ", "你对我生气也没关系ㅠㅠ"],
  ["그러니까 제발 답장만 해 줘", "所以拜托至少回我一句"],
  ["우리 헤어지는 거 아니지...?ㅠㅠ", "我们不会分手的，对吧……？ㅠㅠ"],
  ["자기야아... 나 진짜 너 없으면 안 돼ㅠㅠ", "宝宝呀……我真的不能没有你ㅠㅠ"],
] as const;
export function ep01EarlyCallChoices(runtime: Runtime) {
  if (runtime.workId !== "unpublished-lover-ep01" ||
      runtime.variables.ep01FirstCallAnswered !== true ||
      runtime.variables.ep01EarlyCallChoiceSent === true) return [];
  return answers.map(a => ({ target: "ep01-early-call-" + a.id, label: a.ko + "\n" + a.zh }));
}
export function sendEp01EarlyCallChoice(runtime: Runtime, target: string): Runtime {
  const a = answers.find(a => "ep01-early-call-" + a.id === target);
  if (!a || !ep01EarlyCallChoices(runtime).some(c => c.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables, ep01EarlyCallChoiceSent: true, ep01EarlyCallBranch: a.id,
    ep01FirstCallAnswered: false, ep01FirstCallEnded: true,
    ep01EarlyCallEndedAt: runtime.elapsedMs ?? 0,
  } };
}
export function advanceEp01EarlyCallAftermath(runtime: Runtime): Runtime {
  if (runtime.workId !== "unpublished-lover-ep01" ||
      runtime.variables.ep01EarlyCallChoiceSent !== true ||
      runtime.variables.ep01EarlyCallAftermathFinished === true) return runtime;
  const started = runtime.variables.ep01EarlyCallEndedAt;
  const index = Number(runtime.variables.ep01EarlyCallAftermathDelivered ?? 0);
  if (typeof started !== "number" || (runtime.elapsedMs ?? 0) < started + (index + 1) * 2000) return runtime;
  const [ko, zh] = desperate[index];
  const result = appendStoryDelivery(runtime, {
    app: "kakao", conversationId: "chat-jeongwoo", sender: "朴炡禹",
    lines: [{ id: "early-call-aftermath-" + (index + 1), ko, zh }],
    delivered: 0, blocked: false,
  }, runtime.date ?? "2026-10-23", runtime.time).runtime;
  return { ...result, variables: {
    ...result.variables, ep01EarlyCallAftermathDelivered: index + 1,
    ep01EarlyCallAftermathFinished: index + 1 === desperate.length,
  } };
}
