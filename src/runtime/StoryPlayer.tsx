import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";
function StoryPlayer() {
  const [work, setWork] = useState<Work | null>(null),
    [playerName, setPlayerName] = useState(""),
    [birthYear, setBirthYear] = useState(""),
    [profileConfirmed, setProfileConfirmed] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    fetch(
      new URLSearchParams(location.search).get("preview") === "test"
        ? "./test-work.json"
        : new URLSearchParams(location.search).get("template") === "blank"
          ? "./blank-work.json"
          : "./work.json",
      { signal: abort.signal },
    )
      .then((r) => {
        if (!r.ok) throw Error("缺少作品文件，请运行 npm run story:build");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title =
          w.title === "捡手机" ? "捡手机" : w.title + " · 捡手机";
        setWork(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);
  useEffect(() => {
    if (work?.id !== "unpublished-lover-ep01") return;
    try {
      const saved = window.localStorage.getItem("unpublished-lover-ep01:profile");
      if (!saved) return;
      const profile: unknown = JSON.parse(saved);
      if (!profile || typeof profile !== "object") return;
      const data = profile as Record<string, unknown>;
      if (typeof data.name !== "string" || typeof data.year !== "string") return;
      if (!data.name.trim() || !/^(19|20)[0-9]{2}$/.test(data.year) || Number(data.year) > 2026) return;
      setPlayerName(data.name);
      setBirthYear(data.year);
      setProfileConfirmed(true);
    } catch {
      // Browser storage can be unavailable; the form remains usable.
    }
  }, [work?.id]);
  const needsProfile = work?.id === "unpublished-lover-ep01" && !profileConfirmed;
  const yearValid = /^(19|20)\d{2}$/.test(birthYear) && Number(birthYear) <= 2026;
  const canEnter = playerName.trim().length > 0 && yearValid;
  if (needsProfile) {
    return (
      <main className="story-runtime">
        <form
          className="ep01-profile"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canEnter) return;
            try {
              window.localStorage.setItem("unpublished-lover-ep01:profile", JSON.stringify({ name: playerName.trim(), year: birthYear }));
            } catch {
              // Continue in this session even when storage is unavailable.
            }
            setProfileConfirmed(true);
          }}
        >
          <h1>iPhone16pro Max</h1>
          <p>请输入玩家资料，随后进入手机锁屏。</p>
          <label>姓名
            <input autoComplete="off" maxLength={30} value={playerName} onChange={(e) => setPlayerName(e.target.value)} required />
          </label>
          <label>出生年份
            <input inputMode="numeric" pattern="(19|20)[0-9]{2}" maxLength={4} placeholder="例如 2005" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} required />
          </label>
          <button type="submit" disabled={!canEnter}>进入手机</button>
        </form>
      </main>
    );
  }
  return (
    <main className="story-runtime">
      {work ? (
        <Phone work={work.id === "unpublished-lover-ep01" ? { ...work, phone: { ...work.phone, owner: playerName.trim() }, variables: { ...work.variables, playerName: playerName.trim(), birthYear: Number(birthYear) } } : work} />
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
