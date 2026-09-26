// Chapter 05 — "before / after" story pictures (red = the problem, green = the fix)
import { Diagram, TONES, T } from "../engine.mjs";
const W = 1100;
const F = (d, title, tone, h) => d.frame({ x: 20, y: 20, w: 1060, h, title, tone });

export default {
  "timeout-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "No timeout — every request waits forever", "bad", 360);
    d.node({ id: "u", x: 50, y: 150, w: 200, h: 76, kind: "users", title: "Customers" });
    d.node({ id: "c", x: 360, y: 110, w: 280, h: 156, kind: "service", tone: "bad", title: "Checkout service", sub: "200 of 200 threads stuck waiting ⏳ · can't serve anyone", emphasis: true });
    d.node({ id: "s", x: 790, y: 150, w: 260, h: 76, kind: "service", tone: "bad", title: "Shipping service", sub: "hanging, never answers" });
    d.edge("u", "c", { sides: "rl", tone: "bad" });
    d.edge("c", "s", { sides: "rl", tone: "bad", dashed: true, label: "waiting… 60 s… 120 s…" });
    return d;
  },
  "timeout-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "Timeout + fallback — give up fast, keep serving", "good", 360);
    d.node({ id: "u", x: 50, y: 150, w: 200, h: 76, kind: "users", title: "Customers" });
    d.node({ id: "c", x: 360, y: 130, w: 280, h: 116, kind: "service", title: "Checkout service", sub: "waits max 2 s, then uses a fallback", emphasis: true });
    d.node({ id: "s", x: 790, y: 90, w: 260, h: 70, kind: "service", tone: "bad", title: "Shipping service", sub: "slow" });
    d.node({ id: "f", x: 790, y: 230, w: 260, h: 70, kind: "check", title: "Fallback", sub: "“standard shipping $5”" });
    d.edge("u", "c", { sides: "rl", tone: "good", both: true });
    d.edge("c", "s", { sides: "rl", tone: "warn", dashed: true, label: "timeout 2 s", mid: 720 });
    d.edge("c", "f", { sides: "rl", tone: "good", mid: 720 });
    return d;
  },
  "breaker-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "No circuit breaker — one failure spreads to everything", "bad", 380);
    d.node({ id: "p", x: 790, y: 160, w: 260, h: 80, kind: "money", tone: "bad", title: "Payment provider", sub: "down ✗" });
    d.node({ id: "a", x: 380, y: 130, w: 280, h: 140, kind: "service", tone: "bad", title: "App servers", sub: "all threads waiting on payments → no capacity left", emphasis: true });
    d.edge("a", "p", { sides: "rl", tone: "bad", dashed: true, label: "call… wait… retry…" });
    [["Checkout", "down"], ["Product pages", "down too"], ["Search", "down too"], ["Login", "down too"]].forEach(([t, s], i) => { d.node({ id: "f" + i, x: 50, y: 70 + i * 76, w: 240, h: 60, kind: "x", title: t, sub: s }); d.edge("f" + i, "a", { sides: "rl", mid: 335, tone: "bad" }); });
    return d;
  },
  "breaker-with": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "Circuit breaker open — fail fast, the rest of the site stays up", "good", 380);
    d.node({ id: "p", x: 880, y: 160, w: 170, h: 80, kind: "money", tone: "bad", title: "Payments", sub: "down ✗" });
    d.node({ id: "a", x: 360, y: 150, w: 240, h: 100, kind: "service", title: "App servers", sub: "plenty of capacity", emphasis: true });
    d.node({ id: "b", x: 640, y: 165, w: 170, h: 70, kind: "lock", tone: "warn", title: "Breaker", sub: "OPEN" });
    d.edge("a", "b", { sides: "rl", tone: "warn" });
    d.edge("b", "p", { sides: "rl", tone: "bad", dashed: true, noArrow: true });
    [["Checkout", "“try again soon”", "warn"], ["Product pages", "working", "good"], ["Search", "working", "good"], ["Login", "working", "good"]].forEach(([t, s, tone], i) => { d.node({ id: "f" + i, x: 50, y: 70 + i * 76, w: 240, h: 60, kind: tone === "good" ? "check" : "warn", tone, title: t, sub: s }); d.edge("f" + i, "a", { sides: "rl", mid: 325, tone: "good" }); });
    return d;
  },
  "slo-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Measuring the wrong thing — green dashboards, unhappy users", "bad", 340);
    d.box({ x: 50, y: 90, w: 470, h: 210, text: "Server dashboard: all green ✔", sub: "CPU 40% · memory 60% · all 12 servers up · disk OK", tone: "good", size: 19 });
    d.box({ x: 580, y: 90, w: 470, h: 210, text: "Users: 5% of checkouts fail ✗", sub: "nobody is alerted · found hours later from complaints", tone: "bad", size: 19 });
    return d;
  },
  "obs-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "No observability — “checkout is slow”, but where?", "bad", 360);
    d.node({ id: "u", x: 50, y: 160, w: 200, h: 76, kind: "user", title: "User", sub: "checkout takes 10 s" });
    const svcs = ["Gateway", "Auth", "Cart", "Pricing", "Inventory", "Payments", "Database", "Cache"];
    svcs.forEach((t, i) => { const col = i % 4, row = Math.floor(i / 4); d.node({ x: 330 + col * 180, y: 100 + row * 120, w: 160, h: 60, kind: t === "Database" ? "db" : t === "Cache" ? "cache" : "service", title: t + " ?", ghost: true }); });
    d.text(550, 350, "Engineers guess, restart things, and hope — while customers leave", { size: 15, weight: 700, color: TONES.bad[0], anchor: "middle" });
    return d;
  },
  "dr-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Everything in one region — the region fails, the business stops", "bad", 340);
    d.group({ x: 300, y: 80, w: 500, h: 230, label: "Region: us-east (power outage 💥)", tone: "bad" });
    [["service", "App servers"], ["db", "Database + replica"], ["storage", "Files"], ["file", "Backups"]].forEach(([k, t], i) => d.node({ x: 330 + (i % 2) * 240, y: 130 + Math.floor(i / 2) * 90, w: 220, h: 64, kind: k, tone: "bad", ghost: true, title: t }));
    d.node({ id: "u", x: 50, y: 160, w: 200, h: 70, kind: "users", title: "All users" });
    d.edge("u", [296, 195], { sides: "rl", tone: "bad", dashed: true, label: "✗" });
    d.node({ x: 850, y: 160, w: 200, h: 70, kind: "x", title: "Down for hours", sub: "recent data lost" });
    return d;
  },
  "dr-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "A second region takes over", "good", 360);
    d.node({ id: "u", x: 50, y: 170, w: 180, h: 70, kind: "users", title: "All users" });
    d.node({ id: "dns", x: 280, y: 170, w: 170, h: 70, kind: "dns", title: "DNS", sub: "health-checked" });
    d.group({ x: 520, y: 70, w: 530, h: 120, label: "us-east (down)", tone: "bad" });
    d.group({ x: 520, y: 220, w: 530, h: 120, label: "us-west (standby → active)", tone: "good" });
    d.node({ id: "e1", x: 540, y: 108, w: 230, h: 60, kind: "service", tone: "bad", ghost: true, title: "App servers" });
    d.node({ id: "e2", x: 800, y: 108, w: 230, h: 60, kind: "db", tone: "bad", ghost: true, title: "Database" });
    d.node({ id: "w1", x: 540, y: 258, w: 230, h: 60, kind: "service", title: "App servers" });
    d.node({ id: "w2", x: 800, y: 258, w: 230, h: 60, kind: "db", title: "Database copy" });
    d.edge("u", "dns", { sides: "rl" });
    d.edge("dns", "w1", { sides: "rl", tone: "good", hot: true, mid: 490 });
    d.edge("dns", "e1", { sides: "rl", tone: "bad", dashed: true, mid: 490, noArrow: true });
    d.edge("e2", "w2", { sides: "bt", dashed: true, label: "continuous copy" });
    return d;
  },
  "deploy-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Deploy to everyone at once — a bug hits 100% of users", "bad", 320);
    d.node({ id: "v", x: 50, y: 130, w: 220, h: 80, kind: "code", title: "Version 2", sub: "has a hidden bug" });
    for (let i = 0; i < 6; i++) d.node({ x: 380 + (i % 3) * 150, y: 90 + Math.floor(i / 3) * 100, w: 130, h: 70, kind: "service", tone: "bad", title: "v2 ✗" });
    d.edge("v", [376, 170], { sides: "rl", tone: "bad", label: "all at once" });
    d.node({ x: 860, y: 135, w: 190, h: 70, kind: "x", title: "100% of users", sub: "see errors" });
    return d;
  },
  "deploy-with": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Canary release — a bug hits 1%, then rolls back automatically", "good", 340);
    d.node({ id: "lb", x: 50, y: 140, w: 220, h: 80, kind: "lb", title: "Load balancer" });
    d.node({ id: "c", x: 420, y: 80, w: 280, h: 70, kind: "service", tone: "warn", title: "Canary · v2 · 1% of users", sub: "errors rising → roll back ↩" });
    d.node({ id: "s", x: 420, y: 210, w: 280, h: 70, kind: "service", tone: "good", title: "Stable · v1 · 99% of users", sub: "unaffected" });
    d.edge("lb", "c", { sides: "rl", mid: 350, tone: "warn", label: "1%", at: [350, 140] });
    d.edge("lb", "s", { sides: "rl", mid: 350, tone: "good", label: "99%", at: [350, 222] });
    d.node({ id: "m", x: 800, y: 140, w: 250, h: 80, kind: "monitor", title: "Automatic check", sub: "error rate · p99 latency" });
    d.edge("c", "m", { sides: "rl", dashed: true, mid: 760 });
    return d;
  },
};
