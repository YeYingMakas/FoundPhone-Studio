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
