// Chapter 08 — diagrams for case studies 20–25
import { Diagram, table, sequence, TONES, T } from "../engine.mjs";
const W = 1100;
const F = (d, title, tone, h) => d.frame({ x: 20, y: 20, w: 1060, h, title, tone });

export default {
  // ---------- 20 Key-value store ----------
  "cs-kv-without": () => {
    const d = new Diagram({ w: W, h: 340, bare: true }); F(d, "One database server — limited, and down when it dies", "bad", 300);
    d.node({ id: "c", x: 50, y: 120, w: 240, h: 76, kind: "users", title: "Cart service", sub: "1M writes/s" });
    d.node({ id: "db", x: 440, y: 110, w: 300, h: 96, kind: "db", tone: "bad", title: "Single DB server", sub: "full · overloaded · SPOF", emphasis: true });
    d.node({ x: 860, y: 120, w: 190, h: 76, kind: "x", title: "Carts fail", sub: "lost sales" });
    d.edge("c", "db", { sides: "rl", tone: "bad", hot: true }); d.edge("db", [856, 158], { sides: "rl", tone: "bad" });
    return d;
  },
  "cs-kv": () => {
    const d = new Diagram({ w: 1300, h: 560, bare: true });
    const cx = 780, cy = 280, r = 200;
    d.raw(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#CBD5E1" stroke-width="10"/>`, "back");
    const P = (deg, rr = r) => [cx + rr * Math.sin(deg * Math.PI / 180), cy - rr * Math.cos(deg * Math.PI / 180)];
    ["A", "B", "C", "D", "E", "F"].forEach((n, i) => {
      const deg = i * 60, [x, y] = P(deg), rep = i >= 1 && i <= 3;
      d.raw(`<circle cx="${x}" cy="${y}" r="26" fill="${rep ? TONES.data[0] : "#fff"}" stroke="${TONES.data[0]}" stroke-width="3"/>`, "front");
      d.text(x, y + 6, n, { size: 16, weight: 800, color: rep ? "#fff" : TONES.data[0], anchor: "middle" });
    });
    const [kx, ky] = P(40); d.raw(`<circle cx="${kx}" cy="${ky}" r="10" fill="${TONES.bad[0]}"/>`, "front");
    d.text(kx + 18, ky - 12, "key “cart:42”", { size: 13, weight: 700, color: TONES.bad[0] });
    d.text(cx, cy - 6, "hash ring", { size: 16, weight: 700, color: T.ink, anchor: "middle" });
    d.text(cx, cy + 18, "replicas = next 3 nodes: B, C, D", { size: 13, color: T.muted, anchor: "middle" });
    d.node({ id: "cl", x: 40, y: 240, w: 190, h: 76, kind: "service", title: "Client" });
    d.node({ id: "co", x: 300, y: 230, w: 220, h: 96, kind: "coord", title: "Coordinator node", sub: "any node · W=2, R=2 of N=3", emphasis: true });
    d.edge("cl", "co", { sides: "rl", hot: true });
    d.edge("co", [P(60)[0] - 30, P(60)[1]], { tone: "good", label: "write", sides: "rl" });
    d.note({ x: 1030, y: 60, w: 250, title: "Gossip", icon: "users", tone: "info", lines: ["Nodes share who is alive every second"] });
    d.note({ x: 1030, y: 330, w: 250, title: "Self-healing", icon: "check", tone: "good", lines: ["Hinted handoff", "Read repair", "Merkle-tree sync"] });
    return d;
  },
  "cs-kv-quorum": () => {
    const d = new Diagram({ w: 1300, h: 380, bare: true });
    d.node({ id: "c", x: 40, y: 150, w: 200, h: 80, kind: "coord", title: "Coordinator" });
    [["Replica B", "v2 ✔", "good"], ["Replica C", "v2 ✔", "good"], ["Replica D", "v1 (was down)", "warn"]].forEach(([t, s2, tone], i) => { d.node({ id: "r" + i, x: 440, y: 50 + i * 110, w: 260, h: 76, kind: "db", tone, title: t, sub: s2 }); d.edge("c", "r" + i, { sides: "rl", mid: 340, tone: i < 2 ? "good" : "warn", dashed: i === 2 }); });
    d.note({ x: 780, y: 50, w: 480, title: "Write: W = 2", icon: "check", tone: "good", lines: ["Success after B and C confirm; D catches up later (hinted handoff)."] });
    d.note({ x: 780, y: 200, w: 480, title: "Read: R = 2", icon: "search", tone: "info", lines: ["Any 2 replicas include at least one with v2, because W + R = 4 > N = 3.", "Stale D is repaired in the background."] });
    return d;
  },

  // ---------- 21 ID generator ----------
  "cs-id-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Auto-increment on every shard — duplicate IDs", "bad", 320);
    ["Shard 1", "Shard 2", "Shard 3"].forEach((t, i) => d.node({ x: 50 + i * 340, y: 110, w: 310, h: 80, kind: "db", tone: "bad", title: t, sub: "next order ID = 1001" }));
    d.text(550, 260, "Three different orders all get ID 1001 — references, URLs and joins break", { size: 15, weight: 700, color: TONES.bad[0], anchor: "middle" });
    return d;
  },
  "cs-snowflake": () => {
    const d = new Diagram({ w: 1300, h: 300, bare: true });
    const parts = [["0", "1 bit", "sign (unused)", "neutral", 90], ["timestamp", "41 bits", "ms since custom epoch · ~69 years", "info", 560], ["machine", "10 bits", "1,024 generators", "edge", 280], ["sequence", "12 bits", "4,096 per ms", "good", 300]];
    let x = 30;
    parts.forEach(([t, b, s2, tone, w]) => { d.box({ x, y: 50, w, h: 90, text: t, sub: b, tone, solid: true, size: 18 }); d.text(x + w / 2, 175, s2, { size: 13.5, weight: 600, color: TONES[tone][0], anchor: "middle" }); x += w + 8; });
    d.text(650, 240, "Example: 1541815603606036480 — unique, sortable by time, generated locally with no network call", { size: 14.5, weight: 600, color: T.body, anchor: "middle" });
    return d;
  },

  // ---------- 22 Scheduler ----------
  "cs-sched-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Cron on servers — one is a SPOF, two run everything twice", "bad", 340);
    d.node({ id: "a", x: 50, y: 90, w: 300, h: 76, kind: "clock", tone: "bad", title: "cron on server A", sub: "server dies → no jobs run" });
    d.node({ id: "b", x: 50, y: 220, w: 300, h: 76, kind: "clock", tone: "bad", title: "cron on A and B", sub: "every job runs twice" });
    d.node({ x: 760, y: 90, w: 290, h: 76, kind: "x", title: "Reports never sent" });
    d.node({ x: 760, y: 220, w: 290, h: 76, kind: "x", title: "Customers billed twice" });
    d.edge("a", [756, 128], { sides: "rl", tone: "bad" }); d.edge("b", [756, 258], { sides: "rl", tone: "bad" });
    return d;
  },
  "cs-scheduler": () => {
    const d = new Diagram({ w: 1400, h: 520, bare: true });
    d.node({ id: "api", x: 40, y: 80, w: 200, h: 76, kind: "gateway", title: "Job API", sub: "create / cancel" });
    d.node({ id: "db", x: 310, y: 70, w: 260, h: 96, kind: "db", title: "Jobs DB", sub: "indexed by time bucket", emphasis: true });
    d.group({ x: 640, y: 30, w: 300, h: 200, label: "Scheduler shards (leader per bucket range)", tone: "neutral" });
    d.node({ id: "s1", x: 660, y: 75, w: 260, h: 60, kind: "clock", title: "Scheduler shard 1", sub: "buckets 00–29" });
    d.node({ id: "s2", x: 660, y: 150, w: 260, h: 60, kind: "clock", title: "Scheduler shard 2", sub: "buckets 30–59" });
    d.node({ id: "q", x: 1030, y: 90, w: 250, h: 90, kind: "queue", title: "Job queue", sub: "per tenant / priority" });
    d.node({ id: "w", x: 1030, y: 300, w: 250, h: 90, kind: "worker", title: "Worker pool", sub: "lease · timeout · retry" });
    d.node({ id: "dlq", x: 660, y: 310, w: 260, h: 76, kind: "x", title: "Dead-letter queue", sub: "after max retries → alert" });
    d.node({ id: "sw", x: 310, y: 310, w: 260, h: 76, kind: "clock", title: "Lease sweeper", sub: "re-enqueue crashed runs" });
    d.edge("api", "db", { sides: "rl" });
    d.edge("s1", "db", { sides: "lr", mid: 610, dashed: true, label: "due soon?" }); d.edge("s2", "db", { sides: "lr", mid: 610, dashed: true });
    d.edge("s1", "q", { sides: "rl", mid: 985, tone: "good", label: "enqueue" }); d.edge("s2", "q", { sides: "rl", mid: 985, tone: "good" });
    d.edge("q", "w", { sides: "bt", hot: true });
    d.edge("w", "dlq", { sides: "lr", tone: "bad", dashed: true, label: "gave up" });
    d.edge("w", "db", { sides: "bb", via: [[1155, 470], [440, 470]], dashed: true, label: "record run, set next_run_at", at: [800, 470] });
    d.edge("sw", "db", { sides: "tb", dashed: true });
    return d;
  },
  "cs-sched-lease": () => {
    const d = new Diagram({ w: 1300, h: 420, bare: true });
    sequence(d, { x: 40, y: 30, w: 1220, actorW: 220, rowH: 44, actors: [{ kind: "queue", title: "Queue" }, { kind: "worker", title: "Worker 1" }, { kind: "db", title: "Runs DB" }, { kind: "worker", title: "Worker 2" }], messages: [
      { from: 0, to: 1, label: "job 77", step: 1 },
      { from: 1, to: 2, label: "run 77 · lease until 09:05" },
      { note: "Worker 1 crashes 💥", from: 1, to: 1, tone: "bad" },
      { note: "09:05 — sweeper sees the expired lease → re-enqueue job 77", from: 0, to: 2, tone: "warn" },
      { from: 0, to: 3, label: "job 77 (attempt 2)", step: 2 },
      { from: 3, to: 2, label: "new lease · runs with the same idempotency key", tone: "good" },
      { from: 3, to: 2, label: "succeeded ✔", tone: "good" }] });
    return d;
  },

  // ---------- 23 Metrics ----------
  "cs-metrics-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Metrics in a normal database — overwhelmed, and nobody is alerted", "bad", 320);
    d.node({ id: "h", x: 50, y: 120, w: 250, h: 80, kind: "server", tone: "neutral", icon: "server", title: "10,000 servers", sub: "1M points/s" });
    d.node({ id: "db", x: 440, y: 110, w: 300, h: 100, kind: "db", tone: "bad", title: "SQL database", sub: "INSERT per point · full 🔥", emphasis: true });
    d.node({ x: 860, y: 120, w: 190, h: 80, kind: "x", title: "Outage found", sub: "by customers" });
    d.edge("h", "db", { sides: "rl", tone: "bad", hot: true }); d.edge("db", [856, 160], { sides: "rl", tone: "bad" });
    return d;
  },
  "cs-metrics": () => {
    const d = new Diagram({ w: 1400, h: 520, bare: true });
    d.node({ id: "ag", x: 40, y: 200, w: 190, h: 80, kind: "server", title: "Agents", sub: "on every host", icon: "server" });
    d.node({ id: "gw", x: 290, y: 200, w: 200, h: 80, kind: "gateway", title: "Ingestion gateway", sub: "validate · limits" });
    d.node({ id: "k", x: 550, y: 200, w: 180, h: 80, kind: "stream", title: "Kafka", sub: "buffer" });
    d.node({ id: "wr", x: 790, y: 200, w: 180, h: 80, kind: "worker", title: "Writers" });
    d.node({ id: "ts", x: 1040, y: 180, w: 320, h: 120, kind: "db", title: "Time-series DB", sub: "compressed blocks · sharded by series · rollups", emphasis: true });
    d.node({ id: "obj", x: 1040, y: 380, w: 320, h: 70, kind: "storage", title: "Object storage", sub: "old blocks, cheap" });
    d.node({ id: "q", x: 790, y: 40, w: 240, h: 76, kind: "search", title: "Query service", sub: "dashboards (Grafana)" });
    d.node({ id: "al", x: 790, y: 380, w: 180, h: 76, kind: "bell", title: "Alert evaluator" });
    d.node({ id: "am", x: 550, y: 380, w: 180, h: 76, kind: "bell", title: "Alert manager", sub: "group · route · page" });
    d.edge("ag", "gw", { sides: "rl", hot: true }); d.edge("gw", "k", { sides: "rl", hot: true }); d.edge("k", "wr", { sides: "rl" }); d.edge("wr", "ts", { sides: "rl" });
    d.edge("ts", "obj", { sides: "bt", dashed: true, label: "downsample · archive" });
    d.edge("q", "ts", { sides: "rt", via: [[1200, 78]] });
    d.edge("al", "ts", { sides: "rl", via: [[1005, 418], [1005, 270]], dashed: true, off2: [0, 30] });
    d.edge("al", "am", { sides: "lr", tone: "bad" });
    return d;
  },
  "cs-cardinality": () => {
    const d = new Diagram({ w: 1300, h: 340, bare: true });
    table(d, { x: 30, y: 30, rowH: 64, headH: 46, size: 14.5, cols: [{ title: "Metric labels", w: 560 }, { title: "Unique series", w: 280 }, { title: "Verdict", w: 400 }], rows: [
      ["http_requests{service, status}", "50 × 5 = 250", { t: "fine", tone: "good" }],
      ["http_requests{service, status, endpoint}", "250 × 200 = 50,000", { t: "OK with care", tone: "warn" }],
      ["http_requests{service, status, user_id}", "250 × 10M = 2.5 billion", { t: "crashes the TSDB — use logs/traces", tone: "bad" }],
    ] });
    return d;
  },

  // ---------- 24 Live streaming ----------
  "cs-live-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "One server sending the live stream to everyone", "bad", 320);
    d.node({ id: "s", x: 50, y: 120, w: 220, h: 80, kind: "video", title: "Streamer", sub: "6 Mbps" });
    d.node({ id: "srv", x: 400, y: 110, w: 300, h: 100, kind: "service", tone: "bad", title: "One streaming server", sub: "2M viewers × 5 Mbps = 10 Tbps 🔥", emphasis: true });
    d.node({ x: 830, y: 120, w: 220, h: 80, kind: "x", title: "Everyone buffers" });
    d.edge("s", "srv", { sides: "rl" }); d.edge("srv", [826, 160], { sides: "rl", tone: "bad" });
    return d;
  },
  "cs-live": () => {
    const d = new Diagram({ w: 1400, h: 500, bare: true });
    d.node({ id: "st", x: 40, y: 90, w: 180, h: 80, kind: "video", title: "Streamer", sub: "OBS · RTMP/SRT" });
    d.node({ id: "in", x: 280, y: 90, w: 200, h: 80, kind: "ws", title: "Nearest ingest", sub: "verify stream key" });
    d.node({ id: "tc", x: 540, y: 80, w: 220, h: 100, kind: "gear", tone: "compute", title: "Live transcoders", sub: "1080p · 720p · 480p (GPU)" });
    d.node({ id: "pk", x: 820, y: 90, w: 200, h: 80, kind: "file", title: "Packager", sub: "1–2 s segments" });
    d.node({ id: "cdn", x: 1080, y: 80, w: 280, h: 100, kind: "cdn", title: "CDN + origin shield", sub: "fan-out to millions", emphasis: true });
    d.node({ id: "v", x: 1080, y: 300, w: 280, h: 80, kind: "users", title: "Viewers", sub: "adaptive player" });
    d.node({ id: "vod", x: 820, y: 300, w: 200, h: 80, kind: "storage", title: "Recording", sub: "becomes a VOD" });
    d.node({ id: "chat", x: 540, y: 300, w: 220, h: 80, kind: "ws", title: "Chat service", sub: "rate limits · moderation" });
    d.edge("st", "in", { sides: "rl", hot: true }); d.edge("in", "tc", { sides: "rl", hot: true }); d.edge("tc", "pk", { sides: "rl", hot: true }); d.edge("pk", "cdn", { sides: "rl", hot: true });
    d.edge("cdn", "v", { sides: "bt", tone: "good", hot: true });
    d.edge("pk", "vod", { sides: "bt", dashed: true });
    d.edge("v", "chat", { sides: "bb", via: [[1220, 450], [650, 450]], both: true, dashed: true, label: "chat messages", at: [930, 450] });
    return d;
  },
  "cs-live-latency": () => {
    const d = new Diagram({ w: 1300, h: 300, bare: true });
    const st = [["Encode", "~0.5 s", "info", 160], ["Upload to ingest", "~0.3 s", "info", 180], ["Transcode + package", "~1–2 s", "edge", 260], ["CDN delivery", "~0.2 s", "info", 160], ["Player buffer", "2–6 s", "warn", 420]];
    let x = 30;
    st.forEach(([t, s2, tone, w]) => { d.box({ x, y: 60, w, h: 90, text: t, sub: s2, tone, size: 15 }); x += w + 8; });
    d.text(650, 210, "Glass-to-glass ≈ 4–10 s · shrink segments and buffers for ~2 s · WebRTC for < 1 s (costlier, less smooth)", { size: 14.5, weight: 600, color: T.body, anchor: "middle" });
    return d;
  },

  // ---------- 25 Food delivery ----------
  "cs-food-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Uncoordinated — waiting couriers, cold food, confused customers", "bad", 340);
    d.node({ x: 50, y: 90, w: 300, h: 76, kind: "user", title: "Customer", sub: "“where is my food?”" });
    d.node({ x: 400, y: 90, w: 300, h: 76, kind: "service", title: "Restaurant", sub: "“courier came 20 min early”" });
    d.node({ x: 750, y: 90, w: 300, h: 76, kind: "mobile", title: "Courier", sub: "“food isn't ready”" });
    ["Cold food", "Wasted courier time", "Paid for a sold-out item"].forEach((t, i) => d.node({ x: 50 + i * 350, y: 230, w: 300, h: 64, kind: "x", title: t }));
    return d;
  },
  "cs-food": () => {
    const d = new Diagram({ w: 1400, h: 540, bare: true });
    d.node({ id: "cu", x: 40, y: 210, w: 180, h: 80, kind: "mobile", title: "Customer app" });
    d.node({ id: "os", x: 290, y: 200, w: 240, h: 100, kind: "service", title: "Order service", sub: "state machine · payment auth", emphasis: true });
    d.node({ id: "re", x: 290, y: 40, w: 240, h: 80, kind: "browser", title: "Restaurant tablet", sub: "accept · prep time · ready" });
    d.node({ id: "pay", x: 290, y: 400, w: 240, h: 76, kind: "money", title: "Payments", sub: "authorize → capture" });
    d.node({ id: "ev", x: 610, y: 210, w: 200, h: 80, kind: "stream", title: "Order events" });
    d.node({ id: "dp", x: 880, y: 200, w: 240, h: 100, kind: "worker", title: "Dispatch", sub: "assign courier to arrive when food is ready" });
    d.node({ id: "eta", x: 880, y: 40, w: 240, h: 80, kind: "ml", title: "ETA & prep-time models" });
    d.node({ id: "loc", x: 880, y: 400, w: 240, h: 76, kind: "map", title: "Courier locations", sub: "in-memory geo index" });
    d.node({ id: "co", x: 1190, y: 210, w: 180, h: 80, kind: "mobile", title: "Courier app" });
    d.node({ id: "nt", x: 610, y: 400, w: 200, h: 76, kind: "bell", title: "Notifications", sub: "live updates" });
    d.edge("cu", "os", { sides: "rl", hot: true, step: 1 });
    d.edge("os", "re", { sides: "tb", both: true, step: 2 });
    d.edge("os", "pay", { sides: "bt", dashed: true });
    d.edge("os", "ev", { sides: "rl" }); d.edge("ev", "dp", { sides: "rl", step: 3 });
    d.edge("dp", "eta", { sides: "tb", dashed: true }); d.edge("dp", "loc", { sides: "bt", dashed: true });
    d.edge("dp", "co", { sides: "rl", step: 4, label: "offer" });
    d.edge("co", "loc", { sides: "br", via: [[1280, 438]], dashed: true, label: "location", at: [1200, 438] });
    d.edge("ev", "nt", { sides: "bt", dashed: true });
    return d;
  },
  "cs-food-states": () => {
    const d = new Diagram({ w: 1400, h: 320, bare: true });
    const st = [["PLACED", "info"], ["ACCEPTED", "edge"], ["PREPARING", "edge"], ["READY", "compute"], ["PICKED UP", "compute"], ["DELIVERED", "good"]];
    st.forEach(([t, tone], i) => d.box({ id: "s" + i, x: 30 + i * 226, y: 60, w: 200, h: 64, text: t, tone, solid: i === 5, size: 15 }));
    for (let i = 0; i < st.length - 1; i++) d.edge("s" + i, "s" + (i + 1), { sides: "rl" });
    d.box({ id: "rj", x: 30, y: 210, w: 300, h: 60, text: "REJECTED", sub: "restaurant declines → void payment", tone: "bad", size: 14 });
    d.box({ id: "cx", x: 480, y: 210, w: 360, h: 60, text: "CANCELLED", sub: "full refund before prep · partial after", tone: "bad", size: 14 });
    d.edge("s0", "rj", { sides: "bt", dashed: true, tone: "bad" });
    d.edge("s1", "cx", { sides: "bt", dashed: true, tone: "bad" }); d.edge("s2", "cx", { sides: "bt", dashed: true, tone: "bad" });
    return d;
  },
};
