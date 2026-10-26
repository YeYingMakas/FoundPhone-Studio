import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
import { ep01CallBranches } from "./ep01CallDialogue";

const rejectionLines = [
  ["자기야 전화 좀 받아 줘ㅠㅠ", "宝宝，接一下电话嘛ㅠㅠ"],
  ["제발 한 번만 내 얘기 들어 줘...", "拜托了，就听我解释一次……"],
  ["자기야 나 진짜 미안해... 전화 좀 받아 줘 제발ㅠㅠ", "宝宝，我真的对不起你……拜托接一下电话吧ㅠㅠ"],
] as const;
export function advanceScene14Call(s:Runtime):Runtime {
 if(s.workId!=="unpublished-lover-ep01"||s.variables.ep01Scene14Answered===true||s.variables.ep01Scene14Ended===true)return s;
 if(s.variables.ep01Scene14Ringing===true)return s;
 const due=s.variables.ep01Scene14RetryDueAt;
 if(typeof due==="number" && due>=0 && (s.elapsedMs??0)>=due)
  return {...s,variables:{...s.variables,ep01Scene14Ringing:true,ep01Scene14RetryDueAt:-1}};
 const finished=s.variables.ep01Scene13FinishedAt;
 if(s.variables.ep01Scene14Triggered!==true && typeof finished==="number" && (s.elapsedMs??0)>=finished+5000)
  return {...s,variables:{...s.variables,ep01Scene14Triggered:true,ep01Scene14Ringing:true}};
 return s;
}
export function rejectScene14Call(s:Runtime):Runtime {
 if(s.variables.ep01Scene14Ringing!==true)return s;
 const count=Number(s.variables.ep01Scene14RejectedCount??0)+1;
 const line=count<=3?rejectionLines[count-1]:undefined;
 const delivered=line?appendStoryDelivery(s,{app:"kakao",conversationId:"chat-jeongwoo",sender:"朴炡禹",lines:[{id:"scene14-reject-"+count,ko:line[0],zh:line[1]}],delivered:0,blocked:false},s.date??"2026-10-23",s.time).runtime:s;
 return {...delivered,variables:{...delivered.variables,ep01Scene14RejectedCount:count,ep01Scene14Ringing:false,ep01Scene14RetryDueAt:(s.elapsedMs??0)+3000}};
}
export function answerScene14Call(s:Runtime):Runtime {
 if(s.variables.ep01Scene14Ringing!==true)return s;
 return {...s,variables:{...s.variables,ep01Scene14Ringing:false,ep01Scene14Answered:true,ep01Scene14AnsweredAt:s.elapsedMs??0,ep01Scene14OpeningDelivered:0}};
}
export function advanceScene14Opening(s:Runtime):Runtime {
 if(s.variables.ep01Scene14Answered!==true || s.variables.ep01Scene14Branch || Number(s.variables.ep01Scene14OpeningDelivered??0)>=5)return s;
 const started=s.variables.ep01Scene14AnsweredAt;
 if(typeof started!=="number")return s;
 const n=Number(s.variables.ep01Scene14OpeningDelivered??0);
 if((s.elapsedMs??0)<started+(n+1)*2000)return s;
 return {...s,variables:{...s.variables,ep01Scene14OpeningDelivered:n+1}};
}
export function scene14CallChoices(s:Runtime){
 if(s.variables.ep01Scene14Answered!==true||s.variables.ep01Scene14Branch||Number(s.variables.ep01Scene14OpeningDelivered??0)<5)return [];
 return ep01CallBranches.map(b=>({target:"ep01-scene14-"+b.id,label:b.player.ko+"\n"+b.player.zh}));
}
export function sendScene14CallChoice(s:Runtime,target:string):Runtime {
 const b=ep01CallBranches.find(b=>"ep01-scene14-"+b.id===target);
 if(!b||!scene14CallChoices(s).some(x=>x.target===target))return s;
 return {...s,variables:{...s.variables,ep01Scene14Branch:b.id,ep01Scene14BranchStartedAt:s.elapsedMs??0,ep01Scene14Delivered:0}};
}
export function advanceScene14Replies(s:Runtime):Runtime {
 const b=ep01CallBranches.find(b=>b.id===s.variables.ep01Scene14Branch);
 if(!b||s.variables.ep01Scene14RepliesFinished===true)return s;
 const n=Number(s.variables.ep01Scene14Delivered??0),started=s.variables.ep01Scene14BranchStartedAt;
 if(typeof started!=="number"||(s.elapsedMs??0)<started+(n+1)*2000)return s;
 return {...s,variables:{...s.variables,ep01Scene14Delivered:n+1,ep01Scene14RepliesFinished:n+1===b.replies.length}};
}
