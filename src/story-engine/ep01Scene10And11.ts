import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

// Approved EP01 scene 10 V3 and scene 11 V1, 2026-10-26.
const prompt = [
 ["자기야 뭐 해?ㅠㅠ","宝宝呀，在干嘛呢？ㅠㅠ"],
 ["왜 답장이 없어어","怎么不回消息呀——"],
 ["혹시 잠들었어?","难道睡着了吗？"],
 ["자기야아ㅠㅠ","宝宝呀——ㅠㅠ"],
] as const;
const branches = [
 {id:"A",player:["오빠 아직 숙소야?","欧巴，你现在还在宿舍吗？"],replies:[["응 자기야","嗯宝宝呀"],["나 숙소지ㅎㅎ","我在宿舍呀ㅎㅎ"],["왜애 또 물어봐ㅋㅋ","怎么又问这个呀ㅋㅋ"],["자기 오늘 좀 이상해ㅠㅠ","宝宝今天有点奇怪ㅠㅠ"],["무슨 일 있어?","发生什么事了吗？"]]},
 {id:"B",player:["오빠 나한테 거짓말한 거 없어?","欧巴，你没有什么事瞒着我吧？"],replies:[["응?","嗯？"],["갑자기 왜 그런 말을 해ㅠㅠ","怎么突然说这种话ㅠㅠ"],["자기야 무슨 일 있어?","宝宝，发生什么事了吗？"],["나한테 서운한 거 있어?","是不是有什么事让你对我不开心了？"]]},
 {id:"C",player:["나 지금 기분이 별로 안 좋아... 오빠 나한테 할 말 없어?","我现在心情不太好……欧巴没有什么话要跟我说吗？"],replies:[["자기야 왜ㅠㅠ","宝宝怎么了ㅠㅠ"],["무슨 일 있었어?","发生什么事了吗？"],["내가 뭐 잘못했어...?","我做错什么了吗……？"],["자기야 말해 줘","宝宝，告诉我嘛"],["나 걱정되잖아ㅠㅠ","我会担心的呀ㅠㅠ"]]},
] as const;
export function openScene10XPost(s:Runtime, postId:string):Runtime {
 if(s.workId!=="unpublished-lover-ep01" || !/^ep01-rumor-(?:main|[1-5])$/.test(postId) || s.variables.ep01XUnlocked!==true || s.variables.ep01Scene10StartedAt!==undefined || s.variables.ep01Scene10Finished===true) return s;
 const raw=s.variables.ep01Scene10XPostsSeen;
 let seen:string[]=[];
 if(typeof raw==="string"){try{const parsed:unknown=JSON.parse(raw);if(Array.isArray(parsed))seen=parsed.filter((v):v is string=>typeof v==="string");}catch{seen=[];}}
 if(seen.includes(postId))return s;
 const next:Runtime={...s,variables:{...s.variables,ep01Scene10XPostsSeen:JSON.stringify([...seen,postId])}};
 return seen.length+1>=3 ? markScene10ThirdXPost(next) : next;
}
export function markScene10ThirdXPost(s:Runtime):Runtime {
 if(s.workId!=="unpublished-lover-ep01"||s.variables.ep01Scene10StartedAt!==undefined)return s;
 return {...s,variables:{...s.variables,ep01Scene10StartedAt:s.elapsedMs??0,ep01Scene10Delivered:0}};
}
export function advanceScene10And11(s:Runtime):Runtime {
 if(s.workId!=="unpublished-lover-ep01")return s;
 const now=s.elapsedMs??0;
 const started=s.variables.ep01Scene10StartedAt;
 if(typeof started==="number"&&s.variables.ep01Scene10Finished!==true){
  const n=Number(s.variables.ep01Scene10Delivered??0);
  if(n<prompt.length&&now>=started+(n+1)*2000){
   const [ko,zh]=prompt[n];
   const d=appendStoryDelivery(s,{app:"kakao",conversationId:"chat-jeongwoo",sender:"朴炡禹",lines:[{id:"scene10-"+(n+1),ko,zh}],delivered:0,blocked:false},s.date??"2026-10-23",s.time).runtime;
   return {...d,variables:{...d.variables,ep01Scene10Delivered:n+1,ep01Scene10Finished:n+1===prompt.length}};
  }
 }
 const b=branches.find(x=>x.id===s.variables.ep01Scene11Branch);
 if(!b||s.variables.ep01Scene11Finished===true)return s;
 const n=Number(s.variables.ep01Scene11Delivered??0),begin=s.variables.ep01Scene11StartedAt;
 if(typeof begin!=="number"||now<begin+(n+1)*2000)return s;
 const [ko,zh]=b.replies[n];
 const d=appendStoryDelivery(s,{app:"kakao",conversationId:"chat-jeongwoo",sender:"朴炡禹",lines:[{id:"scene11-"+b.id+"-"+(n+1),ko,zh}],delivered:0,blocked:false},s.date??"2026-10-23",s.time).runtime;
 return {...d,variables:{...d.variables,ep01Scene11Delivered:n+1,ep01Scene11Finished:n+1===b.replies.length}};
}
export function scene10Choices(s:Runtime){
 if(s.workId!=="unpublished-lover-ep01"||s.variables.ep01Scene10Finished!==true||s.variables.ep01Scene11Branch)return [];
 return branches.map(b=>({target:"ep01-scene10-"+b.id,label:b.player.join("\n")}));
}
export function sendScene10Choice(s:Runtime,target:string):Runtime{
 const b=branches.find(x=>"ep01-scene10-"+x.id===target);
 if(!b||!scene10Choices(s).some(x=>x.target===target))return s;
 return {...s,variables:{...s.variables,ep01Scene11Branch:b.id,ep01Scene11StartedAt:s.elapsedMs??0,ep01Scene11Delivered:0}};
}
