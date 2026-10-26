import { describe,expect,it } from "vitest";
import { initialRuntime,type Runtime,type Work } from "../schema";
import { scene12Choices,sendScene12Choice,advanceScene12 } from "./ep01Scene12";
import { scene13Choices,sendScene13Choice,advanceScene13 } from "./ep01Scene13";
const work={id:"unpublished-lover-ep01",updatedAt:1,phone:{date:"2026-10-23",time:"22:50"},variables:{}} as Work;
describe("EP01 approved scenes12 and 13",()=>{
 it.each([["A",["A1","A2","A3"],[4,4,3]],["B",["B1","B2","B3"],[3,3,5]],["C",["C1","C2","C3"],[3,3,3]]])("offers only scene11 branch %s choices",(parent,ids,counts)=>{
  for(let k=0;k<3;k++){
   let s:Runtime=initialRuntime(work);
   s={...s,elapsedMs:1000,variables:{ep01Scene11Branch:parent}};
   const choices=scene12Choices(s);
   expect(choices.map(c=>c.target)).toEqual(ids.map(id=>"ep01-scene12-"+id));
   s=sendScene12Choice(s,"ep01-scene12-"+ids[k]);
   expect(scene13Choices(s)).toHaveLength(0);
   for(let i=0;i<counts[k];i++)s=advanceScene12({...s,elapsedMs:3000+i*2000});
   expect(s.messages.kakao).toHaveLength(counts[k]);
   expect(s.variables.ep01Scene12Finished).toBe(true);
   expect(scene13Choices(s)).toHaveLength(3);
  }
 });
 it.each([["A",5],["B",4],["C",5]])("finishes scene13 branch %s after %i replies",(id,count)=>{
  let s:Runtime=initialRuntime(work);
  s={...s,elapsedMs:1000,variables:{ep01Scene12Finished:true}};
  s=sendScene13Choice(s,"ep01-scene13-"+id);
  for(let i=0;i<count;i++)s=advanceScene13({...s,elapsedMs:3000+i*2000});
  expect(s.variables.ep01Scene13Finished).toBe(true);
  expect(s.variables.ep01Scene13FinishedAt).toBe(3000+(count-1)*2000);
  expect(s.messages.kakao).toHaveLength(count);
 });
});
