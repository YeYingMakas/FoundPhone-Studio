import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const story = JSON.parse(readFileSync(join(process.cwd(),"stories/unpublished-lover/story.json"),"utf8"));
const ids = ["ep01-rumor-main","ep01-rumor-1","ep01-rumor-2","ep01-rumor-3","ep01-rumor-4","ep01-rumor-5"];
describe("approved EP01 X detail threads",()=>{
 it("provides six distinct clickable X posts with bilingual comments",()=>{
  const posts=ids.map(id=>story.content.twitter.find((item:{id:string})=>item.id===id));
  expect(posts.every(Boolean)).toBe(true);
  expect(new Set(posts.map((p:{id:string})=>p.id)).size).toBe(6);
  for(const post of posts){
   expect(post.comments.length).toBeGreaterThanOrEqual(5);
   expect(Number(post.meta.commentCount)).toBe(post.comments.length);
   expect(post.comments.every((line:string)=>line.includes("\n"))).toBe(true);
   expect(post.body.length).toBeGreaterThan(20);
  }
  expect(posts.slice(1).map((p:{comments:string[]})=>p.comments.length)).toEqual([7,6,8,9,7]);
 });
});
