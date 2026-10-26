import { useEffect, useRef, useState } from "react";
import type { Item } from "./schema";
import "./my-phone-kakao.css";

type Reply = { id: string; ko: string; zh: string };
const REPLIES: Record<number, Reply[]> = {
  2: [
    { id: "stage2-where", ko: "오빠 지금 어디야?", zh: "欧巴现在在哪里？" },
    { id: "stage2-photo", ko: "오빠, 인터넷에 올라온 사진 봤어?", zh: "欧巴看到网上的照片了吗？" },
    { id: "stage2-lie", ko: "오빠 나한테 거짓말한 거야?", zh: "欧巴骗我了吗？" },
  ],
  3: [
    { id: "stage3-dorm", ko: "왜 숙소라고 했어?", zh: "为什么说自己在宿舍？" },
    { id: "stage3-actress", ko: "한서윤 선배랑 무슨 사이야?", zh: "你和韩瑞允前辈是什么关系？" },
    { id: "stage3-explain", ko: "나한테 할 말 없어?", zh: "你就没有什么话要说吗？" },
  ],
  4: [
    { id: "stage4-stop", ko: "나 지금 오빠 말 듣고 싶지 않아.", zh: "我现在不想听欧巴说话。" },
  ],
  6: [
    { id: "stage6-name", ko: "박정우. 나한테 할 말 없어?", zh: "朴炡禹。你就没有什么话要跟我说吗？" },
    { id: "stage6-members", ko: "오빠, 왜 다른 사람들한테까지 연락했어? 나한테 직접 말하면 되잖아.", zh: "欧巴，为什么连其他人都联系了？直接跟我说不就好了。" },
    { id: "stage6-tired", ko: "오빠, 나 진짜 너무 지쳤어. 우리 거의 3년이나 만났는데 아직도 숨어서 만나야 하고... 이제는 이런 일까지 생기잖아.", zh: "欧巴，我真的太累了。我们交往快3年，却还得偷偷见面……现在又发生这种事。" },
  ],
  7: [
    { id: "stage7-where", ko: "오늘 어디 있었는지 솔직하게 말해 줘.", zh: "如实告诉我今天在哪里。" },
    { id: "stage7-explain", ko: "제대로 설명해 줘...", zh: "好好解释给我听……" },
    { id: "stage7-truth", ko: "나한테 숨기는 거 없이 얘기해.", zh: "不要再瞒着我了。" },
  ],
  8: [
    { id: "stage8-tired", ko: "오빠, 나 이제 진짜 지쳤어...", zh: "欧巴，我现在真的累了……" },
    { id: "stage8-lie", ko: "근데 왜 나한테까지 거짓말했어?", zh: "可是你为什么连我也要骗？" },
    { id: "stage8-trust", ko: "오빠, 나 이제 오빠 말을 어떻게 믿어...?", zh: "欧巴，我现在到底要怎么相信你……？" },
  ],
  9: [
    { id: "stage9-sleep", ko: "나 오늘 너무 피곤해... 이제 그만 얘기하고 잘래.", zh: "我今天真的太累了……就聊到这里吧，我要睡了。" },
    { id: "stage9-breakup", ko: "오빠... 나 이제 우리 관계를 더는 이어 갈 자신이 없어. 우리 헤어지자.", zh: "欧巴……我已经没有信心继续维持这段关系了。我们分手吧。" },
    { id: "stage9-stop", ko: "나 이제 오빠 말 듣고 싶지 않아. 더 이상 연락하지 마.", zh: "我现在不想再听欧巴说话了。不要再联系我了。" },
  ],

  14: [
    { id: "stage14-angry", ko: "오빠 미쳤어??? 오빠 아이돌이잖아!!! 어떻게 연애를 마음대로 공개해???", zh: "欧巴你疯了吗？你可是爱豆啊！怎么能擅自公开恋爱？" },
    { id: "stage14-shock", ko: "오빠... 나 진짜 너무 놀랐어... 어떻게 그렇게 바로 공개할 생각을 했어...?", zh: "欧巴……我真的吓了一大跳……你怎么敢直接公开了？" },
    { id: "stage14-love", ko: "아니 오빠 잠깐만ㅠㅠ 나 진짜 헤어지려고 한 건 아니었어... 그냥 너무 속상해서 그런 말이 나온 거야ㅠㅠ 나도 지금 무슨 말을 해야 할지 모르겠어...", zh: "不是欧巴等一下ㅠㅠ 我真的没打算分手……只是太委屈才说那种话ㅠㅠ" },
  ],
  15: [
    { id: "stage15-promise", ko: "오빠... 나도 아직 오빠 많이 사랑해ㅠㅠ 우리 헤어지지 말자... 대신 앞으로는 나한테 거짓말하지 마. 알겠지?", zh: "欧巴……我也还是很爱你ㅠㅠ 我们不要分手了……但以后不许再骗我了。" },
    { id: "stage15-miss", ko: "바보야ㅠㅠ 누가 진짜 헤어지재... 나 그냥 너무 속상했단 말이야ㅠㅠ 오빠 보고 싶어...", zh: "笨蛋ㅠㅠ 谁真的要跟你分手了……我只是太委屈了嘛ㅠㅠ 好想欧巴……" },
    { id: "stage15-honest", ko: "오빠, 나 아직 우리 관계를 포기하고 싶지 않아. 우리 다시 잘해 보자... 앞으로는 서로 숨기는 거 없이 솔직하게 얘기하자.", zh: "欧巴，我还不想放弃我们的关系。我们重新好好在一起吧……以后彼此坦诚，好不好？" },
  ],};

