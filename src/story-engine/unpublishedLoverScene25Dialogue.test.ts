import { describe, expect, it } from "vitest";
import type { Runtime, Work } from "../schema";
import { initialRuntime } from "../engine";
import scene25 from "../../stories/unpublished-lover/data/scene25.json";
import { advanceScene25Incoming, answerScene25Incoming, advanceScene25Dialogue, chooseScene25Reply, speakScene25Final, scene25Transcript } from "./unpublishedLoverScene25";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
const tick = (runtime: Runtime, ms: number) => advanceScene25Dialogue({ ...runtime, elapsedMs: ms });

describe("EP01 nine approved call outcomes", () => {
  for (const route of ["A", "B", "C"] as const) {
    for (const choice of [1, 2, 3] as const) {
      it("completes " + route + choice + " without auto-unblocking Kakao", () => {
        let runtime = answerScene25Incoming(advanceScene25Incoming({ ...initialRuntime(work), variables: {
          ep01Scene25Ready: true, ep01Scene24Branch: route, ep01KakaoBlocked: route === "A",
        } }));
        expect(chooseScene25Reply(runtime, choice)).toBe(runtime);
        for (let i = 1; i <= scene25.opening[route].length; i++) runtime = tick(runtime, i * 2000);
        expect(scene25Transcript(runtime)).toHaveLength(scene25.opening[route].length);
        runtime = chooseScene25Reply(runtime, choice);
        expect(runtime.variables.ep01Scene25Choice).toBe(choice);
        for (let i = 1; i <= scene25.replies[route][choice - 1].length; i++) {
          runtime = tick(runtime, (scene25.opening[route].length + i) * 2000);
        }
        expect(scene25Transcript(runtime)).toHaveLength(scene25.opening[route].length + 1 + scene25.replies[route][choice - 1].length);
        runtime = speakScene25Final(runtime);
        expect(scene25Transcript(runtime).at(-1)?.ko).toBe(scene25.final.ko);
        runtime = tick(runtime, (scene25.opening[route].length + scene25.replies[route][choice - 1].length) * 2000 + 2000);
        expect(runtime.incomingCall).toBeNull();
        expect(runtime.variables.ep01Scene25Finished).toBe(true);
        expect(runtime.variables.ep01KakaoBlocked).toBe(route === "A");
      });
    }
  }
});
