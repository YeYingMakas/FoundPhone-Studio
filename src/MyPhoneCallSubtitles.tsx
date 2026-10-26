import { useEffect, useRef, useState } from "react";

const FIRST: [string, string][] = [
  ["자기야... 여보세요?ㅠㅠ", "亲爱的……喂？ㅠㅠ"],
  ["사진 봤지...? 나 진짜 설명하고 싶어", "你看到照片了吧……？我真的想解释。"],
  ["나 진짜 바람피운 거 아니야...", "我真的没有出轨……"],
  ["숙소에 있다고 거짓말한 건 미안해", "对不起，我骗你说我在宿舍。"],
  ["자기야 내 말 좀 들어 줄래?ㅠㅠ", "亲爱的，能不能听我解释？ㅠㅠ"],
];
const SECOND: [string, string][] = [
  ["자기야... 여보세요?ㅠㅠ", "亲爱的……喂？ㅠㅠ"],
  ["아... 받아 줬다. 고마워ㅠㅠ", "啊……你接了。谢谢你ㅠㅠ"],
  ["미안해... 피곤하다고 했는데 전화까지 해서", "对不起……你都说累了，我还打电话。"],
  ["근데 나 너무 불안해서... 그냥 못 자겠어", "可是我太不安了……根本睡不着。"],
  ["자기야... 내일 일어나도 나 사랑해 줄 거지...?ㅠㅠ", "亲爱的……明天醒来，你还会爱我吧……？ㅠㅠ"],
  ["나 버리지 마... 제발ㅠㅠ", "不要抛下我……求你了ㅠㅠ"],
];

export function MyPhoneCallSubtitles({ second }: { second: boolean }) {
  const lines = second ? SECOND : FIRST;
  const [shown, setShown] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [shown]);
  useEffect(() => {
    setShown(0);
    let nextLine = 0;
    const timer = window.setInterval(() => {
      nextLine += 1;
      setShown(nextLine);
      if (nextLine >= lines.length) window.clearInterval(timer);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [second, lines.length]);
  return (
    <div ref={transcriptRef} role="log" aria-live="polite" aria-label="通话实时字幕" style={{ maxHeight: 210, overflowY: "auto", padding: "12px 20px", width: "100%", textAlign: "left" }}>
      {shown === 0 && <p style={{ opacity: .7 }}>연결 중... · 正在接通……</p>}
      {lines.slice(0, shown).map(([ko, zh], i) => (
        <p key={i} style={{ marginBottom: 10, lineHeight: 1.45 }}>
          <span style={{ display: "block" }}>{ko}</span>
          <small style={{ display: "block", opacity: .75 }}>{zh}</small>
        </p>
      ))}
    </div>
  );
}