export function MyPhoneKakao({
  title, items, onRead, onSend, onBack, stage, canReply,
}: {
  title: string;
  items: Item[];
  onRead: (id: string) => void;
  onSend: (id: string, text: string, title: string) => void;
  onBack: () => void;
  stage: number;
  canReply: boolean;
}) {
  const [picker, setPicker] = useState(false);
  const [draft, setDraft] = useState<Reply | null>(null);
  const messages = items.filter((item) => item.title === title);
  const knownIds = useRef<Set<string>>(new Set(messages.map((item) => item.id)));
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set(messages.map((item) => item.id)));
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stayAtBottom, setStayAtBottom] = useState(true);
  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => pendingTimers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const incoming = messages.filter((item) => !knownIds.current.has(item.id));
    incoming.forEach((item) => knownIds.current.add(item.id));
    if (!incoming.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const incomingOnly = incoming.filter((item) => !item.outgoing);
    // Incoming bubbles begin after 3 seconds, then appear one per second.
    // Player-sent bubbles appear immediately and never cancel the typing cue.
    incoming.forEach((item) => {
      if (item.outgoing) {
        timers.push(setTimeout(() => setRevealed((prev) => new Set([...prev, item.id])), 0));
      }
    });
    if (incomingOnly.length) {
      timers.push(setTimeout(() => setTyping(true), 1000));
      incomingOnly.forEach((item, index) => {
        timers.push(setTimeout(() => {
          setRevealed((prev) => new Set([...prev, item.id]));
          if (index === incomingOnly.length - 1) setTyping(false);
        }, 3000 + index * 1000));
      });
    }
    pendingTimers.current.push(...timers);
  }, [items, title]);

  const visibleMessages = messages.filter((item) => revealed.has(item.id));
  useEffect(() => {
    if (stayAtBottom && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleMessages.length, typing, stayAtBottom]);
  const options = REPLIES[stage] ?? [];
  const enabled = canReply && options.length > 0;
  const selected = draft && options.some((o) => o.id === draft.id) ? draft : null;
  return (
    <div className="chat-content my-phone-kakao" ref={scrollRef} onScroll={(e) => { const el = e.currentTarget; setStayAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 90); }} aria-label={title + " 聊天"}>
      {visibleMessages.map((item, index) => (
        <div className="my-phone-message-block" key={item.id}>
          {(index === 0 || visibleMessages[index - 1].time.slice(0, 10) !== item.time.slice(0, 10)) && <div className="chat-time">{/^\d{4}-\d{2}-\d{2}$/.test(item.time.slice(0, 10)) ? item.time.slice(0, 10) : "今天"}</div>}
        <button
          className={`message-row ${item.outgoing ? "outgoing" : ""}`}
          onClick={() => onRead(item.id)}
        >
          {!item.outgoing && <span className="avatar">{item.sender.slice(0, 1)}</span>}
          <span className="my-phone-bubble-wrap">
            {!item.outgoing && <strong className="my-phone-sender">{item.sender}</strong>}
            <span className="bubble">
              {item.body.split("\n").map((line, index) => (
                <span key={index} className={index === 0 ? "my-phone-ko" : "my-phone-zh"}>{line}</span>
              ))}
            </span>
            <small className="my-phone-timestamp">{item.time.slice(-5)}</small>
          </span>
        </button>
        </div>
      ))}
      {typing && (
        <div aria-live="polite" style={{ padding: "8px 14px", opacity: 0.65, fontSize: 12 }}>
          입력 중... · 正在输入…
        </div>
      )}
      {enabled && (
        <div className="my-phone-reply" style={{ padding: 12, marginTop: "auto" }}>
          {picker && (
            <div role="group" aria-label="选择回复">
              {options.map((option) => (
                <button key={option.id} type="button"
                  onClick={() => { setDraft(option); setPicker(false); }}
                  style={{ display: "block", width: "100%", padding: 10, textAlign: "left" }}>
                  {option.ko}<small style={{ display: "block" }}>{option.zh}</small>
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" aria-label="选择回复内容"
              onClick={() => setPicker((v) => !v)}
              style={{ flex: 1, padding: 10, textAlign: "left" }}>
              {selected ? selected.ko : "点击输入框选择回复"}
            </button>
            <button type="button" disabled={!selected} aria-label="发送消息"
              onClick={() => {
                if (!selected) return;
                onSend(selected.id, selected.ko + "\n" + selected.zh, title);
                setDraft(null);
                setPicker(false);
              }}>发送</button>
          </div>
        </div>
      )}
      <button type="button" onClick={onBack} aria-label="返回聊天列表">返回聊天列表</button>
    </div>
  );
}
