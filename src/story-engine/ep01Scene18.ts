import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

const branches = [
  { id: "A", player: ["재혁 오빠, 오빠도 그 사진 봤지...? 정우 오빠 진짜 다른 여자 만나는 거야?", "材赫欧巴，你也看到那张照片了吧……？炡禹欧巴真的在见别的女生吗？"], replies: [
    ["응 사진 봤어", "嗯，我看过照片了"],
    ["근데 사진만 보고 그렇게 생각하지는 않았으면 좋겠어", "但希望你别只凭照片就这样想"],
    ["정우가 너한테 제대로 얘기해야 하는 건 맞아", "炡禹确实应该好好跟你解释"],
    ["나도 걔가 거짓말한 건 잘못했다고 생각해", "我也觉得他撒谎是做错了"],
    ["그래도 조금만 기다려 줄 수 있을까?", "不过能不能稍微再等一下？"],
  ] },
  { id: "B", player: ["재혁 오빠도 정우 오빠 편이지? 다 알고 있으면서 나한테는 아무 말도 안 하는 거잖아.", "材赫欧巴也站在炡禹欧巴那边吧？明明什么都知道，却什么也不告诉我。"], replies: [
    ["아니야 그런 거 아니야", "不是的，不是那样"],
    ["나 정우 편들려고 연락한 거 아니야", "我联系你不是为了偏袒炡禹"],
    ["네가 그렇게 생각할 수도 있겠다...", "你会那样想也可以理解……"],
    ["솔직히 내가 지금 다 얘기해 줄 수는 없어", "说实话，我现在不能把一切都告诉你"],
    ["근데 정우가 너한테 거짓말한 건 잘못한 거 맞아", "但炡禹对你撒谎确实是错的"],
    ["그건 나도 감싸 줄 생각 없어", "这点我也不打算护着他"],
    ["그냥 네가 혼자 속상해하고 있을까 봐 연락했어", "只是怕你一个人难过才联系你"],
  ] },
  { id: "C", player: ["재혁 오빠... 나 정우 오빠 진짜 믿었는데ㅠㅠ 나한테 거짓말했어...", "材赫欧巴……我真的很相信炡禹欧巴ㅠㅠ 可他却骗了我……"], replies: [
    ["아이고...", "哎哟……"],
    ["정우가 거짓말했구나...", "炡禹撒谎了啊……"],
    ["그건 걔가 잘못했네", "那确实是他做错了"],
    ["3년이나 만났는데 당연히 믿었겠지", "都交往三年了，你当然会相信他"],
    ["네가 뭘 잘못한 건 아니잖아", "又不是你做错了什么"],
    ["내가 대신 설명할 수 있는 일은 아닌데...", "这件事也不是我能替他解释的……"],
    ["정우가 너한테 직접 제대로 얘기해야 해", "炡禹必须亲自好好跟你说清楚"],
    ["일단 울지 말고ㅠㅠ 나 여기 있으니까", "先别哭了ㅠㅠ 我在这里呢"],
  ] },
] as const;

export function scene18Choices(runtime: Runtime) {
  if (runtime.workId !== "unpublished-lover-ep01" ||
      Number(runtime.variables.ep01Scene17_jaehyuk ?? 0) < 4 ||
      runtime.variables.ep01Scene18Branch) return [];
  return branches.map(b => ({ target: "ep01-scene18-" + b.id, label: b.player.join("\n") }));
}
export function sendScene18Choice(runtime: Runtime, target: string): Runtime {
  const branch = branches.find(b => "ep01-scene18-" + b.id === target);
  if (!branch || !scene18Choices(runtime).some(c => c.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables, ep01Scene18Branch: branch.id,
    ep01Scene18StartedAt: runtime.elapsedMs ?? 0,
    ep01Scene18Delivered: 0,
  } };
}
export function advanceScene18(runtime: Runtime): Runtime {
  const branch = branches.find(b => b.id === runtime.variables.ep01Scene18Branch);
  if (!branch || runtime.variables.ep01Scene18Finished === true) return runtime;
  const index = Number(runtime.variables.ep01Scene18Delivered ?? 0);
  const started = runtime.variables.ep01Scene18StartedAt;
  if (typeof started !== "number" || (runtime.elapsedMs ?? 0) < started + (index + 1) * 2000) return runtime;
  const [ko, zh] = branch.replies[index];
  const delivered = appendStoryDelivery(runtime, {
    app: "kakao", conversationId: "chat-jaehyuk", sender: "尹材赫",
    lines: [{ id: "scene18-" + branch.id + "-" + (index + 1), ko, zh }],
    delivered: 0, blocked: false,
  }, runtime.date ?? "2026-10-23", runtime.time).runtime;
  return { ...delivered, variables: {
    ...delivered.variables, ep01Scene18Delivered: index + 1,
    ep01Scene18Finished: index + 1 === branch.replies.length,
  } };
}
