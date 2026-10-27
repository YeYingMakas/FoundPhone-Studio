import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

// Approved best-friend KKT exchange after round-two final Jeongwoo reply.
const branches=[
 {id:"A",player:["왜...? 너도 뭐 봤어?","怎么了……？你也看到什么了吗？"],replies:[["너도 봤어?","你也看到了？"],["아 진짜 박정우 이 새끼 뭐 하는 거야","啊真是的，朴炡禹这混蛋到底在干什么"],["안안아 빨리 실검 봐","安安啊，快去看热搜"]]},
 {id:"B",player:["나 지금 좀 불안한데... 무슨 일인데?","我现在有点不安……到底出什么事了？"],replies:[["아 씨...","啊西……"],["박정우 진짜 미친 거 아니야?","朴炡禹真的疯了吗？"],["일단 빨리 실검부터 봐","你先赶紧去看热搜"]]},
 {id:"C",player:["혹시 정우 오빠 때문에 그래...?","难道是因为炡禹欧巴……？"],replies:[["응...","嗯……"],["야 나 진짜 너무 화나","呀，我真的气死了"],["박정우 진짜 뭐 하는 새끼야?","朴炡禹这混蛋到底在干什么？"],["너 지금 빨리 실검 봐","你现在快去看热搜"]]}
] as const;
function deliver(s:Runtime,id:string,ko:string,zh:string):Runtime{
 return appendStoryDelivery(s,{app:"kakao",conversationId:"chat-friend",sender:"闺蜜",lines:[{id,ko,zh}],delivered:0,blocked:false},s.date??"2026-10-23",s.time).runtime;
}
export function advanceEp01BestFriend(s:Runtime):Runtime{
 if(s.workId!=="unpublished-lover-ep01"||s.variables.ep01SecondReplyFinished!==true)return s;
 const now=s.elapsedMs??0;
 if(s.variables.ep01FriendPromptDelivered!==true){
  const t=s.variables.ep01SecondReplyFinishedAt;
  if(typeof t!=="number"||now<t+2000)return s;
  const d=deliver(s,"ep01-friend-prompt","안안아 너 괜찮아?","安安啊，你还好吗？");
  return {...d,variables:{...d.variables,ep01FriendPromptDelivered:true}};
 }
 const b=branches.find(x=>x.id===s.variables.ep01FriendBranch);
 if(!b||s.variables.ep01FriendFinished===true)return s;
 const n=Number(s.variables.ep01FriendReplyDelivered??0),start=s.variables.ep01FriendReplyStartedAt;
 if(typeof start!=="number"||now<start+(n+1)*2000)return s;
 const [ko,zh]=b.replies[n];
 const d=deliver(s,"ep01-friend-"+b.id+"-"+(n+1),ko,zh);
 return {...d,variables:{...d.variables,ep01FriendReplyDelivered:n+1,ep01FriendFinished:n+1===b.replies.length,ep01XUnlocked:n+1===b.replies.length}};
}
export function ep01BestFriendChoices(s:Runtime){
 if(s.workId!=="unpublished-lover-ep01"||s.variables.ep01FriendPromptDelivered!==true||s.variables.ep01FriendBranch)return [];
 return branches.map(b=>({target:"ep01-friend-"+b.id,label:b.player.join("\n")}));
}
export function sendEp01BestFriendChoice(s:Runtime,target:string):Runtime{
 const b=branches.find(b=>"ep01-friend-"+b.id===target);
 if(!b||!ep01BestFriendChoices(s).some(x=>x.target===target))return s;
 return {...s,variables:{...s.variables,ep01FriendBranch:b.id,ep01FriendReplyStartedAt:s.elapsedMs??0,ep01FriendReplyDelivered:0}};
}
