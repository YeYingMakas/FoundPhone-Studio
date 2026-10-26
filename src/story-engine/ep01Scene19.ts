import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

const branches = [
  { id: "A", player: ["지훈 오빠도 다 알고 있었지? 나만 아무것도 몰랐던 거야?", "志焄欧巴也全都知道吧？只有我什么都不知道吗？"], replies: [
    ["야 잠깐만", "呀，等一下"],
    ["무슨 얘기 들었는데?", "你听说了什么？"],
    ["나한테 화내는 건 괜찮은데", "你冲我发火也没关系"],
    ["나도 지금 다 말할 수 있는 상황은 아니야", "但我现在也不是能把一切都说出来的情况"],
    ["그렇다고 정우가 거짓말한 게 잘한 짓이라는 건 아니고", "这也不代表炡禹撒谎是对的"],
    ["그건 걔가 직접 설명해야지", "那得由他自己解释"],
  ] },
  { id: "B", player: ["박정우 진짜 짜증 나. 나한테 숙소라고 거짓말까지 했어.", "朴炡禹真的烦死了，还骗我说他在宿舍。"], replies: [
    ["아 진짜?", "啊，真的？"],
    ["숙소라고 했다고?", "他说自己在宿舍？"],
    ["하... 이 자식 진짜", "哈……这小子真是"],
    ["그건 걔가 잘못했네", "那确实是他做错了"],
    ["내가 대신 변명해 줄 생각은 없고", "我也没打算替他辩解"],
    ["너 지금 걔 전화 안 받고 있는 거지?", "你现在没接他电话吧？"],
    ["일단 걔한테 바로 답장 안 해도 돼", "你先不用马上回复他"],
  ] },
  { id: "C", player: ["지훈 오빠... 나 진짜 너무 억울해ㅠㅠ 정우 오빠 믿었는데 나한테 거짓말까지 했잖아...", "志焄欧巴……我真的太委屈了ㅠㅠ 我那么相信炡禹欧巴，他却还骗我……"], replies: [
    ["아이고 우리 {name} 삐졌네ㅋㅋ", "哎哟，我们{name}生气了呢ㅋㅋ"],
    ["아니 근데 박정우 이 자식은 왜 말을 그렇게 해가지고ㅋㅋ", "不是，朴炡禹这小子干嘛非要那样说话啊ㅋㅋ"],
    ["거짓말한 건 걔가 잘못했지", "撒谎确实是他做错了"],
    ["근데 너무 걱정하지는 마", "不过你也别太担心"],
    ["네가 생각하는 것만큼 심각한 일은 아닐 수도 있잖아ㅎㅎ", "说不定事情没有你想的那么严重呢ㅎㅎ"],
    ["내가 괜히 이런 말 하는 거겠냐ㅋㅋ", "你觉得我会无缘无故这么说吗ㅋㅋ"],
    ["일단 박정우한테 설명할 기회는 한 번 줘 봐", "总之，先给朴炡禹一次解释的机会吧"],
    ["그래도 계속 이상한 소리 하면 내가 혼내 줄게ㅋㅋ", "要是他还继续胡说八道，我帮你教训他ㅋㅋ"],
  ] },
] as const;

export function scene19Choices(runtime: Runtime) {
  if (runtime.workId !== "unpublished-lover-ep01" ||
      Number(runtime.variables.ep01Scene17_jihoon ?? 0) < 4 ||
      runtime.variables.ep01Scene19Branch) return [];
  return branches.map(b => ({ target: "ep01-scene19-" + b.id, label: b.player.join("\n") }));
}
export function sendScene19Choice(runtime: Runtime, target: string): Runtime {
  const branch = branches.find(b => "ep01-scene19-" + b.id === target);
  if (!branch || !scene19Choices(runtime).some(c => c.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables, ep01Scene19Branch: branch.id,
    ep01Scene19StartedAt: runtime.elapsedMs ?? 0, ep01Scene19Delivered: 0,
  } };
}
export function advanceScene19(runtime: Runtime): Runtime {
  const branch = branches.find(b => b.id === runtime.variables.ep01Scene19Branch);
  if (!branch || runtime.variables.ep01Scene19Finished === true) return runtime;
  const index = Number(runtime.variables.ep01Scene19Delivered ?? 0);
  const started = runtime.variables.ep01Scene19StartedAt;
  if (typeof started !== "number" || (runtime.elapsedMs ?? 0) < started + (index + 1) * 2000) return runtime;
  const name = String(runtime.variables.ep01PlayerName ?? "").trim();
  const [rawKo, rawZh] = branch.replies[index];
  const delivered = appendStoryDelivery(runtime, {
    app: "kakao", conversationId: "chat-jihoon", sender: "朴志焄",
    lines: [{ id: "scene19-" + branch.id + "-" + (index + 1),
      ko: rawKo.replace("{name}", name), zh: rawZh.replace("{name}", name) }],
    delivered: 0, blocked: false,
  }, runtime.date ?? "2026-10-23", runtime.time).runtime;
  return { ...delivered, variables: {
    ...delivered.variables, ep01Scene19Delivered: index + 1,
    ep01Scene19Finished: index + 1 === branch.replies.length,
  } };
}
