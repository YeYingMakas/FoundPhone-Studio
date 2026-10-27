import type { Runtime } from "../schema";
import { appendStoryDelivery } from "./unpublishedLoverRuntime";

// Approved round two: shared three choices, replies depend on round-one A/B/C.
const choices=[
 ["오빠 얼굴 보고 싶은데 영상통화할까?ㅎㅎ","想看看欧巴的脸，要不要打视频呀？ㅎㅎ"],
 ["그럼 사진 하나 보내 줘ㅎㅎ","那给我发张照片嘛ㅎㅎ"],
 ["오빠 진짜 숙소에 있는 거 맞아?","欧巴，你真的在宿舍吗？"]
] as const;
const replies:Record<string,readonly (readonly [string,string])[]>={
 "A0":[["아 자기야ㅠㅠ","啊宝宝ㅠㅠ"],["나 지금 씻으려고 하는데","我现在正准备洗澡呢"],["씻고 나서 전화하자 응?❤️","洗完再打给你，好不好？❤️"]],
 "B0":[["지금?ㅎㅎ","现在？ㅎㅎ"],["나 지금 씻으려고 해서ㅠㅠ","我正准备洗澡呢ㅠㅠ"],["좀 이따 전화하면 안 돼?","晚一点再打不行吗？"]],
 "C0":[["영상통화?ㅋㅋㅋ","视频通话？ㅋㅋㅋ"],["자기야 나 지금 씻으려고ㅠㅠ","宝宝，我正准备洗澡呢ㅠㅠ"],["이따 내가 전화할게 응?","一会儿我打给你，好不好？"]],
 "A1":[["사진?ㅎㅎ","照片？ㅎㅎ"],["아 지금은 좀...ㅋㅋ","啊现在有点……ㅋㅋ"],["나중에 예쁘게 찍어서 보내 줄게ㅠㅠ","晚点拍张好看的发给你ㅠㅠ"]],
 "B1":[["갑자기 사진?ㅋㅋ","突然要照片？ㅋㅋ"],["나 지금 상태가 좀 그래서...","我现在状态有点……"],["내일 보내 주면 안 돼?ㅠㅠ","明天发给你不行吗？ㅠㅠ"]],
 "C1":[["어... 사진?","呃……照片？"],["지금은 좀 그런데ㅠㅠ","现在有点不方便ㅠㅠ"],["나중에 보내 줄게 자기야","晚点发给你，宝宝"]],
 "A2":[["응? 당연하지ㅎㅎ","嗯？当然啦ㅎㅎ"],["나 숙소라고 했잖아","不是说了我在宿舍嘛"],["왜애 자기야?","怎么啦宝宝？"]],
 "B2":[["응 숙소야","嗯，在宿舍"],["근데 왜 자꾸 확인해?ㅠㅠ","不过怎么一直确认呀？ㅠㅠ"],["무슨 일 있어?","发生什么事了吗？"]],
 "C2":[["응 맞아","嗯，没错"],["자기야 왜 그래?","宝宝，你怎么啦？"],["나 지금 누워서 쉬고 있어ㅎㅎ","我现在正躺着休息呢ㅎㅎ"]]
};
export function ep01SecondChoices(s:Runtime){
 if(s.workId!=="unpublished-lover-ep01"||s.variables.ep01OpeningReplyFinished!==true||s.variables.ep01SecondChoiceSent===true)return [];
 return choices.map(([ko,zh],i)=>({label:ko+"\n"+zh,target:"ep01-second-choice-"+i}));
}
export function sendEp01SecondChoice(s:Runtime,target:string):Runtime{
 if(!ep01SecondChoices(s).some(x=>x.target===target))return s;
 return {...s,variables:{...s.variables,ep01SecondChoiceSent:true,ep01SecondChoiceIndex:Number(target.slice(-1)),ep01SecondReplyStartedAt:s.elapsedMs??0,ep01SecondReplyDelivered:0}};
}
export function advanceEp01SecondChoice(s:Runtime):Runtime{
 const route=String(s.variables.ep01OpeningChoiceIndex??"")+String(s.variables.ep01SecondChoiceIndex??"");
 const lines=replies[route];
 if(!lines||s.variables.ep01SecondReplyFinished===true)return s;
 const n=Number(s.variables.ep01SecondReplyDelivered??0),start=s.variables.ep01SecondReplyStartedAt;
 if(typeof start!=="number"||(s.elapsedMs??0)<start+(n+1)*2000)return s;
 const [ko,zh]=lines[n];
 const d=appendStoryDelivery(s,{app:"kakao",conversationId:"chat-jeongwoo",sender:"朴炡禹",lines:[{id:"opening-second-reply-"+route+"-"+(n+1),ko,zh}],delivered:0,blocked:false},s.date??"2026-10-23",s.time).runtime;
 return {...d,variables:{...d.variables,ep01SecondReplyDelivered:n+1,ep01SecondReplyFinished:n+1===lines.length, ...(n+1===lines.length?{ep01SecondReplyFinishedAt:s.elapsedMs??0}:{})}};
}
