// Chapter 08 — case study diagrams
import { Diagram, table, sequence, TONES, T } from "../engine.mjs";
const W = 1100;
const F = (d, title, tone, h, w = 1060) => d.frame({ x: 20, y: 20, w, h, title, tone });

export default {
  // ---------- 01 URL shortener ----------
  "cs-url-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Long links — hard to share, easy to break, impossible to count", "bad", 320);
    d.box({ x: 50, y: 90, w: 1000, h: 70, text: "https://www.example-store.com/products/summer-collection/shoes?color=red&size=42&utm_source=newsletter…", tone: "bad", size: 15, weight: 500 });
    [["Breaks across lines", "in emails and chats"], ["Won't fit", "on posters, SMS, slides"], ["No click counts", "for the marketing team"]].forEach(([t, s], i) => d.node({ x: 50 + i * 340, y: 200, w: 320, h: 70, kind: "x", title: t, sub: s }));
    return d;
  },
  "cs-url-shortener": () => {
    const d = new Diagram({ w: 1500, h: 600, bare: true });
    d.node({ id: "u", x: 40, y: 250, w: 170, h: 70, kind: "users", title: "Clients", sub: "browsers, apps" });
    d.node({ id: "lb", x: 270, y: 250, w: 180, h: 70, kind: "lb", title: "Load balancer", sub: "TLS" });
    d.node({ id: "api", x: 510, y: 236, w: 230, h: 98, kind: "service", title: "API servers", sub: "stateless · create + redirect · local LRU", emphasis: true });
    d.node({ id: "idg", x: 495, y: 80, w: 260, h: 70, kind: "coord", title: "Code generator", sub: "random base62 codes" });
    d.node({ id: "cache", x: 830, y: 120, w: 250, h: 76, kind: "cache", title: "Redis cache", sub: "code → long_url · TTL 24 h" });
    d.node({ id: "db", x: 830, y: 250, w: 250, h: 76, kind: "db", title: "PostgreSQL", sub: "links · primary + sync standby" });
    d.node({ id: "q", x: 830, y: 400, w: 250, h: 70, kind: "queue", title: "Click events queue", sub: "Kafka / SQS" });
    d.node({ id: "wk", x: 1160, y: 400, w: 280, h: 70, kind: "worker", title: "Analytics workers", sub: "aggregate per minute" });
    d.node({ id: "ch", x: 1160, y: 250, w: 280, h: 76, kind: "monitor", title: "Analytics store", sub: "ClickHouse · click counts" });
    d.edge("u", "lb", { sides: "rl", hot: true, step: 1 });
    d.edge("lb", "api", { sides: "rl", hot: true });
    d.edge("api", "cache", { sides: "rl", hot: true, step: 2, label: "GET code", mid: 785 });
    d.edge("api", "db", { sides: "rl", step: 3, label: "miss", mid: 785, at: [785, 318] });
    d.edge("api", "idg", { sides: "tb", dashed: true, label: "new code" });
    d.edge("api", "q", { sides: "br", via: [[625, 435]], dashed: true, step: 4, label: "click event (async)", at: [720, 435] });
    d.edge("q", "wk", { sides: "rl" });
    d.edge("wk", "ch", { sides: "tb" });
    d.edge("lb", "u", { sides: "bb", via: [[360, 380], [125, 380]], tone: "good", label: "302 Location", at: [240, 380] });
    return d;
  },
  "cs-url-codegen": () => {
    const d = new Diagram({ w: 1500, h: 480, bare: true });
    const cols = [
      ["Hash the long URL", "warn", ["md5(url) → 128 bits", "base62, keep 7 chars", "clash? add salt, retry"]],
      ["Counter + base62", "info", ["Counter hands out ID blocks", "server A: 1,000–1,999", "id 125 → base62 “21”"]],
      ["Random + unique check", "good", ["42 random bits → 7 chars", "INSERT (code is the key)", "rare clash → pick again"]],
    ];
    cols.forEach(([t, tone, steps], i) => {
      const x = 40 + i * 474, y = 40;
      d.panel({ x, y, w: 452, h: 220, title: t, tone });
      steps.forEach((st, j) => { d.stepCircle(x + 36, y + 80 + j * 44, j + 1, tone, 12); d.text(x + 58, y + 85 + j * 44, st, { size: 13.5, mono: true, color: T.ink }); });
    });
    return d;
  },

  // ---------- 02 Rate limiter ----------
  "cs-rate-limiter": () => {
    const d = new Diagram({ w: 1300, h: 500, bare: true });
    d.node({ id: "c", x: 40, y: 190, w: 180, h: 76, kind: "users", title: "Clients", sub: "API keys, users, IPs" });
    d.group({ x: 280, y: 60, w: 330, h: 380, label: "API gateway fleet (50 nodes)", tone: "edge" });
    ["Gateway 1", "Gateway 2", "Gateway 50"].forEach((t, i) => d.node({ id: "g" + i, x: 310, y: 110 + i * 105, w: 270, h: 76, kind: "gateway", title: t, sub: "limiter middleware · rules cache" }));
    d.node({ id: "r", x: 710, y: 110, w: 260, h: 90, kind: "cache", title: "Redis Cluster", sub: "token buckets · 1 Lua script per request", emphasis: true });
    d.node({ id: "cfg", x: 710, y: 300, w: 260, h: 76, kind: "doc", title: "Rules config", sub: "limits per plan / endpoint" });
    d.node({ id: "api", x: 1050, y: 60, w: 210, h: 76, kind: "service", title: "Backend APIs" });
    d.node({ id: "rej", x: 1050, y: 180, w: 210, h: 76, kind: "x", title: "429 + Retry-After" });
    [0, 1, 2].forEach((i) => d.edge("c", "g" + i, { sides: "rl", mid: 250 }));
    d.edge("g0", "r", { sides: "rl", hot: true, step: 1, label: "allow(key)?" });
    d.edge("cfg", "g2", { sides: "lr", dashed: true, label: "push rules", mid: 650 });
    d.edge("r", "api", { sides: "rl", tone: "good", step: 2, label: "allowed", off1: [0, -18], mid: 1010 });
    d.edge("r", "rej", { sides: "rl", tone: "bad", label: "over limit", off1: [0, 18], mid: 1010 });
    return d;
  },
  "cs-rl-atomic": () => {
    const d = new Diagram({ w: 1300, h: 420, bare: true });
    sequence(d, { x: 40, y: 30, w: 1220, actorW: 220, rowH: 46, actors: [{ kind: "gateway", title: "Gateway A" }, { kind: "cache", title: "Redis" }, { kind: "gateway", title: "Gateway B" }], messages: [
      { from: 0, to: 1, label: "EVAL limiter.lua  key=user:42", step: 1 },
      { from: 2, to: 1, label: "EVAL limiter.lua  key=user:42 (queued behind A)", step: 2 },
      { note: "Redis runs one script at a time: refill → check → take a token → save", from: 0, to: 2, tone: "info" },
      { from: 1, to: 0, label: "allowed · 1 token left → 0", dashed: true, tone: "good" },
      { from: 1, to: 2, label: "denied · bucket empty → 429", dashed: true, tone: "bad" },
      { note: "no race: the last token can only be taken once", from: 0, to: 2, tone: "good" }] });
    return d;
  },

  // ---------- 03 Notifications ----------
  "cs-notif-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "Every team sends its own way — duplicates, spam and lost codes", "bad", 380);
    ["Orders team", "Social team", "Marketing team", "Security team"].forEach((t, i) => { d.node({ id: "t" + i, x: 50, y: 80 + i * 72, w: 260, h: 56, kind: "service", title: t, sub: ["own email code", "own push code", "10M-email blast", "login codes (OTP)"][i] }); });
    d.node({ id: "u", x: 780, y: 170, w: 270, h: 96, kind: "user", tone: "bad", title: "One user", sub: "3 copies of one alert · pinged at 3 a.m. · OTP arrives 40 min late", emphasis: true });
    [0, 1, 2, 3].forEach((i) => d.edge("t" + i, "u", { sides: "rl", mid: 540, tone: "bad", dashed: i === 3 }));
    return d;
  },
  "cs-notifications": () => {
    const d = new Diagram({ w: 1400, h: 560, bare: true });
    d.node({ id: "p", x: 40, y: 220, w: 180, h: 80, kind: "service", title: "Product services", sub: "orders, social, auth…" });
    d.node({ id: "api", x: 280, y: 220, w: 190, h: 80, kind: "gateway", title: "Notification API", sub: "validate · idempotency" });
    d.node({ id: "q", x: 530, y: 220, w: 170, h: 80, kind: "stream", title: "Ingest queue", sub: "Kafka" });
    d.node({ id: "o", x: 760, y: 200, w: 220, h: 120, kind: "worker", title: "Orchestrator", sub: "preferences · quiet hours · dedupe · templates", emphasis: true });
    d.node({ id: "pref", x: 760, y: 40, w: 220, h: 70, kind: "cache", title: "Preferences", sub: "cached" });
    d.node({ id: "tpl", x: 760, y: 410, w: 220, h: 70, kind: "doc", title: "Templates", sub: "per channel, locale" });
    const lanes = [["OTP / security lane", "bad"], ["Transactional lane", "info"], ["Social lane", "queue"], ["Marketing lane", "neutral"]];
    lanes.forEach(([t, tone], i) => d.node({ id: "l" + i, x: 1040, y: 60 + i * 110, w: 150, h: 70, kind: "queue", tone, title: t }));
    [["Push", "APNs / FCM"], ["Email", "SES"], ["SMS", "Twilio"], ["In-app", "inbox DB"]].forEach(([t, s2], i) => d.node({ id: "w" + i, x: 1240, y: 60 + i * 110, w: 140, h: 70, kind: "bell", title: t, sub: s2 }));
    d.edge("p", "api", { sides: "rl", hot: true }); d.edge("api", "q", { sides: "rl", hot: true }); d.edge("q", "o", { sides: "rl", hot: true });
    d.edge("o", "pref", { sides: "tb", dashed: true }); d.edge("o", "tpl", { sides: "bt", dashed: true });
    [0, 1, 2, 3].forEach((i) => { d.edge("o", "l" + i, { sides: "rl", mid: 1010 }); d.edge("l" + i, "w" + i, { sides: "rl" }); });
    return d;
  },
  "cs-notif-lanes": () => {
    const d = new Diagram({ w: 1300, h: 380, bare: true });
    table(d, { x: 30, y: 30, rowH: 58, headH: 46, size: 14.5, cols: [{ title: "Lane", w: 270 }, { title: "Examples", w: 360 }, { title: "Target delivery", w: 230 }, { title: "Workers", w: 380 }], rows: [
      [{ t: "P0 · Security", tone: "bad" }, "Login codes, password reset, fraud alerts", "seconds", "dedicated, always over-provisioned"],
      [{ t: "P1 · Transactional", tone: "info" }, "Receipts, shipping updates", "< 1 minute", "dedicated pool"],
      [{ t: "P2 · Social", tone: "queue" }, "Likes, comments, follows", "minutes · can batch", "shared, autoscaled"],
      [{ t: "P3 · Marketing", tone: "neutral" }, "Campaigns, newsletters", "hours · quiet hours apply", "rate-limited, lowest priority"],
    ] });
    return d;
  },

  // ---------- 04 News feed ----------
  "cs-feed-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "Building the feed when it's opened — 200 lookups per open", "bad", 380);
    d.node({ id: "u", x: 50, y: 110, w: 210, h: 76, kind: "mobile", title: "User opens app", sub: "follows 200 people" });
    d.node({ id: "f", x: 340, y: 110, w: 210, h: 76, kind: "service", title: "Feed service" });
    d.node({ id: "db", x: 760, y: 90, w: 290, h: 116, kind: "db", tone: "bad", title: "Posts database", sub: "200 queries + sort, × 10M users × 10 opens/day 🔥", emphasis: true });
    d.edge("u", "f", { sides: "rl" });
    d.edge("f", "db", { sides: "rl", tone: "bad", hot: true, label: "posts of person 1…200" });
    return d;
  },
  "cs-news-feed": () => {
    const d = new Diagram({ w: 1400, h: 560, bare: true });
    d.node({ id: "a", x: 40, y: 90, w: 180, h: 70, kind: "user", title: "Author posts" });
    d.node({ id: "ps", x: 280, y: 90, w: 200, h: 70, kind: "service", title: "Post service" });
    d.node({ id: "pdb", x: 280, y: 250, w: 200, h: 70, kind: "db", title: "Posts DB", sub: "+ post cache" });
    d.node({ id: "k", x: 540, y: 90, w: 190, h: 70, kind: "stream", title: "PostCreated", sub: "Kafka" });
    d.node({ id: "fw", x: 790, y: 80, w: 230, h: 90, kind: "worker", title: "Fan-out workers", sub: "skip celebrities" });
    d.node({ id: "g", x: 790, y: 250, w: 230, h: 70, kind: "db", title: "Follow graph", sub: "who follows whom" });
    d.node({ id: "tl", x: 1090, y: 80, w: 270, h: 90, kind: "cache", title: "Timeline cache", sub: "Redis · feed:{user} = post IDs", emphasis: true });
    d.node({ id: "r", x: 40, y: 420, w: 180, h: 70, kind: "mobile", title: "Reader opens feed" });
    d.node({ id: "fs", x: 280, y: 410, w: 230, h: 90, kind: "service", title: "Feed service", sub: "read IDs · merge celebrities · hydrate" });
    d.edge("a", "ps", { sides: "rl", hot: true, step: 1 }); d.edge("ps", "pdb", { sides: "bt" }); d.edge("ps", "k", { sides: "rl", step: 2 });
    d.edge("k", "fw", { sides: "rl" }); d.edge("fw", "g", { sides: "bt", dashed: true, label: "followers" }); d.edge("fw", "tl", { sides: "rl", tone: "good", step: 3, label: "push post ID" });
    d.edge("r", "fs", { sides: "rl", hot: true, step: 4 });
    d.edge("fs", "tl", { sides: "rb", via: [[1225, 455]], tone: "good", label: "1 read: my timeline", at: [1100, 455] });
    d.edge("fs", "pdb", { sides: "tb", dashed: true, label: "hydrate + celebrity posts" });
    return d;
  },
  "cs-feed-fanout": () => {
    const d = new Diagram({ w: 1400, h: 440, bare: true });
    const mk = (x, title, tone, write) => {
      d.panel({ x, y: 30, w: 440, h: 380, title, tone });
      d.node({ id: title + "a", x: x + 20, y: 170, w: 140, h: 60, kind: "user", title: "Author" });
      ["Follower 1", "Follower 2", "Follower 3"].forEach((t, i) => d.node({ id: title + i, x: x + 280, y: 90 + i * 100, w: 140, h: 56, kind: "cache", title: t + " feed" }));
      [0, 1, 2].forEach((i) => d.edge(write ? title + "a" : title + i, write ? title + i : title + "a", { sides: write ? "rl" : "lr", mid: x + 220, tone }));
    };
    mk(30, "Fan-out on write (push)", "good", true);
    mk(490, "Fan-out on read (pull)", "info", false);
    d.panel({ x: 950, y: 30, w: 420, h: 380, title: "Hybrid (what big feeds use)", tone: "edge" });
    d.node({ x: 970, y: 100, w: 380, h: 70, kind: "users", title: "Normal accounts", sub: "push to followers' timelines" });
    d.node({ x: 970, y: 200, w: 380, h: 70, kind: "warn", tone: "warn", title: "Celebrities (100K+ followers)", sub: "no push — pulled and merged at read time" });
    d.node({ x: 970, y: 300, w: 380, h: 70, kind: "check", title: "Fast reads, bounded write cost" });
    return d;
  },

  // ---------- 05 Chat ----------
  "cs-chat-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Plain web requests — the server can't reach Bob", "bad", 320);
    d.node({ id: "a", x: 50, y: 140, w: 200, h: 70, kind: "mobile", title: "Alice", sub: "sends “hi”" });
    d.node({ id: "s", x: 420, y: 130, w: 260, h: 90, kind: "service", title: "Web server", sub: "stores “hi”… then what?" });
    d.node({ id: "b", x: 850, y: 140, w: 200, h: 70, kind: "mobile", tone: "bad", title: "Bob", sub: "not asking right now" });
    d.edge("a", "s", { sides: "rl" });
    d.edge("s", "b", { sides: "rl", tone: "bad", dashed: true, label: "✗ can't start a request" });
    return d;
  },
  "cs-chat": () => {
    const d = new Diagram({ w: 1400, h: 560, bare: true });
    d.node({ id: "a", x: 40, y: 90, w: 170, h: 70, kind: "mobile", title: "Alice" });
    d.node({ id: "b", x: 40, y: 380, w: 170, h: 70, kind: "mobile", title: "Bob" });
    d.node({ id: "lb", x: 260, y: 230, w: 170, h: 76, kind: "lb", title: "L7 load balancer", sub: "WebSocket" });
    d.group({ x: 480, y: 40, w: 250, h: 470, label: "Gateway fleet (~1,000)", tone: "compute" });
    d.node({ id: "g1", x: 500, y: 85, w: 210, h: 70, kind: "ws", title: "Gateway 1", sub: "holds Alice's socket" });
    d.node({ id: "g7", x: 500, y: 375, w: 210, h: 70, kind: "ws", title: "Gateway 7", sub: "holds Bob's socket" });
    d.node({ id: "cs", x: 800, y: 220, w: 230, h: 96, kind: "service", title: "Chat service", sub: "assign seq · save · route", emphasis: true });
    d.node({ id: "db", x: 1110, y: 80, w: 250, h: 76, kind: "db", title: "Message store", sub: "Cassandra · by conv_id, seq" });
    d.node({ id: "reg", x: 1110, y: 230, w: 250, h: 76, kind: "cache", title: "Connection registry", sub: "Redis · user → gateway" });
    d.node({ id: "push", x: 1110, y: 380, w: 250, h: 76, kind: "bell", title: "Push service", sub: "APNs / FCM if offline" });
    d.edge("a", "lb", { sides: "rl", mid: 235 }); d.edge("b", "lb", { sides: "rl", mid: 235 });
    d.edge("lb", "g1", { sides: "rl", mid: 455 }); d.edge("lb", "g7", { sides: "rl", mid: 455 });
    d.edge("g1", "cs", { sides: "rl", hot: true, step: 1, mid: 760 });
    d.edge("cs", "db", { sides: "rl", step: 2, label: "save first", mid: 1070 });
    d.edge("cs", "reg", { sides: "rl", dashed: true, step: 3, label: "where is Bob?" });
    d.edge("cs", "g7", { sides: "bl", via: [[915, 410]], hot: true, step: 4, label: "push", at: [860, 410] });
    d.edge("cs", "push", { sides: "rl", dashed: true, mid: 1070, label: "offline" });
    return d;
  },
  "cs-chat-delivery": () => {
    const d = new Diagram({ w: 1300, h: 520, bare: true });
    sequence(d, { x: 40, y: 30, w: 1220, actorW: 220, rowH: 44, actors: [{ kind: "mobile", title: "Alice's phone" }, { kind: "service", title: "Chat service" }, { kind: "db", title: "Message store" }, { kind: "mobile", title: "Bob's phone" }], messages: [
      { from: 0, to: 1, label: "send “hi” · client_msg_id c-77", step: 1 },
      { from: 1, to: 2, label: "save as seq 1043" },
      { from: 1, to: 0, label: "ack seq 1043  →  ✓ sent", dashed: true, tone: "good" },
      { from: 1, to: 3, label: "push message seq 1043", step: 2 },
      { from: 3, to: 1, label: "delivered up to 1043", dashed: true },
      { from: 1, to: 0, label: "✓✓ delivered", dashed: true, tone: "good" },
      { note: "Bob opens the chat", from: 3, to: 3, tone: "info" },
      { from: 3, to: 1, label: "read up to 1043", step: 3 },
      { from: 1, to: 0, label: "blue ticks · read", dashed: true, tone: "info" }] });
    return d;
  },

  // ---------- 06 Photo sharing ----------
  "cs-photo-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Every photo flows through the app servers", "bad", 340);
    d.node({ id: "u", x: 50, y: 140, w: 200, h: 76, kind: "mobile", title: "Phones", sub: "5 MB uploads & views" });
    d.node({ id: "a", x: 420, y: 120, w: 280, h: 116, kind: "service", tone: "bad", title: "App servers", sub: "busy moving megabytes · slow for everyone", emphasis: true });
    d.node({ id: "db", x: 850, y: 140, w: 200, h: 76, kind: "db", tone: "bad", title: "Database", sub: "photos stored as blobs" });
    d.edge("u", "a", { sides: "rl", tone: "bad", both: true, label: "5 MB each way" });
    d.edge("a", "db", { sides: "rl", tone: "bad", both: true });
    return d;
  },
  "cs-photo-sharing": () => {
    const d = new Diagram({ w: 1400, h: 520, bare: true });
    d.node({ id: "p", x: 40, y: 210, w: 170, h: 76, kind: "mobile", title: "Phone" });
    d.node({ id: "api", x: 290, y: 60, w: 220, h: 76, kind: "service", title: "Upload & post API", sub: "small metadata only" });
    d.node({ id: "meta", x: 290, y: 380, w: 220, h: 76, kind: "db", title: "Metadata DB", sub: "posts, media status" });
    d.node({ id: "raw", x: 600, y: 200, w: 230, h: 96, kind: "storage", title: "Object storage", sub: "originals + resized versions", emphasis: true });
    d.node({ id: "w", x: 920, y: 60, w: 230, h: 90, kind: "worker", title: "Processing workers", sub: "resize · WebP/AVIF · strip GPS · moderate" });
    d.node({ id: "cdn", x: 920, y: 360, w: 230, h: 76, kind: "cdn", title: "CDN", sub: "serves every image view" });
    d.node({ id: "v", x: 1230, y: 360, w: 140, h: 76, kind: "users", title: "Viewers" });
    d.edge("p", "api", { sides: "tl", via: [[125, 98]], step: 1, label: "get signed URL" });
    d.edge("p", "raw", { sides: "rl", hot: true, step: 2, label: "upload bytes directly" });
    d.edge("raw", "w", { sides: "tl", via: [[715, 105]], dashed: true, step: 3, label: "object created" });
    d.edge("w", "raw", { sides: "bt", via: [[1035, 180], [780, 180]], tone: "good", label: "variants", at: [900, 180], off2: [50, 0] });
    d.edge("w", "meta", { sides: "lr", via: [[870, 130], [870, 418]], dashed: true, label: "status = ready", at: [870, 300] });
    d.edge("raw", "cdn", { sides: "br", via: [[715, 398]], tone: "good" });
    d.edge("cdn", "v", { sides: "rl", tone: "good", hot: true });
    d.edge("api", "meta", { sides: "bt", dashed: true });
    return d;
  },
  "cs-photo-upload": () => {
    const d = new Diagram({ w: 1300, h: 440, bare: true });
    sequence(d, { x: 40, y: 30, w: 1220, actorW: 220, rowH: 46, actors: [{ kind: "mobile", title: "Phone" }, { kind: "service", title: "Upload API" }, { kind: "storage", title: "Object storage" }, { kind: "worker", title: "Workers" }], messages: [
      { from: 0, to: 1, label: "I want to upload a photo", step: 1 },
      { from: 1, to: 0, label: "signed URL · valid 15 min · one object only", dashed: true, tone: "good" },
      { from: 0, to: 2, label: "PUT 5 MB directly (resumable)", step: 2, tone: "good" },
      { from: 2, to: 3, label: "event: object created", step: 3, dashed: true },
      { from: 3, to: 2, label: "save thumb / feed / full sizes" },
      { from: 3, to: 1, label: "media ready", dashed: true },
      { from: 0, to: 1, label: "create post with this photo", step: 4 }] });
    return d;
  },

  // ---------- 07 Ride sharing ----------
  "cs-ride-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Live locations in a normal database — it can't keep up", "bad", 340);
    d.node({ id: "d", x: 50, y: 90, w: 250, h: 76, kind: "users", title: "5M drivers", sub: "update every 4 s" });
    d.node({ id: "r", x: 50, y: 220, w: 250, h: 76, kind: "user", title: "Riders", sub: "“who's within 2 km?”" });
    d.node({ id: "db", x: 520, y: 140, w: 320, h: 110, kind: "db", tone: "bad", title: "SQL database", sub: "1.25M writes/s + distance scans 🔥", emphasis: true });
    d.edge("d", "db", { sides: "rl", tone: "bad", mid: 420 }); d.edge("r", "db", { sides: "rl", tone: "bad", mid: 420 });
    d.node({ x: 880, y: 160, w: 180, h: 70, kind: "x", title: "Slow matches" });
    return d;
  },
  "cs-ride-sharing": () => {
    const d = new Diagram({ w: 1300, h: 560, bare: true });
    d.node({ id: "drv", x: 40, y: 80, w: 190, h: 76, kind: "mobile", title: "Driver apps", sub: "position every 4 s" });
    d.node({ id: "lg", x: 300, y: 80, w: 200, h: 76, kind: "ws", title: "Location gateways" });
    d.node({ id: "loc", x: 580, y: 70, w: 270, h: 96, kind: "map", title: "Location service", sub: "in-memory geo index · per city / H3 cell", emphasis: true });
    d.node({ id: "k", x: 940, y: 80, w: 300, h: 76, kind: "stream", title: "Location stream (Kafka)", sub: "→ ETA models, surge, analytics" });
    d.node({ id: "rid", x: 40, y: 330, w: 190, h: 76, kind: "mobile", title: "Rider app" });
    d.node({ id: "trip", x: 300, y: 330, w: 200, h: 76, kind: "service", title: "Trip service", sub: "state machine" });
    d.node({ id: "disp", x: 580, y: 320, w: 270, h: 96, kind: "worker", title: "Dispatch", sub: "find nearby → rank by ETA → offer with lock" });
    d.node({ id: "eta", x: 940, y: 330, w: 300, h: 76, kind: "map", title: "ETA / routing service" });
    d.node({ id: "db", x: 580, y: 470, w: 270, h: 64, kind: "db", title: "Trips & drivers DB", sub: "driver status, rides" });
    d.node({ id: "pay", x: 300, y: 470, w: 200, h: 64, kind: "money", title: "Payments", sub: "at trip end" });
    d.edge("drv", "lg", { sides: "rl", hot: true, step: 1 }); d.edge("lg", "loc", { sides: "rl", hot: true });
    d.edge("loc", "k", { sides: "rl", dashed: true });
    d.edge("rid", "trip", { sides: "rl", hot: true, step: 2, label: "request" });
    d.edge("trip", "disp", { sides: "rl", step: 3 });
    d.edge("disp", "loc", { sides: "tb", tone: "good", step: 4, label: "drivers near pickup" });
    d.edge("disp", "eta", { sides: "rl", step: 5, label: "rank by ETA" });
    d.edge("disp", "db", { sides: "bt", step: 6, label: "offer: lock driver" });
    d.edge("trip", "pay", { sides: "bt", dashed: true });
    return d;
  },
  "cs-trip-states": () => {
    const d = new Diagram({ w: 1400, h: 360, bare: true });
    const st = [["REQUESTED", "info"], ["MATCHING", "info"], ["DRIVER ASSIGNED", "edge"], ["ARRIVING", "edge"], ["IN PROGRESS", "compute"], ["COMPLETED", "good"], ["PAID", "good"]];
    st.forEach(([t, tone], i) => d.box({ id: "s" + i, x: 30 + i * 196, y: 60, w: 176, h: 64, text: t, tone, solid: i >= 5, size: 14 }));
    for (let i = 0; i < st.length - 1; i++) d.edge("s" + i, "s" + (i + 1), { sides: "rl" });
    d.box({ id: "c", x: 420, y: 230, w: 360, h: 60, text: "CANCELLED", sub: "rider or driver cancels · fee rules apply", tone: "bad", size: 15 });
    ["s1", "s2", "s3"].forEach((s) => d.edge(s, "c", { sides: "bt", dashed: true, tone: "bad" }));
    d.text(314, 44, "driver declines → offer the next driver", { size: 12.5, weight: 600, color: T.muted, anchor: "middle" });
    return d;
  },

  // ---------- 08 Video streaming ----------
  "cs-video-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "One huge original file for every viewer", "bad", 340);
    d.node({ id: "o", x: 50, y: 140, w: 260, h: 90, kind: "video", title: "movie.mp4", sub: "4K original · 4 GB" });
    [["4K TV · fibre", "plays fine", "check"], ["Phone on a train", "buffering… buffering…", "x"], ["Old laptop", "can't play this format", "x"]].forEach(([t, s2, k], i) => { d.node({ id: "v" + i, x: 720, y: 80 + i * 90, w: 330, h: 70, kind: k, title: t, sub: s2 }); d.edge("o", "v" + i, { sides: "rl", mid: 520, tone: k === "x" ? "bad" : "good" }); });
    return d;
  },
  "cs-video-streaming": () => {
    const d = new Diagram({ w: 1400, h: 500, bare: true });
    d.node({ id: "c", x: 40, y: 90, w: 180, h: 76, kind: "user", title: "Creator", sub: "uploads 4 GB" });
    d.node({ id: "raw", x: 290, y: 90, w: 210, h: 76, kind: "storage", title: "Raw uploads", sub: "object storage" });
    d.node({ id: "split", x: 570, y: 90, w: 210, h: 76, kind: "worker", title: "Split into chunks" });
    d.group({ x: 850, y: 30, w: 290, h: 200, label: "Parallel encoders", tone: "compute" });
    ["240p · 480p", "720p · 1080p", "4K · AV1 / H.264"].forEach((t, i) => d.node({ id: "e" + i, x: 870, y: 65 + i * 52, w: 250, h: 44, kind: "gear", tone: "compute", title: t }));
    d.node({ id: "pkg", x: 1180, y: 90, w: 190, h: 76, kind: "file", title: "Package", sub: "HLS / DASH segments" });
    d.node({ id: "out", x: 1180, y: 300, w: 190, h: 76, kind: "storage", title: "Encoded video", sub: "origin storage" });
    d.node({ id: "cdn", x: 830, y: 300, w: 250, h: 76, kind: "cdn", title: "CDN edges", sub: "cache popular segments", emphasis: true });
    d.node({ id: "p", x: 290, y: 300, w: 300, h: 90, kind: "play", title: "Player", sub: "fetch manifest, then segments; switch quality" });
    d.node({ id: "meta", x: 40, y: 300, w: 180, h: 76, kind: "db", title: "Video metadata" });
    d.edge("c", "raw", { sides: "rl", hot: true, step: 1 }); d.edge("raw", "split", { sides: "rl", step: 2 });
    d.edge("split", "e1", { sides: "rl", mid: 820 }); d.edge("e1", "pkg", { sides: "rl", mid: 1160 });
    d.edge("pkg", "out", { sides: "bt", step: 3 });
    d.edge("out", "cdn", { sides: "lr", dashed: true, label: "on first request" });
    d.edge("cdn", "p", { sides: "lr", tone: "good", hot: true, step: 4, label: "4-second segments" });
    d.edge("p", "meta", { sides: "lr", dashed: true });
    return d;
  },
  "cs-abr": () => {
    const d = new Diagram({ w: 1300, h: 380, bare: true });
    const x0 = 120, x1 = 1260, yb = 300;
    d.raw(`<line x1="${x0}" y1="${yb}" x2="${x1}" y2="${yb}" stroke="#CBD5E1" stroke-width="2"/><line x1="${x0}" y1="40" x2="${x0}" y2="${yb}" stroke="#CBD5E1" stroke-width="2"/>`, "back");
    const levels = { "1080p": 70, "720p": 140, "480p": 210, "240p": 270 };
    Object.entries(levels).forEach(([k, y]) => { d.text(x0 - 12, y + 5, k, { size: 13, weight: 700, color: T.muted, anchor: "end" }); d.raw(`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#F1F5F9" stroke-width="1.5"/>`, "back"); });
    const seq = ["720p", "1080p", "1080p", "1080p", "480p", "240p", "240p", "480p", "720p", "1080p", "1080p", "1080p"];
    const sw = (x1 - x0 - 20) / seq.length;
    seq.forEach((q, i) => { const y = levels[q]; const tone = y <= 70 ? "good" : y <= 140 ? "info" : y <= 210 ? "warn" : "bad"; d.raw(`<rect x="${x0 + 10 + i * sw}" y="${y - 14}" width="${sw - 6}" height="28" rx="6" fill="${TONES[tone][0]}" opacity=".9"/>`, "mid"); });
    d.raw(`<rect x="${x0 + 10 + 4 * sw}" y="30" width="${4 * sw - 6}" height="${yb - 30}" rx="10" fill="${TONES.bad[1]}" opacity=".6"/>`, "back");
    d.text(x0 + 10 + 6 * sw, 50, "train enters a tunnel — bandwidth drops", { size: 13, weight: 700, color: TONES.bad[0], anchor: "middle" });
    d.text(690, 340, "each block = one 4-second segment · the video never stops, only its sharpness changes", { size: 14, weight: 600, color: T.body, anchor: "middle" });
    return d;
  },

  // ---------- 09 File sync ----------
  "cs-sync-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Re-upload the whole file for a one-slide change", "bad", 340);
    d.node({ id: "l", x: 50, y: 140, w: 240, h: 76, kind: "browser", title: "Laptop", sub: "edits 1 slide of 500 MB" });
    d.node({ id: "s", x: 420, y: 130, w: 260, h: 96, kind: "storage", tone: "bad", title: "Cloud storage", sub: "stores another full 500 MB copy" });
    d.node({ id: "p", x: 810, y: 140, w: 240, h: 76, kind: "mobile", tone: "bad", title: "Phone & tablet", sub: "download 500 MB each" });
    d.edge("l", "s", { sides: "rl", tone: "bad", label: "500 MB up" }); d.edge("s", "p", { sides: "rl", tone: "bad", label: "500 MB down" });
    return d;
  },
  "cs-file-sync": () => {
    const d = new Diagram({ w: 1400, h: 520, bare: true });
    d.node({ id: "cl", x: 40, y: 190, w: 220, h: 110, kind: "browser", title: "Desktop client", sub: "watch folder · chunk · hash · local DB" });
    d.node({ id: "meta", x: 380, y: 70, w: 250, h: 90, kind: "service", title: "Metadata service", sub: "files, versions, chunk lists", emphasis: true });
    d.node({ id: "mdb", x: 720, y: 70, w: 250, h: 90, kind: "db", title: "Metadata DB", sub: "sharded by namespace + journal" });
    d.node({ id: "blk", x: 380, y: 340, w: 250, h: 90, kind: "storage", title: "Block storage", sub: "4 MB chunks by SHA-256" });
    d.node({ id: "nt", x: 720, y: 220, w: 250, h: 76, kind: "bell", title: "Notification service", sub: "“namespace changed”" });
    d.node({ id: "o", x: 1080, y: 220, w: 260, h: 90, kind: "mobile", title: "Other devices", sub: "pull changes since cursor" });
    d.edge("cl", "blk", { sides: "br", via: [[150, 385]], hot: true, step: 1, label: "upload missing chunks", at: [260, 385] });
    d.edge("cl", "meta", { sides: "tl", via: [[150, 115]], step: 2, label: "commit version", at: [250, 115] });
    d.edge("meta", "mdb", { sides: "rl" });
    d.edge("mdb", "nt", { sides: "bt", step: 3, dashed: true });
    d.edge("nt", "o", { sides: "rl", step: 4 });
    d.edge("o", "blk", { sides: "bb", via: [[1210, 470], [505, 470]], tone: "good", label: "download only changed chunks", at: [850, 470] });
    return d;
  },
  "cs-chunking": () => {
    const d = new Diagram({ w: 1300, h: 360, bare: true });
    d.text(40, 50, "Version 1", { size: 15, weight: 800, color: T.ink });
    d.text(40, 190, "Version 2 (one slide edited)", { size: 15, weight: 800, color: T.ink });
    ["a1f3", "9c2e", "77b0", "e41d", "5a9c"].forEach((h, i) => d.box({ x: 40 + i * 180, y: 70, w: 164, h: 64, text: `chunk ${i + 1}`, sub: `sha ${h}…`, tone: "info", size: 14 }));
    ["a1f3", "9c2e", "c08a", "e41d", "5a9c"].forEach((h, i) => d.box({ x: 40 + i * 180, y: 210, w: 164, h: 64, text: `chunk ${i + 1}`, sub: `sha ${h}…`, tone: i === 2 ? "good" : "neutral", solid: i === 2, size: 14 }));
    d.note({ x: 960, y: 70, w: 300, title: "Result", icon: "check", tone: "good", lines: ["Only chunk 3 (4 MB) is uploaded — not 500 MB.", "Chunks 1, 2, 4, 5 are reused: same hash, stored once."] });
    return d;
  },

  // ---------- 10 Web crawler ----------
  "cs-crawler-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "A naive crawler — hammering, looping, repeating", "bad", 340);
    d.node({ id: "c", x: 50, y: 140, w: 220, h: 80, kind: "worker", title: "One crawler loop", sub: "fetch → add links → repeat" });
    [["small-shop.com", "1,000 requests/s → blocked 🚫"], ["calendar?month=next", "infinite trap ♾"], ["same page, 50 URLs", "downloaded 50 times"]].forEach(([t, s2], i) => { d.node({ id: "x" + i, x: 690, y: 80 + i * 90, w: 360, h: 70, kind: "x", title: t, sub: s2 }); d.edge("c", "x" + i, { sides: "rl", mid: 480, tone: "bad" }); });
    return d;
  },
  "cs-web-crawler": () => {
    const d = new Diagram({ w: 1400, h: 520, bare: true });
    d.node({ id: "seed", x: 40, y: 80, w: 170, h: 70, kind: "doc", title: "Seed URLs" });
    d.node({ id: "fr", x: 280, y: 70, w: 250, h: 90, kind: "queue", title: "URL frontier", sub: "priority + per-host politeness", emphasis: true });
    d.node({ id: "fe", x: 610, y: 70, w: 250, h: 90, kind: "worker", title: "Fetchers (×1,000s)", sub: "async I/O · timeouts · size caps" });
    d.node({ id: "dns", x: 610, y: 230, w: 250, h: 64, kind: "dns", title: "DNS + robots.txt caches" });
    d.node({ id: "st", x: 940, y: 70, w: 250, h: 90, kind: "storage", title: "Content store", sub: "pages + fingerprints" });
    d.node({ id: "pa", x: 940, y: 330, w: 250, h: 90, kind: "worker", title: "Parser", sub: "extract + normalize links" });
    d.node({ id: "bf", x: 610, y: 340, w: 250, h: 76, kind: "cache", title: "Seen filter", sub: "Bloom filter → seen-URL store" });
    d.node({ id: "ix", x: 1250, y: 70, w: 130, h: 90, kind: "search", title: "Indexer" });
    d.edge("seed", "fr", { sides: "rl" }); d.edge("fr", "fe", { sides: "rl", hot: true, step: 1, label: "next due URL" });
    d.edge("fe", "dns", { sides: "bt", dashed: true }); d.edge("fe", "st", { sides: "rl", hot: true, step: 2 });
    d.edge("st", "ix", { sides: "rl", dashed: true });
    d.edge("st", "pa", { sides: "bt", step: 3 });
    d.edge("pa", "bf", { sides: "lr", step: 4, label: "new links" });
    d.edge("bf", "fr", { sides: "lb", via: [[405, 378]], tone: "good", step: 5, label: "only unseen URLs", at: [480, 378] });
    return d;
  },
  "cs-frontier": () => {
    const d = new Diagram({ w: 1300, h: 440, bare: true });
    d.node({ id: "in", x: 30, y: 180, w: 170, h: 70, kind: "doc", title: "New URLs" });
    d.node({ id: "pr", x: 250, y: 180, w: 170, h: 70, kind: "ml", title: "Prioritizer", sub: "importance, freshness" });
    d.group({ x: 460, y: 40, w: 230, h: 360, label: "Front queues (priority)", tone: "queue" });
    ["High", "Medium", "Low"].forEach((t, i) => d.node({ id: "f" + i, x: 480, y: 90 + i * 100, w: 190, h: 60, kind: "queue", title: t }));
    d.group({ x: 740, y: 40, w: 270, h: 360, label: "Back queues (one per website)", tone: "edge" });
    ["news.com", "shop.com", "blog.org", "…"].forEach((t, i) => d.node({ id: "b" + i, x: 760, y: 80 + i * 76, w: 230, h: 56, kind: "globe", tone: "edge", title: t }));
    d.node({ id: "h", x: 1060, y: 170, w: 210, h: 90, kind: "clock", title: "Scheduler heap", sub: "next allowed time per site" });
    d.edge("in", "pr", { sides: "rl" });
    [0, 1, 2].forEach((i) => d.edge("pr", "f" + i, { sides: "rl", mid: 440 }));
    [0, 1, 2].forEach((i) => d.edge("f" + i, "b" + i, { sides: "rl", mid: 715 }));
    d.edge("b1", "h", { sides: "rl", tone: "good", label: "release when polite delay passed", at: [1030, 140] });
    return d;
  },

  // ---------- 11 Typeahead ----------
  "cs-type-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "A database query on every keystroke", "bad", 320);
    d.node({ id: "u", x: 50, y: 130, w: 240, h: 76, kind: "browser", title: "Typing “how to m”", sub: "a request per letter" });
    d.node({ id: "db", x: 620, y: 120, w: 430, h: 96, kind: "db", tone: "bad", title: "Query log · billions of rows", sub: "LIKE 'how to m%' ORDER BY popularity — seconds each", emphasis: true });
    d.edge("u", "db", { sides: "rl", tone: "bad", hot: true, label: "h · ho · how · how t · …" });
    return d;
  },
  "cs-typeahead": () => {
    const d = new Diagram({ w: 1400, h: 520, bare: true });
    d.group({ x: 30, y: 30, w: 1340, h: 170, label: "Offline — rebuilt every hour", tone: "neutral" });
    d.node({ id: "logs", x: 60, y: 80, w: 220, h: 76, kind: "stream", title: "Search logs", sub: "Kafka → data lake" });
    d.node({ id: "agg", x: 360, y: 80, w: 250, h: 76, kind: "worker", title: "Count & score queries", sub: "recency-weighted, filtered" });
    d.node({ id: "build", x: 690, y: 80, w: 250, h: 76, kind: "gear", tone: "compute", title: "Build trie", sub: "top-k stored at every node" });
    d.node({ id: "snap", x: 1020, y: 80, w: 320, h: 76, kind: "storage", title: "Trie snapshot", sub: "object storage, versioned" });
    d.edge("logs", "agg", { sides: "rl" }); d.edge("agg", "build", { sides: "rl" }); d.edge("build", "snap", { sides: "rl" });
    d.node({ id: "u", x: 60, y: 330, w: 220, h: 80, kind: "browser", title: "Browser", sub: "debounce 50 ms" });
    d.node({ id: "cdn", x: 360, y: 330, w: 250, h: 80, kind: "cdn", title: "CDN / edge cache", sub: "short popular prefixes" });
    d.node({ id: "sv", x: 690, y: 330, w: 250, h: 80, kind: "service", title: "Suggest service", sub: "merge trending, personalize" });
    d.node({ id: "trie", x: 1020, y: 310, w: 320, h: 120, kind: "search", title: "Trie servers (replicas)", sub: "whole trie in memory · walk to prefix node", emphasis: true });
    d.node({ id: "tr", x: 690, y: 450, w: 250, h: 56, kind: "cache", title: "Trending list (Redis)" });
    d.edge("u", "cdn", { sides: "rl", hot: true }); d.edge("cdn", "sv", { sides: "rl", label: "miss" }); d.edge("sv", "trie", { sides: "rl", hot: true });
    d.edge("snap", "trie", { sides: "bt", dashed: true, label: "load + atomic swap" });
    d.edge("sv", "tr", { sides: "bt", dashed: true });
    return d;
  },
  "cs-trie": () => {
    const d = new Diagram({ w: 1300, h: 440, bare: true });
    d.box({ id: "r", x: 560, y: 30, w: 180, h: 50, text: "(root)", tone: "neutral", size: 14 });
    d.box({ id: "h", x: 300, y: 130, w: 180, h: 50, text: "h", tone: "info", size: 16 });
    d.box({ id: "c", x: 820, y: 130, w: 180, h: 50, text: "c", tone: "neutral", size: 16 });
    d.box({ id: "ho", x: 300, y: 230, w: 180, h: 50, text: "ho", tone: "info", size: 16 });
    d.box({ id: "how", x: 300, y: 330, w: 180, h: 50, text: "how …", tone: "good", solid: true, size: 16 });
    d.edge("r", "h", { sides: "bt" }); d.edge("r", "c", { sides: "bt" }); d.edge("h", "ho", { sides: "bt" }); d.edge("ho", "how", { sides: "bt" });
    d.note({ x: 560, y: 220, w: 700, title: "Stored at node “how to m”: its top 10, ready to return", icon: "bolt", tone: "good", lines: ["how to make pancakes · 98K", "how to meditate · 71K", "how to make money online · 64K", "…no subtree search needed at request time"] });
    return d;
  },

  // ---------- 12 Search ----------
  "cs-search-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Searching with LIKE — scan everything, rank nothing", "bad", 320);
    d.node({ id: "u", x: 50, y: 130, w: 250, h: 76, kind: "user", title: "“red running shoes”" });
    d.node({ id: "db", x: 560, y: 110, w: 490, h: 116, kind: "db", tone: "bad", title: "products · 50M rows", sub: "full table scan · seconds per search · misses synonyms · no ranking", emphasis: true });
    d.edge("u", "db", { sides: "rl", tone: "bad" });
    return d;
  },
  "cs-search": () => {
    const d = new Diagram({ w: 1400, h: 540, bare: true });
    d.node({ id: "pg", x: 40, y: 70, w: 220, h: 76, kind: "db", title: "PostgreSQL", sub: "source of truth" });
    d.node({ id: "cdc", x: 330, y: 70, w: 220, h: 76, kind: "stream", title: "CDC → Kafka", sub: "every change" });
    d.node({ id: "ix", x: 620, y: 70, w: 240, h: 76, kind: "worker", title: "Indexers", sub: "analyze: lowercase, stem, synonyms" });
    d.group({ x: 930, y: 30, w: 430, h: 480, label: "Search cluster", tone: "search" });
    ["Shard 1 + replica", "Shard 2 + replica", "Shard 3 + replica", "Shard 4 + replica"].forEach((t, i) => d.node({ id: "s" + i, x: 960, y: 80 + i * 100, w: 370, h: 70, kind: "search", title: t, sub: "inverted index for ¼ of documents" }));
    d.edge("pg", "cdc", { sides: "rl" }); d.edge("cdc", "ix", { sides: "rl" }); d.edge("ix", "s0", { sides: "rl", mid: 900 });
    d.node({ id: "u", x: 40, y: 380, w: 220, h: 76, kind: "user", title: "Shopper", sub: "types a query" });
    d.node({ id: "api", x: 330, y: 370, w: 250, h: 96, kind: "service", title: "Search API", sub: "parse · scatter · gather · merge", emphasis: true });
    d.node({ id: "rk", x: 620, y: 380, w: 240, h: 76, kind: "ml", title: "Re-ranker", sub: "popularity, stock, personal" });
    d.edge("u", "api", { sides: "rl", hot: true });
    [0, 1, 2, 3].forEach((i) => d.edge("api", "s" + i, { sides: "tl", via: [[455, 330], [900, 330], [900, 115 + i * 100]], hot: i === 0, dashed: i > 0, noArrow: false }));
    d.edge("api", "rk", { sides: "rl", dashed: true });
    return d;
  },
  "cs-inverted-index": () => {
    const d = new Diagram({ w: 1300, h: 420, bare: true });
    d.text(40, 50, "DOCUMENTS", { size: 12, weight: 800, color: T.muted });
    [["doc 17", "Red running shoes, lightweight"], ["doc 23", "Blue walking shoe for men"], ["doc 42", "Red trail runner"]].forEach(([id, t], i) => d.box({ x: 40, y: 70 + i * 90, w: 400, h: 70, text: id, sub: t, tone: "neutral", size: 15 }));
    d.text(540, 50, "INVERTED INDEX (word → documents)", { size: 12, weight: 800, color: T.muted });
    [["red", "17, 42"], ["run", "17, 42   (running, runner → run)"], ["shoe", "17, 23"], ["blue", "23"]].forEach(([w, l], i) => { d.box({ x: 540, y: 70 + i * 66, w: 160, h: 52, text: w, tone: "search", solid: true, size: 15 }); d.box({ x: 710, y: 70 + i * 66, w: 380, h: 52, text: l, tone: "search", size: 14, weight: 500, align: "start" }); });
    d.note({ x: 540, y: 350, w: 720, tone: "good", bullets: false, lines: ["“red running shoes” → red ∩ run ∩ shoe = doc 17 (best) · doc 42 matches 2 of 3 words (next)"] });
    return d;
  },

  // ---------- 13 Ticket booking ----------
  "cs-ticket-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "On-sale with no protection", "bad", 340);
    d.node({ id: "u", x: 50, y: 140, w: 240, h: 80, kind: "users", title: "2 million fans", sub: "at 10:00:00" });
    d.node({ id: "s", x: 420, y: 130, w: 260, h: 100, kind: "service", tone: "bad", title: "Booking site", sub: "overloaded, errors 🔥", emphasis: true });
    d.node({ x: 800, y: 80, w: 250, h: 64, kind: "x", title: "Seat 14C sold twice" });
    d.node({ x: 800, y: 200, w: 250, h: 64, kind: "x", title: "Bots grab 500 seats" });
    d.edge("u", "s", { sides: "rl", tone: "bad", hot: true });
    return d;
  },
  "cs-ticket-booking": () => {
    const d = new Diagram({ w: 1400, h: 500, bare: true });
    d.node({ id: "u", x: 40, y: 200, w: 180, h: 80, kind: "users", title: "Fans" });
    d.node({ id: "wr", x: 280, y: 190, w: 230, h: 100, kind: "clock", tone: "edge", title: "Virtual waiting room", sub: "admit ~2,000/min · signed token", emphasis: true });
    d.node({ id: "map", x: 580, y: 60, w: 240, h: 76, kind: "cache", title: "Seat map cache", sub: "refreshed every ~1 s" });
    d.node({ id: "bk", x: 580, y: 200, w: 240, h: 80, kind: "service", title: "Booking service", sub: "holds · orders" });
    d.node({ id: "db", x: 900, y: 200, w: 240, h: 80, kind: "db", title: "Seats DB", sub: "atomic conditional holds" });
    d.node({ id: "pay", x: 580, y: 360, w: 240, h: 76, kind: "money", title: "Payment provider", sub: "idempotency key" });
    d.node({ id: "exp", x: 900, y: 360, w: 240, h: 76, kind: "clock", title: "Hold expiry job", sub: "release unpaid seats" });
    d.node({ id: "tk", x: 1200, y: 200, w: 170, h: 80, kind: "doc", title: "Tickets issued" });
    d.edge("u", "wr", { sides: "rl", hot: true, step: 1 });
    d.edge("wr", "map", { sides: "tl", via: [[395, 98]], dashed: true, label: "browse" });
    d.edge("wr", "bk", { sides: "rl", hot: true, step: 2 });
    d.edge("bk", "db", { sides: "rl", step: 3, label: "hold seats" });
    d.edge("bk", "pay", { sides: "bt", step: 4 });
    d.edge("db", "tk", { sides: "rl", tone: "good", step: 5, label: "sold" });
    d.edge("exp", "db", { sides: "tb", dashed: true });
    return d;
  },
  "cs-seat-hold": () => {
    const d = new Diagram({ w: 1300, h: 460, bare: true });
    sequence(d, { x: 40, y: 30, w: 1220, actorW: 220, rowH: 44, actors: [{ kind: "user", title: "Alice" }, { kind: "service", title: "Booking service" }, { kind: "db", title: "Seats DB" }, { kind: "user", title: "Bob" }], messages: [
      { from: 0, to: 1, label: "hold seat 14C", step: 1 },
      { from: 1, to: 2, label: "UPDATE … WHERE status='available'" },
      { from: 2, to: 1, label: "1 row → held until 10:12", dashed: true, tone: "good" },
      { from: 3, to: 1, label: "hold seat 14C", step: 2 },
      { from: 1, to: 2, label: "same UPDATE" },
      { from: 2, to: 1, label: "0 rows → seat taken (409)", dashed: true, tone: "bad" },
      { from: 0, to: 1, label: "pay (idempotency key)", step: 3 },
      { from: 1, to: 2, label: "status = sold", tone: "good" },
      { note: "if Alice never pays: at 10:12 the hold expires and 14C is available again", from: 0, to: 3, tone: "info" }] });
    return d;
  },

  // ---------- 14 Payments ----------
  "cs-pay-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "No safeguards — double charges and money nobody can explain", "bad", 360);
    d.node({ id: "u", x: 50, y: 150, w: 220, h: 76, kind: "user", title: "Customer", sub: "double-clicks Pay" });
    d.node({ id: "a", x: 400, y: 140, w: 260, h: 96, kind: "service", tone: "bad", title: "Payment code", sub: "no idempotency · balance = balance − 30", emphasis: true });
    [["Charged twice", "$42 × 2"], ["Paid, but no order", "reply timed out"], ["$30 missing", "no history to explain it"]].forEach(([t, s2], i) => { d.node({ id: "x" + i, x: 790, y: 70 + i * 96, w: 260, h: 70, kind: "x", title: t, sub: s2 }); d.edge("a", "x" + i, { sides: "rl", mid: 725, tone: "bad" }); });
    d.edge("u", "a", { sides: "rl", tone: "bad", label: "2 requests" });
    return d;
  },
  "cs-payments": () => {
    const d = new Diagram({ w: 1400, h: 520, bare: true });
    d.node({ id: "c", x: 40, y: 200, w: 180, h: 80, kind: "mobile", title: "Checkout", sub: "Idempotency-Key" });
    d.node({ id: "ps", x: 290, y: 190, w: 240, h: 100, kind: "service", title: "Payment service", sub: "idempotency check · state machine", emphasis: true });
    d.node({ id: "db", x: 610, y: 60, w: 280, h: 96, kind: "db", title: "Payments + ledger DB", sub: "append-only double entry · outbox" });
    d.node({ id: "psp", x: 610, y: 330, w: 280, h: 80, kind: "money", title: "Payment provider (PSP)", sub: "Stripe / Adyen · holds card data" });
    d.node({ id: "wh", x: 970, y: 330, w: 240, h: 80, kind: "worker", title: "Webhook handler", sub: "verify signature · idempotent" });
    d.node({ id: "ev", x: 970, y: 60, w: 240, h: 80, kind: "stream", title: "Payment events", sub: "orders, email, analytics" });
    d.node({ id: "rc", x: 1250, y: 190, w: 170, h: 100, kind: "check", title: "Reconcile", sub: "nightly" });
    d.edge("c", "ps", { sides: "rl", hot: true, step: 1 });
    d.edge("ps", "db", { sides: "tl", via: [[410, 108]], step: 2, label: "one transaction", at: [500, 108] });
    d.edge("ps", "psp", { sides: "bl", via: [[410, 370]], step: 3, label: "charge (same key)", at: [500, 370] });
    d.edge("psp", "wh", { sides: "rl", dashed: true, step: 4, label: "signed webhook" });
    d.edge("wh", "db", { sides: "tb", via: [[1090, 250], [750, 250]], dashed: true, label: "update status + ledger", at: [920, 250] });
    d.edge("db", "ev", { sides: "rl", dashed: true, label: "outbox" });
    d.edge("rc", "db", { sides: "lr", via: [[935, 212], [935, 125]], dashed: true, off2: [0, 17] });
    d.edge("rc", "psp", { sides: "bb", via: [[1320, 450], [750, 450]], dashed: true, label: "compare ledger with PSP settlement report", at: [1040, 450] });
    return d;
  },
  "cs-pay-idem": () => {
    const d = new Diagram({ w: 1300, h: 420, bare: true });
    sequence(d, { x: 40, y: 30, w: 1220, actorW: 220, rowH: 44, actors: [{ kind: "mobile", title: "Checkout" }, { kind: "service", title: "Payment service" }, { kind: "db", title: "Idempotency store" }, { kind: "money", title: "PSP" }], messages: [
      { from: 0, to: 1, label: "pay $42 · key 5f2c", step: 1 },
      { from: 1, to: 2, label: "5f2c new → reserve" },
      { from: 1, to: 3, label: "charge $42 · key 5f2c" },
      { from: 1, to: 0, label: "response lost (network) ✗", dashed: true, tone: "bad" },
      { from: 0, to: 1, label: "retry: pay $42 · key 5f2c", step: 2, tone: "warn" },
      { from: 1, to: 2, label: "5f2c done → stored result" },
      { from: 1, to: 0, label: "same result · no second charge", dashed: true, tone: "good" }] });
    return d;
  },
  "cs-pay-states": () => {
    const d = new Diagram({ w: 1300, h: 340, bare: true });
    const st = [["CREATED", "info"], ["AUTHORIZED", "edge"], ["CAPTURED", "compute"], ["SETTLED", "good"]];
    st.forEach(([t, tone], i) => d.box({ id: "s" + i, x: 40 + i * 310, y: 60, w: 260, h: 66, text: t, tone, solid: i === 3, size: 16 }));
    for (let i = 0; i < 3; i++) d.edge("s" + i, "s" + (i + 1), { sides: "rl" });
    d.box({ id: "f", x: 40, y: 230, w: 260, h: 60, text: "FAILED", sub: "declined / error", tone: "bad", size: 15 });
    d.box({ id: "v", x: 350, y: 230, w: 260, h: 60, text: "VOIDED", sub: "auth released, never captured", tone: "neutral", size: 15 });
    d.box({ id: "r", x: 660, y: 230, w: 260, h: 60, text: "REFUNDED", sub: "full or partial", tone: "warn", size: 15 });
    d.box({ id: "dp", x: 970, y: 230, w: 260, h: 60, text: "DISPUTED", sub: "chargeback", tone: "bad", size: 15 });
    d.edge("s0", "f", { sides: "bt", dashed: true, tone: "bad" }); d.edge("s1", "v", { sides: "bt", dashed: true });
    d.edge("s2", "r", { sides: "bt", dashed: true, tone: "warn" }); d.edge("s3", "dp", { sides: "bt", dashed: true, tone: "bad" });
    return d;
  },

  // ---------- 15 Nearby places ----------
  "cs-nearby-without": () => {
    const d = new Diagram({ w: W, h: 340, bare: true }); F(d, "Measuring the distance to 200 million businesses", "bad", 300);
    d.node({ id: "u", x: 50, y: 120, w: 240, h: 76, kind: "user", title: "“coffee near me”" });
    d.node({ id: "db", x: 560, y: 110, w: 490, h: 96, kind: "db", tone: "bad", title: "businesses · 200M rows", sub: "distance(user, each business) → sort · per search", emphasis: true });
    d.edge("u", "db", { sides: "rl", tone: "bad" });
    return d;
  },
  "cs-nearby": () => {
    const d = new Diagram({ w: 1400, h: 480, bare: true });
    d.node({ id: "u", x: 40, y: 190, w: 180, h: 80, kind: "mobile", title: "User", sub: "lat, lng, “coffee”" });
    d.node({ id: "lb", x: 280, y: 190, w: 180, h: 80, kind: "lb", title: "Load balancer" });
    d.node({ id: "ss", x: 520, y: 180, w: 250, h: 100, kind: "service", title: "Search service", sub: "cell + 8 neighbours → filter → rank", emphasis: true });
    d.node({ id: "geo", x: 850, y: 50, w: 260, h: 80, kind: "map", title: "Geo index (replicated)", sub: "geohash cell → business IDs" });
    d.node({ id: "bc", x: 850, y: 190, w: 260, h: 80, kind: "cache", title: "Business details cache" });
    d.node({ id: "db", x: 850, y: 330, w: 260, h: 80, kind: "db", title: "Business DB", sub: "source of truth" });
    d.node({ id: "own", x: 1180, y: 330, w: 190, h: 80, kind: "user", title: "Owner edits", sub: "async to index" });
    d.node({ id: "cdn", x: 1180, y: 190, w: 190, h: 80, kind: "cdn", title: "CDN", sub: "business photos" });
    d.edge("u", "lb", { sides: "rl", hot: true }); d.edge("lb", "ss", { sides: "rl", hot: true });
    d.edge("ss", "geo", { sides: "rl", step: 1, mid: 810, label: "candidates" });
    d.edge("ss", "bc", { sides: "rl", step: 2, label: "hydrate top results" });
    d.edge("bc", "db", { sides: "bt", dashed: true, label: "on miss" });
    d.edge("own", "db", { sides: "lr" });
    d.edge("db", "geo", { sides: "rr", via: [[1140, 370], [1140, 90]], dashed: true, label: "update index", at: [1140, 150], off1: [0, -20] });
    return d;
  },

  // ---------- 16 Group chat ----------
  "cs-group-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Sending each message one by one to 100,000 members", "bad", 340);
    d.node({ id: "a", x: 50, y: 140, w: 220, h: 76, kind: "user", title: "One message", sub: "in a 100K-member channel" });
    d.node({ id: "cs", x: 400, y: 130, w: 280, h: 96, kind: "service", tone: "bad", title: "Chat service", sub: "100,000 separate pushes per message 🔥", emphasis: true });
    for (let i = 0; i < 4; i++) d.node({ id: "m" + i, x: 810, y: 70 + i * 66, w: 240, h: 50, kind: "user", title: i === 3 ? "… member 100,000" : `member ${i + 1}` });
    d.edge("a", "cs", { sides: "rl", tone: "bad" });
    for (let i = 0; i < 4; i++) d.edge("cs", "m" + i, { sides: "rl", mid: 745, tone: "bad" });
    return d;
  },
  "cs-group-chat": () => {
    const d = new Diagram({ w: 1400, h: 520, bare: true });
    d.node({ id: "s", x: 40, y: 200, w: 180, h: 80, kind: "user", title: "Sender" });
    d.node({ id: "cs", x: 290, y: 190, w: 240, h: 100, kind: "service", title: "Channel service", sub: "order · store · publish once", emphasis: true });
    d.node({ id: "db", x: 290, y: 370, w: 240, h: 76, kind: "db", title: "Message store", sub: "partition = channel_id" });
    d.node({ id: "ps", x: 610, y: 190, w: 240, h: 100, kind: "stream", title: "Pub/sub", sub: "topic per channel" });
    d.group({ x: 930, y: 30, w: 440, h: 460, label: "Gateways subscribed to #general", tone: "compute" });
    [["Gateway 3", "delivers to 240 members"], ["Gateway 18", "delivers to 310 members"], ["Gateway 205", "delivers to 190 members"]].forEach(([t, s2], i) => d.node({ id: "g" + i, x: 960, y: 90 + i * 130, w: 380, h: 80, kind: "ws", title: t, sub: s2 }));
    d.node({ id: "se", x: 610, y: 370, w: 240, h: 76, kind: "search", title: "Search index", sub: "async" });
    d.edge("s", "cs", { sides: "rl", hot: true, step: 1 });
    d.edge("cs", "db", { sides: "bt", step: 2, label: "store" });
    d.edge("cs", "ps", { sides: "rl", step: 3, label: "publish once", hot: true });
    [0, 1, 2].forEach((i) => d.edge("ps", "g" + i, { sides: "rl", mid: 900, tone: "good" }));
    d.edge("db", "se", { sides: "rl", dashed: true });
    return d;
  },
  "cs-group-fanout": () => {
    const d = new Diagram({ w: 1300, h: 340, bare: true });
    table(d, { x: 30, y: 30, rowH: 70, headH: 46, size: 14.5, cols: [{ title: "Channel size", w: 240 }, { title: "Delivery strategy", w: 560 }, { title: "Why", w: 440 }], rows: [
      [{ t: "≤ 100 members", tone: "good" }, "Push directly to each member's connection", "Simplest; tiny fan-out"],
      [{ t: "100 – 10,000", tone: "info" }, "Publish once; each subscribed gateway delivers locally", "Work spread across gateways"],
      [{ t: "100,000+", tone: "warn" }, "Publish once; live only to members viewing the channel; others fetch on open", "Avoids millions of pushes nobody reads"],
    ] });
    return d;
  },

  // ---------- 17 Collaborative editor ----------
  "cs-doc-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Last write wins — one person's work disappears", "bad", 340);
    d.node({ id: "a", x: 50, y: 90, w: 250, h: 70, kind: "user", title: "Alice", sub: "adds a sentence" });
    d.node({ id: "b", x: 50, y: 220, w: 250, h: 70, kind: "user", title: "Bob", sub: "adds a paragraph" });
    d.node({ id: "s", x: 450, y: 150, w: 260, h: 90, kind: "service", tone: "bad", title: "Server", sub: "saves whichever arrives last", emphasis: true });
    d.node({ x: 830, y: 155, w: 220, h: 80, kind: "x", title: "Alice's edit lost" });
    d.edge("a", "s", { sides: "rl", mid: 380, tone: "bad", label: "whole doc v2a" }); d.edge("b", "s", { sides: "rl", mid: 380, tone: "bad", label: "whole doc v2b" });
    d.edge("s", [826, 195], { sides: "rl", tone: "bad" });
    return d;
  },
  "cs-collab": () => {
    const d = new Diagram({ w: 1400, h: 480, bare: true });
    ["Alice", "Bob", "Chen"].forEach((t, i) => d.node({ id: "u" + i, x: 40, y: 70 + i * 120, w: 190, h: 70, kind: "browser", title: t, sub: "applies own edits instantly" }));
    d.node({ id: "rt", x: 310, y: 180, w: 200, h: 80, kind: "lb", title: "Router", sub: "hash(doc_id)" });
    d.node({ id: "ss", x: 590, y: 160, w: 270, h: 120, kind: "service", title: "Session server for doc 42", sub: "order ops · transform · broadcast", emphasis: true });
    d.node({ id: "log", x: 950, y: 90, w: 260, h: 76, kind: "db", title: "Operation log", sub: "append-only, per doc" });
    d.node({ id: "snap", x: 950, y: 280, w: 260, h: 76, kind: "storage", title: "Snapshots", sub: "every ~100 ops" });
    [0, 1, 2].forEach((i) => d.edge("u" + i, "rt", { sides: "rl", mid: 270, both: true }));
    d.edge("rt", "ss", { sides: "rl", both: true, hot: true });
    d.edge("ss", "log", { sides: "rl", mid: 905, label: "append" });
    d.edge("log", "snap", { sides: "bt", dashed: true, label: "compact" });
    return d;
  },
  "cs-ot": () => {
    const d = new Diagram({ w: 1300, h: 440, bare: true });
    sequence(d, { x: 40, y: 30, w: 1220, actorW: 240, rowH: 46, actors: [{ kind: "browser", title: "Alice · “cat”" }, { kind: "service", title: "Session server · v1 “cat”" }, { kind: "browser", title: "Bob · “cat”" }], messages: [
      { from: 0, to: 1, label: "insert “s” at 3 (base v1)", step: 1 },
      { from: 2, to: 1, label: "insert “the ” at 0 (base v1)", step: 2 },
      { note: "server applies Alice first → v2 “cats”", from: 1, to: 1, tone: "info" },
      { note: "Bob's op is based on v1: position 0 is before Alice's edit → unchanged → v3 “the cats”", from: 0, to: 2, tone: "info" },
      { from: 1, to: 0, label: "insert “the ” at 0 → “the cats”", dashed: true, tone: "good" },
      { from: 1, to: 2, label: "Alice's op transformed: “s” at 3 → at 7 → “the cats”", dashed: true, tone: "good" },
      { note: "everyone ends with “the cats”", from: 0, to: 2, tone: "good" }] });
    return d;
  },

  // ---------- 18 Checkout ----------
  "cs-checkout-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "No coordination — oversold stock and half-finished orders", "bad", 340);
    d.node({ id: "u", x: 50, y: 140, w: 230, h: 80, kind: "users", title: "100,000 buyers", sub: "1,000 TVs on sale" });
    d.node({ id: "c", x: 400, y: 130, w: 260, h: 100, kind: "service", tone: "bad", title: "Checkout", sub: "stock checked only at add-to-cart", emphasis: true });
    [["1,300 TVs sold", "only 1,000 exist"], ["Charged, no order", "order service crashed"], ["Inventory DB locked", "one hot row"]].forEach(([t, s2], i) => { d.node({ id: "x" + i, x: 790, y: 70 + i * 90, w: 260, h: 70, kind: "x", title: t, sub: s2 }); d.edge("c", "x" + i, { sides: "rl", mid: 725, tone: "bad" }); });
    d.edge("u", "c", { sides: "rl", tone: "bad" });
    return d;
  },
  "cs-checkout": () => {
    const d = new Diagram({ w: 1400, h: 500, bare: true });
    d.node({ id: "u", x: 40, y: 200, w: 170, h: 80, kind: "users", title: "Buyers" });
    d.node({ id: "wr", x: 270, y: 200, w: 190, h: 80, kind: "clock", tone: "edge", title: "Waiting room", sub: "flash sales only" });
    d.node({ id: "co", x: 520, y: 190, w: 240, h: 100, kind: "coord", title: "Checkout orchestrator", sub: "saga state per order", emphasis: true });
    d.node({ id: "inv", x: 850, y: 50, w: 250, h: 80, kind: "db", title: "Inventory service", sub: "reserve / release · Redis for hot SKUs" });
    d.node({ id: "pay", x: 850, y: 200, w: 250, h: 80, kind: "money", title: "Payment service", sub: "charge / refund · idempotent" });
    d.node({ id: "ord", x: 850, y: 350, w: 250, h: 80, kind: "service", title: "Order service", sub: "confirm / cancel" });
    d.node({ id: "k", x: 1170, y: 200, w: 200, h: 80, kind: "stream", title: "Order events", sub: "shipping, email" });
    d.edge("u", "wr", { sides: "rl", hot: true }); d.edge("wr", "co", { sides: "rl", hot: true });
    d.edge("co", "inv", { sides: "rl", mid: 805, step: 1, label: "reserve" });
    d.edge("co", "pay", { sides: "rl", step: 2, label: "charge" });
    d.edge("co", "ord", { sides: "rl", mid: 805, step: 3, label: "confirm" });
    d.edge("ord", "k", { sides: "rb", via: [[1270, 390]], dashed: true, label: "outbox", at: [1180, 390] });
    return d;
  },
  "cs-checkout-saga": () => {
    const d = new Diagram({ w: 1300, h: 360, bare: true });
    [["Reserve stock", "10-min hold"], ["Charge card", "idempotent"], ["Confirm order", "reservation → sold"]].forEach(([t, s2], i) => d.node({ id: "s" + i, x: 40 + i * 420, y: 50, w: 360, h: 76, kind: "service", title: t, sub: s2 }));
    [["Release stock", ""], ["Refund card", ""]].forEach(([t], i) => d.node({ id: "c" + i, x: 40 + i * 420, y: 230, w: 360, h: 70, kind: "check", tone: "warn", title: t, sub: "compensation" }));
    d.edge("s0", "s1", { sides: "rl", tone: "good" }); d.edge("s1", "s2", { sides: "rl", tone: "good" });
    d.edge("s1", "c0", { sides: "bt", via: [[640, 180], [220, 180]], tone: "bad", dashed: true, label: "card declined → release stock", at: [430, 180] });
    d.edge("s2", "c1", { sides: "bt", via: [[1060, 180], [640, 180]], tone: "bad", dashed: true, label: "confirm fails → refund + release", at: [850, 200] });
    return d;
  },

  // ---------- 19 Recommendations ----------
  "cs-rec-without": () => {
    const d = new Diagram({ w: W, h: 340, bare: true }); F(d, "Scoring every item for every user, every time", "bad", 300);
    d.node({ id: "u", x: 50, y: 120, w: 240, h: 76, kind: "user", title: "User opens home page" });
    d.node({ id: "m", x: 560, y: 110, w: 490, h: 96, kind: "ml", tone: "bad", title: "Model × 100,000,000 videos", sub: "50K requests/s → 5 trillion scores/s · impossible", emphasis: true });
    d.edge("u", "m", { sides: "rl", tone: "bad" });
    return d;
  },
  "cs-recommendations": () => {
    const d = new Diagram({ w: 1400, h: 540, bare: true });
    d.group({ x: 30, y: 30, w: 1340, h: 170, label: "Offline — hours / days", tone: "neutral" });
    d.node({ id: "ev", x: 60, y: 80, w: 230, h: 76, kind: "stream", title: "Events", sub: "views, clicks, skips → lake" });
    d.node({ id: "tr", x: 370, y: 80, w: 250, h: 76, kind: "ml", title: "Train models", sub: "embeddings + ranker" });
    d.node({ id: "vi", x: 700, y: 80, w: 250, h: 76, kind: "search", title: "Vector index", sub: "item embeddings (ANN)" });
    d.node({ id: "fs", x: 1030, y: 80, w: 310, h: 76, kind: "cache", title: "Feature store", sub: "user & item features, online" });
    d.edge("ev", "tr", { sides: "rl" }); d.edge("tr", "vi", { sides: "rl" }); d.edge("vi", "fs", { sides: "rl", dashed: true, noArrow: true });
    d.node({ id: "u", x: 60, y: 350, w: 200, h: 80, kind: "mobile", title: "User" });
    d.node({ id: "cg", x: 330, y: 340, w: 250, h: 100, kind: "worker", title: "Candidate generation", sub: "vector search · similar · trending → ~1,000" });
    d.node({ id: "rk", x: 660, y: 340, w: 250, h: 100, kind: "ml", title: "Ranking", sub: "score each candidate", emphasis: true });
    d.node({ id: "rr", x: 990, y: 340, w: 250, h: 100, kind: "check", title: "Re-rank & filter", sub: "diversity · seen · safety → 20" });
    d.edge("u", "cg", { sides: "rl", hot: true, step: 1 }); d.edge("cg", "rk", { sides: "rl", step: 2 }); d.edge("rk", "rr", { sides: "rl", step: 3 });
    d.edge("cg", "vi", { sides: "tb", dashed: true }); d.edge("rk", "fs", { sides: "tb", dashed: true, label: "features" });
    d.edge("rr", "ev", { sides: "bl", via: [[1115, 490], [30, 490], [30, 118]], dashed: true, label: "log impressions → next training", at: [640, 490] });
    return d;
  },
  "cs-rec-funnel": () => {
    const d = new Diagram({ w: 1300, h: 360, bare: true });
    const st = [["All items", "100,000,000", 1200, "neutral"], ["Candidates", "~1,000 · cheap retrieval", 900, "info"], ["Ranked", "~1,000 scored by a heavy model", 620, "search"], ["Shown", "top 20 after re-ranking", 340, "good"]];
    st.forEach(([t, s2, w, tone], i) => d.box({ x: 650 - w / 2, y: 30 + i * 80, w, h: 64, text: t, sub: s2, tone, solid: i === 3, size: 16 }));
    return d;
  },
};
