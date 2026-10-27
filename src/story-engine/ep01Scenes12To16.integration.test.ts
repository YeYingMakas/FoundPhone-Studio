import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { advanceScene12, scene12Choices, sendScene12Choice } from "./ep01Scene12";
import { advanceScene13, scene13Choices, sendScene13Choice } from "./ep01Scene13";
import { advanceScene14Call, advanceScene14Opening, answerScene14Call, scene14CallChoices } from "./ep01Scene14Call";
import { advanceScene15And16, chooseScene15Reply, scene16Count } from "./ep01Scene15And16";
import { sendScene14CallChoice, advanceScene14Replies } from "./ep01Scene14Call";

const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:50" }, variables: {} } as Work;
const tick = (s: Runtime, ms: number) => ({ ...s, elapsedMs: ms });
describe("EP01 scenes12-16 cross-scene integration", () => {
 it("retains choices, message indexes and unique IDs across JSON save/reload and app changes", () => {
  let s: Runtime = { ...initialRuntime(work), elapsedMs: 1000, variables: { ep01Scene11Branch: "B", ep01Scene11Finished: true } };
  expect(scene12Choices(s)).toHaveLength(3);
  s = sendScene12Choice(s, "ep01-scene12-B3");
  for(let n=0;n<5;n++){
   s = advanceScene12(tick(s,3000+n*2000));
   s = JSON.parse(JSON.stringify(s)) as Runtime;
  }
  expect(s.variables.ep01Scene12Finished).toBe(true);
  expect(scene13Choices(s)).toHaveLength(3);
  s = sendScene13Choice(s,"ep01-scene13-C");
  for(let n=0;n<5;n++){
   s = advanceScene13(tick(s,13000+n*2000));
   s = JSON.parse(JSON.stringify(s)) as Runtime;
  }
  expect(s.variables.ep01Scene13Finished).toBe(true);
  const finish=Number(s.variables.ep01Scene13FinishedAt);
  s = advanceScene14Call(tick(s,finish+4999));
  expect(s.variables.ep01Scene14Ringing).not.toBe(true);
  s = advanceScene14Call(tick(s,finish+5000));
  expect(s.variables.ep01Scene14Ringing).toBe(true);
  s = answerScene14Call(s);
  for(let n=0;n<4;n++){
   s=advanceScene14Opening(tick(s,Number(s.variables.ep01Scene14AnsweredAt)+(n+1)*2000));
  }
  expect(scene14CallChoices(s)).toHaveLength(3);
  s=sendScene14CallChoice(s,"ep01-scene14-A");
  for(let n=0;n<4;n++){
   s=advanceScene14Replies(tick(s,Number(s.variables.ep01Scene14BranchStartedAt)+(n+1)*2000));
  }
  expect(s.variables.ep01Scene14RepliesFinished).toBe(true);
  s=chooseScene15Reply(s);
  const hangup=Number(s.variables.ep01Scene15HangupDueAt);
  s=advanceScene15And16(tick(s,hangup));
  expect(s.variables.ep01Scene14Ended).toBe(true);
  for(let n=0;n<scene16Count;n++){
   s=advanceScene15And16(tick(s,hangup+3000+n*2000));
   s=JSON.parse(JSON.stringify(s)) as Runtime;
  }
  expect(s.variables.ep01Scene16Finished).toBe(true);
  expect(s.variables.ep01Scene16MessageIndex).toBe(scene16Count);
  const before=s.messages.kakao.length;
  s=advanceScene15And16(advanceScene14Call(advanceScene13(advanceScene12(tick(s,hangup+999999)))));
  expect(s.messages.kakao).toHaveLength(before);
  expect(new Set(s.messages.kakao.map(m=>m.id)).size).toBe(before);
 });
});
