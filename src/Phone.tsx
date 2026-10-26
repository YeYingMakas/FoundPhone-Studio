import { StatusGlyph } from "./ios/StatusGlyph";
import { SocialDetail, socialDetailApps } from "./skins/SocialDetails";
import { NativeCalculator } from "./ios/Calculator";
import { HomeLauncher } from "./launcher/HomeLauncher";
import { useDeviceLayout } from "./launcher/layout";
import "./launcher/launcher.css";
import { NativeDetail, nativeDetailApps } from "./ios/Details";
import "./ios/details.css";
import {
  SystemNotifications,
  notificationContent,
} from "./SystemNotifications";
import {
  readLauncherOrigin,
  AppWindow,
  screenOrigin,
} from "./vendor/ios-web/Launcher";
import {
  DeviceLock,
  ControlCenter,
  DeviceKeyboard,
  KeyboardContext,
  NativeSettings,
} from "./DeviceSystem";
import { AppArtwork, hasNativeArtwork } from "./AppArtwork";
import { getFields } from "./fields";
import { catalogSkins } from "./skins/catalog";
import "./skins/skins.css";
import "./ios18.css";
import "./device-system.css";
import "./ios/tokens.css";
import "./ios/reference.css";
import "./ios/status-bar.css";
import { WeChatSkin, WhatsAppSkin } from "./AppSkins";
import { RichText } from "./RichText";
import {
  useEffect,
  useState,
  useRef,
  Suspense,
  type CSSProperties,
} from "react";
import { AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Plus,
  Search,
  LockKeyhole,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ArrowUp,
  Folder,
  Phone as PhoneIcon,
} from "lucide-react";
import { getApp, type AppPlugin } from "./registry";
import {
  initialRuntime,
  makeItem,
  safeMedia,
  type Work,
  type Item,
  type Runtime,
  type UiValue,
} from "./schema";
import { dispatch, choose, visible, advance } from "./engine";
import { db } from "./persistence";
import { appendStoryDelivery, readStoryConversation, readStoryMessage, storyAppUnread } from "./story-engine/unpublishedLoverRuntime";
import type { SceneDelivery } from "./story-engine/unpublishedLoverDelivery";
import { advanceScene22, markScene22ListReturn, markScene23ManualOpen } from "./story-engine/unpublishedLoverScene22";
import { advanceScene23, scene23Choices, sendScene23Choice } from "./story-engine/unpublishedLoverScene23";
import { advanceScene24, scene24Choices, sendScene24Choice, blockScene24Kakao, unblockScene24Kakao } from "./story-engine/unpublishedLoverScene24";
import { advanceScene25Incoming, advanceScene25Dialogue, rejectScene25Incoming, answerScene25Incoming, scene25Transcript, chooseScene25Reply, speakScene25Final } from "./story-engine/unpublishedLoverScene25";
import scene25Data from "../stories/unpublished-lover/data/scene25.json";
import { advanceScene26, manuallyOpenScene27X } from "./story-engine/unpublishedLoverScene26";
import scene28Data from "../stories/unpublished-lover/data/scene28.json";
import { openPublicPost, advanceInstagramDMs, openInstagramThread, sendInstagramReply } from "./story-engine/scene29Gate";
import { advanceScene30Opening } from "./story-engine/scene30Opening";
import { advanceScene30Replies, scene30Choices, sendScene30Choice } from "./story-engine/scene30Replies";
import { advanceScene31, dismissScene31 } from "./story-engine/scene31Ending";
import { scene21Choices, sendScene21Choice } from "./story-engine/scene21Handoff";
import scene31Data from "../stories/unpublished-lover/data/scene31.json";
import "./story-engine/unpublishedLoverBadges.css";
export function AppIcon({
  id,
  name,
  small = false,
  custom = "",
  date,
  time,
  unread = 0,
}: {
  id: string;
  name?: string;
  small?: boolean;
  custom?: string;
  date?: string;
  time?: string;
  unread?: number;
}) {
  const a = getApp(id);
  const Icon = a.icon;
  return (
    <span className={`app-icon-wrap ${small ? "small" : ""}`}>
      <span className="app-icon" style={{ background: a.color }}>
        {custom ? (
          safeMedia(custom) ? (
            <img src={safeMedia(custom)} alt="自定义图标" />
          ) : (
            <span>{custom.slice(0, 2)}</span>
          )
        ) : hasNativeArtwork(id) ? (
          <AppArtwork id={id} date={date} time={time} />
        ) : (
          <Icon size={small ? 21 : 28} strokeWidth={1.65} />
        )}
      </span>
      {unread > 0 && <span className="story-app-badge">{unread > 99 ? "99+" : unread}</span>}
      {name && <span className="app-name">{name}</span>}
    </span>
  );
}
type PhoneProps = Omit<Parameters<typeof PhoneRuntime>[0], "deviceLayout">;
export function Phone(props: PhoneProps) {
  const deviceLayout = useDeviceLayout(props.work, props.creator);
  return (
    <PhoneRuntime
      {...props}
      work={deviceLayout.work}
      deviceLayout={deviceLayout}
    />
  );
}
function PhoneRuntime({
  deviceLayout,
  work,
  creator = false,
  onEdit,
  onAdd,
  onSettings,
  onOpen,
  runtime: external,
  onRuntime,
}: {
  deviceLayout: ReturnType<typeof useDeviceLayout>;
  work: Work;
  creator?: boolean;
  onEdit?: (app: string, item: Item) => void;
  onAdd?: (app: string) => void;
  onSettings?: () => void;
  onOpen?: (app: string) => void;
  runtime?: Runtime;
  onRuntime?: (s: Runtime) => void;
}) {
  const [app, setApp] = useState("");
  const [storyFocusedThread, setStoryFocusedThread] = useState("");
  const [ep01PlayerName, setEp01PlayerName] = useState("");
  const [ep01BirthYear, setEp01BirthYear] = useState("");
  const [homeRequest, setHomeRequest] = useState(0);
  const [locked, setLocked] = useState(!creator);
  const [pinOpen, setPinOpen] = useState(false);
  const [quickCamera, setQuickCamera] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const appSnapshots = useRef(new Map<string, HTMLElement>());
  const [banner, setBanner] = useState("");
  const noticesSeen = useRef(0);
  const pendingBanners = useRef<string[]>([]);
  const [contextApp, setContextApp] = useState("");
  const [deviceScale, setDeviceScale] = useState(0.84);
  const shell = useRef<HTMLDivElement>(null);
  const gesture = useRef({ x: 0, y: 0, time: 0, zone: "" });
  const [launchOrigin, setLaunchOrigin] = useState(screenOrigin);

  const beginUnlock = () => {
    setPinError("");
    setQuickCamera(false);
    if (work.phone.passcode) setPinOpen(true);
    else unlock();
  };
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const gestureConsumed = useRef(false);
  const [pinError, setPinError] = useState("");
  const [wrongPinAttempts, setWrongPinAttempts] = useState(0);
  const [folder, setFolder] = useState("");
  const [panel, setPanel] = useState("");
  const [own, setOwn] = useState(() => initialRuntime(work));
  const [ready, setReady] = useState(creator || !!external);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    const fit = () => {
      setDeviceScale(
        Math.max(
          0.4,
          Math.min(
            1,
            (el.parentElement!.clientWidth - 24) / 407,
            (window.innerHeight - (creator ? 170 : external ? 150 : 40)) / 866,
          ),
        ),
      );
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el.parentElement!);
    window.addEventListener("resize", fit);
    fit();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [creator, ready]);
  const s = external ?? own;
  const runtimeRef = useRef(s);
  runtimeRef.current = s;
  const update = (next: Runtime) => {
    runtimeRef.current = next;
    setOwn(next);
    onRuntime?.(next);
  };
  useEffect(() => {
    let active = true;
    if (creator || external) return;
    void db.saves
      .get(work.id)
      .then((saved) => {
        if (!active) return;
        if (saved && saved.state.revision === work.updatedAt) {
          if (work.id === "unpublished-lover-ep01") {
            noticesSeen.current = saved.state.notifications.length;
            pendingBanners.current = [];
          }
          setOwn(saved.state);
        } else {
          setOwn(dispatch(work, initialRuntime(work), "start"));
          if (saved) setLoadError("作品已更新，已开始新的进度。");
        }
        setReady(true);
      })
      .catch(() => {
        setOwn(dispatch(work, initialRuntime(work), "start"));
        setLoadError("无法读取本地存档。本次仍可游玩。");
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [work.id, work.updatedAt, creator, external]);
  useEffect(() => {
    if (!creator && !external && ready)
      void db.saves
        .put({ id: work.id, state: own })
        .catch(() => setLoadError("存档失败，请检查浏览器存储权限。"));
  }, [own, creator, work.id, external, ready]);
  useEffect(() => {
    if (creator || !ready) return;
    const interval = setInterval(() => {
      const previous = runtimeRef.current;
      const advanced = advance(work, previous, work.id === "unpublished-lover-ep01" ? 200 : 1000);
      const next = work.id === "unpublished-lover-ep01" ? advanceScene31(advanceScene30Replies(advanceScene30Opening(advanceInstagramDMs(advanceScene26(advanceScene25Dialogue(advanceScene25Incoming(advanceScene24(advanceScene23(advanceScene22(advanced)))))))))) : advanced;
      runtimeRef.current = next;
      const changed =
        next !== advanced ||
        next.time !== previous.time ||
        next.trace.join() !== previous.trace.join() ||
        (next.scheduled?.length ?? 0) !== (previous.scheduled?.length ?? 0) ||
        (next.scheduled?.length ?? 0) > 0 ||
        Math.floor((next.elapsedMs ?? 0) / 5000) !==
          Math.floor((previous.elapsedMs ?? 0) / 5000);
      if (changed) update(next);
    }, work.id === "unpublished-lover-ep01" ? 200 : 1000);
    return () => clearInterval(interval);
  }, [creator, ready, work.id, work.updatedAt]);
  const event = (event: string, target: string) => {
    if (!creator) update(dispatch(work, runtimeRef.current, event, target));
  };
  const captureApp = () => {
    if (!app) return;
    const current = shell.current?.querySelector<HTMLElement>(".app-screen");
    if (!current) return;
    const snapshot = current.cloneNode(true) as HTMLElement;
    snapshot.style.transform = "none";
    snapshot.style.opacity = "1";
    snapshot.style.filter = "none";
    snapshot.style.borderRadius = "0";
    snapshot.querySelectorAll("audio").forEach((el) => el.remove());
    snapshot.querySelectorAll("video").forEach((el) => {
      el.removeAttribute("autoplay");
      el.removeAttribute("src");
    });
    snapshot.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    appSnapshots.current.set(app, snapshot);
    for (const id of appSnapshots.current.keys())
      if (!recent.includes(id) && id !== app) appSnapshots.current.delete(id);
  };
  const open = (id: string) => {
    if (!work.apps.some((a) => a.id === id && a.installed)) return;
    if (work.id === "unpublished-lover-ep01" && (id === "twitter" || id === "x")) {
      const current = runtimeRef.current;
      const next = manuallyOpenScene27X(current);
      if (next !== current) update(next);
    }
    setApp(id);
    setStoryFocusedThread("");
    setKeyboard(false);
    setRecent((v) => [id, ...v.filter((a) => a !== id)].slice(0, 8));
    setFolder("");
    setPanel("");
    onOpen?.(id);
    event("openApp", id);
  };
  useEffect(() => {
    if (work.id !== "unpublished-lover-ep01" || creator || locked || !ready || !s.variables.ep01XNoticeDismissed) return;
    const timer = setTimeout(() => {
      const current = runtimeRef.current;
      if (current.variables.ep01OpeningDelivered) return;
      const jeongwoo: SceneDelivery = {
        app: "kakao",
        conversationId: "chat-jeongwoo",
        sender: "朴炡禹",
        lines: [{ id: "opening-01", ko: "자기야아", zh: "亲爱的呀" }],
        delivered: 0,
        blocked: false,
      };
      const next = appendStoryDelivery(current, jeongwoo, current.date || "2026-10-23", current.time);
      update({ ...next.runtime, variables: { ...next.runtime.variables, ep01OpeningDelivered: true } });
    }, 3000);
    return () => clearTimeout(timer);
  }, [work.id, creator, locked, ready, s.variables.ep01XNoticeDismissed]);
  useEffect(() => {
    if (work.id !== "unpublished-lover-ep01" || creator || locked || !ready) return;
    if (!s.variables.ep01OpeningDelivered || s.variables.ep01FriendOpeningDelivered) return;
    const timer = setTimeout(() => {
      const current = runtimeRef.current;
      if (current.variables.ep01FriendOpeningDelivered) return;
      const friend: SceneDelivery = {
        app: "kakao",
        conversationId: "chat-friend",
        sender: "闺蜜",
        lines: [{ id: "friend-opening-01", ko: "야", zh: "喂" }],
        delivered: 0,
        blocked: false,
      };
      const next = appendStoryDelivery(current, friend, current.date || "2026-10-23", current.time);
      update({ ...next.runtime, variables: { ...next.runtime.variables, ep01FriendOpeningDelivered: true } });
    }, 1000);
    return () => clearTimeout(timer);
  }, [work.id, creator, locked, ready, s.variables.ep01OpeningDelivered, s.variables.ep01FriendOpeningDelivered]);
  const installedApps = work.apps.filter((a) => a.installed);
  const apps = installedApps.filter((a) => a.visible);
  const unlock = (pin = "") => {
    if (!work.phone.passcode || pin === work.phone.passcode) {
      setLocked(false);
      setPinOpen(false);
      setWrongPinAttempts(0);
      event("password", pin);
    } else {
      const attempts = wrongPinAttempts + 1;
      setWrongPinAttempts(attempts);
      setPinError(work.id === "unpublished-lover-ep01" && attempts >= 3 ? "提示：密码是蒸蒸生日" : "密码不正确");
      setPinOpen(true);
    }
  };
  useEffect(() => {
    if (app && !work.apps.some((a) => a.id === app && a.installed)) setApp("");
  }, [app, work.apps]);
  const displayTime = creator ? work.phone.time : s.time || work.phone.time;
  const plugin = getApp(app);
  useEffect(() => {
    const count = s.notifications.length;
    if (work.id === "unpublished-lover-ep01") {
      if (count < noticesSeen.current) noticesSeen.current = count;
      if (count > noticesSeen.current && work.phone.notifications) {
        pendingBanners.current.push(...s.notifications.slice(noticesSeen.current));
      }
      noticesSeen.current = count;
      return;
    }
    if (!locked && work.phone.notifications && count > noticesSeen.current) {
      setBanner(s.notifications.at(-1) || "");
      const timer = setTimeout(() => setBanner(""), 4500);
      noticesSeen.current = count;
      return () => clearTimeout(timer);
    }
    noticesSeen.current = count;
  }, [s.notifications.length, locked, work.phone.notifications, work.id]);
  useEffect(() => {
    if (work.id !== "unpublished-lover-ep01" || locked || !work.phone.notifications) return;
    if (banner || pendingBanners.current.length === 0) return;
    setBanner(pendingBanners.current.shift() || "");
  }, [banner, locked, work.id, work.phone.notifications, s.notifications.length]);
  useEffect(() => {
    if (work.id !== "unpublished-lover-ep01" || !banner) return;
    const timer = setTimeout(() => setBanner(""), 2000);
    return () => clearTimeout(timer);
  }, [banner, work.id]);
  const dismissNotice = (index: number) =>
    update({
      ...runtimeRef.current,
      notifications: runtimeRef.current.notifications.filter(
        (_, i) => i !== index,
      ),
    });
  if (!ready) return <div className="phone-loading">正在恢复进度…</div>;
  return (
    <div
      ref={shell}
      style={{ "--phone-scale": deviceScale } as CSSProperties}
      className={`phone-shell ios18 ${work.phone.theme === "dark" ? "dark-phone" : ""}`}
    >
      {work.id === "unpublished-lover-ep01" && !creator && s.variables.ep01PlayerSetupDone !== true && (
        <div className="ep01-ending-overlay" role="dialog" aria-modal="true" aria-label="开始游戏">
          <form className="ep01-ending-card" onSubmit={(event) => {
            event.preventDefault();
            const name = ep01PlayerName.trim();
            const year = Number(ep01BirthYear);
            if (!name || name.length > 30 || !/^\\d{4}$/.test(ep01BirthYear) || year < 1900 || year > 2026) return;
            update({ ...runtimeRef.current, variables: { ...runtimeRef.current.variables, ep01PlayerName: name, ep01BirthYear: year, ep01PlayerSetupDone: true } });
          }}>
            <small>iPhone16pro Max</small>
            <h2>开始之前</h2>
            <p>请输入玩家姓名和出生年份。只需年份，不需要月日。</p>
            <label>姓名<input aria-label="玩家姓名" maxLength={30} required value={ep01PlayerName} onChange={(event) => setEp01PlayerName(event.target.value)} /></label>
            <label>出生年份<input aria-label="出生年份" type="number" min="1900" max="2026" required value={ep01BirthYear} onChange={(event) => setEp01BirthYear(event.target.value)} /></label>
            <button type="submit">进入手机</button>
          </form>
        </div>
      )}
      {work.id === "unpublished-lover-ep01" && s.variables.ep01Scene31Visible === true && (
        <div className="ep01-ending-overlay" role="dialog" aria-modal="true" aria-label="剧情结局">
          <section className="ep01-ending-card">
            <small>ENDING 01 · 未公开恋人</small>
            <h2>{scene31Data.title}</h2>
            <h3>{scene31Data.subtitleByBranch[(s.variables.ep01Scene30Branch as "A" | "B" | "C") || "A"]}</h3>
            <p>{scene31Data.summaryByBranch[(s.variables.ep01Scene30Branch as "A" | "B" | "C") || "A"]}</p>
            <strong>{scene31Data.footer}</strong>
            <p>{scene31Data.notice}</p>
            <button type="button" onClick={() => update(dismissScene31(runtimeRef.current))}>{scene31Data.button}</button>
          </section>
        </div>
      )}
      <KeyboardContext.Provider value={setKeyboard}>
        <div
          className={`phone-screen wallpaper-${work.phone.wallpaper} ${work.id === "unpublished-lover-ep01" ? "ep01-custom-wallpaper" : ""} ${locked ? "is-locked" : ""} ${app ? "in-app" : ""} ${keyboard ? "keyboard-open" : ""}`}
          data-app={app}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            gestureConsumed.current = false;
            const button = (e.target as HTMLElement).closest<HTMLElement>(
              "[data-app-id]",
            );
            if (button) {
              pressTimer.current = setTimeout(() => {
                gestureConsumed.current = true;
                setContextApp(button.dataset.appId || "");
              }, 550);
            }
            const box = e.currentTarget.getBoundingClientRect(),
              x = (e.clientX - box.left) / deviceScale,
              y = (e.clientY - box.top) / deviceScale;
            gesture.current = {
              x,
              y,
              time: Date.now(),
              zone: y < 58 ? "top" : y > 818 ? "bottom" : locked ? "lock" : "",
            };
          }}
          onPointerMove={(e) => {
            if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5)
              clearTimeout(pressTimer.current);
          }}
          onPointerCancel={() => clearTimeout(pressTimer.current)}
          onPointerUp={(e) => {
            clearTimeout(pressTimer.current);
            const box = e.currentTarget.getBoundingClientRect(),
              y = (e.clientY - box.top) / deviceScale,
              g = gesture.current;
            const dy = y - g.y;
            if (g.zone === "top" && dy > 65)
              setPanel(g.x > 230 ? "control" : "notification");
            else if ((g.zone === "bottom" || g.zone === "lock") && dy < -55) {
              gestureConsumed.current = true;
              if (!locked) captureApp();
              setKeyboard(false);
              if (panel) {
                setPanel("");
              } else if (locked) {
                beginUnlock();
              } else if (g.zone === "bottom" && Date.now() - g.time > 450) {
                captureApp();
                setPanel("switcher");
              } else {
                setApp("");
                setPanel("");
                setFolder("");
              }
            }
          }}
          onClickCapture={(e) => {
            const target = (e.target as HTMLElement).closest(
              ".home-app-grid button,.dock button",
            );
            if (target) {
              setLaunchOrigin(
                readLauncherOrigin(target as HTMLElement, e.currentTarget),
              );
            }
          }}
        >
          <div className="wallpaper-orb orb-one" />
          <div className="wallpaper-orb orb-two" />
          <div className="status-bar">
            <button
              onClick={() =>
                setPanel(panel === "notification" ? "" : "notification")
              }
              className="status-time"
              aria-label="通知中心"
            >
              {displayTime}
              <StatusGlyph kind="silent" />
            </button>
            <div className="dynamic-island" />
            <button
              className="signals"
              onClick={() => setPanel(panel === "control" ? "" : "control")}
              aria-label="控制中心"
            >
              <StatusGlyph kind="cellular" />
              <StatusGlyph kind="wifi" />
              <span
                className={`ios-battery${work.phone.battery <= 20 ? " low-battery" : ""}`}
              >
                <span style={{ width: `${work.phone.battery}%` }} />
                <b>{work.phone.battery}</b>
              </span>
            </button>
          </div>
          {work.id === "unpublished-lover-ep01" && !creator && ready && !locked && !s.variables.ep01XNoticeDismissed && !s.variables.ep01OpeningDelivered && (
            <div className="ep01-opening-notice" role="dialog" aria-modal="true" aria-label="X 通知">
              <div className="ep01-opening-notice-card">
                <strong>X · 通知</strong>
                <p>你有一条新的 X 通知。</p>
                <button type="button" onClick={() => update({ ...runtimeRef.current, variables: { ...runtimeRef.current.variables, ep01XNoticeDismissed: true } })}>关闭</button>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            {locked && !(quickCamera && app === "camera") ? (
              <DeviceLock
                work={
                  s.date
                    ? { ...work, phone: { ...work.phone, date: s.date } }
                    : work
                }
                time={displayTime}
                notices={s.notifications}
                onDismiss={dismissNotice}
                pinOpen={pinOpen}
                setPinOpen={setPinOpen}
                error={pinError}
                onUnlock={unlock}
                onLight={() => setPanel("light")}
                onCamera={() => {
                  setQuickCamera(true);
                  open("camera");
                }}
              />
            ) : app && app !== "appstore" ? (
              <AppWindow
                key={app}
                className={`app-screen engine-${plugin.engine} skin-${app}`}
                creator={creator}
                origin={launchOrigin}
              >
                <AppContent
                  app={plugin}
                  name={
                    work.apps.find((a) => a.id === app)?.name ?? plugin.name
                  }
                  items={[
                    ...(work.data[app] ?? []),
                    ...(s.messages[app] ?? []),
                  ]}
                  creator={creator}
                  state={s}
                  onRead={(id) => {
                    if (work.id === "unpublished-lover-ep01") {
                      const next = dispatch(work, runtimeRef.current, "read", id);
                      update(readStoryMessage(next, app, id));
                    } else {
                      event("read", id);
                    }
                  }}
                  onEdit={(item) => onEdit?.(app, item)}
                  onAdd={() => onAdd?.(app)}
                  onBack={() => setApp("")}
                  onSettings={onSettings}
                  onUi={(key, value) => {
                    const current = runtimeRef.current;
                    update(
                      dispatch(
                        work,
                        {
                          ...current,
                          ui: {
                            ...current.ui,
                            [app]: { ...current.ui?.[app], [key]: value },
                          },
                        },
                        "variable",
                        `ui:${app}:${key}`,
                      ),
                    );
                  }}
                  work={work}
                  storyFocusedThread={storyFocusedThread}
                  onStoryReturnToList={() => {
                    const current = runtimeRef.current;
                    const next = markScene22ListReturn(current);
                    if (next !== current) update(next);
                  }}
                  onStoryManualOpen={(title) => {
                    const current = runtimeRef.current;
                    const next = markScene23ManualOpen(current, title);
                    if (next !== current) update(next);
                  }}
                  onStoryInstagramOpen={(title) => {
                    update(openInstagramThread(runtimeRef.current, title));
                  }}
                  onStoryInstagramSend={(title, body) => {
                    update(sendInstagramReply(runtimeRef.current, title, body));
                  }}
                  onStoryPostOpen={(id) => {
                    const current = runtimeRef.current;
                    const next = openPublicPost(current, id);
                    if (next !== current) update(next);
                  }}
                  onStoryReadThread={(title) => {
                    const current = runtimeRef.current;
                    const next = readStoryConversation(current, "kakao", title);
                    if (next !== current) update(next);
                  }}
                  onStoryBlock={() => {
                    const current = runtimeRef.current;
                    const next = blockScene24Kakao(current);
                    if (next !== current) update(next);
                  }}
                  onStoryUnblock={() => {
                    const current = runtimeRef.current;
                    const next = unblockScene24Kakao(current);
                    if (next !== current) update(next);
                  }}
                  onStorySave={() => { void db.saves.put({ id: work.id, state: runtimeRef.current }); }}
                  onStoryReplay={() => {
                    if (!window.confirm("确定重玩《未公开恋人》？当前进度将被覆盖。")) return;
                    const fresh = dispatch(work, initialRuntime(work), "start");
                    pendingBanners.current = [];
                    noticesSeen.current = 0;
                    setBanner("");
                    update(fresh);
                    setApp("");
                    setStoryFocusedThread("");
                    setLocked(true);
                    setPinOpen(false);
                    setWrongPinAttempts(0);
                  }}
                  onStorySend={(threadTitle, label, target) => {
                    const current = runtimeRef.current;
                    const special21 = threadTitle === "苏庭焕" && scene21Choices(current).some((choice) => choice.target === target && choice.label === label);
                    const special23 = threadTitle === "쩡쩡❤️" && scene23Choices(current).some((choice) => choice.target === target && choice.label === label);
                    const special24 = threadTitle === "쩡쩡❤️" && scene24Choices(current).some((choice) => choice.target === target && choice.label === label);
                    const special30 = threadTitle === "쩡쩡❤️" && scene30Choices(current).some((choice) => choice.target === target && choice.label === label);
                    const special = special21 || special23 || special24 || special30;
                    if (!special && !current.choices.some((choice) => choice.target === target && choice.label === label)) return;
                    const message = makeItem({
                      title: threadTitle,
                      body: label,
                      sender: work.phone.owner,
                      outgoing: true,
                      read: true,
                      time: (current.date || work.phone.date) + " " + current.time,
                      meta: { conversationId: threadTitle, source: "unpublished-lover" },
                    });
                    const withMessage = {
                      ...current,
                      messages: { ...current.messages, kakao: [...(current.messages.kakao ?? []), message] },
                    };
                    update(special21 ? sendScene21Choice(withMessage, target) : special23 ? sendScene23Choice(withMessage, target) : special24 ? sendScene24Choice(withMessage, target) : special30 ? sendScene30Choice(withMessage, target) : choose(work, withMessage, target));
                  }}
                />
              </AppWindow>
            ) : (
              <HomeLauncher
                key={
                  "home-" + homeRequest + (app === "appstore" ? "store" : "")
                }
                storeOpen={app === "appstore"}
                closeStore={() => setApp("")}
                work={work}
                layout={deviceLayout.layout}
                change={deviceLayout.change}
                importLayout={deviceLayout.importLayout}
                error={deviceLayout.error}
                open={open}
                onFolder={setFolder}
                search={() => setPanel("search")}
                time={displayTime}
                icon={(a, small) => (
                  <AppIcon
                    key={a.id}
                    id={a.id}
                    name={small ? undefined : a.name}
                    small={small}
                    custom={a.icon}
                    date={s.date || work.phone.date}
                    time={s.time}
                    unread={work.id === "unpublished-lover-ep01" ? storyAppUnread(s, a.id) : 0}
                  />
                )}
                clearApp={(id) =>
                  update({
                    ...runtimeRef.current,
                    messages: Object.fromEntries(
                      Object.entries(runtimeRef.current.messages).filter(
                        ([app]) => app !== id,
                      ),
                    ),
                  })
                }
              />
            )}
          </AnimatePresence>
          {folder && (
            <div className="folder-overlay" onClick={() => setFolder("")}>
              <h2>{folder}</h2>
              <div className="folder-apps" onClick={(e) => e.stopPropagation()}>
                {apps
                  .filter((a) => a.folder === folder)
                  .map((a) => (
                    <button key={a.id} onClick={() => open(a.id)}>
                      <AppIcon id={a.id} name={a.name} custom={a.icon} />
                    </button>
                  ))}
              </div>
              <button className="glass-btn" onClick={() => setFolder("")}>
                关闭文件夹
              </button>
            </div>
          )}
          {panel === "control" && (
            <ControlCenter
              battery={work.phone.battery}
              network={work.phone.network}
              close={() => setPanel("")}
            />
          )}
          {panel && panel !== "control" && panel !== "switcher" && (
            <div
              className={`system-panel ${panel === "light" ? "flash-on" : ""}`}
            >
              <button className="panel-close" onClick={() => setPanel("")}>
                关闭 <ChevronLeft size={14} />
              </button>
              {panel === "notification" ? (
                <>
                  <h2>通知中心</h2>
                  {work.phone.notifications && s.notifications.length ? (
                    <SystemNotifications
                      notices={s.notifications}
                      apps={work.apps}
                      onOpen={() => {
                        setPanel("");
                        if (locked) beginUnlock();
                        else if (installedApps.some((a) => a.id === "messages"))
                          open("messages");
                      }}
                      onDismiss={dismissNotice}
                    />
                  ) : (
                    <p>没有新通知</p>
                  )}
                </>
              ) : panel === "search" ? (
                <>
                  <h2>搜索 App</h2>
                  <AppSearch apps={installedApps} open={open} />
                </>
              ) : (
                <h2>手电筒已打开</h2>
              )}
            </div>
          )}
          {!creator && work.id !== "unpublished-lover-ep01" && s.choices.length > 0 && !locked && (
            <div className="story-overlay">
              <span className="eyebrow">故事来到一个岔路口</span>
              <h3>你会如何选择？</h3>
              {s.choices.map((c) => (
                <button
                  key={c.target}
                  onClick={() => update(choose(work, s, c.target))}
                >
                  {c.label}
                  <ArrowUp size={15} />
                </button>
              ))}
            </div>
          )}
          {!creator && s.endings.length > 0 && !locked && (
            <div className="story-overlay ending">
              <span className="eyebrow">ENDING · {s.endings.length}</span>
              <h2>故事在这里停泊。</h2>
              <p>{s.endings[s.endings.length - 1]}</p>
              <button
                onClick={() => {
                  update(dispatch(work, initialRuntime(work), "start"));
                  setApp("");
                  setLocked(true);
                }}
              >
                重新开始
              </button>
            </div>
          )}
          {!creator && s.incomingCall && (
            <div className="incoming-call-screen">
              <small>
                {s.incomingCall.status === "ringing" ? "来电" : "通话中"} ·
                作品内模拟
              </small>
              <div className="incoming-avatar">
                {s.incomingCall.caller.slice(0, 1)}
              </div>
              <h2>{s.incomingCall.caller}</h2>
              {s.incomingCall.status === "answered" &&
                (() => {
                  const record = work.data.phone?.find(
                    (i) => i.id === s.incomingCall?.target,
                  );
                  return record?.kind === "audio" && safeMedia(record.media) ? (
                    <audio controls src={safeMedia(record.media)} />
                  ) : (
                    <p>这是一通虚构来电。</p>
                  );
                })()}
              {s.incomingCall.target === "ep01-scene25" && s.incomingCall.status === "answered" ? (
                <div className="ep01-call-dialogue">
                  <div className="ep01-call-transcript" aria-live="polite">
                    {scene25Transcript(s).map((line, index) => (
                      <p key={index}><strong>{line.speaker}</strong>：{line.ko}<span className="ep01-call-translation">{line.zh}</span></p>
                    ))}
                  </div>
                  {(() => {
                    const route = s.variables.ep01Scene25Route;
                    const openingDone = scene25Transcript(s).filter((line) => line.speaker === "朴炡禹").length ===
                      (route === "A" ? 9 : route === "B" ? 8 : 10);
                    const choice = Number(s.variables.ep01Scene25Choice ?? 0);
                    if (openingDone && !choice) return (
                      <div className="ep01-call-options">
                        {scene25Data.choices.map((option, index) => (
                          <button type="button" key={index} onClick={() => update(chooseScene25Reply(runtimeRef.current, index + 1))}>
                            {option.ko}<span>{option.zh}</span>
                          </button>
                        ))}
                      </div>
                    );
                    if (choice && s.variables.ep01Scene25FinalSpoken !== true &&
                        Number(s.variables.ep01Scene25ReplyDelivered ?? 0) ===
                        (route === "C" && choice === 3 ? 6 : 5)) return (
                      <button type="button" className="ep01-call-final" onClick={() => update(speakScene25Final(runtimeRef.current))}>
                        {scene25Data.final.ko}<span>{scene25Data.final.zh}</span>
                      </button>
                    );
                    return null;
                  })()}
                </div>
              ) : null}
              <div className="incoming-actions">
                <button
                  className="decline-call"
                  onClick={() => {
                    const call = runtimeRef.current.incomingCall;
                    if (call?.target === "ep01-scene25" && call.status === "ringing") { update(rejectScene25Incoming(runtimeRef.current)); return; }
                    if (call?.target === "ep01-scene25") return;
                    if (call)
                      update(
                        dispatch(
                          work,
                          { ...runtimeRef.current, incomingCall: null },
                          call.status === "ringing"
                            ? "callDeclined"
                            : "callEnded",
                          call.target || call.caller,
                        ),
                      );
                  }}
                >
                  <PhoneIcon size={25} />
                  <span>
                    {s.incomingCall.status === "ringing" ? "拒接" : "挂断"}
                  </span>
                </button>
                {s.incomingCall.status === "ringing" && (
                  <button
                    className="accept-call"
                    onClick={() => {
                      const call = runtimeRef.current.incomingCall;
                      if (call?.target === "ep01-scene25") { update(answerScene25Incoming(runtimeRef.current)); return; }
                      if (call)
                        update(
                          dispatch(
                            work,
                            {
                              ...runtimeRef.current,
                              incomingCall: { ...call, status: "answered" },
                            },
                            "callAnswered",
                            call.target || call.caller,
                          ),
                        );
                    }}
                  >
                    <PhoneIcon size={25} />
                    <span>接听</span>
                  </button>
                )}
              </div>
            </div>
          )}
          {banner && !locked && (
            <button
              className="device-banner"
              onClick={() => {
                setBanner("");
                if (work.id === "unpublished-lover-ep01" && (banner.startsWith("朴炡禹:") || banner.startsWith("闺蜜:"))) {
                  open("kakao");
                  setStoryFocusedThread(banner.startsWith("朴炡禹:") ? "쩡쩡❤️" : "闺蜜");
                } else {
                  setPanel("notification");
                }
              }}
            >
              <AppIcon
                id={notificationContent(banner, work.apps).appId}
                small
              />
              <span>
                <strong>{notificationContent(banner, work.apps).title}</strong>
                <span>{notificationContent(banner, work.apps).body}</span>
              </span>
            </button>
          )}
          {panel === "switcher" && (
            <div className="device-switcher">
              <div className="switcher-cards">
                {recent
                  .filter(
                    (id) =>
                      installedApps.some((a) => a.id === id) &&
                      appSnapshots.current.has(id),
                  )
                  .map((id) => (
                    <button
                      className="recent-app-card"
                      key={id}
                      onClick={() => open(id)}
                    >
                      <span className="recent-app-label">
                        <AppIcon id={id} small />
                        <strong>
                          {work.apps.find((a) => a.id === id)?.name}
                        </strong>
                      </span>
                      <span className="recent-app-window">
                        <span
                          className="recent-app-snapshot"
                          aria-hidden="true"
                          inert
                          ref={(el) => {
                            const snapshot = appSnapshots.current.get(id);
                            if (el && snapshot)
                              el.replaceChildren(snapshot.cloneNode(true));
                          }}
                        />
                      </span>
                    </button>
                  ))}
              </div>
              <button className="switcher-done" onClick={() => setPanel("")}>
                完成
              </button>
            </div>
          )}
          {contextApp && (
            <div
              className="home-context-shade"
              onClick={() => setContextApp("")}
            >
              <div className="home-context-menu">
                <AppIcon id={contextApp} />
                <strong>
                  {work.apps.find((a) => a.id === contextApp)?.name}
                </strong>
                <button
                  onClick={() => {
                    open(contextApp);
                    setContextApp("");
                  }}
                >
                  打开 App
                </button>
                <button
                  onClick={() => {
                    setContextApp("");
                    setPanel("search");
                  }}
                >
                  在 App 库中查看
                </button>
                <button onClick={() => setContextApp("")}>取消</button>
              </div>
            </div>
          )}
          {keyboard && <DeviceKeyboard close={() => setKeyboard(false)} />}
          {loadError && (
            <button className="runtime-error" onClick={() => setLoadError("")}>
              {loadError}
            </button>
          )}
          <button
            className="home-indicator"
            aria-label="返回桌面"
            onClick={() => {
              if (gestureConsumed.current) return;
              if (locked) {
                beginUnlock();
                return;
              }
              captureApp();
              setHomeRequest((n) => n + 1);
              setKeyboard(false);
              setApp("");
              setFolder("");
              setPanel("");
            }}
          />
          <div className="screen-dimmer" />
          <div className="hardware-reflection" />
        </div>
      </KeyboardContext.Provider>
    </div>
  );
}
function AppSearch({
  apps,
  open,
}: {
  apps: Work["apps"];
  open: (id: string) => void;
}) {
  const [q, set] = useState("");
  return (
    <>
      <input
        autoFocus
        value={q}
        placeholder="App 名称"
        onChange={(e) => set(e.target.value)}
      />
      {apps
        .filter((a) => a.name.toLowerCase().includes(q.toLowerCase()))
        .map((a) => (
          <button
            className="search-result"
            key={a.id}
            onClick={() => open(a.id)}
          >
            <AppIcon id={a.id} small />
            {a.name}
          </button>
        ))}
    </>
  );
}
function Media({ item }: { item: Item }) {
  const src = safeMedia(item.media);
  return src ? (
    item.kind === "audio" ? (
      <audio controls src={src} />
    ) : item.kind === "video" ? (
      <video controls playsInline src={src} />
    ) : (
      <img loading="lazy" src={src} alt={item.title} />
    )
  ) : (
    <div
      className={`original-art art-${item.id.includes("ticket") ? "ticket" : "rain"}`}
    >
      <span>
        {item.id.includes("ticket") ? "城南 / SOUTHBOUND" : "after the rain"}
      </span>
      <strong>{item.id.includes("ticket") ? "09 · 01" : "雨 后"}</strong>
      <small>
        {item.id.includes("ticket")
          ? "16:30 · 一张未完成的约定"
          : "a little moment of quiet"}
      </small>
    </div>
  );
}
function AppContent({
  app,
  name,
  items,
  creator,
  state,
  onRead,
  onEdit,
  onAdd,
  onBack,
  onSettings,
  onUi,
  work,
  onStorySend,
  storyFocusedThread,
  onStorySave,
  onStoryReplay,
  onStoryReadThread,
  onStoryReturnToList,
  onStoryManualOpen,
  onStoryPostOpen,
  onStoryInstagramOpen,
  onStoryInstagramSend,
  onStoryBlock,
  onStoryUnblock,
}: {
  app: AppPlugin;
  name: string;
  items: Item[];
  creator: boolean;
  state: Runtime;
  onRead: (id: string) => void;
  onEdit: (item: Item) => void;
  onAdd: () => void;
  onBack: () => void;
  onSettings?: () => void;
  onUi?: (key: string, value: UiValue) => void;
  work: Work;
  onStorySend?: (thread: string, label: string, target: string) => void;
  storyFocusedThread?: string;
  onStorySave?: () => void;
  onStoryReplay?: () => void;
  onStoryReadThread?: (title: string) => void;
  onStoryReturnToList?: () => void;
  onStoryManualOpen?: (title: string) => void;
  onStoryPostOpen?: (id: string) => void;
  onStoryInstagramOpen?: (title: string) => void;
  onStoryInstagramSend?: (title: string, body: string) => void;
  onStoryBlock?: () => void;
  onStoryUnblock?: () => void;
}) {
  const [detail, setDetail] = useState<Item | null>(null);
  const [thread, setThread] = useState("");
  const [instagramDraft, setInstagramDraft] = useState("");
  const [storyDraft, setStoryDraft] = useState<{ label: string; target: string } | null>(null);
  const [showStoryChoices, setShowStoryChoices] = useState(false);
  useEffect(() => {
    if (work.id === "unpublished-lover-ep01" && app.id === "kakao" && storyFocusedThread) setThread(storyFocusedThread);
  }, [work.id, app.id, storyFocusedThread]);
  const [tab, setTab] = useState(app.tabs[0]);
  const [q, setQ] = useState("");
  const [pw, setPw] = useState("");
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [pwError, setPwError] = useState("");
  const [likes, setLikes] = useState<string[]>([]);
  const shown = items
    .filter((i) => creator || visible(i, state))
    .filter((i) =>
      (i.title + i.body + i.sender).toLowerCase().includes(q.toLowerCase()),
    );
  const filtered =
    tab === "收藏"
      ? shown.filter((i) => i.favorite)
      : tab === app.tabs[0]
        ? shown
        : shown.filter((i) => i.folder === tab);
  const read = (i: Item) => {
    if (creator) {
      onEdit(i);
      return;
    }
    setDetail(i);
    if (app.id === "twitter" && i.id === "scene27-public-post") onStoryPostOpen?.(i.id);
    if (!i.password || unlocks.includes(i.id)) onRead(i.id);
  };
  useEffect(() => {
    if (work.id !== "unpublished-lover-ep01" || app.id !== "kakao" || !thread || creator) return;
    if (items.some((item) => item.title === thread && !item.read && !item.outgoing)) {
      onStoryReadThread?.(thread);
    }
  }, [work.id, app.id, thread, creator, items, onStoryReadThread]);
  const chats = [...new Set(shown.map((i) => i.title))];
  const back = () => {
    if (detail) setDetail(null);
    else if (thread) { setThread(""); if (app.id === "kakao") onStoryReturnToList?.(); }
    else onBack();
  };
  const Skin =
    app.id === "wechat"
      ? WeChatSkin
      : app.id === "whatsapp"
        ? WhatsAppSkin
        : (catalogSkins[app.id as keyof typeof catalogSkins] ?? null);
  const detailView = detail ? (
    <div className="phone-content detail-content">
      {detail.password && !creator && !unlocks.includes(detail.id) ? (
        <div className="locked-note">
          <LockKeyhole size={36} />
          <h3>这条内容已锁定</h3>
          <input
            type="password"
            placeholder="内容密码"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button
            onClick={() => {
              if (pw === detail.password) {
                setUnlocks([...unlocks, detail.id]);
                onRead(detail.id);
                setPwError("");
              } else setPwError("密码不正确");
            }}
          >
            解锁内容
          </button>
          <small>{pwError}</small>
        </div>
      ) : (
        <>
          <small className="detail-meta">
            {detail.time} · {detail.sender}
          </small>
          <h2>{detail.title}</h2>
          {(detail.media || ["media", "social"].includes(app.engine)) && (
            <Media item={detail} />
          )}
          <RichText value={detail.richText} fallback={detail.body} />
          <dl className="item-metadata">
            {getFields(app.id)
              .filter((f) => detail.meta?.[f.key])
              .map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>{detail.meta[f.key]}</dd>
                </div>
              ))}
          </dl>
          {detail.folder && (
            <span className="folder-label">
              <Folder size={12} />
              {detail.folder}
            </span>
          )}
          {work.id === "unpublished-lover-ep01" && app.id === "twitter" && detail.id === "scene27-public-post" && (
            <section className="ep01-x-comments" aria-label="公开恋爱帖评论">
              <h3>评论 · 12.8万</h3>
              {scene28Data.comments.map((comment) => (
                <article className="ep01-x-comment" key={comment.id}>
                  <strong>{comment.author}</strong>
                  <p>{comment.ko}</p>
                  <p className="ep01-x-comment-zh">{comment.zh}</p>
                </article>
              ))}
            </section>
          )}
          {detail.comments.map((c, i) => (
            <p key={i} className="comment">
              {c}
            </p>
          ))}
        </>
      )}
    </div>
  ) : null;
  if (work.id === "unpublished-lover-ep01" && app.id === "instagram" && !creator) {
    const dmItems = shown.filter((item) => item.meta.source?.startsWith("ep01-scene29"));
    const dmThreads = [...new Set(dmItems.map((item) => item.title))];
    const current = dmItems.filter((item) => item.title === thread);
    return (
      <div className="ep01-instagram">
        <header className="ep01-instagram-header">
          {thread ? <button type="button" onClick={() => { setThread(""); setInstagramDraft(""); }}>‹</button> : null}
          <strong>{thread || "Instagram · 消息"}</strong>
        </header>
        {thread ? (
          <>
            <div className="ep01-instagram-chat">
              {current.map((item) => (
                <div key={item.id} className={item.outgoing ? "ep01-instagram-bubble mine" : "ep01-instagram-bubble"}>
                  {item.body.split("\n").map((line, index) => <p key={index}>{line}</p>)}
                </div>
              ))}
            </div>
            <form className="ep01-instagram-compose" onSubmit={(event) => {
              event.preventDefault();
              if (!instagramDraft.trim()) return;
              onStoryInstagramSend?.(thread, instagramDraft);
              setInstagramDraft("");
            }}>
              <input aria-label="输入私信" placeholder="发送消息……" value={instagramDraft} onChange={(event) => setInstagramDraft(event.target.value)} />
              <button type="submit" disabled={!instagramDraft.trim()}>发送</button>
            </form>
          </>
        ) : (
          <div className="ep01-instagram-list">
            {dmThreads.map((title) => {
              const messages = dmItems.filter((item) => item.title === title);
              const last = messages[messages.length - 1];
              const unread = messages.filter((item) => !item.read && !item.outgoing).length;
              return <button type="button" key={title} className="ep01-instagram-contact" onClick={() => { setThread(title); onStoryInstagramOpen?.(title); }}>
                <span className="ep01-instagram-contact-avatar">{title.slice(-2)}</span>
                <span className="ep01-instagram-contact-text"><strong>{title}</strong><small>{last?.body.split("\n")[0]}</small></span>
                {unread > 0 ? <span className="ep01-instagram-unread">{unread > 99 ? "99+" : unread}</span> : null}
              </button>;
            })}
          </div>
        )}
      </div>
    );
  }
  if (work.id === "unpublished-lover-ep01" && app.id === "kakao" && !creator) {
    const conversations = [...new Set(["쩡쩡❤️", "闺蜜", "苏庭焕", "朴志焄", "尹材赫", ...shown.map((item) => item.title))];
    const threadItems = shown.filter((item) => item.title === thread);
    const availableChoices = thread === "쩡쩡❤️" ? [...scene23Choices(state), ...scene24Choices(state), ...scene30Choices(state)] : thread === "苏庭焕" ? scene21Choices(state) : state.choices;
    const openThread = (title: string) => {
      setThread(title);
      onStoryManualOpen?.(title);
      onStoryReadThread?.(title);
    };
    return (
      <div className="ep01-kakao">
        <div className="ep01-kakao-header">
          {thread ? <button onClick={() => { setThread(""); onStoryReturnToList?.(); }} aria-label="返回聊天列表">‹</button> : null}
          <strong>{thread || "聊天"}</strong>
          {thread === "쩡쩡❤️" && (state.variables.ep01Scene24Branch === "A" || state.variables.ep01KakaoBlocked === true) ? (
            <button type="button" className="ep01-block-toggle" onClick={state.variables.ep01KakaoBlocked === true ? onStoryUnblock : onStoryBlock}>
              {state.variables.ep01KakaoBlocked === true ? "解除拉黑" : "拉黑"}
            </button>
          ) : null}
        </div>
        {thread ? (
          <div className="ep01-kakao-thread">
            {threadItems.map((item) => (
              <div className={item.outgoing ? "ep01-message sent" : "ep01-message"} key={item.id}>
                <span className="ep01-message-sender">{item.sender}</span>
                <div className="ep01-message-bubble">{item.body}</div>
                <small>{item.time.slice(-5)}</small>
              </div>
            ))}
            <div className="ep01-kakao-compose">
              {showStoryChoices && availableChoices.length > 0 && (
                <div className="ep01-reply-options">
                  {availableChoices.map((choice) => (
                    <button type="button" key={choice.target} onClick={() => { setStoryDraft(choice); setShowStoryChoices(false); }}>
                      {choice.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="ep01-compose-controls">
                <button type="button" className="ep01-compose-input" onClick={() => setShowStoryChoices((value) => !value)} disabled={availableChoices.length === 0}>
                  {storyDraft?.label || (availableChoices.length ? "点击选择回复" : "等待剧情回复选项")}
                </button>
                <button type="button" className="ep01-compose-send" disabled={!storyDraft || !onStorySend || !availableChoices.some((choice) => choice.target === storyDraft.target && choice.label === storyDraft.label)} onClick={() => {
                  if (!storyDraft) return;
                  onStorySend?.(thread, storyDraft.label, storyDraft.target);
                  setStoryDraft(null);
                  setShowStoryChoices(false);
                }}>发送</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="ep01-kakao-list">
            {conversations.map((title) => {
              const messages = shown.filter((item) => item.title === title);
              const last = messages[messages.length - 1];
              const unread = messages.filter((item) => !item.read && !item.outgoing).length;
              return (
                <button key={title} className="ep01-kakao-contact" onClick={() => openThread(title)}>
                  <span className="ep01-kakao-avatar">
                    {({ "쩡쩡❤️": "kakao-jeongwoo.jpeg", "朴炡禹": "kakao-jeongwoo.jpeg", "苏庭焕": "kakao-junghwan.jpeg", "朴志焄": "kakao-jihoon.jpeg", "尹材赫": "kakao-jaehyuk.jpeg", "闺蜜": "kakao-friend.jpeg" } as Record<string, string>)[title] ? (
                      <img src={"/story-assets/unpublished-lover/" + ({ "쩡쩡❤️": "kakao-jeongwoo.jpeg", "朴炡禹": "kakao-jeongwoo.jpeg", "苏庭焕": "kakao-junghwan.jpeg", "朴志焄": "kakao-jihoon.jpeg", "尹材赫": "kakao-jaehyuk.jpeg", "闺蜜": "kakao-friend.jpeg" } as Record<string, string>)[title]} alt={title + "头像"} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    ) : null}
                    <span>{title.slice(0, 1)}</span>
                  </span>
                  <span className="ep01-kakao-contact-body"><strong>{title}</strong><small>{last?.body.split("\n")[0] ?? "暂无消息"}</small></span>
                  <span className="ep01-kakao-contact-side"><small>{last?.time.slice(-5) ?? ""}</small>{unread > 0 && <b>{unread > 99 ? "99+" : unread}</b>}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  if (Skin)
    return (
      <>
        <div className="catalog-slot" hidden={!!detail}>
          <Suspense fallback={<div className="catalog-loading">正在打开…</div>}>
            <Skin
              appId={app.id}
              owner={work.phone.owner}
              virtualTime={state.time}
              ui={state.ui?.[app.id]}
              onUi={creator ? undefined : onUi}
              name={name}
              items={shown}
              creator={creator}
              onRead={onRead}
              onItem={read}
              onAdd={onAdd}
              onBack={onBack}
              thread={thread}
              onThread={setThread}
            />
          </Suspense>
        </div>
        {detail &&
          (socialDetailApps.has(app.id) &&
          (!detail.password || unlocks.includes(detail.id)) ? (
            <SocialDetail
              app={app.id}
              item={detail}
              back={back}
              owner={work.phone.owner}
              ui={state.ui?.[app.id]}
              onUi={onUi}
            />
          ) : nativeDetailApps.has(app.id) &&
            (!detail.password || unlocks.includes(detail.id)) ? (
            <NativeDetail app={app.id} item={detail} back={back} />
          ) : (
            <>
              <div className="app-nav">
                <button aria-label="返回" onClick={back}>
                  <ChevronLeft size={23} />
                </button>
                <strong>{detail.title}</strong>
                <span />
              </div>
              {detailView}
            </>
          ))}
      </>
    );
  return (
    <>
      <div className="app-nav">
        <button onClick={back} aria-label="返回">
          <ChevronLeft size={23} />
          {detail || thread ? "返回" : ""}
        </button>
        <strong>{thread || name}</strong>
        <button
          onClick={
            creator
              ? onAdd
              : () =>
                  document
                    .querySelector<HTMLInputElement>(
                      ".app-screen .phone-search input",
                    )
                    ?.focus()
          }
          aria-label={creator ? "新增内容" : "搜索内容"}
        >
          {creator ? <Plus size={22} /> : <Search size={20} />}
        </button>
      </div>
      {app.id === "settings" && !detail && work.id === "unpublished-lover-ep01" && !creator ? (
        <div className="ep01-settings">
          <h2>设置</h2>
          <p>《未公开恋人》EP01</p>
          <button type="button" onClick={onStorySave}>保存当前进度</button>
          <small>进度会自动保存在本设备浏览器中。</small>
          <button type="button" className="ep01-replay" onClick={onStoryReplay}>重新开始游戏</button>
          <small>重玩会覆盖当前存档，需要再次解锁手机。</small>
        </div>
      ) : app.id === "settings" && !detail ? (
        <NativeSettings
          work={work}
          items={items}
          creator={creator}
          onItem={read}
          onSettings={onSettings}
        />
      ) : app.id === "calculator" && !detail ? (
        <NativeCalculator
          items={shown}
          onRead={read}
          ui={state.ui?.[app.id]}
          onUi={onUi}
        />
      ) : detail ? (
        detailView
      ) : app.engine === "messaging" && thread ? (
        <div className="chat-content">
          <div className="chat-time">2026 年 9 月 1 日</div>
          {shown
            .filter((i) => i.title === thread)
            .map((i) => (
              <button
                key={i.id}
                className={`message-row ${i.outgoing ? "outgoing" : ""}`}
                onClick={() => (creator ? onEdit(i) : onRead(i.id))}
              >
                <span className="avatar">{i.sender.slice(0, 1)}</span>
                <span className="bubble">
                  {i.kind === "image" ||
                  i.kind === "audio" ||
                  i.kind === "video" ? (
                    <Media item={i} />
                  ) : i.kind === "transfer" ? (
                    <span className="transfer">
                      ¥ {i.body}
                      <small>虚构转账记录</small>
                    </span>
                  ) : (
                    i.body
                  )}
                  <small>
                    {i.time.slice(-5)} {i.read ? "✓✓" : ""}
                  </small>
                  {creator && (i.hidden || i.unlock) && (
                    <LockKeyhole size={12} />
                  )}
                </span>
              </button>
            ))}
          {creator ? (
            <button className="chat-compose" onClick={onAdd}>
              ＋ 添加一条消息
            </button>
          ) : (
            <div className="chat-compose muted">
              根据剧情推进，互动回复将在这里出现。
            </div>
          )}
        </div>
      ) : (
        <div
          className={`phone-content ${app.engine === "social" ? "feed-content" : ""}`}
        >
          {app.engine !== "media" && (
            <div className="phone-search">
              <Search size={15} />
              <input
                placeholder={`搜索${name}`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          )}
          {app.engine === "messaging" ? (
            chats.map((t) => {
              const list = shown.filter((i) => i.title === t),
                last = list[list.length - 1];
              return (
                <button
                  className="contact-row"
                  key={t}
                  onClick={() => {
                    setThread(t);
                    onRead(t);
                  }}
                >
                  <span className="avatar" style={{ background: app.color }}>
                    {t.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{t}</strong>
                    <p>{last.body}</p>
                  </span>
                  <small>{last.time.slice(-5)}</small>
                </button>
              );
            })
          ) : app.engine === "media" ? (
            <>
              <div className="media-heading">
                <h1>{tab}</h1>
                <p>{filtered.length} 个故事片段</p>
              </div>
              <div className="media-grid">
                {filtered.map((i) => (
                  <button key={i.id} onClick={() => read(i)}>
                    <Media item={i} />
                    <span>
                      {i.title} {creator && i.hidden ? "· 隐藏" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : app.engine === "social" ? (
            filtered.map((i) => (
              <article className="social-post" key={i.id}>
                <div className="post-author">
                  <span className="avatar" style={{ background: app.color }}>
                    {i.sender.slice(0, 1)}
                  </span>
                  <div>
                    <strong>{i.sender}</strong>
                    <small>{i.time}</small>
                  </div>
                  <button aria-label="查看帖子详情" onClick={() => read(i)}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <button className="post-image" onClick={() => read(i)}>
                  <Media item={i} />
                </button>
                <div className="post-actions">
                  <button
                    aria-label="虚构点赞"
                    onClick={() =>
                      setLikes(
                        likes.includes(i.id)
                          ? likes.filter((id) => id !== i.id)
                          : [...likes, i.id],
                      )
                    }
                  >
                    <Heart
                      size={22}
                      fill={likes.includes(i.id) ? "#d67670" : "none"}
                    />
                  </button>
                  <button aria-label="查看评论" onClick={() => read(i)}>
                    <MessageCircle size={22} />
                  </button>
                  <small>
                    {i.likes + (likes.includes(i.id) ? 1 : 0)} 次虚构喜欢
                  </small>
                </div>
                <button className="post-text" onClick={() => read(i)}>
                  <strong>{i.title}</strong>
                  <p>{i.body}</p>
                </button>
              </article>
            ))
          ) : (
            filtered.map((i) => (
              <button
                key={i.id}
                className={`record-row ${app.engine === "document" ? "document-row" : ""}`}
                onClick={() => read(i)}
              >
                <div className="record-symbol">
                  {app.engine === "records" ? (
                    <app.icon size={20} />
                  ) : (
                    <span>{i.title.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <strong>{i.title}</strong>
                  <p>{i.body.split("\n")[0]}</p>
                  <small>
                    {i.time} {i.folder && `· ${i.folder}`}
                  </small>
                </div>
                {i.password || i.hidden ? (
                  <LockKeyhole size={14} />
                ) : (
                  <ChevronLeft className="chevron-right" size={16} />
                )}
              </button>
            ))
          )}
          {!filtered.length && app.engine !== "messaging" && (
            <div className="empty-app">
              <app.icon size={36} />
              <h3>这一页还很安静</h3>
              <p>
                {creator
                  ? "添加属于这个 App 的故事内容。"
                  : "暂时没有可浏览的内容。"}
              </p>
            </div>
          )}
          {creator && (
            <button className="phone-add" onClick={onAdd}>
              <Plus size={15} />
              添加
              {app.engine === "messaging"
                ? "聊天"
                : app.engine === "social"
                  ? "帖子"
                  : app.engine === "media"
                    ? "素材"
                    : "内容"}
            </button>
          )}
        </div>
      )}
      {!detail &&
        !thread &&
        app.id !== "calculator" &&
        app.id !== "settings" && (
          <div className="app-tabs">
            {app.tabs.map((t, i) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {i === 0 ? (
                  <MessageCircle size={17} />
                ) : i === 1 ? (
                  <Search size={17} />
                ) : (
                  <UsersIcon />
                )}
                <span>{t}</span>
              </button>
            ))}
          </div>
        )}
    </>
  );
}
function UsersIcon() {
  return <PhoneIcon size={17} />;
}
