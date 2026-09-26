import { Diagram, table, icon, TONES, T } from "../engine.mjs";

export default {
  "interview-timeline": () => {
    const d = new Diagram({
      w: 1500, h: 560,
      eyebrow: "Interview · the framework",
      title: "How to spend 45 minutes",
      subtitle: "A repeatable 7-step framework. The interviewer scores **how you think** at every step, not the final diagram.",
      takeaway: "Clarify before you draw, put numbers on the board, walk the write path and the read path, then go deep and break things.",
    });
    const steps = [
      ["1", "Clarify", "5 min", "Features, users, scale, NFRs, out of scope", "info", 5],
      ["2", "Estimate", "3 min", "QPS, storage, bandwidth → so what?", "cache", 3],
      ["3", "API", "4 min", "3–6 endpoints with inputs/outputs", "edge", 4],
      ["4", "Data model", "5 min", "Entities, keys, indexes, store choice", "data", 5],
      ["5", "High-level design", "10 min", "Boxes + arrows; write path, read path", "compute", 10],
      ["6", "Deep dive", "12 min", "1–2 hardest parts, options, trade-offs", "search", 12],
      ["7", "Wrap up", "6 min", "Failures, scaling, monitoring, summary", "good", 6],
    ];
    const total = 45, x0 = 48, W = 1404;
    let x = x0;
    steps.forEach(([n, t, m, s, tone, mins]) => {
      const w = (mins / total) * W - 6;
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${x}" y="176" width="${w}" height="64" rx="12" fill="${a}"/>`, "mid");
      d.text(x + 14, 205, n + "  " + (w > 150 ? t : ""), { size: 15, weight: 800, color: "#fff" });
      d.text(x + 14, 226, m, { size: 12.5, weight: 600, color: "rgba(255,255,255,.85)" });
      x += w + 6;
    });
    d.text(48, 270, "0 min", { size: 12, color: T.muted });
    d.text(1452, 270, "45 min", { size: 12, color: T.muted, anchor: "end" });
    const cw = 190;
    steps.forEach(([n, t, m, s, tone], i) => {
      const cx = 48 + i * (cw + 12.3);
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${cx}" y="300" width="${cw}" height="210" rx="16" fill="#fff" stroke="${br}" stroke-width="1.5" filter="url(#sh)"/>`, "back");
      d.stepCircle(cx + 32, 336, n, tone, 16);
      d.text(cx + 20, 384, t, { size: 16, weight: 700, color: T.ink, maxW: cw - 36 });
      d.text(cx + 20, 410, m, { size: 12.5, weight: 700, color: a });
      d.text(cx + 20, 444, s, { size: 13.5, color: T.body, maxW: cw - 36, lh: 1.5 });
    });
    return d;
  },

  "whiteboard-layout": () => {
    const d = new Diagram({
      w: 1500, h: 760,
      eyebrow: "Interview · whiteboard",
      title: "A board layout that looks senior",
      subtitle: "Fixed zones keep you organized and show the interviewer you have a method. **Requirements stay visible** the whole time.",
      takeaway: "Top: what and how much. Middle: the design, left to right. Bottom: deep-dive notes and trade-offs. Never erase the requirements.",
    });
    const zone = (x, y, w, h, title, tone, lines) => {
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${bg}" stroke="${br}" stroke-width="1.5" stroke-dasharray="7 5"/>`, "back");
      d.text(x + 18, y + 28, title.toUpperCase(), { size: 12, weight: 800, color: a });
      lines.forEach((l, i) => d.text(x + 18, y + 56 + i * 22, l, { size: 13, color: T.body, mono: true }));
    };
    d.raw(`<rect x="40" y="160" width="1420" height="560" rx="18" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>`, "back");
    zone(60, 180, 440, 170, "① Requirements", "info", ["F: create link, redirect", "NFR: p99 < 50 ms, 99.9%", "Out: analytics warehouse", "Assume: 100M new/month"]);
    zone(520, 180, 440, 170, "② Estimates", "cache", ["writes ~40/s  reads ~4K/s", "storage ~6 TB / 5 yrs", "cache ~20% hot → ~50 GB", "→ 1 primary + cache"]);
    zone(980, 180, 460, 170, "③ API + data model", "edge", ["POST /v1/links → {code}", "GET /{code} → 302", "links(code PK, url,", "      user_id, created_at)"]);
    zone(60, 370, 1380, 200, "④ High-level design  (left → right)", "compute", []);
    const n = [["user", "Client"], ["lb", "LB"], ["service", "API ×N"], ["cache", "Redis"], ["db", "Postgres"], ["queue", "Queue → workers"]];
    n.forEach(([k, t], i) => d.node({ id: "w" + i, x: 90 + i * 222, y: 430, w: 190, h: 56, kind: k, title: t }));
    [0, 1, 2, 3].forEach((i) => d.edge("w" + i, "w" + (i + 1), { sides: "rl" }));
    d.edge("w2", "w5", { sides: "bb", via: [[629, 530], [1197, 530]], dashed: true, label: "clicks async", at: [900, 530] });
    zone(60, 590, 680, 116, "⑤ Deep dive", "search", ["code generation: base62(random 64-bit)", "hot link: local cache + single-flight"]);
    zone(760, 590, 680, 116, "⑥ Trade-offs & failures", "bad", ["302 vs 301: analytics vs caching", "Redis down → read DB, shed load"]);
    return d;
  },

  "estimation-flow": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Interview · capacity estimation",
      title: "Back-of-envelope estimation in four moves",
      subtitle: "Example: **a photo-sharing app with 10M daily active users.** Round aggressively — the goal is the order of magnitude and its consequence.",
      takeaway: "Every number must end in a decision: “~6K reads/s → we need a cache”, “~2 PB → object storage + CDN, not the DB”.",
    });
    const cards = [
      ["1", "Traffic", "info", ["10M DAU × 50 views = 5×10⁸/day", "÷ 10⁵ s ≈ 5,000 reads/s", "peak ×3 ≈ 15K reads/s", "uploads: 1M/day ≈ 12/s"], "Read-heavy (400:1) → cache + CDN"],
      ["2", "Storage", "data", ["1M photos/day × 2 MB = 2 TB/day", "× 365 × 5 yrs ≈ 3.6 PB", "+ thumbnails, ×3 replicas (managed)", "metadata: 1M × 1 KB = 1 GB/day"], "Blobs → object storage; metadata → SQL"],
      ["3", "Bandwidth", "edge", ["5K views/s × 200 KB (resized)", "≈ 1 GB/s egress", "≈ 8 Gbps average", "peak ≈ 25 Gbps"], "Must go through a CDN"],
      ["4", "Memory", "cache", ["hot 20% of daily metadata", "≈ 0.2 × 50 GB ≈ 10 GB", "fits in a small Redis cluster", "feed cache: 10M × 2 KB = 20 GB"], "Redis cluster, a few nodes"],
    ];
    const cw = 342;
    cards.forEach(([n, t, tone, lines, concl], i) => {
      const x = 40 + i * (cw + 17), y = 166;
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${x}" y="${y}" width="${cw}" height="430" rx="16" fill="#fff" stroke="${br}" stroke-width="1.5" filter="url(#sh)"/>`, "back");
      d.stepCircle(x + 34, y + 36, n, tone, 16);
      d.text(x + 62, y + 42, t, { size: 18, weight: 700, color: T.ink });
      lines.forEach((l, j) => d.text(x + 22, y + 96 + j * 36, l, { size: 13, mono: true, color: T.body }));
      d.raw(`<rect x="${x + 16}" y="${y + 300}" width="${cw - 32}" height="110" rx="12" fill="${bg}"/>`, "back");
      d.text(x + 32, y + 330, "SO WHAT?", { size: 11.5, weight: 800, color: a });
      d.text(x + 32, y + 358, concl, { size: 14.5, weight: 700, color: T.ink, maxW: cw - 64 });
    });
    d.text(40, 634, "Handy: 1 day ≈ 10⁵ s · 1M/day ≈ 12/s · 1 KB × 1M = 1 GB · 1 Gbps ≈ 125 MB/s · peak ≈ 2–5× average", { size: 14, weight: 600, color: T.muted });
    return d;
  },

  "tradeoffs": () => {
    const d = new Diagram({
      w: 1500, h: 860,
      eyebrow: "Interview · trade-offs",
      title: "The trade-off cheat sheet",
      subtitle: "There are no best choices, only choices that fit the requirements. Know **both sides** of each and when each wins.",
      takeaway: "Say it as: “Option A optimizes X at the cost of Y; given our requirement Z, I pick A — and I'd revisit if W changes.”",
    });
    table(d, {
      x: 40, y: 166, rowH: 50, headH: 44, size: 13.5,
      cols: [{ title: "Decision", w: 270 }, { title: "Option A — wins when…", w: 575 }, { title: "Option B — wins when…", w: 575 }],
      rows: [
        ["SQL vs NoSQL", "SQL: relationships, transactions, ad-hoc queries", "NoSQL: one access pattern at huge scale, flexible schema"],
        ["Sync vs async", "Sync: user needs the answer now; simple errors", "Async: side effects, spikes, slow or flaky dependencies"],
        ["Monolith vs services", "Monolith: small team, unclear domains, ACID needs", "Services: many teams, different scaling, fault isolation"],
        ["Strong vs eventual", "Strong: money, inventory, permissions", "Eventual: counters, feeds, recommendations"],
        ["Fan-out on write vs read", "Write: fast feed reads, normal users", "Read: celebrities, rarely-read feeds, cheap writes"],
        ["Cache-aside vs write-through", "Aside: simple, only caches what's read", "Through: read-right-after-write freshness"],
        ["Scale up vs out", "Up: simple, early DBs", "Out: stateless tiers, beyond one machine"],
        ["Push vs pull", "Push (WS/SSE): low latency, live apps", "Pull (poll): simple, rare updates"],
        ["Hash vs range sharding", "Hash: even load", "Range: range scans, time windows"],
        ["At-least vs at-most-once", "At-least: can't lose it (with idempotency)", "At-most: loss OK (metrics, pings)"],
        ["Active-passive vs active-active", "Passive: simpler, no write conflicts", "Active: lowest latency, near-zero RTO"],
        ["REST vs gRPC", "REST: public, cacheable, universal", "gRPC: internal, fast, streaming, typed"],
      ],
    });
    return d;
  },

  "levels": () => {
    const d = new Diagram({
      w: 1500, h: 620,
      eyebrow: "Interview · expectations",
      title: "What each level is expected to show",
      subtitle: "Same prompt — **“Design a news feed”** — very different bars. Calibrate your depth to the level you're targeting.",
      takeaway: "Don't claim a level — demonstrate it. A clean, well-defended mid-level design beats a shaky staff-level one.",
    });
    table(d, {
      x: 40, y: 166, rowH: 90, headH: 46, size: 13.5,
      cols: [{ title: "Level", w: 220 }, { title: "Expected to drive", w: 440 }, { title: "Feed example", w: 420 }, { title: "Interviewer help", w: 340 }],
      rows: [
        [{ t: "Junior (L3–L4)", tone: "info" }, "Core building blocks, a clear simple HLD, basic trade-offs, rough estimates", "Posts table, timeline API, cache recent feeds", "Heavy scaffolding and hints are normal"],
        [{ t: "Mid (L4–L5)", tone: "good" }, "Full loop unaided; data model and partition key; idempotency; SPOFs", "Fan-out on write vs read, the celebrity problem, ranking basics", "Some nudges on depth"],
        [{ t: "Senior (L5–L6)", tone: "warn" }, "SLOs, failure modes first, multi-region, cost, operability, clear decision criteria", "Degradation modes, privacy, multi-region, ads injection", "Mostly a peer discussion"],
        [{ t: "Staff+ (L6+)", tone: "edge" }, "Systems of systems, evolution from MVP to global, org and cost trade-offs", "A feed platform for many products, experimentation, fan-out fleet cost", "Interviewer follows your lead"],
      ],
    });
    return d;
  },

  "pitfalls": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Interview · pitfalls",
      title: "Twelve ways candidates lose the room",
      subtitle: "Avoiding these raises your score as much as learning new technology.",
      takeaway: "Clarify first, keep numbers visible, name every SPOF, say what's stale and for how long, and check in every few minutes.",
    });
    const p = [
      ["Drawing before clarifying", "Ask 5 minutes of questions first"],
      ["Boiling the ocean", "Match the stated scale; show the evolution"],
      ["Buzzword bingo", "Every box must solve a named problem"],
      ["No data model", "Show entities, keys and top queries"],
      ["Hidden SPOFs", "Circle them and give mitigations"],
      ["“Eventually consistent” hand-wave", "Say what is stale, for how long, who notices"],
      ["Only the read path", "Walk writes and reads separately"],
      ["No backpressure story", "Queues, rate limits, load shedding"],
      ["Over-precise math", "Round hard; state the implication"],
      ["Monologue", "Check in every 5–7 minutes"],
      ["Security as afterthought", "AuthN/Z, PII, abuse in the NFRs"],
      ["“Exactly-once” myths", "At-least-once + idempotency"],
    ];
    p.forEach(([bad, fix], i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 40 + col * 358, y = 166 + row * 158, w = 342;
      d.raw(`<rect x="${x}" y="${y}" width="${w}" height="142" rx="16" fill="#fff" stroke="#E2E8F0" stroke-width="1.5" filter="url(#sh)"/>`, "back");
      d.raw(icon("x", x + 18, y + 18, 22, TONES.bad[0], 2));
      d.text(x + 50, y + 35, bad, { size: 14.5, weight: 700, color: T.ink, maxW: w - 70 });
      d.raw(`<line x1="${x + 18}" y1="${y + 80}" x2="${x + w - 18}" y2="${y + 80}" stroke="#F1F5F9" stroke-width="2"/>`, "back");
      d.raw(icon("check", x + 18, y + 94, 22, TONES.good[0], 2));
      d.text(x + 50, y + 111, fix, { size: 13.5, color: TONES.good[0], weight: 600, maxW: w - 70 });
    });
    return d;
  },
};
