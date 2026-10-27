import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

const routes = [
["A1","A","오빠 진짜 숙소에 있는 거 맞지?","欧巴，你真的在宿舍对吧？",[["응 자기야 나 숙소라니까ㅠㅠ","嗯宝宝，我都说了在宿舍嘛ㅠㅠ"],["아까부터 왜 자꾸 확인해애","怎么从刚才开始就一直确认呀——"],["나 씻으려고 누워서 쉬고 있었어ㅎㅎ","我正躺着休息，准备去洗澡呢ㅎㅎ"],["자기야 나 못 믿어?ㅠㅠ","宝宝，你不相信我吗？ㅠㅠ"]]],
["A2","A","오빠 지금 혼자 있어?","欧巴，你现在一个人吗？",[["응 혼자 있지ㅎㅎ","嗯，当然是一个人呀ㅎㅎ"],["숙소에서 쉬고 있다니까아","都说了在宿舍休息嘛——"],["왜애 자기야ㅋㅋ","怎么啦宝宝ㅋㅋ"],["혹시 나 보고 싶어서 그래?ㅠㅠ","是不是因为想我了才这样呀？ㅠㅠ"]]],
["A3","A","오빠 오늘 여자랑 같이 있었어?","欧巴，你今天和女生待在一起了吗？",[["...응?","……嗯？"],["갑자기 무슨 소리야","怎么突然这么说"],["자기야 왜 그런 걸 물어봐?","宝宝，你为什么问这个？"]]],
["B1","B","그럼 나한테 숨기는 것도 없어?","那你也没有什么事瞒着我吗？",[["자기야...","宝宝……"],["왜 자꾸 그렇게 물어봐ㅠㅠ","怎么一直这样问我ㅠㅠ"],["무슨 일인지 얘기해 주면 안 돼?","不能告诉我发生什么事了吗？"]]],
["B2","B","우리 3년이나 만났잖아. 나한테 솔직한 거 맞지?","我们都交往三年了。你真的有对我坦诚吗？",[["자기야 왜 그래...","宝宝，你怎么了……"],["갑자기 그렇게 말하니까 나 좀 무서워","突然这样说，我有点害怕"],["내가 뭘 잘못했는지 말해 줘ㅠㅠ","告诉我我做错什么了ㅠㅠ"]]],
["B3","B","내가 묻기 전에 오빠가 먼저 말해 줬으면 좋겠어.","我希望在我问出口之前，欧巴能自己告诉我。",[["자기야아ㅠㅠ","宝宝呀ㅠㅠ"],["왜 그래 진짜... 나 무서워ㅠㅠ","到底怎么了嘛……我害怕ㅠㅠ"],["내가 뭐 잘못했으면 말해 줘 응?","如果我做错了什么，告诉我好不好？"],["자기가 이렇게 말하니까 나 너무 불안해...","宝宝这样说，我真的好不安……"],["제발 나한테 말해 줘ㅠㅠ","拜托告诉我嘛ㅠㅠ"]]],
["C1","C","오빠는 내가 왜 기분이 안 좋은지 정말 몰라?","欧巴真的不知道我为什么心情不好吗？",[["자기야ㅠㅠ","宝宝ㅠㅠ"],["내가 뭐 잘못한 거야...?","是我做错什么了吗……？"],["그러면 말해 줘... 나 고칠게","那告诉我嘛……我会改的"]]],
["C2","C","오빠한테 마지막으로 물어볼게. 나한테 할 말 진짜 없어?","我最后再问欧巴一次，真的没有什么要告诉我的吗？",[["마지막이라니...?","什么叫最后一次……？"],["자기야 그렇게 말하지 마ㅠㅠ","宝宝，别这样说ㅠㅠ"],["나 지금 너무 불안해...","我现在真的很不安……"]]],
["C3","C","난 오빠 믿었는데...","我明明那么相信欧巴……",[["자기야 왜 그런 말 해ㅠㅠ","宝宝，为什么这样说ㅠㅠ"],["나한테 실망한 거야...?","你对我失望了吗……？"],["제발 무슨 일인지 말해 줘","拜托告诉我发生了什么事"]]]
] as const;
export function scene12Choices(s:Runtime) {
 const prev = s.variables.ep01Scene11Branch;
 if(s.workId!=="unpublished-lover-ep01" || !["A","B","C"].includes(String(prev)) || s.variables.ep01Scene11Finished!==true || s.variables.ep01Scene12Branch) return [];
 return routes.filter(r=>r[1]===prev).map(r=>({target:"ep01-scene12-"+r[0],label:r[2]+"\n"+r[3]}));
}
export function sendScene12Choice(s:Runtime,target:string):Runtime {
 const r=routes.find(r=>"ep01-scene12-"+r[0]===target);
 if(!r||!scene12Choices(s).some(c=>c.target===target))return s;
 return {...s,variables:{...s.variables,ep01Scene12Branch:r[0],ep01Scene12StartedAt:s.elapsedMs??0,ep01Scene12Delivered:0}};
}
export function advanceScene12(s:Runtime):Runtime {
 const r=routes.find(r=>r[0]===s.variables.ep01Scene12Branch);
 if(!r||s.variables.ep01Scene12Finished===true)return s;
 const n=Number(s.variables.ep01Scene12Delivered??0),started=s.variables.ep01Scene12StartedAt;
 if(typeof started!=="number"||(s.elapsedMs??0)<started+(n+1)*2000)return s;
 const [ko,zh]=r[4][n];
 const delivered=appendStoryDelivery(s,{app:"kakao",conversationId:"chat-jeongwoo",sender:"朴炡禹",lines:[{id:"scene12-"+r[0]+"-"+(n+1),ko,zh}],delivered:0,blocked:false},s.date??"2026-10-23",s.time).runtime;
 return {...delivered,variables:{...delivered.variables,ep01Scene12Delivered:n+1,ep01Scene12Finished:n+1===r[4].length}};
}
