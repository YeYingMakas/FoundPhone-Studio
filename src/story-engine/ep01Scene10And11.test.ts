import { describe,expect,it } from "vitest";
import { initialRuntime,type Runtime,type Work } from "../schema";
import { advanceScene10And11,openScene10XPost,markScene10ThirdXPost,scene10Choices,sendScene10Choice } from "./ep01Scene10And11";
import { scene12Choices } from "./ep01Scene12";
const work={id:"unpublished-lover-ep01",updatedAt:1,phone:{date:"2026-10-23",time:"22:45"},variables:{}} as Work;
describe("EP01 approved scene10/11",()=>{
 it("requires three unique X post details and survives reload",()=>{
  let s:Runtime=initialRuntime(work);
  s={...s,elapsedMs:1000,variables:{ep01XUnlocked:true}};
  s=openScene10XPost(s,"ep01-rumor-1");
  s=openScene10XPost(s,"ep01-rumor-1");
  expect(s.variables.ep01Scene10XPostsSeen).toBe('["ep01-rumor-1"]');
  s=JSON.parse(JSON.stringify(s)) as Runtime;
  s=openScene10XPost(s,"ep01-rumor-2");
  expect(s.variables.ep01Scene10StartedAt).toBeUndefined();
  s=openScene10XPost(s,"ep01-rumor-3");
  expect(s.variables.ep01Scene10StartedAt).toBe(1000);
  s=openScene10XPost(s,"ep01-rumor-4");
  expect(s.variables.ep01Scene10XPostsSeen).toBe('["ep01-rumor-1","ep01-rumor-2","ep01-rumor-3"]');
 });
 it.each([["A",5],["B",4],["C",5]])("plays %s branch and gates scene12 until finished",(branch,count)=>{
  let s:Runtime=initialRuntime(work);
  s={...s,elapsedMs:1000};
  s=markScene10ThirdXPost(s);
  expect(s.variables.ep01Scene10StartedAt).toBe(1000);
  expect(markScene10ThirdXPost(s)).toBe(s);
  for(let i=0;i<4;i++)s=advanceScene10And11({...s,elapsedMs:3000+i*2000});
  expect(s.variables.ep01Scene10Finished).toBe(true);
  expect(scene10Choices(s)).toHaveLength(3);
  s=sendScene10Choice(s,"ep01-scene10-"+branch);
  expect(scene12Choices(s)).toHaveLength(0);
  for(let i=0;i<count;i++)s=advanceScene10And11({...s,elapsedMs:11000+i*2000});
  expect(s.variables.ep01Scene11Finished).toBe(true);
  expect(scene12Choices(s)).toHaveLength(3);
  expect(s.messages.kakao).toHaveLength(4+count);
  s=JSON.parse(JSON.stringify(s)) as Runtime;
  expect(advanceScene10And11({...s,elapsedMs:999999}).messages.kakao).toHaveLength(4+count);
 });
});
