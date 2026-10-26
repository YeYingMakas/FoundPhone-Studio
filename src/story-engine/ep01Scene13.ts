import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";
const branches=[
{id:"A",player:["됐어. 오빠랑 더 얘기하고 싶지 않아.","算了，我不想再跟欧巴说下去了。"],replies:[["자기야 잠깐만ㅠㅠ","宝宝，等一下ㅠㅠ"],["왜 갑자기 그래...","怎么突然这样……"],["내가 뭐 잘못했으면 말해 줘","如果我做错了什么，你告诉我嘛"],["그냥 이렇게 끝내지 마ㅠㅠ","不要就这样结束聊天嘛ㅠㅠ"],["자기야 제발...","宝宝，拜托了……"]]},
{id:"B",player:["오빠 진짜 끝까지 이럴 거야? 내가 바보로 보여?","欧巴，你真的要一直这样下去吗？你觉得我是傻子吗？"],replies:[["자기야 왜 그래ㅠㅠ","宝宝，你怎么了ㅠㅠ"],["내가 뭘 그렇게 잘못했는데...","我到底做错什么了嘛……"],["갑자기 그렇게 화내면 나도 당황스럽잖아","你突然这么生气，我也会不知所措啊"],["일단 진정하고 얘기하자 응?","我们先冷静下来再说，好不好？"]]},
{id:"C",player:["오빠가 하는 말 이제 뭐가 진짜인지 모르겠어.","欧巴说的话，我现在已经不知道哪句是真的了。"],replies:[["...자기야","……宝宝"],["왜 그렇게까지 말해ㅠㅠ","为什么说到这种程度ㅠㅠ"],["나 진짜 속상해...","我真的很难过……"],["우리 3년이나 만났잖아","我们都交往三年了啊"],["나 좀 믿어 주면 안 돼...?","就不能再相信我一点吗……？"]]}
] as const;
export function scene13Choices(s:Runtime){
 if(s.workId!=="unpublished-lover-ep01"||s.variables.ep01Scene12Finished!==true||s.variables.ep01Scene13Branch)return [];
 return branches.map(b=>({target:"ep01-scene13-"+b.id,label:b.player.join("\n")}));
}
export function sendScene13Choice(s:Runtime,target:string):Runtime{
 const b=branches.find(b=>"ep01-scene13-"+b.id===target);
 if(!b||!scene13Choices(s).some(c=>c.target===target))return s;
 return {...s,variables:{...s.variables,ep01Scene13Branch:b.id,ep01Scene13StartedAt:s.elapsedMs??0,ep01Scene13Delivered:0}};
}
export function advanceScene13(s:Runtime):Runtime{
 const b=branches.find(b=>b.id===s.variables.ep01Scene13Branch);
 if(!b||s.variables.ep01Scene13Finished===true)return s;
 const n=Number(s.variables.ep01Scene13Delivered??0),started=s.variables.ep01Scene13StartedAt;
 if(typeof started!=="number"||(s.elapsedMs??0)<started+(n+1)*2000)return s;
 const [ko,zh]=b.replies[n];
 const delivered=appendStoryDelivery(s,{app:"kakao",conversationId:"chat-jeongwoo",sender:"朴炡禹",lines:[{id:"scene13-"+b.id+"-"+(n+1),ko,zh}],delivered:0,blocked:false},s.date??"2026-10-23",s.time).runtime;
 return {...delivered,variables:{...delivered.variables,ep01Scene13Delivered:n+1,ep01Scene13Finished:n+1===b.replies.length,...(n+1===b.replies.length?{ep01Scene13FinishedAt:s.elapsedMs??0}:{})}};
}
