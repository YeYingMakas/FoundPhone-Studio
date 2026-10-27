import {describe,expect,it} from "vitest";
import {initialRuntime,type Runtime,type Work} from "../schema";
import {advanceEp01BestFriend,ep01BestFriendChoices,sendEp01BestFriendChoice} from "./ep01BestFriend";
import {openScene10XPost} from "./ep01Scene10And11";
const work={id:"unpublished-lover-ep01",updatedAt:1,phone:{date:"2026-10-23",time:"22:38"},variables:{}} as Work;
describe("approved friend KKT and X unlock",()=>{
 it.each([["A",3],["B",3],["C",4]])("keeps branch %s separate and unlocks X after %i replies",(branch,count)=>{
  let s:Runtime={...initialRuntime(work),elapsedMs:1000,variables:{ep01SecondReplyFinished:true,ep01SecondReplyFinishedAt:1000}};
  expect(advanceEp01BestFriend({...s,elapsedMs:2999}).messages.kakao).toBeUndefined();
  s=advanceEp01BestFriend({...s,elapsedMs:3000});
  expect(s.messages.kakao).toHaveLength(1);
  expect(s.messages.kakao[0].title).toBe("闺蜜");
  expect(ep01BestFriendChoices(s)).toHaveLength(3);
  expect(openScene10XPost(s,"ep01-rumor-1")).toBe(s);
  s=sendEp01BestFriendChoice(s,"ep01-friend-"+branch);
  for(let i=1;i<=count;i++)s=advanceEp01BestFriend({...s,elapsedMs:3000+i*2000});
  expect(s.messages.kakao).toHaveLength(1+count);
  expect(s.messages.kakao.every(m=>m.title==="闺蜜")).toBe(true);
  expect(s.variables.ep01XUnlocked).toBe(true);
  s=JSON.parse(JSON.stringify(s)) as Runtime;
  expect(advanceEp01BestFriend({...s,elapsedMs:999999}).messages.kakao).toHaveLength(1+count);
  expect(openScene10XPost(s,"ep01-rumor-1").variables.ep01Scene10XPostsSeen).toBe('["ep01-rumor-1"]');
 });
});
