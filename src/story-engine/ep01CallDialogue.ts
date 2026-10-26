import type { Runtime } from "../schema";

export const ep01CallOpening = [
  { ko: "자기야...", zh: "宝宝呀……" },
  { ko: "나 봤어. 인터넷에 올라온 거...", zh: "我看到了。网上传的那些……" },
  { ko: "그래서 아까부터 그랬던 거지...?", zh: "所以你刚才一直那样，是因为这个吧……？" },
  { ko: "자기야, 내가 설명할게. 일단 내 말 좀 들어 줘... 응?", zh: "宝宝，我会解释的。你先听我说一下……好不好？" },
] as const;
export const ep01CallBranches = [
  {
    id: "A",
    player: { ko: "뭘 설명할 건데? 나한테 숙소라고 거짓말한 거?", zh: "你要解释什么？解释你骗我说自己在宿舍吗？" },
    replies: [
      { ko: "...미안해", zh: "……对不起" },
      { ko: "숙소라고 한 건 내가 거짓말했어", zh: "说自己在宿舍，确实是我骗了你" },
      { ko: "근데 자기야, 진짜 네가 생각하는 그런 건 아니야", zh: "但是宝宝，真的不是你想的那样" },
      { ko: "내가 제대로 설명할게. 전화 끊지 마...", zh: "我会好好解释的。别挂电话……" },
    ],
  },
  {
    id: "B",
    player: { ko: "오빠, 나한테 어떻게 그럴 수 있어...?", zh: "欧巴，你怎么能这样对我……？" },
    replies: [
      { ko: "자기야...ㅠㅠ", zh: "宝宝……ㅠㅠ" },
      { ko: "미안해. 진짜 미안해...", zh: "对不起，真的对不起……" },
      { ko: "네가 얼마나 속상할지 알아", zh: "我知道你现在一定很难过" },
      { ko: "근데 나 좀 믿어 줘... 제발", zh: "但再相信我一次……拜托了" },
    ],
  },
  {
    id: "C",
    player: { ko: "그 여자 누구야? 지금도 같이 있어?", zh: "那个女生是谁？你现在还和她在一起吗？" },
    replies: [
      { ko: "...", zh: "……" },
      { ko: "자기야 일단...", zh: "宝宝，先……" },
      { ko: "그 사람이랑 있었던 건 맞아", zh: "我的确和那个人待在一起" },
      { ko: "근데 네가 생각하는 그런 사이 아니야", zh: "但我们不是你想的那种关系" },
      { ko: "나 지금 설명할 수 있어. 조금만 들어 줘...", zh: "我现在可以解释。你听我说一会儿……" },
    ],
  },
] as const;
export function ep01CallChoices(runtime: Runtime) {
  if (runtime.workId !== "unpublished-lover-ep01" ||
      runtime.variables.ep01FirstCallAnswered !== true ||
      runtime.variables.ep01CallChoiceSent === true) return [];
  return ep01CallBranches.map((branch) => ({
    target: "ep01-call-branch-" + branch.id,
    label: branch.player.ko + "\n" + branch.player.zh,
  }));
}
export function chooseEp01CallBranch(runtime: Runtime, target: string): Runtime {
  const branch = ep01CallBranches.find((item) => "ep01-call-branch-" + item.id === target);
  if (!branch || !ep01CallChoices(runtime).some((choice) => choice.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables, ep01CallChoiceSent: true, ep01CallBranch: branch.id,
  } };
}
