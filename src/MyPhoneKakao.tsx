import { useState } from "react";
import type { Item } from "./schema";

const FIRST_REPLIES = [
  { id: "where", ko: "오빠 지금 어디야?", zh: "欧巴你现在在哪里？" },
  { id: "photo", ko: "오빠, 인터넷에 올라온 사진 봤어?", zh: "欧巴看到网上的照片了吗？" },
  { id: "lie", ko: "오빠 나한테 거짓말한 거야?", zh: "欧巴骗我了吗？" },
];

export function MyPhoneKakao({
  title, items, onRead, onSend, onBack, canReply,
}: {
  title: string;
  items: Item[];
  onRead: (id: string) => void;
  onSend: (id: string, text: string, title: string) => void;
  onBack: () => void;
  canReply: boolean;
}) {
  const [picker, setPicker] = useState(false);
  const [draft, setDraft] = useState<(typeof FIRST_REPLIES)[number] | null>(null);
  const messages = items.filter((item) => item.title === title);
  const [readIds, setReadIds] = useState<string[]>([]);
  return (
    <div className="chat-content" aria-label={title + " 聊天"}>
      <div className="chat-time">今天</div>
      {messages.map((item) => (
        <button
          key={item.id}
          className={`message-row ${item.outgoing ? "outgoing" : ""}`}
          onClick={() => { onRead(item.id); setReadIds((v) => v.includes(item.id) ? v : [...v, item.id]); }}
        >
          <span className="avatar">{item.sender.slice(0, 1)}</span>
          <span className="bubble" style={{ whiteSpace: "pre-line" }}>
            {item.body}
            <small>{item.time.slice(-5)}</small>
          </span>
        </button>
      ))}
      {canReply && (
        <div className="my-phone-reply" style={{ padding: 12, marginTop: "auto" }}>
          {picker && (
            <div role="group" aria-label="选择回复">
              {FIRST_REPLIES.map((option) => (
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
              {draft ? draft.ko : "点击输入框选择回复"}
            </button>
            <button type="button" disabled={!draft} aria-label="发送消息"
              onClick={() => {
                if (!draft) return;
                onSend(draft.id, draft.ko + "\n" + draft.zh, title);
                setDraft(null);
                setPicker(false);
              }}>发送</button>
          </div>
        </div>
      )}

    </div>
  );
}
