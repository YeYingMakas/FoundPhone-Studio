import {describe,expect,it} from "vitest";
import {initialRuntime,type Runtime,type Work} from "../schema";
import {advanceScene14Call,rejectScene14Call,answerScene14Call,advanceScene14Opening,scene14CallChoices,sendScene14CallChoice,advanceScene14Replies} from "./ep01Scene14Call";
import {chooseScene15Reply,advanceScene15And16} from "./ep01Scene15And16";
const work={id:"unpublished-lover-ep01",updatedAt:1,phone:{date:"2026-10-23",time:"22:50"},variables:{}} as Work;
describe("EP01 scene14 independent late call",()=>{
 it("rings five seconds after scene13 and repeats rejection without extra messages",()=>{
  let s:Runtime=initialRuntime(work);
  s={...s,elapsedMs:1000,variables:{ep01Scene13FinishedAt:1000}};
  expect(advanceScene14Call({...s,elapsedMs:5999}).variables.ep01Scene14Ringing).not.toBe(true);
  s=advanceScene14Call({...s,elapsedMs:6000});
  expect(s.variables.ep01Scene14Ringing).toBe(true);
  for(let i=1;i<=5;i++){
   s=rejectScene14Call(s);
   expect(s.variables.ep01Scene14RejectedCount).toBe(i);
   expect(s.messages.kakao).toHaveLength(Math.min(i,3));
   s=advanceScene14Call({...s,elapsedMs:6000+i*3000});
   expect(s.variables.ep01Scene14Ringing).toBe(true);
  }
  s=answerScene14Call(s);
  expect(scene14CallChoices(s)).toHaveLength(0);
  for(let i=0;i<4;i++){
   s=advanceScene14Opening({...s,elapsedMs:Number(s.variables.ep01Scene14AnsweredAt)+(i+1)*2000});
   expect(s.variables.ep01Scene14OpeningDelivered).toBe(i+1);
  }
  expect(scene14CallChoices(s)).toHaveLength(3);
 });
 it.each([["A",4],["B",4],["C",5]])("finishes branch %s before scene15",(branch,count)=>{
  let s:Runtime=initialRuntime(work);
  s={...s,elapsedMs:1000,variables:{ep01Scene14Answered:true,ep01Scene14OpeningDelivered:4}};
  s=sendScene14CallChoice(s,"ep01-scene14-"+branch);
  expect(chooseScene15Reply(s)).toBe(s);
  for(let i=0;i<count;i++)s=advanceScene14Replies({...s,elapsedMs:3000+i*2000});
  expect(s.variables.ep01Scene14RepliesFinished).toBe(true);
  s=chooseScene15Reply(s);
  expect(s.variables.ep01Scene15ReplySent).toBe(true);
  s=advanceScene15And16({...s,elapsedMs:Number(s.variables.ep01Scene15HangupDueAt)+1});
  expect(s.variables.ep01Scene14Ended).toBe(true);
  expect(s.variables.ep01FirstCallEnded).not.toBe(true);
 });
});
