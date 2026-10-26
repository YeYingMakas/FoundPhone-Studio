import { useState } from "react";
import "./player-profile.css";

export type PlayerProfile = { name: string; birthYear: number };
const KEY = "foundphone:iphone16-pro-max:player";

export function readPlayerProfile(): PlayerProfile | null {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if (typeof data?.name === "string" && data.name.trim() &&
      Number.isInteger(data.birthYear) && data.birthYear >= 1900 &&
      data.birthYear <= new Date().getFullYear()) return data;
  } catch { /* storage may be unavailable */ }
  return null;
}

export function PlayerSetup({ onComplete }: { onComplete: (profile: PlayerProfile) => void }) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const birthYear = Number(year);
    if (!name.trim()) return setError("请输入姓名");
    if (!/^\d{4}$/.test(year) || !Number.isInteger(birthYear) ||
        birthYear < 1900 || birthYear > new Date().getFullYear())
      return setError("请输入有效的四位出生年份");
    const profile = { name: name.trim().slice(0, 40), birthYear };
    try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch { /* private browsing */ }
    onComplete(profile);
  }
  return <section className="player-setup" aria-label="玩家信息">
    <form className="player-setup-card" onSubmit={submit}>
      <span className="player-setup-eyebrow">WELCOME TO</span>
      <h1>iPhone16 pro Max</h1>
      <p>在打开这部手机之前，请先填写你的信息。</p>
      <label htmlFor="player-name">姓名</label>
      <input id="player-name" autoComplete="nickname" maxLength={40}
        value={name} onChange={e => { setName(e.target.value); setError(""); }}
        placeholder="请输入你的姓名" required />
      <label htmlFor="player-year">出生年份</label>
      <input id="player-year" type="text" inputMode="numeric" autoComplete="bday-year"
        maxLength={4} value={year}
        onChange={e => { setYear(e.target.value.replace(/\D/g, "")); setError(""); }}
        placeholder="例如 2005" required />
      {error && <p className="player-setup-error" role="alert">{error}</p>}
      <button type="submit">继续 <span aria-hidden="true">→</span></button>
    </form>
  </section>;
}
