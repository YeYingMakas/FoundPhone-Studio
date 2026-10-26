import type { Runtime } from "../schema";

export function scene21Choices(runtime: Runtime): { label: string; target: string }[] {
  if (runtime.variables.ep01Scene21Ready !== true || runtime.variables.ep01Scene21SecondSent === true) return [];
  const second = runtime.variables.ep01Scene21FirstSent === true;
  return [{
    label: second
      ? "그냥 이럴 거면 헤어지는 게 나을까 싶어...\n这样下去的话，我甚至觉得分手是不是更好……"
      : "정환아... 나 지금 진짜 정우 오빠 얼굴도 보기 싫어ㅠㅠ\n庭焕啊……我现在真的连炡禹欧巴的脸都不想看到ㅠㅠ",
    target: second ? "ep01-scene21-second" : "ep01-scene21-first",
  }];
}

export function sendScene21Choice(runtime: Runtime, target: string): Runtime {
  if (!scene21Choices(runtime).some((choice) => choice.target === target)) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables,
    ...(target === "ep01-scene21-first" ? { ep01Scene21FirstSent: true } : { ep01Scene21SecondSent: true, ep01Scene22StartedAt: runtime.elapsedMs ?? 0 }),
  } };
}
