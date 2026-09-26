import { Diagram, table, sequence, icon, TONES, T } from "../engine.mjs";

export default {
  "load-balancing": () => {
    const d = new Diagram({
      w: 1500, h: 680,
      eyebrow: "Traffic · load balancing",
      title: "A load balancer spreads traffic and hides failures",
      subtitle: "Clients see **one address**. Behind it, many identical servers share the work — and a sick one is quietly removed.",
      takeaway: "Put an L7 load balancer in front of a stateless app tier. Health checks turn a dead server into a non-event.",
    });
    d.node({ id: "u1", x: 40, y: 220, w: 170, kind: "mobile", title: "Mobile" });
    d.node({ id: "u2", x: 40, y: 330, w: 170, kind: "browser", title: "Web" });
    d.node({ id: "u3", x: 40, y: 440, w: 170, kind: "external", title: "Partner API" });
    d.node({ id: "lb", x: 300, y: 300, w: 250, h: 110, kind: "lb", title: "L7 load balancer", sub: "TLS termination · routing · health checks", emphasis: true });
    ["u1", "u2", "u3"].forEach((u) => d.edge(u, "lb", { sides: "rl", mid: 255 }));
    d.group({ x: 640, y: 160, w: 390, h: 470, label: "Pool: /api/*", tone: "compute" });
    d.node({ id: "a1", x: 670, y: 210, w: 330, kind: "service", title: "API server 1", sub: "healthy · 38 active conns" });
    d.node({ id: "a2", x: 670, y: 310, w: 330, kind: "service", title: "API server 2", sub: "healthy · 41 active conns" });
    d.node({ id: "a3", x: 670, y: 410, w: 330, kind: "service", title: "API server 3", sub: "failed 3 health checks", tone: "bad", ghost: true });
    d.node({ id: "a4", x: 670, y: 510, w: 330, kind: "service", title: "API server 4", sub: "healthy · 36 active conns" });
    d.edge("lb", "a1", { sides: "rl", mid: 600, hot: true });
    d.edge("lb", "a2", { sides: "rl", mid: 600, hot: true });
    d.edge("lb", "a3", { sides: "rl", mid: 600, dashed: true, tone: "bad", label: "✗ removed", at: [620, 444], noArrow: true });
    d.edge("lb", "a4", { sides: "rl", mid: 600, hot: true });
    d.group({ x: 1090, y: 160, w: 370, h: 250, label: "Pool: /images/*", tone: "storage" });
    d.node({ id: "i1", x: 1120, y: 210, w: 310, kind: "storage", title: "Image server 1" });
    d.node({ id: "i2", x: 1120, y: 310, w: 310, kind: "storage", title: "Image server 2" });
    d.edge("lb", "i1", { sides: "tl", via: [[425, 148], [1060, 148], [1060, 244]], label: "path-based routing", at: [760, 148] });
    d.edge([1060, 244], "i2", { sides: "rl", via: [[1060, 344]] });
    d.note({ x: 1090, y: 440, w: 370, title: "Every few seconds", icon: "clock", tone: "info", lines: ["LB calls GET /health on each server.", "3 failures → out of the pool.", "2 successes → back in."] });
    return d;
  },

  "lb-algorithms": () => {
    const d = new Diagram({
      w: 1500, h: 570,
      eyebrow: "Traffic · load balancing",
      title: "Four ways to pick the next server",
      subtitle: "The algorithm decides **which** healthy server gets the next request.",
      takeaway: "Default to round robin or least-connections; use hashing only when a client must keep landing on the same server.",
    });
    const cards = [
      ["Round robin", "1 → A, 2 → B, 3 → C, 4 → A …", "Equal servers, short requests", "info"],
      ["Weighted", "Big server gets 3×, small gets 1×", "Mixed machine sizes, canary 5%", "edge"],
      ["Least connections", "Send to the least busy server", "Long or uneven requests (uploads, WS)", "good"],
      ["Hash (IP / user / key)", "Same key → same server", "Local caches, sticky sessions", "warn"],
    ];
    const cw = 336, x0 = 48, y = 166;
    cards.forEach(([t, how, fit, tone], i) => {
      const x = x0 + i * (cw + 20);
      d.panel({ x, y, w: cw, h: 350, title: t, tone });
      const [a, bg] = TONES[tone];
      const sx = x + 30, sy = y + 44;
      const servers = ["A", "B", "C"];
      servers.forEach((s, j) => {
        const bx = sx + j * 96;
        let h = 60, label = s;
        if (i === 1) h = [120, 50, 50][j];
        if (i === 2) h = [110, 40, 80][j];
        d.raw(`<rect x="${bx}" y="${sy + 140 - h}" width="80" height="${h}" rx="10" fill="${bg}" stroke="${a}" stroke-width="1.5"/>`, "mid");
        d.text(bx + 40, sy + 164, "Server " + s, { size: 12.5, weight: 700, color: T.ink, anchor: "middle" });
        if (i === 1) d.text(bx + 40, sy + 140 - h + 24, ["×3", "×1", "×1"][j], { size: 14, weight: 800, color: a, anchor: "middle" });
        if (i === 2) d.text(bx + 40, sy + 140 - h + 24, ["40", "12", "28"][j], { size: 14, weight: 800, color: a, anchor: "middle" });
        if (i === 0) d.text(bx + 40, sy + 116, ["1 · 4", "2 · 5", "3 · 6"][j], { size: 14, weight: 800, color: a, anchor: "middle" });
        if (i === 3) d.text(bx + 40, sy + 116, ["user 7", "user 3", "user 9"][j], { size: 12.5, weight: 700, color: a, anchor: "middle" });
      });
      if (i === 2) d.raw(`<path d="M${sx + 96 + 40} ${sy + 50}l0 30" stroke="${a}" stroke-width="2.5" marker-end="url(#a-good)"/>`), (d.used = d.used || new Set()).add(JSON.stringify(["a-good", TONES.good[0]]));
      d.text(x + 20, y + 250, how, { size: 13.5, weight: 600, color: T.ink, maxW: cw - 40 });
      d.text(x + 20, y + 292, "Best for", { size: 11.5, weight: 700, color: a });
      d.text(x + 20, y + 314, fit, { size: 13.5, color: T.body, maxW: cw - 40 });
    });
    return d;
  },

  "clustering": () => {
    const d = new Diagram({
      w: 1500, h: 620,
      eyebrow: "Traffic · redundancy",
      title: "Active-active vs active-passive",
      subtitle: "Two ways to keep a service alive when a node dies. Load balancers themselves are paired the same way.",
      takeaway: "Stateless tiers run active-active. Stateful primaries (databases, leaders) usually run active-passive with fencing.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 410, title: "Active-active", tone: "good", tag: "All nodes serve" });
    d.node({ id: "c1", x: 80, y: 280, w: 160, kind: "users", title: "Traffic" });
    d.node({ id: "n1", x: 380, y: 220, w: 300, kind: "service", title: "Node A", sub: "serving 50%" });
    d.node({ id: "n2", x: 380, y: 340, w: 300, kind: "service", title: "Node B", sub: "serving 50%" });
    d.edge("c1", "n1", { sides: "rl", hot: true, mid: 310 });
    d.edge("c1", "n2", { sides: "rl", hot: true, mid: 310 });
    d.text(80, 470, "✓  Full capacity used, instant survival of one node", { size: 13.5, color: T.body });
    d.text(80, 498, "✗  Shared state must live elsewhere; conflicts if both write", { size: 13.5, color: "#B91C1C" });
    d.text(80, 534, "Use for: app servers, gateways, caches, LB pairs", { size: 13.5, weight: 600, color: TONES.good[0] });

    d.panel({ x: 760, y: 158, w: 700, h: 410, title: "Active-passive", tone: "warn", tag: "Standby waits" });
    d.node({ id: "c2", x: 800, y: 280, w: 160, kind: "users", title: "Traffic" });
    d.node({ id: "vip", x: 1010, y: 280, w: 140, kind: "lb", title: "Virtual IP" });
    d.node({ id: "p", x: 1210, y: 220, w: 220, kind: "db", title: "Primary", sub: "active", emphasis: true });
    d.node({ id: "s", x: 1210, y: 360, w: 220, kind: "db", title: "Standby", sub: "passive · in sync", ghost: true });
    d.edge("c2", "vip", { sides: "rl", hot: true });
    d.edge("vip", "p", { sides: "rl", hot: true, mid: 1180 });
    d.edge("vip", "s", { sides: "rl", dashed: true, mid: 1180, label: "on failover", at: [1180, 380] });
    d.edge("p", "s", { sides: "bt", dashed: true, label: "heartbeat + replication", both: true });
    d.text(800, 470, "✓  Simple; no write conflicts", { size: 13.5, color: T.body });
    d.text(800, 498, "✗  Idle capacity; failover takes seconds; beware split brain", { size: 13.5, color: "#B91C1C" });
    d.text(800, 534, "Use for: primary databases, schedulers, singleton jobs", { size: 13.5, weight: 600, color: TONES.warn[0] });
    return d;
  },



  "token-bucket": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Traffic · rate limiting",
      title: "Token bucket: the default rate-limiting algorithm",
      subtitle: "Each user has a bucket. Tokens drip in at a steady rate; **every request spends one**. Empty bucket → HTTP 429.",
      takeaway: "Bucket size = allowed burst. Refill rate = sustained limit. Two numbers, easy to explain, cheap to run in Redis.",
    });
    // tap
    const bx = 520, by = 250, bw = 260, bh = 280;
    d.raw(`<rect x="${bx + 90}" y="${by - 80}" width="80" height="26" rx="6" fill="#E2E8F0"/><rect x="${bx + 120}" y="${by - 56}" width="20" height="30" fill="#E2E8F0"/>`, "back");
    d.text(bx + 190, by - 60, "refill: 10 tokens / second", { size: 14, weight: 700, color: TONES.good[0] });
    [0, 1, 2].forEach((k) => d.raw(`<circle cx="${bx + 130}" cy="${by - 10 + k * 22}" r="7" fill="${TONES.cache[0]}" opacity="${1 - k * 0.25}"/>`, "front"));
    d.raw(`<path d="M${bx} ${by}v${bh - 20}a20 20 0 0 0 20 20h${bw - 40}a20 20 0 0 0 20-20v-${bh - 20}" fill="${TONES.cache[1]}" stroke="${TONES.cache[0]}" stroke-width="2.5"/>`, "back");
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      if (r === 0 && c > 1) continue;
      d.raw(`<circle cx="${bx + 50 + c * 40}" cy="${by + bh - 40 - r * 40}" r="15" fill="${TONES.cache[0]}"/><circle cx="${bx + 50 + c * 40}" cy="${by + bh - 40 - r * 40}" r="8" fill="none" stroke="#FEF3C7" stroke-width="2"/>`, "mid");
    }
    d.text(bx + bw / 2, by + bh + 36, "capacity: 20 tokens = max burst", { size: 14, weight: 700, color: TONES.cache[0], anchor: "middle" });
    d.node({ id: "req", x: 60, y: 330, w: 240, h: 76, kind: "user", title: "Incoming request", sub: "user_id = 42" });
    d.edge("req", [bx - 4, 368], { sides: "rl", hot: true, label: "take 1 token", route: "straight" });
    d.node({ id: "ok", x: 960, y: 250, w: 280, h: 76, kind: "check", title: "Token available", sub: "forward → 200 OK" });
    d.node({ id: "no", x: 960, y: 430, w: 280, h: 76, kind: "x", title: "Bucket empty", sub: "429 Too Many Requests" });
    d.edge([bx + bw + 4, 330], "ok", { sides: "rl", tone: "good", mid: 880 });
    d.edge([bx + bw + 4, 430], "no", { sides: "rl", tone: "bad", mid: 880 });
    d.note({ x: 1270, y: 250, w: 190, tone: "good", lines: ["Continue to the service"], bullets: false });
    d.note({ x: 1270, y: 430, w: 190, tone: "bad", lines: ["Retry-After: 2"], bullets: false });
    d.raw(`<rect x="60" y="590" width="1400" height="54" rx="12" fill="#0F172A" fill-opacity="0.04" stroke="#E2E8F0"/>`, "back");
    d.text(80, 623, "Redis:  key rl:42  →  { tokens, last_refill }   ·   one atomic Lua script per request   ·   ~0.3 ms", { size: 14, weight: 500, color: T.body, mono: true });
    return d;
  },

  "rate-limit-windows": () => {
    const d = new Diagram({
      w: 1500, h: 560,
      eyebrow: "Traffic · rate limiting",
      title: "Fixed window vs sliding window",
      subtitle: "Limit: **5 requests per minute**. A fixed window can be tricked at its edges; a sliding window cannot.",
      takeaway: "Fixed windows are the cheapest counter; sliding windows (or token bucket) are fairer. Say which one and why.",
    });
    const x0 = 120, x1 = 1400, y1 = 250, y2 = 470;
    const X = (s) => x0 + (s / 120) * (x1 - x0);
    [[y1, "Fixed window", "bad"], [y2, "Sliding window", "good"]].forEach(([y, t, tone]) => {
      d.text(48, y - 70, t, { size: 18, weight: 700, color: T.ink });
      d.raw(`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#94A3B8" stroke-width="2"/>`, "back");
      [0, 30, 60, 90, 120].forEach((s) => {
        d.raw(`<line x1="${X(s)}" y1="${y - 6}" x2="${X(s)}" y2="${y + 6}" stroke="#94A3B8" stroke-width="2"/>`, "back");
        d.text(X(s), y + 28, `${String(Math.floor(s / 60))}:${String(s % 60).padStart(2, "0")}`, { size: 12.5, color: T.muted, anchor: "middle" });
      });
    });
    // fixed windows
    d.raw(`<rect x="${X(0)}" y="${y1 - 50}" width="${X(60) - X(0)}" height="44" rx="8" fill="${TONES.info[1]}" stroke="${TONES.info[2]}"/><rect x="${X(60)}" y="${y1 - 50}" width="${X(120) - X(60)}" height="44" rx="8" fill="${TONES.edge[1]}" stroke="${TONES.edge[2]}"/>`, "back");
    d.text(X(4), y1 - 22, "window 1: count 5 ✓", { size: 13, weight: 600, color: TONES.info[0] });
    d.text(X(64), y1 - 22, "window 2: count 5 ✓", { size: 13, weight: 600, color: TONES.edge[0] });
    const burst = [52, 54, 55, 57, 59, 61, 62, 63, 65, 66];
    burst.forEach((s) => d.raw(`<circle cx="${X(s)}" cy="${y1}" r="7" fill="${TONES.bad[0]}"/>`, "front"));
    d.raw(`<rect x="${X(51)}" y="${y1 + 40}" width="${X(67) - X(51)}" height="30" rx="8" fill="${TONES.bad[1]}" stroke="${TONES.bad[2]}"/>`, "back");
    d.text((X(51) + X(67)) / 2, y1 + 60, "10 requests in 15 s — 2× the limit!", { size: 12.5, weight: 700, color: TONES.bad[0], anchor: "middle" });
    // sliding
    const ok = [52, 54, 55, 57, 59], rej = [61, 62, 63, 65, 66];
    ok.forEach((s) => d.raw(`<circle cx="${X(s)}" cy="${y2}" r="7" fill="${TONES.good[0]}"/>`, "front"));
    rej.forEach((s) => d.raw(`<circle cx="${X(s)}" cy="${y2}" r="7" fill="#fff" stroke="${TONES.bad[0]}" stroke-width="2.5"/>`, "front"));
    d.raw(`<rect x="${X(6)}" y="${y2 - 50}" width="${X(66) - X(6)}" height="44" rx="8" fill="${TONES.good[1]}" stroke="${TONES.good[2]}"/>`, "back");
    d.text(X(10), y2 - 22, "any 60-second span looking back from “now” holds at most 5", { size: 13, weight: 600, color: TONES.good[0] });
    d.text(X(68), y2 + 36, "hollow = rejected (429)", { size: 13, weight: 700, color: TONES.bad[0] });
    return d;
  },

  "cache-aside": () => {
    const d = new Diagram({
      w: 1500, h: 810,
      eyebrow: "Traffic · caching",
      title: "Cache-aside: the pattern behind most caches",
      subtitle: "The app checks the cache first. On a **miss** it reads the database and saves the answer for next time.",
      takeaway: "Always say three things about a cache: the key, the TTL, and how it is invalidated when data changes.",
    });
    sequence(d, {
      x: 48, y: 166, w: 900, actorW: 190, rowH: 44,
      actors: [{ kind: "service", title: "App server" }, { kind: "cache", title: "Redis cache" }, { kind: "db", title: "Database" }],
      messages: [
        { note: "first request — cache is cold", from: 0, to: 2, tone: "warn" },
        { from: 0, to: 1, label: "GET user:42", step: 1 },
        { from: 1, to: 0, label: "(nil) — miss", dashed: true, tone: "bad" },
        { from: 0, to: 2, label: "SELECT * FROM users WHERE id=42", step: 2 },
        { from: 2, to: 0, label: "row · 8 ms", dashed: true },
        { from: 0, to: 1, label: "SET user:42  TTL 10 min", step: 3 },
        { note: "next 10,000 requests", from: 0, to: 2, tone: "good" },
        { from: 0, to: 1, label: "GET user:42", step: 4 },
        { from: 1, to: 0, label: "hit · 0.3 ms", dashed: true, tone: "good" },
        { note: "user edits profile", from: 0, to: 2, tone: "info" },
        { from: 0, to: 2, label: "UPDATE users …", step: 5 },
        { from: 0, to: 1, label: "DEL user:42  (invalidate)", step: 6 },
      ],
    });
    d.note({ x: 990, y: 166, w: 462, title: "Why it wins", icon: "check", tone: "good", lines: ["Only data that is actually read gets cached.", "Cache down? App falls back to the DB (slower, still correct).", "Simple to add to an existing app."] });
    d.note({ x: 990, y: 360, w: 462, title: "Watch out", icon: "alert", tone: "warn", lines: ["First read after expiry is slow (cold miss).", "Delete-then-read races can briefly serve stale data — keep TTLs as a safety net.", "A hot key expiring can stampede the DB."] });
    d.note({ x: 990, y: 574, w: 462, title: "Hit ratio is the KPI", icon: "chart", tone: "info", lines: ["95% hit ratio = 20× fewer DB reads."] });
    return d;
  },

  "cache-write-policies": () => {
    const d = new Diagram({
      w: 1500, h: 620,
      eyebrow: "Traffic · caching",
      title: "Write-through, write-around, write-back",
      subtitle: "What happens to the cache when data is **written**? Three answers, three trade-offs.",
      takeaway: "Write-around is the safe default; write-through for read-right-after-write data; write-back only when losing a few writes is OK.",
    });
    const cols = [
      ["Write-through", "good", "Cache and DB are updated together.", ["Cache always warm and fresh", "Slower writes (two writes)"], [["1", "app→cache"], ["2", "cache→db"]]],
      ["Write-around", "info", "Write to DB only; cache fills on the next read.", ["Cache not flooded by one-off writes", "First read after a write misses"], [["1", "app→db"]]],
      ["Write-back", "warn", "Write to cache; flush to DB later in batches.", ["Fastest writes, absorbs spikes", "Cache crash = lost writes"], [["1", "app→cache"], ["2", "cache→db (async)"]]],
    ];
    const cw = 452;
    cols.forEach(([t, tone, s, pc, flow], i) => {
      const x = 40 + i * (cw + 22), y = 158;
      d.panel({ x, y, w: cw, h: 420, title: t, tone });
      const A = d.node({ id: `a${i}`, x: x + 30, y: y + 90, w: 160, h: 56, kind: "service", title: "App" });
      const C = d.node({ id: `c${i}`, x: x + cw - 190, y: y + 90, w: 160, h: 56, kind: "cache", title: "Cache" });
      const B = d.node({ id: `d${i}`, x: x + cw - 190, y: y + 210, w: 160, h: 56, kind: "db", title: "Database" });
      if (i === 0) { d.edge(`a${i}`, `c${i}`, { step: 1, hot: true }); d.edge(`c${i}`, `d${i}`, { step: 2, hot: true, label: "sync" }); }
      if (i === 1) { d.edge(`a${i}`, `d${i}`, { sides: "bl", step: 1, hot: true, via: [[x + 110, y + 238]] }); d.text(x + cw - 110, y + 170, "cache untouched", { size: 12.5, color: T.muted, anchor: "middle" }); }
      if (i === 2) { d.edge(`a${i}`, `c${i}`, { step: 1, hot: true }); d.edge(`c${i}`, `d${i}`, { step: 2, dashed: true, tone: "warn", label: "later, batched" }); }
      d.text(x + 24, y + 320, s, { size: 13.5, weight: 600, color: T.ink, maxW: cw - 48 });
      d.text(x + 24, y + 366, "✓  " + pc[0], { size: 13.5, color: T.body });
      d.text(x + 24, y + 392, "✗  " + pc[1], { size: 13.5, color: "#B91C1C" });
    });
    return d;
  },

  "cache-layers": () => {
    const d = new Diagram({
      w: 1500, h: 600,
      eyebrow: "Traffic · caching",
      title: "Caches live at every layer",
      subtitle: "The closer to the user a request is answered, the faster and cheaper it is. Each layer catches what the previous one missed.",
      takeaway: "Cache as close to the user as correctness allows: static files at the CDN, shared hot data in Redis, per-user data carefully.",
    });
    const layers = [
      ["browser", "Browser cache", "Cache-Control headers", "0 ms", "client"],
      ["cdn", "CDN edge", "images · JS · public GETs", "~10–30 ms", "edge"],
      ["gateway", "Gateway / LB cache", "idempotent API responses", "~1 ms", "edge"],
      ["service", "In-process memory", "config, tiny hot sets", "~0.001 ms", "compute"],
      ["cache", "Distributed cache", "Redis / Memcached, shared", "~0.3 ms", "cache"],
      ["db", "Database buffer pool", "hot pages in DB RAM", "~1 ms", "data"],
    ];
    const cw = 222, x0 = 40, y = 190;
    layers.forEach(([k, t, s, lat, tone], i) => {
      const x = x0 + i * (cw + 18);
      d.node({ id: "l" + i, x, y, w: cw, h: 100, kind: k, title: t, sub: s });
      d.text(x + cw / 2, y + 140, lat, { size: 20, weight: 800, color: TONES[tone][0], anchor: "middle" });
      d.text(x + cw / 2, y + 164, "typical hit latency", { size: 12, color: T.muted, anchor: "middle" });
    });
    for (let i = 0; i < layers.length - 1; i++) d.edge("l" + i, "l" + (i + 1), { sides: "rl" });
    d.raw(`<defs><linearGradient id="gr" x1="0" x2="1"><stop offset="0" stop-color="#16A34A"/><stop offset="1" stop-color="#DC2626"/></linearGradient></defs><rect x="40" y="420" width="1420" height="10" rx="5" fill="url(#gr)"/>`, "back");
    d.text(40, 462, "closest to the user · cheapest per request", { size: 13.5, weight: 600, color: TONES.good[0] });
    d.text(1460, 462, "closest to the data · most expensive to scale", { size: 13.5, weight: 600, color: TONES.bad[0], anchor: "end" });
    d.text(40, 520, "Rule of thumb: every layer you skip saves money only if its hit ratio is high. Measure hit ratio per layer.", { size: 14, color: T.body });
    return d;
  },

  "cdn": () => {
    const d = new Diagram({
      w: 1500, h: 680,
      eyebrow: "Traffic · CDN",
      title: "A CDN brings your files close to every user",
      subtitle: "Copies of images, video and JS live in **edge locations (PoPs)** around the world. Users download from the nearest one.",
      takeaway: "Origin serves each file once per edge; the CDN serves it millions of times. Protect the origin with an origin shield.",
    });
    const pops = [
      ["Seattle", 160, 230], ["New York", 430, 220], ["London", 760, 200], ["Frankfurt", 1010, 230], ["Tokyo", 1340, 230], ["Mumbai", 1110, 400], ["Singapore", 1320, 480], ["São Paulo", 430, 480],
    ];
    d.raw(`<rect x="40" y="160" width="1420" height="480" rx="20" fill="#EFF6FF" fill-opacity="0.5" stroke="#DBEAFE"/>`, "back");
    d.node({ id: "origin", x: 635, y: 320, w: 250, h: 80, kind: "service", title: "Origin", sub: "your servers + S3 (us-east)", emphasis: true });
    d.node({ id: "shield", x: 660, y: 470, w: 200, h: 56, kind: "shield", tone: "edge", title: "Origin shield" });
    pops.forEach(([n, x, y], i) => d.node({ id: "p" + i, x: x - 80, y: y - 26, w: 160, h: 52, kind: "cdn", title: n }));
    d.edge("p2", "origin", { sides: "bt", dashed: true, label: "miss → fetch once" });
    d.edge("origin", "shield", { sides: "bt", dashed: true, both: true });
    d.node({ id: "bob", x: 90, y: 360, w: 140, h: 44, kind: "user", title: "Bob" });
    d.node({ id: "alice", x: 1250, y: 580, w: 140, h: 44, kind: "user", title: "Alice" });
    d.edge("bob", "p0", { sides: "tb", tone: "good", label: "~20 ms" });
    d.edge("alice", "p6", { sides: "tb", tone: "good", label: "~20 ms" });
    d.note({ x: 60, y: 540, w: 520, title: "Pull CDN (most common)", icon: "cdn", tone: "edge", lines: ["Edge fetches from origin on the first miss, then caches.", "Push CDN: you upload files ahead of time (big launches)."] });
    return d;
  },


};
