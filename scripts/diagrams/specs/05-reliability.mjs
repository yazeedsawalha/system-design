import { Diagram, table, sequence, bars, icon, TONES, T } from "../engine.mjs";

export default {
  "retries-backoff": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Reliability · retries",
      title: "Timeouts, retries, exponential backoff and jitter",
      subtitle: "Retrying instantly turns a small hiccup into a **retry storm**. Wait longer each time — and add randomness.",
      takeaway: "Always: a timeout on every call, a small retry budget, exponential backoff with jitter, and retries only for idempotent operations.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 430, title: "Naive retries → synchronized storm", tone: "bad" });
    d.panel({ x: 760, y: 158, w: 700, h: 430, title: "Backoff + jitter → spread-out recovery", tone: "good" });
    const chart = (x0, y0, w, h, series, tone) => {
      d.raw(`<line x1="${x0}" y1="${y0 + h}" x2="${x0 + w}" y2="${y0 + h}" stroke="#CBD5E1" stroke-width="2"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + h}" stroke="#CBD5E1" stroke-width="2"/>`, "back");
      series.forEach((v, i) => {
        const bw = w / series.length - 4;
        const bh = v * h;
        d.raw(`<rect x="${x0 + 2 + i * (w / series.length)}" y="${y0 + h - bh}" width="${bw}" height="${bh}" rx="3" fill="${TONES[tone][0]}" opacity="0.85"/>`, "mid");
      });
      d.text(x0, y0 + h + 22, "time →", { size: 12, color: T.muted });
      d.text(x0 - 8, y0 + 10, "load", { size: 12, color: T.muted, anchor: "end" });
    };
    const storm = Array.from({ length: 30 }, (_, i) => (i % 5 === 0 ? 1 : 0.08));
    chart(110, 250, 600, 180, storm, "bad");
    d.raw(`<line x1="110" y1="${250 + 180 - 0.55 * 180}" x2="710" y2="${250 + 180 - 0.55 * 180}" stroke="${TONES.bad[0]}" stroke-dasharray="6 5" stroke-width="2"/>`, "front");
    d.text(152, 250 + 180 - 0.55 * 180 - 8, "server capacity", { size: 12, weight: 600, color: TONES.bad[0] });
    d.text(70, 490, "Every client retries at the same instant → spikes above capacity", { size: 13.5, color: "#B91C1C" });
    d.text(70, 518, "→ more timeouts → more retries → the outage never ends.", { size: 13.5, color: "#B91C1C" });
    const smooth = Array.from({ length: 30 }, (_, i) => 0.25 + 0.2 * Math.abs(Math.sin(i * 1.7)) * Math.exp(-i / 18));
    chart(830, 250, 600, 180, smooth, "good");
    d.raw(`<line x1="830" y1="${250 + 180 - 0.55 * 180}" x2="1430" y2="${250 + 180 - 0.55 * 180}" stroke="${TONES.bad[0]}" stroke-dasharray="6 5" stroke-width="2"/>`, "front");
    d.text(790, 490, "wait = random(0, min(cap, base × 2^attempt))", { size: 13.5, mono: true, weight: 600, color: TONES.good[0] });
    d.text(790, 518, "e.g. 100 ms → 200 → 400 → 800 (randomized), max 3 tries", { size: 13.5, color: T.body });
    d.text(790, 546, "Retry only on timeouts / 5xx / 429 — never on 400s.", { size: 13.5, color: T.body });
    return d;
  },

  "circuit-breaker": () => {
    const d = new Diagram({
      w: 1500, h: 620,
      eyebrow: "Reliability · circuit breakers",
      title: "The circuit breaker: stop calling a sick dependency",
      subtitle: "Like the breaker in your house: when too many calls fail, it **trips open** and fails fast, giving the dependency room to recover.",
      takeaway: "Fail fast + fallback beats piling up threads waiting on a dead service. Put a breaker on every remote dependency.",
    });
    d.box({ id: "closed", x: 120, y: 230, w: 300, h: 120, text: "CLOSED", sub: "Normal. Calls pass through; failures are counted.", tone: "good" });
    d.box({ id: "open", x: 760, y: 230, w: 300, h: 120, text: "OPEN", sub: "Fail fast. No calls to the dependency; return a fallback.", tone: "bad" });
    d.box({ id: "half", x: 440, y: 440, w: 300, h: 120, text: "HALF-OPEN", sub: "Let a few trial calls through to test recovery.", tone: "warn" });
    d.edge("closed", "open", { sides: "rl", tone: "bad", label: "error rate > 50% in 10 s", off1: [0, -20], off2: [0, -20] });
    d.edge("open", "half", { sides: "bt", via: [[910, 500]], tone: "warn", label: "after 30 s cooldown", at: [860, 500], off2: [0, 0] });
    d.edge("half", "closed", { sides: "lb", via: [[270, 500]], tone: "good", label: "trial calls succeed", at: [330, 500] });
    d.edge("half", "open", { sides: "tb", via: [[590, 400], [880, 400]], tone: "bad", dashed: true, label: "trial fails", at: [735, 400] });
    d.note({ x: 1100, y: 200, w: 360, title: "Fallback ideas", icon: "idea", tone: "info", lines: ["Serve cached / stale data", "Hide the widget (no recommendations)", "Queue the request for later", "Clear error: “try again in a minute”"] });
    d.note({ x: 1100, y: 420, w: 360, title: "Never fall back to…", icon: "alert", tone: "bad", lines: ["“payment succeeded” when unsure", "Granting access when auth is down"] });
    return d;
  },

  "bulkheads": () => {
    const d = new Diagram({
      w: 1500, h: 600,
      eyebrow: "Reliability · isolation",
      title: "Bulkheads: one leak shouldn't sink the ship",
      subtitle: "Ships are split into watertight compartments. Split your **thread pools, connection pools and queues** the same way.",
      takeaway: "Give each dependency and each priority class its own bounded pool, so a slow one can only exhaust its own slice.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 390, title: "One shared pool", tone: "bad" });
    for (let i = 0; i < 20; i++) {
      const slow = i < 18;
      d.raw(`<rect x="${80 + (i % 10) * 62}" y="${240 + Math.floor(i / 10) * 62}" width="52" height="52" rx="10" fill="${slow ? TONES.bad[0] : TONES.good[0]}" opacity="${slow ? 0.85 : 1}"/>`, "mid");
    }
    d.text(80, 400, "18 of 20 threads stuck waiting on the slow Recommendations API", { size: 13.5, weight: 600, color: "#B91C1C" });
    d.text(80, 428, "→ Checkout and Login can't get a thread → whole site down", { size: 13.5, color: "#B91C1C" });
    d.panel({ x: 760, y: 158, w: 700, h: 390, title: "Separate pools per dependency", tone: "good" });
    [["Checkout", 8, "good", 0], ["Login", 6, "good", 0], ["Recommendations", 6, "bad", 6]].forEach(([t, n, tone, stuck], r) => {
      const y = 236 + r * 76;
      d.text(790, y + 32, t, { size: 14, weight: 700, color: T.ink });
      for (let i = 0; i < n; i++) d.raw(`<rect x="${960 + i * 52}" y="${y + 8}" width="44" height="40" rx="8" fill="${i < stuck ? TONES.bad[0] : TONES.good[0]}" opacity="0.9"/>`, "mid");
    });
    d.text(790, 500, "Recommendations is saturated, but checkout and login are untouched.", { size: 13.5, weight: 600, color: TONES.good[0] });
    return d;
  },

  "sla-slo-sli": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Reliability · targets",
      title: "SLI → SLO → SLA, and the error budget",
      subtitle: "Measure what users feel (**SLI**), set an internal target (**SLO**), promise customers something looser (**SLA**).",
      takeaway: "The error budget turns reliability into a business decision: budget left → ship features; budget gone → fix reliability first.",
    });
    const items = [
      ["SLI", "Indicator", "What you measure", "% of requests that succeed in < 300 ms", "info"],
      ["SLO", "Objective", "Your internal target", "99.9% of requests per 30 days", "good"],
      ["SLA", "Agreement", "Contract with a penalty", "99.5% or customers get credits", "warn"],
    ];
    items.forEach(([k, n, s, ex, tone], i) => {
      const x = 40 + i * 330, y = 170;
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${x}" y="${y}" width="300" height="190" rx="16" fill="#fff" stroke="${br}" stroke-width="1.5" filter="url(#sh)"/>`, "back");
      d.raw(`<rect x="${x + 20}" y="${y + 20}" width="70" height="44" rx="10" fill="${a}"/>`, "mid");
      d.text(x + 55, y + 49, k, { size: 18, weight: 800, color: "#fff", anchor: "middle" });
      d.text(x + 104, y + 38, n, { size: 16, weight: 700, color: T.ink });
      d.text(x + 104, y + 58, s, { size: 13, color: T.muted });
      d.text(x + 20, y + 108, "Example", { size: 11.5, weight: 700, color: a });
      d.text(x + 20, y + 132, ex, { size: 14, weight: 600, color: T.ink, maxW: 260 });
      if (i < 2) d.edge([x + 302, y + 95], [x + 328, y + 95], { route: "straight", hot: true });
    });
    // error budget gauge
    const gx = 1040, gy = 170;
    d.raw(`<rect x="${gx}" y="${gy}" width="420" height="190" rx="16" fill="#0F172A"/>`, "back");
    d.text(gx + 24, gy + 36, "ERROR BUDGET · 99.9% SLO", { size: 12, weight: 700, color: "#94A3B8" });
    d.text(gx + 24, gy + 84, "43 min / month", { size: 30, weight: 800, color: "#fff" });
    d.raw(`<rect x="${gx + 24}" y="${gy + 112}" width="372" height="18" rx="9" fill="#334155"/><rect x="${gx + 24}" y="${gy + 112}" width="${372 * 0.62}" height="18" rx="9" fill="#FBBF24"/>`, "mid");
    d.text(gx + 24, gy + 160, "62% used · 16 min left this month", { size: 13.5, weight: 600, color: "#FCD34D" });
    table(d, {
      x: 40, y: 400, rowH: 46, headH: 42, size: 13.5,
      cols: [{ title: "Budget status", w: 300 }, { title: "What the team does", w: 1120 }],
      rows: [
        [{ t: "Plenty left", tone: "good" }, "Ship features faster, run experiments, do risky migrations."],
        [{ t: "Burning fast", tone: "warn" }, "Page on-call when the burn rate would exhaust the budget in hours; slow down releases."],
        [{ t: "Exhausted", tone: "bad" }, "Feature freeze. Spend the sprint on reliability work until the SLO recovers."],
      ],
    });
    return d;
  },

  "observability": () => {
    const d = new Diagram({
      w: 1500, h: 720,
      eyebrow: "Reliability · observability",
      title: "Metrics, logs and traces — the three pillars",
      subtitle: "Metrics tell you **that** something is wrong. Traces tell you **where**. Logs tell you **why**.",
      takeaway: "Put one trace_id on every log line and span, so you can jump from a red dashboard to the exact failing request.",
    });
    const cols = [
      ["Metrics", "info", "chart", "Numbers over time", ["RED: Rate, Errors, Duration", "USE: Utilization, Saturation, Errors", "Percentiles, not averages"], "Prometheus · Datadog · CloudWatch"],
      ["Logs", "cache", "file", "Timestamped events", ["Structured JSON, not free text", "Include trace_id, user_id", "Never log secrets or card numbers"], "ELK · Loki · Splunk"],
      ["Traces", "edge", "split", "One request across services", ["Spans with timings", "Propagate traceparent header", "Sample smartly (tail-based)"], "OpenTelemetry · Jaeger · Tempo"],
    ];
    cols.forEach(([t, tone, ic, s, pts, ex], i) => {
      const x = 40 + i * 474, y = 160, w = 452;
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${x}" y="${y}" width="${w}" height="220" rx="16" fill="#fff" stroke="${br}" stroke-width="1.5" filter="url(#sh)"/>`, "back");
      d.raw(`<rect x="${x + 20}" y="${y + 20}" width="44" height="44" rx="12" fill="${bg}"/>`, "back");
      d.raw(icon(ic, x + 30, y + 30, 24, a, 2));
      d.text(x + 78, y + 40, t, { size: 18, weight: 700, color: T.ink });
      d.text(x + 78, y + 60, s, { size: 13, color: T.muted });
      pts.forEach((p, j) => d.text(x + 24, y + 104 + j * 28, "•  " + p, { size: 13.5, color: T.body }));
      d.text(x + 24, y + 200, ex, { size: 12.5, weight: 600, color: a });
    });
    d.text(40, 430, "A trace waterfall — why is GET /checkout slow?", { size: 16, weight: 700, color: T.ink });
    const spans = [
      ["gateway  GET /checkout", 0, 100, "neutral"],
      ["auth-service  verify token", 2, 6, "info"],
      ["cart-service  load cart", 9, 12, "info"],
      ["  └ redis GET cart:42", 10, 2, "cache"],
      ["pricing-service  quote", 22, 70, "bad"],
      ["  └ postgres SELECT promos (no index!)", 24, 66, "bad"],
      ["payment-service  authorize", 93, 6, "info"],
    ];
    spans.forEach(([n, s, len, tone], i) => {
      const y = 452 + i * 30, x0 = 470, W = 980;
      d.text(40, y + 17, n, { size: 13, mono: true, color: tone === "bad" ? TONES.bad[0] : T.body, weight: tone === "bad" ? 700 : 400 });
      d.raw(`<rect x="${x0 + (s / 100) * W}" y="${y + 4}" width="${Math.max(6, (len / 100) * W)}" height="20" rx="5" fill="${TONES[tone][0]}" opacity="${tone === "neutral" ? 0.35 : 0.85}"/>`, "mid");
    });
    d.text(1450, 452 + 7 * 30 + 12, "total 820 ms · 70% spent in one missing index", { size: 13, weight: 700, color: TONES.bad[0], anchor: "end" });
    return d;
  },

  "disaster-recovery": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Reliability · disaster recovery",
      title: "RPO, RTO and the four DR strategies",
      subtitle: "**RPO** = how much data you can lose. **RTO** = how long you can be down. Tighter targets cost exponentially more.",
      takeaway: "Agree RPO/RTO with the business first, then buy the cheapest strategy that meets them — and rehearse the restore.",
    });
    const tx0 = 120, tx1 = 1380, ty = 250, mid = 750;
    d.raw(`<line x1="${tx0}" y1="${ty}" x2="${tx1}" y2="${ty}" stroke="#94A3B8" stroke-width="3"/>`, "back");
    d.raw(`<circle cx="${mid}" cy="${ty}" r="14" fill="${TONES.bad[0]}"/>`, "front");
    d.text(mid, ty - 26, "💥 disaster", { size: 15, weight: 700, color: TONES.bad[0], anchor: "middle" });
    d.raw(`<rect x="${mid - 330}" y="${ty + 20}" width="330" height="40" rx="10" fill="${TONES.warn[1]}" stroke="${TONES.warn[2]}"/>`, "back");
    d.text(mid - 165, ty + 46, "RPO — data lost since last good copy", { size: 13.5, weight: 700, color: TONES.warn[0], anchor: "middle" });
    d.raw(`<rect x="${mid}" y="${ty + 20}" width="400" height="40" rx="10" fill="${TONES.info[1]}" stroke="${TONES.info[2]}"/>`, "back");
    d.text(mid + 200, ty + 46, "RTO — time until service is back", { size: 13.5, weight: 700, color: TONES.info[0], anchor: "middle" });
    d.text(mid - 330, ty - 14, "last backup / replica point", { size: 12.5, color: T.muted });
    d.text(mid + 400, ty - 14, "back online", { size: 12.5, color: T.muted, anchor: "end" });
    const strat = [
      ["Backup & restore", "Hours", "Hours–day", "$", "Nightly snapshots to another region; rebuild on disaster", "neutral"],
      ["Pilot light", "Minutes", "~1 hour", "$$", "Data replicated; minimal core infra idle, scaled up on failover", "info"],
      ["Warm standby", "Seconds", "Minutes", "$$$", "Scaled-down full copy running; scale up + switch DNS", "warn"],
      ["Active-active", "≈ 0", "≈ 0", "$$$$", "Every region serves traffic; conflicts must be designed for", "good"],
    ];
    table(d, {
      x: 40, y: 360, rowH: 56, headH: 44, size: 14,
      cols: [{ title: "Strategy", w: 260 }, { title: "RPO", w: 150 }, { title: "RTO", w: 160 }, { title: "Cost", w: 120 }, { title: "How it works", w: 730 }],
      rows: strat.map(([a, b, c, e, f, tone]) => [{ t: a, tone }, b, c, e, f]),
    });
    return d;
  },

  "deployments": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Reliability · releasing safely",
      title: "Rolling, blue-green and canary deployments",
      subtitle: "Most outages are caused by **changes**. Good deployment strategies limit how many users a bad release can hurt.",
      takeaway: "Deploy small, deploy often, expose new code to a few users first, watch the metrics, and make rollback one click.",
    });
    const cols = [["Rolling", "info"], ["Blue-green", "edge"], ["Canary", "good"]];
    const cw = 452;
    cols.forEach(([t, tone], i) => {
      const x = 40 + i * (cw + 22), y = 158;
      d.panel({ x, y, w: cw, h: 430, title: t, tone });
      const [a, bg] = TONES[tone];
      const V1 = "#94A3B8", V2 = a;
      if (i === 0) {
        [0, 1, 2].forEach((step) => {
          d.text(x + 24, y + 96 + step * 60, `step ${step + 1}`, { size: 12.5, weight: 700, color: T.muted });
          for (let k = 0; k < 4; k++) d.raw(`<rect x="${x + 110 + k * 72}" y="${y + 74 + step * 60}" width="62" height="34" rx="8" fill="${k <= step ? V2 : V1}" opacity="${k <= step ? 0.9 : 0.5}"/>`, "mid");
        });
        d.text(x + 24, y + 290, "Replace servers a few at a time.", { size: 14, weight: 600, color: T.ink });
        d.text(x + 24, y + 324, "✓  No extra capacity needed", { size: 13.5, color: T.body });
        d.text(x + 24, y + 350, "✗  Old and new run side by side", { size: 13.5, color: "#B91C1C" });
        d.text(x + 24, y + 376, "✗  Rollback = another rollout", { size: 13.5, color: "#B91C1C" });
      }
      if (i === 1) {
        d.node({ id: "lbb", x: x + 150, y: y + 70, w: 150, h: 48, kind: "lb", title: "Router" });
        d.box({ id: "blue", x: x + 30, y: y + 170, w: 170, h: 60, text: "Blue · v1", sub: "idle, kept for rollback", tone: "neutral" });
        d.box({ id: "green", x: x + 250, y: y + 170, w: 170, h: 60, text: "Green · v2", sub: "all live traffic", tone: "edge" });
        d.edge("lbb", "green", { sides: "bt", hot: true, label: "100%" });
        d.edge("lbb", "blue", { sides: "bt", dashed: true, label: "0%" });
        d.text(x + 24, y + 290, "Two full environments; flip the switch.", { size: 14, weight: 600, color: T.ink });
        d.text(x + 24, y + 324, "✓  Instant rollback: flip back", { size: 13.5, color: T.body });
        d.text(x + 24, y + 350, "✗  Double infrastructure during release", { size: 13.5, color: "#B91C1C" });
        d.text(x + 24, y + 376, "✗  DB schema must work for both", { size: 13.5, color: "#B91C1C" });
      }
      if (i === 2) {
        [["1%", 0.01], ["10%", 0.1], ["50%", 0.5], ["100%", 1]].forEach(([l, f], k) => {
          const yy = y + 80 + k * 44;
          d.text(x + 24, yy + 20, l, { size: 13, weight: 700, color: T.muted });
          d.raw(`<rect x="${x + 80}" y="${yy + 4}" width="330" height="24" rx="6" fill="#E2E8F0"/><rect x="${x + 80}" y="${yy + 4}" width="${Math.max(6, 330 * f)}" height="24" rx="6" fill="${a}"/>`, "mid");
        });
        d.text(x + 24, y + 290, "Send a small % to v2; watch error rates.", { size: 14, weight: 600, color: T.ink });
        d.text(x + 24, y + 324, "✓  A bad release hurts 1% of users", { size: 13.5, color: T.body });
        d.text(x + 24, y + 350, "✓  Automated promote / rollback on SLOs", { size: 13.5, color: T.body });
        d.text(x + 24, y + 376, "✗  Needs good metrics and routing", { size: 13.5, color: "#B91C1C" });
      }
    });
    return d;
  },
};
