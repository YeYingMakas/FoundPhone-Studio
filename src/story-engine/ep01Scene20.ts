import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

// Scene 20 is retained from the source V1 draft, which is not separately approved.
const branches = [
  { id: "A", player: ["정환아ㅠㅠ 나 정우 오빠 진짜 믿었는데... 나한테 거짓말했어.", "庭焕啊ㅠㅠ 我真的那么相信炡禹欧巴……他却骗了我。"], replies: [
    ["아... 누나ㅠㅠ", "啊……姐姐ㅠㅠ"],
    ["정우 형이 거짓말했어요...?", "炡禹哥骗你了吗……？"],
    ["그건 형이 잘못했네요...", "那确实是哥做错了……"],
    ["근데 누나 너무 걱정하지 마세요", "不过姐姐别太担心"],
    ["제가 다 말씀드릴 수는 없지만...", "虽然我不能把所有事情都告诉你……"],
    ["누나가 생각하시는 그런 일은 아닐 거예요", "但应该不是姐姐想的那种事"],
    ["정우 형이 직접 잘 설명해 줄 거예요", "炡禹哥会亲自好好解释的"],
  ] },
  { id: "B", player: ["정환이도 다 알고 있었지...? 너희 다 나한테 숨기는 거잖아.", "庭焕也全都知道吧……？你们都在瞒着我，不是吗？"], replies: [
    ["아니 누나 그게...", "不是，姐姐，那个……"],
    ["제가 일부러 숨기려고 그런 건 아니에요ㅠㅠ", "我不是故意要瞒着你的ㅠㅠ"],
    ["근데 제가 마음대로 말씀드릴 수 있는 일이 아니라서...", "但是这不是我能擅自说出来的事……"],
    ["정우 형이 거짓말한 건 잘못한 거 맞아요", "炡禹哥撒谎确实不对"],
    ["저도 누나 속상하게 하고 싶지 않아요", "我也不想让姐姐难过"],
    ["조금만 기다려 주시면 안 돼요...?", "能不能稍微等一下呢……？"],
  ] },
  { id: "C", player: ["정환아... 너는 나한테 솔직하게 말해 줄 수 없어? 그 여자 누구야?", "庭焕啊……你就不能对我说实话吗？那个女生是谁？"], replies: [
    ["누나...", "姐姐……"],
    ["제가 지금 말씀드리면 안 되는 거라서ㅠㅠ", "因为我现在真的不能说ㅠㅠ"],
    ["근데 누나가 걱정하시는 그런 건 아니에요", "但真的不是姐姐担心的那种情况"],
    ["정우 형이 직접 얘기해야 하는 일이에요", "这件事应该由炡禹哥亲自告诉你"],
    ["제가 괜히 더 헷갈리게 해 드리고 싶진 않아요", "我不想因为自己说错话，让姐姐更困惑"],
    ["누나 조금만 기다려 주세요...", "姐姐，再稍微等一下好不好……"],
  ] },
] as const;

export function scene20Choices(runtime: Runtime) {
  if (runtime.workId !== "unpublished-lover-ep01" ||
      Number(runtime.variables.ep01Scene17_junghwan ?? 0) < 4 ||
      runtime.variables.ep01Scene20Branch) return [];
  return branches.map(b => ({ target: "ep01-scene20-" + b.id, label: b.player.join("\n") }));
}
export function sendScene20Choice(runtime: Runtime, target: string): Runtime {
  const branch = branches.find(b => "ep01-scene20-" + b.id === target);
  if (!branch || !scene20Choices(runtime).some(c => c.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables, ep01Scene20Branch: branch.id,
    ep01Scene20StartedAt: runtime.elapsedMs ?? 0, ep01Scene20Delivered: 0,
  } };
}
export function advanceScene20(runtime: Runtime): Runtime {
  const branch = branches.find(b => b.id === runtime.variables.ep01Scene20Branch);
  if (!branch || runtime.variables.ep01Scene20Finished === true) return runtime;
  const index = Number(runtime.variables.ep01Scene20Delivered ?? 0);
  const started = runtime.variables.ep01Scene20StartedAt;
  if (typeof started !== "number" || (runtime.elapsedMs ?? 0) < started + (index + 1) * 2000) return runtime;
  const [ko, zh] = branch.replies[index];
  const delivered = appendStoryDelivery(runtime, {
    app: "kakao", conversationId: "chat-junghwan", sender: "苏庭焕",
    lines: [{ id: "scene20-" + branch.id + "-" + (index + 1), ko, zh }],
    delivered: 0, blocked: false,
  }, runtime.date ?? "2026-10-23", runtime.time).runtime;
  return { ...delivered, variables: {
    ...delivered.variables, ep01Scene20Delivered: index + 1,
    ep01Scene20Finished: index + 1 === branch.replies.length,
  } };
}
