import { useState } from "react";
import type { Item } from "./schema";

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
};

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
  const options = REPLIES[stage] ?? [];
  const enabled = canReply && options.length > 0;
  const selected = draft && options.some((o) => o.id === draft.id) ? draft : null;
  return (
    <div className="chat-content" aria-label={title + " 聊天"}>
      <div className="chat-time">今天</div>
      {messages.map((item) => (
        <button
          key={item.id}
          className={`message-row ${item.outgoing ? "outgoing" : ""}`}
          onClick={() => onRead(item.id)}
        >
          <span className="avatar">{item.sender.slice(0, 1)}</span>
          <span className="bubble" style={{ whiteSpace: "pre-line" }}>
            {item.body}
            <small>{item.time.slice(-5)}</small>
          </span>
        </button>
      ))}
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
