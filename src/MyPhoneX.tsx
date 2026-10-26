import { useState } from "react";
import type { Item } from "./schema";
import "./my-phone-x.css";

export function MyPhoneX({ items, readIds, onRead, onBack }: {
  items: Item[];
  readIds: string[];
  onRead: (id: string) => void;
  onBack: () => void;
}) {
  const [opened, setOpened] = useState<Item | null>(null);
  return <div className="myphone-x">
    <header className="myphone-x-header">
      <button onClick={opened ? () => setOpened(null) : onBack} aria-label="返回">‹</button>
      <strong>{opened ? "帖子" : "X"}</strong><span>✦</span>
    </header>
    {opened ? <article className="myphone-x-detail">
      <div className="myphone-x-author"><span className="myphone-x-avatar">{opened.sender.slice(1, 2).toUpperCase()}</span><span><strong>{opened.sender}</strong><small>{opened.time.slice(-5)} · X</small></span></div>
      <div className="myphone-x-post-text">{opened.body.includes("—— 中文翻译 ——") ? <><section lang="ko">{opened.body.split("—— 中文翻译 ——")[0].trim().split("\n").map((line, i) => <p key={i}>{line || "\u00a0"}</p>)}</section><section className="myphone-x-translation" lang="zh"><h3>中文翻译</h3>{opened.body.split("—— 中文翻译 ——")[1].trim().split("\n").map((line, i) => <p key={i}>{line || "\u00a0"}</p>)}</section></> : opened.body.split("\n").map((line, i) => <p key={i}>{line || "\u00a0"}</p>)}</div>
      <footer>♡　↻　▢　↗</footer>
    </article> : <section className="myphone-x-feed">
      <p className="myphone-x-feed-label">为你推荐 · For you</p>
      {[...items].sort((a, b) => a.id === "x-jeongwoo-public" ? -1 : b.id === "x-jeongwoo-public" ? 1 : 0).map(item =>
        <button key={item.id} className="myphone-x-post" onClick={() => { setOpened(item); onRead(item.id); }}>
          <span className="myphone-x-avatar">{item.sender.slice(1, 2).toUpperCase()}</span>
          <span className="myphone-x-preview"><strong>{item.sender}</strong><small>{item.time.slice(-5)}</small><b>{item.title}{item.id === "x-jeongwoo-public" && <span className="myphone-x-pinned">公开声明</span>}{!readIds.includes(item.id) && <span className="myphone-x-new">未读</span>}</b><span>{item.body.slice(0, 160)}{item.body.length > 160 ? "…" : ""}</span><em>♡　↻　▢　↗</em></span>
        </button>
      )}
    </section>}
  </div>;
}
