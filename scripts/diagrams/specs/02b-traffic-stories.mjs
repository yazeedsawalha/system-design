// Chapter 02 — "before / after" story pictures (red = the problem, green = the fix)
import { Diagram, TONES, T } from "../engine.mjs";
const W = 1100;

export default {
  "lb-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 340, title: "One server — a hard limit and a single point of failure", tone: "bad" });
    d.node({ id: "u", x: 50, y: 160, w: 220, h: 76, kind: "users", title: "10,000 req/s", sub: "campaign traffic" });
    d.node({ id: "s", x: 440, y: 150, w: 280, h: 96, kind: "service", tone: "bad", title: "Server", sub: "max ~2,000 req/s · 100% CPU", emphasis: true });
    d.node({ id: "e", x: 830, y: 100, w: 220, h: 64, kind: "x", title: "Slow & timeouts" });
    d.node({ id: "c", x: 830, y: 230, w: 220, h: 64, kind: "x", title: "Crash = site down" });
    d.edge("u", "s", { sides: "rl", tone: "bad", hot: true });
    d.edge("s", "e", { sides: "rl", tone: "bad", mid: 780 });
    d.edge("s", "c", { sides: "rl", tone: "bad", mid: 780 });
    return d;
  },
  "lb-with": () => {
    const d = new Diagram({ w: W, h: 460, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 420, title: "A load balancer shares the work and skips dead servers", tone: "good" });
    d.node({ id: "u", x: 50, y: 200, w: 200, h: 76, kind: "users", title: "10,000 req/s" });
    d.node({ id: "lb", x: 330, y: 190, w: 220, h: 96, kind: "lb", title: "Load balancer", sub: "one public address", emphasis: true });
    ["2,000 req/s", "2,000 req/s", "down — skipped", "2,000 req/s", "2,000 req/s"].forEach((t, i) => {
      const dead = i === 2;
      d.node({ id: "s" + i, x: 700, y: 80 + i * 70, w: 340, h: 54, kind: dead ? "x" : "service", tone: dead ? "bad" : undefined, ghost: dead, title: `Server ${i + 1}`, sub: t });
      d.edge("lb", "s" + i, { sides: "rl", mid: 630, tone: dead ? "bad" : "good", dashed: dead, noArrow: dead });
    });
    d.edge("u", "lb", { sides: "rl", hot: true });
    return d;
  },
  "redundancy-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 320, title: "One database — when it dies, everything stops", tone: "bad" });
    d.node({ id: "a", x: 50, y: 150, w: 220, h: 76, kind: "service", title: "App servers ×5", sub: "all healthy" });
    d.node({ id: "db", x: 440, y: 150, w: 260, h: 76, kind: "db", tone: "bad", title: "Database", sub: "disk failed 💥", emphasis: true });
    d.node({ id: "x", x: 830, y: 150, w: 220, h: 76, kind: "x", title: "Whole site down", sub: "for hours" });
    d.edge("a", "db", { sides: "rl", tone: "bad", dashed: true, label: "✗ no answer" });
    d.edge("db", "x", { sides: "rl", tone: "bad" });
    return d;
  },
  "redundancy-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "A standby copy in another zone takes over", tone: "good" });
    d.node({ id: "a", x: 50, y: 170, w: 220, h: 76, kind: "service", title: "App servers ×5" });
    d.group({ x: 400, y: 80, w: 300, h: 130, label: "Zone A", tone: "bad" });
    d.group({ x: 400, y: 230, w: 300, h: 130, label: "Zone B", tone: "good" });
    d.node({ id: "p", x: 420, y: 118, w: 260, h: 70, kind: "db", tone: "bad", ghost: true, title: "Primary", sub: "failed" });
    d.node({ id: "s", x: 420, y: 268, w: 260, h: 70, kind: "db", title: "Standby → new primary", sub: "always in sync", emphasis: true });
    d.edge("a", "s", { sides: "rl", tone: "good", hot: true, label: "switched in ~30 s", mid: 340 });
    d.edge("p", "s", { sides: "bt", dashed: true, label: "copy of every write" });
    d.node({ id: "ok", x: 800, y: 265, w: 250, h: 76, kind: "check", title: "Site keeps running", sub: "no data lost" });
    d.edge("s", "ok", { sides: "rl", tone: "good" });
    return d;
  },
  "gateway-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 380, title: "No gateway — the phone calls every service itself", tone: "bad" });
    d.node({ id: "m", x: 50, y: 180, w: 200, h: 80, kind: "mobile", title: "Phone", sub: "slow mobile network" });
    ["Profile service", "Orders service", "Recommendations"].forEach((t, i) => {
      d.node({ id: "s" + i, x: 690, y: 80 + i * 105, w: 360, h: 76, kind: "service", title: t, sub: "own login check · own limits · own logs" });
      d.edge("m", "s" + i, { sides: "rl", mid: 460, tone: "bad", label: `call ${i + 1} · ~120 ms`, at: [560, 118 + i * 105] });
    });
    return d;
  },
  "gateway-with": () => {
    const d = new Diagram({ w: W, h: 420, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 380, title: "With a gateway — one call, rules in one place", tone: "good" });
    d.node({ id: "m", x: 50, y: 180, w: 190, h: 80, kind: "mobile", title: "Phone", sub: "1 call · ~120 ms" });
    d.node({ id: "g", x: 330, y: 150, w: 250, h: 140, kind: "gateway", title: "API gateway", sub: "login check · limits · logs · combine answers", emphasis: true });
    ["Profile service", "Orders service", "Recommendations"].forEach((t, i) => {
      d.node({ id: "s" + i, x: 730, y: 80 + i * 105, w: 320, h: 76, kind: "service", title: t, sub: "~2–5 ms inside the data center" });
      d.edge("g", "s" + i, { sides: "rl", mid: 660, tone: "good" });
    });
    d.edge("m", "g", { sides: "rl", hot: true });
    return d;
  },
  "ratelimit-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "No limits — one bot takes the service down for everyone", tone: "bad" });
    d.node({ id: "b", x: 50, y: 90, w: 230, h: 76, kind: "warn", tone: "bad", title: "Bot", sub: "10,000 requests/s" });
    ["Alice", "Bob", "Chen"].forEach((t, i) => d.node({ id: "u" + i, x: 50, y: 190 + i * 58, w: 230, h: 46, kind: "user", title: t }));
    d.node({ id: "s", x: 560, y: 150, w: 260, h: 96, kind: "service", tone: "bad", title: "API servers", sub: "overloaded 🔥", emphasis: true });
    d.edge("b", "s", { sides: "rl", tone: "bad", hot: true, mid: 420 });
    [0, 1, 2].forEach((i) => d.edge("u" + i, "s", { sides: "rl", mid: 420, dashed: true }));
    d.node({ x: 870, y: 160, w: 180, h: 76, kind: "x", title: "Errors", sub: "for everyone" });
    d.edge([824, 198], [866, 198], { route: "straight", tone: "bad" });
    return d;
  },
  "ratelimit-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "Rate limiting — each client gets a fair allowance", tone: "good" });
    d.node({ id: "b", x: 50, y: 90, w: 230, h: 76, kind: "warn", tone: "bad", title: "Bot", sub: "10,000 requests/s" });
    ["Alice", "Bob", "Chen"].forEach((t, i) => d.node({ id: "u" + i, x: 50, y: 190 + i * 58, w: 230, h: 46, kind: "user", title: t }));
    d.node({ id: "rl", x: 400, y: 150, w: 230, h: 96, kind: "lock", title: "Rate limiter", sub: "100 requests/min each", emphasis: true });
    d.node({ id: "s", x: 790, y: 190, w: 260, h: 76, kind: "service", title: "API servers", sub: "calm, serving users" });
    d.edge("b", "rl", { sides: "rl", tone: "bad", mid: 340 });
    [0, 1, 2].forEach((i) => d.edge("u" + i, "rl", { sides: "rl", mid: 340, tone: "good" }));
    d.edge("rl", "s", { sides: "rl", tone: "good", hot: true, label: "allowed" });
    d.node({ id: "rej", x: 790, y: 72, w: 260, h: 70, kind: "x", title: "Bot rejected", sub: "429 Too Many Requests" });
    d.edge("rl", "rej", { sides: "tl", via: [[515, 107]], tone: "bad" });
    return d;
  },
  "cache-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 340, title: "No cache — the same query, thousands of times", tone: "bad" });
    d.node({ id: "u", x: 50, y: 150, w: 230, h: 76, kind: "users", title: "10,000 visits", sub: "all want the home page" });
    d.node({ id: "a", x: 380, y: 150, w: 200, h: 76, kind: "service", title: "App servers" });
    d.node({ id: "db", x: 720, y: 140, w: 330, h: 96, kind: "db", tone: "bad", title: "Database · 100% busy", sub: "same query 10,000× · ~20 ms each", emphasis: true });
    d.edge("u", "a", { sides: "rl" });
    d.edge("a", "db", { sides: "rl", tone: "bad", hot: true, label: "10,000 queries" });
    return d;
  },
  "cache-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "With a cache — most answers come from memory", tone: "good" });
    d.node({ id: "u", x: 50, y: 170, w: 230, h: 76, kind: "users", title: "10,000 visits" });
    d.node({ id: "a", x: 380, y: 170, w: 200, h: 76, kind: "service", title: "App servers" });
    d.node({ id: "c", x: 720, y: 90, w: 330, h: 80, kind: "cache", title: "Cache (Redis)", sub: "9,500 hits · ~0.3 ms each", emphasis: true });
    d.node({ id: "db", x: 720, y: 250, w: 330, h: 80, kind: "db", title: "Database · relaxed", sub: "only 500 misses" });
    d.edge("u", "a", { sides: "rl" });
    d.edge("a", "c", { sides: "rl", tone: "good", hot: true, label: "95%", mid: 650 });
    d.edge("a", "db", { sides: "rl", dashed: true, label: "5%", mid: 650 });
    return d;
  },
  "stampede-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "Stampede — a hot key expires and everyone refills it", tone: "bad" });
    for (let i = 0; i < 5; i++) d.node({ id: "r" + i, x: 50, y: 80 + i * 56, w: 200, h: 44, kind: "user", title: "request" });
    d.node({ id: "db", x: 720, y: 170, w: 330, h: 90, kind: "db", tone: "bad", title: "Database", sub: "10,000 identical queries at once 🔥", emphasis: true });
    for (let i = 0; i < 5; i++) d.edge("r" + i, "db", { sides: "rl", mid: 500, tone: "bad" });
    d.text(270, 360, "cache key “home-page” just expired → every request misses at the same moment", { size: 14, weight: 600, color: TONES.bad[0] });
    return d;
  },
  "stampede-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "Single-flight — one request refills, the rest wait", tone: "good" });
    for (let i = 0; i < 5; i++) d.node({ id: "r" + i, x: 50, y: 80 + i * 56, w: 200, h: 44, kind: "user", tone: i === 0 ? "good" : undefined, title: i === 0 ? "request #1" : "request" });
    d.node({ id: "lk", x: 420, y: 180, w: 210, h: 70, kind: "lock", title: "Lock on the key" });
    d.node({ id: "db", x: 790, y: 180, w: 260, h: 70, kind: "db", title: "Database", sub: "just 1 query" });
    for (let i = 0; i < 5; i++) d.edge("r" + i, "lk", { sides: "rl", mid: 350, tone: i === 0 ? "good" : undefined, dashed: i !== 0 });
    d.edge("lk", "db", { sides: "rl", tone: "good", label: "#1 refills" });
    d.text(270, 360, "the others wait ~5 ms for the fresh value (or get the slightly old one)", { size: 14, weight: 600, color: TONES.good[0] });
    return d;
  },
  "cdn-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 380, title: "No CDN — every file crosses the world", tone: "bad" });
    d.node({ id: "o", x: 420, y: 170, w: 260, h: 90, kind: "service", tone: "bad", title: "Your servers (Virginia)", sub: "carry every download", emphasis: true });
    [["Tokyo", 820, 80, "~180 ms"], ["Sydney", 820, 300, "~220 ms"], ["London", 60, 80, "~80 ms"], ["São Paulo", 60, 300, "~130 ms"]].forEach(([n, x, y, ms], i) => {
      d.node({ id: "u" + i, x, y, w: 220, h: 60, kind: "user", title: n });
      d.edge("u" + i, "o", { tone: "bad", label: ms + " per file", both: true });
    });
    return d;
  },
};
