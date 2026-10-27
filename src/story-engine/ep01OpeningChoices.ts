import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

// Approved first-round A/B/C choices and replies.
const branches=[
 {id:"A",player:["나도 보고 싶어ㅠㅠ 오늘 많이 힘들었어?","我也想你ㅠㅠ 今天很累吗？"],replies:[["응ㅠㅠ 오늘 진짜 정신없었어","嗯ㅠㅠ 今天真的忙得晕头转向"],["그래도 이제 숙소 돌아와서 좀 쉬려고 ㅎㅎ","不过现在已经回宿舍了，准备休息一下ㅎㅎ"],["자기랑 조금만 더 얘기하다 잘래","想再和宝宝聊一会儿再睡"],["자기는 뭐 하고 있었어?","宝宝刚才在干嘛呀？"]]},
 {id:"B",player:["오빠 지금 진짜 숙소야?","欧巴，你现在真的在宿舍吗？"],replies:[["응? ㅋㅋㅋ","嗯？ㅋㅋㅋ"],["응 숙소지 왜?","嗯，在宿舍啊，怎么啦？"],["자기 무슨 일 있어?","宝宝，发生什么事了吗？"]]},
 {id:"C",player:["오빠 어디야?","欧巴，你在哪儿？"],replies:[["응? 나 숙소지 ㅎㅎ","嗯？我在宿舍呀ㅎㅎ"],["왜애","怎么啦——"],["자기 나 보러 오려고?ㅋㅋㅋ","宝宝是想过来看我吗？ㅋㅋㅋ"]]}
] as const;
export function ep01OpeningChoices(s:Runtime){
 if(s.workId!=="unpublished-lover-ep01"||s.variables.ep01OpeningFinished!==true||s.variables.ep01OpeningChoiceSent===true)return [];
 return branches.map(b=>({target:"ep01-opening-choice-"+b.id,label:b.player.join("\n")}));
}
export function sendEp01OpeningChoice(s:Runtime,target:string):Runtime{
 const b=branches.find(b=>"ep01-opening-choice-"+b.id===target);
 if(!b||!ep01OpeningChoices(s).some(x=>x.target===target))return s;
 return {...s,variables:{...s.variables,ep01OpeningChoiceSent:true,ep01OpeningChoiceIndex:b.id,ep01OpeningReplyStartedAt:s.elapsedMs??0,ep01OpeningReplyDelivered:0}};
}
export function advanceEp01OpeningChoice(s:Runtime):Runtime{
 const b=branches.find(b=>b.id===s.variables.ep01OpeningChoiceIndex);
 if(!b||s.variables.ep01OpeningReplyFinished===true)return s;
 const n=Number(s.variables.ep01OpeningReplyDelivered??0),started=s.variables.ep01OpeningReplyStartedAt;
 if(typeof started!=="number"||(s.elapsedMs??0)<started+(n+1)*2000)return s;
 const [ko,zh]=b.replies[n];
 const d=appendStoryDelivery(s,{app:"kakao",conversationId:"chat-jeongwoo",sender:"朴炡禹",lines:[{id:"opening-choice-reply-"+b.id+"-"+(n+1),ko,zh}],delivered:0,blocked:false},s.date??"2026-10-23",s.time).runtime;
 return {...d,variables:{...d.variables,ep01OpeningReplyDelivered:n+1,ep01OpeningReplyFinished:n+1===b.replies.length}};
}
