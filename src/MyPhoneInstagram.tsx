import { useState } from "react";
import type { Item } from "./schema";
import "./my-phone-instagram.css";

export function MyPhoneInstagram({ items, readIds, onRead, onBack }: {
  items: Item[];
  readIds: string[];
  onRead: (id: string) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"profile" | "requests">("profile");
  const [opened, setOpened] = useState<Item | null>(null);
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const requests = items.filter((item) => item.id.startsWith("ig-dm-"));
  const posts = items.filter((item) => !item.id.startsWith("ig-dm-"));
  const unreadCount = requests.filter((item) => !readIds.includes(item.id)).length;
  const filteredRequests = requests.filter((item) => (!unreadOnly || !readIds.includes(item.id)) && `${item.sender} ${item.body}`.toLowerCase().includes(search.toLowerCase()));
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
        <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>消息请求 {unreadCount ? <b>{unreadCount}</b> : null}</button>
      </nav>
      {tab === "requests" ? <section className="myphone-ig-requests">
        <p>消息请求 · Message requests</p>
        <div className="myphone-ig-filter"><input aria-label="搜索私信" placeholder="搜索消息或账号" value={search} onChange={(e) => setSearch(e.target.value)} /><button className={unreadOnly ? "active" : ""} onClick={() => setUnreadOnly((v) => !v)}>{unreadOnly ? "显示全部" : "仅看未读"}</button></div>
        {filteredRequests.length === 0 && <p className="myphone-ig-empty">没有符合条件的消息</p>}
        {filteredRequests.map((item) => <button key={item.id} className={`myphone-ig-request ${readIds.includes(item.id) ? "is-read" : "is-unread"}`} onClick={() => { setOpened(item); onRead(item.id); if (item.id !== "ig-dm-001") onRead("ig-dm-001"); }}>
          <span className="myphone-ig-avatar">{item.sender.slice(1, 2).toUpperCase()}</span>
          <span><strong>{item.sender}</strong><small>{item.body.split("\n")[0]}</small></span>
          <time>{!readIds.includes(item.id) && <i className="myphone-ig-unread-dot" aria-label="未读" />}{item.time.slice(-5)}</time>
        </button>)}
      </section> : <section className="myphone-ig-profile">
        <div className="myphone-ig-avatar large">안</div>
        <h3>안안</h3>
        <p>Personal account · 개인 계정</p>
        <div className="myphone-ig-posts">{posts.map((item) => <article key={item.id}>
          <strong>{item.sender}</strong><p>{item.body}</p>
        </article>)}</div>
        {requests.length > 0 && <button className="myphone-ig-view-requests" onClick={() => setTab("requests")}>查看 {requests.length} 条消息请求 · {unreadCount} 条未读</button>}
      </section>}
    </>}
  </div>;
}
