import { useState } from "react";
import type { Item } from "./schema";
import "./my-phone-instagram.css";

export function MyPhoneInstagram({ items, onRead, onBack }: {
  items: Item[];
  onRead: (id: string) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"profile" | "requests">("profile");
  const [opened, setOpened] = useState<Item | null>(null);
  const requests = items.filter((item) => item.id.startsWith("ig-dm-"));
  const posts = items.filter((item) => !item.id.startsWith("ig-dm-"));
  return <div className="myphone-instagram">
    <header className="myphone-ig-header">
      <button onClick={opened ? () => setOpened(null) : onBack} aria-label="返回">‹</button>
      <strong>{opened ? opened.sender : "Instagram"}</strong>
      <span>◎</span>
    </header>
    {opened ? <section className="myphone-ig-opened">
      <div className="myphone-ig-avatar">{opened.sender.slice(1, 2).toUpperCase()}</div>
      <strong>{opened.sender}</strong>
      <div className="myphone-ig-dm-bubble">{opened.body.split("\n").map((line, i) => <span key={i}>{line}</span>)}</div>
      <small>消息请求 · 仅供故事体验</small>
    </section> : <>
      <nav className="myphone-ig-tabs">
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>主页</button>
        <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>消息请求 {requests.length ? <b>{requests.length}</b> : null}</button>
      </nav>
      {tab === "requests" ? <section className="myphone-ig-requests">
        <p>消息请求 · Message requests</p>
        {requests.map((item) => <button key={item.id} className="myphone-ig-request" onClick={() => { setOpened(item); onRead(item.id); }}>
          <span className="myphone-ig-avatar">{item.sender.slice(1, 2).toUpperCase()}</span>
          <span><strong>{item.sender}</strong><small>{item.body.split("\n")[0]}</small></span>
          <time>{item.time.slice(-5)}</time>
        </button>)}
      </section> : <section className="myphone-ig-profile">
        <div className="myphone-ig-avatar large">안</div>
        <h3>안안</h3>
        <p>Personal account · 개인 계정</p>
        <div className="myphone-ig-posts">{posts.map((item) => <article key={item.id}>
          <strong>{item.sender}</strong><p>{item.body}</p>
        </article>)}</div>
        {requests.length > 0 && <button className="myphone-ig-view-requests" onClick={() => setTab("requests")}>查看 {requests.length} 条消息请求</button>}
      </section>}
    </>}
  </div>;
}
