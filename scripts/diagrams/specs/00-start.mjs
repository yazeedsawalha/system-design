import { Diagram, table, bars, sequence, icon as iconG, TONES, T } from "../engine.mjs";

export default {
  "big-picture": () => {
    const d = new Diagram({
      w: 1500, h: 730,
      eyebrow: "The map",
      title: "Anatomy of a modern web system",
      subtitle: "Almost every product you will ever design is a remix of these ~12 building blocks.",
      takeaway: "Learn the blocks once — then every design is a question of which blocks, in what order, and why.",
    });
    d.group({ x: 32, y: 150, w: 250, h: 540, label: "Users", tone: "client" });
    d.group({ x: 312, y: 150, w: 280, h: 540, label: "Edge — get close to the user", tone: "edge" });
    d.group({ x: 622, y: 150, w: 290, h: 540, label: "Compute — run the logic", tone: "compute" });
    d.group({ x: 942, y: 150, w: 526, h: 540, label: "Data — remember things", tone: "data" });

    d.node({ id: "web", x: 52, y: 250, w: 210, kind: "browser", title: "Web browser", sub: "React, HTML" });
    d.node({ id: "app", x: 52, y: 470, w: 210, kind: "mobile", title: "Mobile app", sub: "iOS / Android" });

    d.node({ id: "dns", x: 342, y: 200, w: 220, kind: "dns", title: "DNS", sub: "name → IP address" });
    d.node({ id: "cdn", x: 342, y: 330, w: 220, kind: "cdn", title: "CDN", sub: "images, JS, video" });
    d.node({ id: "lb", x: 342, y: 480, w: 220, kind: "lb", title: "Load balancer", sub: "spreads traffic" });

    d.node({ id: "api", x: 652, y: 372, w: 230, h: 76, kind: "service", title: "App servers", sub: "stateless · many copies", emphasis: true });
    d.node({ id: "q", x: 652, y: 560, w: 230, kind: "queue", title: "Message queue", sub: "work for later" });
    d.node({ id: "wk", x: 652, y: 200, w: 230, kind: "worker", title: "Background workers", sub: "emails, resize, feeds" });

    d.node({ id: "cache", x: 972, y: 200, w: 220, kind: "cache", title: "Cache", sub: "Redis · hot data in RAM" });
    d.node({ id: "db", x: 972, y: 370, w: 220, h: 76, kind: "db", title: "Primary database", sub: "source of truth", emphasis: true });
    d.node({ id: "rep", x: 972, y: 560, w: 220, kind: "replica", title: "Read replicas", sub: "copies for reads" });
    d.node({ id: "obj", x: 1222, y: 200, w: 220, kind: "storage", title: "Object storage", sub: "S3 · files & media" });
    d.node({ id: "search", x: 1222, y: 380, w: 220, kind: "search", title: "Search index", sub: "full-text queries" });
    d.node({ id: "mon", x: 1222, y: 560, w: 220, kind: "monitor", title: "Observability", sub: "logs · metrics · traces" });

    d.edge("web", "dns", { step: 1, label: "where is it?", sides: "rl", hot: true });
    d.edge("web", "cdn", { step: 2, label: "static files", sides: "rl", mid: 300 });
    d.edge("app", "lb", { step: 3, label: "API call", sides: "rl", hot: true });
    d.edge("lb", "api", { step: 4, sides: "rl", hot: true });
    d.edge("api", "cache", { step: 5, label: "check cache", sides: "rl", hot: true, mid: 930 });
    d.edge("api", "db", { step: 6, label: "on miss", sides: "rl", hot: true, mid: 930, at: [928, 440] });
    d.edge("db", "rep", { label: "replicate", dashed: true, sides: "bt" });
    d.edge("api", "q", { step: 7, label: "enqueue", sides: "bt", dashed: true });
    d.edge("q", "wk", { sides: "ll", via: [[638, 594], [638, 234]], dashed: true, label: "consume", at: [638, 300] });
    d.edge("wk", "obj", { sides: "tt", via: [[767, 184], [1332, 184]], dashed: true, label: "write files", at: [1207, 184] });
    d.edge("db", "search", { sides: "rl", dashed: true, label: "index" });
    return d;
  },

  "scale-journey": () => {
    const d = new Diagram({
      w: 1500, h: 850,
      eyebrow: "How systems grow",
      title: "From 1 user to 10 million: the scaling journey",
      subtitle: "You never design the final system on day one. Each stage fixes the **bottleneck** the previous stage created.",
      takeaway: "Architects add complexity only when a measured bottleneck demands it — every box has a running cost.",
    });
    const stages = [
      { t: "Stage 1", u: "1 – 1K users", title: "One box", tone: "good", items: ["App + DB on one server", "Deploy with one command", "Cheap and simple"], pain: "Server dies → site dies" },
      { t: "Stage 2", u: "1K – 10K", title: "Split the DB", tone: "info", items: ["Web tier and DB tier apart", "Scale each independently", "Managed DB (RDS)"], pain: "One app server = one SPOF" },
      { t: "Stage 3", u: "10K – 100K", title: "Load balance", tone: "info", items: ["LB + many stateless servers", "Sessions moved to Redis", "Auto-scaling group"], pain: "DB drowning in reads" },
      { t: "Stage 4", u: "100K – 1M", title: "Cache + replicas", tone: "warn", items: ["Redis cache for hot reads", "Read replicas", "CDN for static files"], pain: "Slow work blocks requests" },
      { t: "Stage 5", u: "1M – 10M", title: "Async + shard", tone: "edge", items: ["Queues + workers", "Shard the write DB", "Multi-region, observability"], pain: "Team & org complexity" },
    ];
    const cw = 262, gap = 20, x0 = 48, bottom = 760;
    const glyphs = [
      [["service", "App + DB"]],
      [["service", "App"], ["db", "Database"]],
      [["lb", "Load balancer"], ["service", "App × N"], ["db", "Database"]],
      [["cdn", "CDN"], ["lb", "Load balancer"], ["service", "App × N"], ["cache", "Cache"], ["db", "DB + replicas"]],
      [["cdn", "CDN"], ["lb", "LB (multi-region)"], ["service", "Services"], ["queue", "Queue + workers"], ["cache", "Cache"], ["db", "Sharded DB"]],
    ];
    stages.forEach((s, i) => {
      const x = x0 + i * (cw + gap);
      const glyph = glyphs[i];
      const hgt = 104 + glyph.length * 50 + 12 + 80;
      const y = bottom - hgt;
      d.panel({ x, y, w: cw, h: hgt, title: s.title, tone: s.tone, tag: s.t });
      d.text(x + 20, y + 84, s.u, { size: 13, weight: 700, color: "#64748B" });
      const gy = y + 104;
      glyph.forEach(([k, t], j) => d.node({ x: x + 18, y: gy + j * 50, w: cw - 36, h: 42, kind: k, title: t }));
      const py = y + hgt - 74;
      d.raw(`<rect x="${x + 14}" y="${py}" width="${cw - 28}" height="58" rx="10" fill="#FEF2F2" stroke="#FECACA"/>`);
      d.text(x + 26, py + 22, "NEXT BOTTLENECK", { size: 11, weight: 700, color: "#DC2626" });
      d.text(x + 26, py + 42, s.pain, { size: 13, weight: 600, color: "#991B1B" });
    });
    d.edge([60, 790], [1440, 790], { route: "straight" });
    d.text(60, 820, "More users, more data, more engineers  →  more building blocks", { size: 13.5, weight: 600, color: "#64748B" });
    return d;
  },

  "sd-without": () => {
    const d = new Diagram({ w: 1100, h: 420, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 380, title: "Launch day without system design", tone: "bad" });
    d.node({ id: "u", x: 50, y: 170, w: 220, h: 80, kind: "users", title: "10,000 users", sub: "arrive in one minute" });
    d.node({ id: "s", x: 440, y: 150, w: 280, h: 120, kind: "service", tone: "bad", title: "One server", sub: "app + database · CPU 100% 🔥", emphasis: true });
    d.node({ id: "e", x: 830, y: 110, w: 220, h: 64, kind: "x", title: "Timeouts", sub: "pages take 30 s" });
    d.node({ id: "c", x: 830, y: 250, w: 220, h: 64, kind: "x", title: "Crash", sub: "everything is down" });
    d.edge("u", "s", { sides: "rl", tone: "bad", label: "all traffic", hot: true });
    d.edge("s", "e", { sides: "rl", tone: "bad", mid: 780 });
    d.edge("s", "c", { sides: "rl", tone: "bad", mid: 780 });
    return d;
  },

  "sd-with": () => {
    const d = new Diagram({ w: 1100, h: 460, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 420, title: "The same launch day with system design", tone: "good" });
    d.node({ id: "u", x: 50, y: 200, w: 180, h: 76, kind: "users", title: "10,000 users" });
    d.node({ id: "cdn", x: 50, y: 330, w: 180, h: 60, kind: "cdn", title: "CDN", sub: "images nearby" });
    d.node({ id: "lb", x: 290, y: 200, w: 180, h: 76, kind: "lb", title: "Load balancer" });
    ["App server 1", "App server 2", "App server 3"].forEach((t, i) => d.node({ id: "a" + i, x: 530, y: 100 + i * 100, w: 200, h: 60, kind: "service", title: t }));
    d.node({ id: "cache", x: 800, y: 90, w: 250, h: 66, kind: "cache", title: "Cache", sub: "answers repeat questions" });
    d.node({ id: "db", x: 800, y: 205, w: 250, h: 66, kind: "db", title: "Database", sub: "relaxed" });
    d.node({ id: "rep", x: 800, y: 320, w: 250, h: 66, kind: "replica", title: "Replica", sub: "backup copy" });
    d.edge("u", "lb", { sides: "rl", hot: true });
    d.edge("u", "cdn", { sides: "bt", dashed: true });
    [0, 1, 2].forEach((i) => d.edge("lb", "a" + i, { sides: "rl", mid: 500, tone: "good" }));
    d.edge("a1", "cache", { sides: "rl", mid: 765 });
    d.edge("a1", "db", { sides: "rl", mid: 765 });
    d.edge("db", "rep", { sides: "bt", dashed: true });
    return d;
  },

  "numbers-without": () => {
    const d = new Diagram({ w: 1100, h: 380, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 340, title: "Every query crosses the ocean", tone: "bad" });
    d.group({ x: 50, y: 90, w: 430, h: 240, label: "Europe", tone: "client" });
    d.group({ x: 620, y: 90, w: 430, h: 240, label: "United States", tone: "neutral" });
    d.node({ id: "u", x: 80, y: 190, w: 160, h: 64, kind: "user", title: "User" });
    d.node({ id: "a", x: 280, y: 190, w: 170, h: 64, kind: "service", title: "App server" });
    d.node({ id: "db", x: 700, y: 190, w: 280, h: 64, kind: "db", title: "Database", tone: "bad" });
    d.edge("u", "a", { sides: "rl" });
    d.edge("a", "db", { sides: "rl", tone: "bad", both: true, label: "10 queries × 150 ms = 1.5 s", hot: true });
    return d;
  },

  "numbers-with": () => {
    const d = new Diagram({ w: 1100, h: 380, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 340, title: "The same page with data nearby", tone: "good" });
    d.group({ x: 50, y: 90, w: 1000, h: 240, label: "Europe — everything in one region", tone: "data" });
    d.node({ id: "u", x: 80, y: 190, w: 160, h: 64, kind: "user", title: "User" });
    d.node({ id: "a", x: 330, y: 190, w: 170, h: 64, kind: "service", title: "App server" });
    d.node({ id: "c", x: 700, y: 130, w: 300, h: 64, kind: "cache", title: "Cache (memory)", sub: "~0.3 ms" });
    d.node({ id: "db", x: 700, y: 240, w: 300, h: 64, kind: "db", title: "Database (same region)", sub: "~1–5 ms" });
    d.edge("u", "a", { sides: "rl" });
    d.edge("a", "c", { sides: "rl", tone: "good", both: true, label: "10 lookups ≈ 10 ms", mid: 600 });
    d.edge("a", "db", { sides: "rl", tone: "good", both: true, mid: 600 });
    return d;
  },

  "architect-mindset": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Think like an architect",
      title: "The architect's decision loop",
      subtitle: "Juniors ask **“what tech should I use?”** Architects ask **“what problem, under which constraints, at what cost?”**",
      takeaway: "Every architecture is a set of trade-offs you chose on purpose — write down the why, not just the what.",
    });
    const steps = [
      ["1", "Understand the business", "Who pays? What is success? What happens if we are down for an hour?"],
      ["2", "Turn goals into numbers", "Users, QPS, data size, latency p99, uptime %, budget."],
      ["3", "List the options", "At least two real alternatives for every big decision."],
      ["4", "Weigh the trade-offs", "Cost, complexity, speed to market, risk, team skills."],
      ["5", "Decide & document", "Pick the simplest option that meets the numbers. Write an ADR."],
      ["6", "Measure & evolve", "Watch real metrics. Revisit when a threshold is crossed."],
    ];
    const cw = 222, gap = 18, x0 = 48, y = 180;
    steps.forEach(([n, t, s], i) => {
      const x = x0 + i * (cw + gap);
      d.raw(`<rect x="${x}" y="${y}" width="${cw}" height="220" rx="16" fill="#fff" stroke="#E2E8F0" stroke-width="1.5" filter="url(#sh)"/>`, "back");
      d.stepCircle(x + 36, y + 38, n, i === 4 ? "good" : "ink", 16);
      d.text(x + 20, y + 92, t, { size: 16, weight: 700, color: T.ink, maxW: cw - 40, lh: 1.3 });
      d.text(x + 20, y + 146, s, { size: 13.5, color: T.body, maxW: cw - 40, lh: 1.5 });
      if (i < steps.length - 1) d.edge([x + cw + 2, y + 38], [x + cw + gap - 2, y + 38], { route: "straight", hot: true });
    });
    const xl = x0 + 5 * (cw + gap) + cw / 2;
    d.edge([xl, y + 222], [x0 + cw / 2, y + 222], { via: [[xl, y + 256], [x0 + cw / 2, y + 256]], dashed: true, label: "requirements change → loop again", at: [750, y + 256] });
    d.note({ x: 48, y: 480, w: 450, title: "Questions a CTO will ask you", icon: "user", tone: "info", lines: ["What does this cost per month at 10× users?", "What breaks first, and how will we know?", "Can our current team run this at 3 a.m.?"] });
    d.note({ x: 525, y: 480, w: 450, title: "Default to boring technology", icon: "check", tone: "good", lines: ["Postgres, Redis, S3 and a queue cover most products.", "Every new tool is one more thing to hire for and be paged for.", "Novelty must pay for itself with a real requirement."] });
    d.note({ x: 1002, y: 480, w: 450, title: "Red flags in a design", icon: "alert", tone: "bad", lines: ["Tools chosen before requirements were written.", "No numbers anywhere on the board.", "No answer to “what happens when X fails?”"] });
    return d;
  },

  "latency-numbers": () => {
    const d = new Diagram({
      w: 1500, h: 760,
      eyebrow: "Numbers every engineer should feel",
      title: "How long things take (approximate, log scale)",
      subtitle: "RAM is ~1,000× faster than SSD. One trip across the ocean costs as much as ~1,000 cache reads. **Design around the slow hops.**",
      takeaway: "Keep the user's request path in memory and in-region; push slow, far or heavy work off the critical path.",
    });
    bars(d, {
      x: 48, y: 166, w: 1400, labelW: 390, log: true, rowH: 44,
      rows: [
        { label: "L1 CPU cache reference", v: 1, text: "~1 ns", tone: "good" },
        { label: "Main memory (RAM) reference", v: 100, text: "~100 ns", tone: "good" },
        { label: "Random SSD read (4 KB)", v: 100000, text: "~0.1 ms", tone: "cache" },
        { label: "Redis GET inside the same zone", v: 300000, text: "~0.3 ms", tone: "cache" },
        { label: "Round trip inside one datacenter", v: 500000, text: "~0.5 ms", tone: "info" },
        { label: "Read 1 MB sequentially from SSD", v: 1000000, text: "~1 ms", tone: "info" },
        { label: "Simple indexed database query", v: 3000000, text: "~1–5 ms", tone: "info" },
        { label: "Spinning disk (HDD) seek", v: 10000000, text: "~10 ms", tone: "warn" },
        { label: "Round trip US East ↔ US West", v: 70000000, text: "~70 ms", tone: "warn" },
        { label: "Round trip US ↔ Europe", v: 150000000, text: "~150 ms", tone: "bad" },
        { label: "New TLS connection to a far region", v: 400000000, text: "~300–500 ms", tone: "bad" },
        { label: "User feels the app is “slow”", v: 1000000000, text: "~1 s", tone: "bad" },
      ],
    });
    return d;
  },

  "availability-nines": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Availability",
      title: "What “the nines” really mean",
      subtitle: "Each extra nine cuts allowed downtime by **10×** — and usually multiplies cost and complexity.",
      takeaway: "Buy the nines the business actually needs: 99.99% for a hobby app burns money, 99% for payments burns trust.",
    });
    table(d, {
      x: 48, y: 166, rowH: 56, headH: 48, size: 14.5,
      cols: [{ title: "Availability", w: 250 }, { title: "Down / year", w: 180 }, { title: "Down / month", w: 180 }, { title: "Typical architecture", w: 450 }, { title: "Good fit", w: 344 }],
      rows: [
        [{ t: "99% · two nines", tone: "bad" }, "3.65 days", "7.2 hours", "Single server, manual restore", "Internal tools, prototypes"],
        [{ t: "99.9% · three nines", tone: "warn" }, "8.8 hours", "43 minutes", "Multi-AZ, LB + replicas, auto-restart", "Most SaaS and consumer apps"],
        [{ t: "99.99% · four nines", tone: "info" }, "53 minutes", "4.4 minutes", "Automated failover, no SPOF, safe deploys", "Payments, core platform APIs"],
        [{ t: "99.999% · five nines", tone: "good" }, "5.3 minutes", "26 seconds", "Multi-region active-active, chaos testing", "Telecom, critical infrastructure"],
      ],
    });
    d.note({ x: 48, y: 470, w: 690, title: "Chained dependencies multiply down", icon: "alert", tone: "warn", lines: ["Request needs A → B → C, each 99.9% → 0.999³ ≈ 99.7%.", "Every synchronous hop you add lowers the ceiling."] });
    d.note({ x: 762, y: 470, w: 690, title: "Redundancy multiplies up", icon: "check", tone: "good", lines: ["Two independent 99% replicas → 1 − 0.01² = 99.99%.", "Only if failures are truly independent (different zone, power, deploy)."] });
    return d;
  },

  "vertical-vs-horizontal": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Scalability",
      title: "Scale up vs scale out",
      subtitle: "Vertical = a **bigger** machine. Horizontal = **more** machines. Real systems use both.",
      takeaway: "Scale the database up first (it is easy); scale stateless app servers out (cheap, and it removes the single point of failure).",
    });
    d.panel({ x: 48, y: 160, w: 690, h: 420, title: "Vertical scaling (scale up)", tone: "warn", tag: "Simple" });
    [[0, 90, "2 vCPU · 4 GB"], [1, 150, "8 vCPU · 32 GB"], [2, 220, "64 vCPU · 512 GB"]].forEach(([i, h, t]) => {
      const x = 90 + i * 210, y = 470 - h;
      d.raw(`<rect x="${x}" y="${y}" width="160" height="${h}" rx="12" fill="${TONES.compute[1]}" stroke="${TONES.compute[2]}" stroke-width="1.5"/>`, "mid");
      d.text(x + 80, y + h / 2 + 5, t, { size: 13.5, weight: 700, color: TONES.compute[0], anchor: "middle" });
      if (i < 2) d.edge([x + 166, 440], [x + 204, 440], { route: "straight", hot: true });
    });
    d.text(90, 512, "✓  No code changes, no distributed-systems problems", { size: 13.5, color: T.body });
    d.text(90, 540, "✗  Hard ceiling, pricey at the top, still one point of failure", { size: 13.5, color: "#B91C1C" });

    d.panel({ x: 762, y: 160, w: 690, h: 420, title: "Horizontal scaling (scale out)", tone: "good", tag: "Elastic" });
    d.node({ id: "lb", x: 800, y: 300, w: 180, h: 60, kind: "lb", title: "Load balancer" });
    [0, 1, 2, 3].forEach((i) => {
      d.node({ id: "s" + i, x: 1080, y: 236 + i * 56, w: 200, h: 44, kind: "service", title: `Server ${i + 1}`, ghost: i === 3 });
      d.edge("lb", "s" + i, { sides: "rl", dashed: i === 3, mid: 1030 });
    });
    d.text(1296, 432, "+ add more", { size: 13, weight: 600, color: T.muted });
    d.text(800, 512, "✓  Near-linear growth, survives a dead server, pay as you go", { size: 13.5, color: T.body });
    d.text(800, 540, "✗  App must be stateless, data layer gets harder", { size: 13.5, color: "#B91C1C" });
    return d;
  },

  "quality-attributes": () => {
    const d = new Diagram({
      w: 1500, h: 660,
      eyebrow: "Non-functional requirements",
      title: "The seven qualities every design is judged on",
      subtitle: "Features say **what** a system does. These qualities say **how well** — and they drive the architecture.",
      takeaway: "Turn each quality into a number (p99 < 200 ms, 99.9% uptime, RPO 1 min) before you draw a single box.",
    });
    const q = [
      ["Scalability", "Handles 10× users by adding machines, not by rewriting.", "“Will we survive Black Friday?”", "compute", "users"],
      ["Availability", "The system answers when users call.", "“99.9% = 43 min down a month”", "good", "check"],
      ["Latency", "Time for one request — watch p99, not the average.", "“Feed loads in < 200 ms”", "cache", "clock"],
      ["Consistency", "Everyone sees the same, latest data.", "“A balance must never be stale”", "search", "db"],
      ["Durability", "Once saved, data is never lost.", "“A paid order survives a crash”", "data", "lock"],
      ["Security", "Only the right people can do the right things.", "“User A never sees user B's files”", "bad", "shield"],
      ["Cost & operability", "Affordable to run, easy to debug at 3 a.m.", "“$ per 1K users, pages per week”", "neutral", "chart"],
    ];
    const cw = 332, ch = 150;
    q.forEach(([t, s, ex, tone, ic], i) => {
      const row = i < 4 ? 0 : 1, col = row === 0 ? i : i - 4;
      const x = 48 + col * (cw + 25) + (row === 1 ? (cw + 25) / 2 : 0);
      const y = 166 + row * (ch + 24);
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="16" fill="#fff" stroke="${br}" stroke-width="1.5" filter="url(#sh)"/>`, "back");
      d.raw(`<rect x="${x + 18}" y="${y + 18}" width="40" height="40" rx="10" fill="${bg}"/>`, "back");
      d.raw(iconG(ic, x + 26, y + 26, 24, a));
      d.text(x + 72, y + 44, t, { size: 17, weight: 700, color: T.ink });
      d.text(x + 20, y + 84, s, { size: 13.5, color: T.body, maxW: cw - 40 });
      d.text(x + 20, y + 132, ex, { size: 13, weight: 600, color: a, maxW: cw - 40 });
    });
    d.note({ x: 48, y: 520, w: 1404, title: "The classic tensions", icon: "split", tone: "warn", bullets: false, lines: ["Consistency ↔ Latency (wait for replicas, or answer fast?)   ·   Availability ↔ Consistency (during a network split)   ·   Cost ↔ everything (each nine and each region costs money)"] });
    return d;
  },

  "request-lifecycle": () => {
    const d = new Diagram({
      w: 1500, h: 830,
      eyebrow: "What happens when you press Enter",
      title: "The life of one web request",
      subtitle: "Opening **shop.example.com** touches 7+ systems in under a second. Each hop is a place to add speed — or failure.",
      takeaway: "Know this path by heart and you can place every building block on the board in the right order.",
    });
    sequence(d, {
      x: 48, y: 166, w: 1404, rowH: 46, actorW: 172,
      actors: [
        { kind: "browser", title: "Browser" },
        { kind: "dns", title: "DNS resolver" },
        { kind: "cdn", title: "CDN edge" },
        { kind: "lb", title: "Load balancer" },
        { kind: "service", title: "App server" },
        { kind: "cache", title: "Cache" },
        { kind: "db", title: "Database" },
      ],
      messages: [
        { from: 0, to: 1, label: "IP for shop.example.com?", step: 1 },
        { from: 1, to: 0, label: "203.0.113.10 (cached 5 min)", dashed: true },
        { from: 0, to: 2, label: "GET logo.png, app.js", step: 2 },
        { from: 2, to: 0, label: "served from a nearby city", dashed: true },
        { from: 0, to: 3, label: "HTTPS GET /api/products", step: 3 },
        { from: 3, to: 4, label: "forward to healthy server", step: 4 },
        { from: 4, to: 5, label: "GET products:home", step: 5 },
        { from: 5, to: 4, label: "miss", dashed: true, tone: "bad" },
        { from: 4, to: 6, label: "SELECT … LIMIT 20", step: 6 },
        { from: 6, to: 4, label: "rows in 4 ms", dashed: true },
        { from: 4, to: 5, label: "SET products:home (TTL 60 s)", step: 7 },
        { from: 4, to: 0, label: "200 OK · JSON", dashed: true, step: 8, tone: "good" },
      ],
    });
    return d;
  },

  "learning-path": () => {
    const d = new Diagram({
      w: 1500, h: 560,
      eyebrow: "Your roadmap",
      title: "From zero to architect with this guide",
      subtitle: "Read the chapters in order the first time — each one builds the vocabulary the next one uses.",
      takeaway: "Understand → apply to a real design → practise under a timer. Repeat until the framework is automatic.",
    });
    const ch = [
      ["00", "Start here", "Mindset, qualities, numbers", "neutral"],
      ["01", "Networking", "IP, DNS, TCP, TLS, real-time", "edge"],
      ["02", "Traffic & edge", "LB, gateway, rate limits, cache, CDN", "edge"],
      ["03", "Data", "SQL/NoSQL, sharding, replication, CAP", "data"],
      ["04", "Async & coordination", "Queues, delivery, locks, Bloom", "queue"],
      ["05", "Reliability & ops", "Breakers, SLOs, DR, observability", "good"],
      ["06", "Architecture & security", "APIs, services, events, auth", "compute"],
      ["07", "Interview playbook", "Framework, estimation, whiteboard", "warn"],
      ["08", "Case studies", "25 real designs, end to end", "search"],
      ["09", "Practice", "Drills, prompts, plans, rubric", "bad"],
    ];
    const cw = 256, chh = 118, gap = 26;
    ch.forEach(([n, t, s, tone], i) => {
      const row = Math.floor(i / 5), col = row === 0 ? i : 9 - i;
      const x = 48 + col * (cw + gap), y = 166 + row * (chh + 56);
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${x}" y="${y}" width="${cw}" height="${chh}" rx="16" fill="#fff" stroke="${br}" stroke-width="1.5" filter="url(#sh)"/>`, "back");
      d.raw(`<rect x="${x + 12}" y="${y + 20}" width="4" height="${chh - 40}" rx="2" fill="${a}"/>`, "back");
      d.text(x + 26, y + 34, "CHAPTER " + n, { size: 11.5, weight: 700, color: a });
      d.text(x + 26, y + 62, t, { size: 17, weight: 700, color: T.ink });
      d.text(x + 26, y + 90, s, { size: 13, color: T.muted, maxW: cw - 44 });
      if (row === 0 && col < 4) d.edge([x + cw + 3, y + chh / 2], [x + cw + gap - 3, y + chh / 2], { route: "straight", hot: true });
      if (row === 1 && col > 0) d.edge([x - 3, y + chh / 2], [x - gap + 3, y + chh / 2], { route: "straight", hot: true });
    });
    const xr = 48 + 4 * (cw + gap) + cw;
    d.edge([xr + 3, 166 + chh / 2], [xr + 3, 166 + chh + 56 + chh / 2], { via: [[xr + 24, 166 + chh / 2], [xr + 24, 166 + chh + 56 + chh / 2]], hot: true });
    return d;
  },
};
