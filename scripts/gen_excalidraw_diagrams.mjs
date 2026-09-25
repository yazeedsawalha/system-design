#!/usr/bin/env node
/**
 * Generate Excalidraw hand-drawn diagrams + PNG exports for the system-design curriculum.
 * Usage: node scripts/gen_excalidraw_diagrams.mjs
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const EXCAL_DIR = join(ROOT, "diagrams", "excalidraw");
const PNG_DIR = join(ROOT, "diagrams", "png");

// Excalidraw pastel palette
const C = {
  blue: { stroke: "#1971c2", fill: "#a5d8ff" },
  green: { stroke: "#2f9e44", fill: "#b2f2bb" },
  red: { stroke: "#c92a2a", fill: "#ffc9c9" },
  yellow: { stroke: "#e67700", fill: "#ffec99" },
  purple: { stroke: "#9c36b5", fill: "#eebefa" },
  orange: { stroke: "#d9480f", fill: "#ffd8a8" },
  gray: { stroke: "#495057", fill: "#ced4da" },
  ink: "#1e1e1e",
  muted: "#868e96",
  white: "#ffffff",
  transparent: "transparent",
};

const CLIENT = C.blue;
const NETWORK = C.purple;
const COMPUTE = C.yellow;
const CACHE = C.green;
const DB = C.red;
const STORAGE = { stroke: "#087f5b", fill: "#b2f2bb" };
const QUEUE = C.orange;
const EXTERNAL = C.gray;
const HIGHLIGHT = C.purple;

let _seq = 1;
function uid(prefix = "e") {
  return `${prefix}${_seq++}`;
}
function seed() {
  return Math.floor(Math.random() * 2 ** 31);
}

function estimateTextSize(str, fontSize = 16) {
  const lines = String(str).split("\n");
  const maxLen = Math.max(...lines.map((l) => l.length), 1);
  const width = Math.ceil(maxLen * fontSize * 0.62);
  const height = Math.ceil(lines.length * fontSize * 1.25);
  return { width, height, lines: lines.length };
}

function base(extra = {}) {
  return {
    angle: 0,
    strokeColor: C.ink,
    backgroundColor: C.transparent,
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: seed(),
    version: 1,
    versionNonce: seed(),
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    ...extra,
  };
}

function rect(id, x, y, w, h, opts = {}) {
  const {
    stroke = C.ink,
    fill = C.transparent,
    dashed = false,
    strokeWidth = 2,
  } = opts;
  return {
    ...base({
      id,
      type: "rectangle",
      x,
      y,
      width: w,
      height: h,
      strokeColor: stroke,
      backgroundColor: fill,
      strokeStyle: dashed ? "dashed" : "solid",
      strokeWidth,
      roundness: { type: 3 },
      boundElements: [],
    }),
  };
}

function text(id, x, y, str, opts = {}) {
  const {
    size = 16,
    color = C.ink,
    align = "left",
    valign = "top",
    containerId = null,
  } = opts;
  const { width, height } = estimateTextSize(str, size);
  return {
    ...base({
      id,
      type: "text",
      x,
      y,
      width,
      height,
      strokeColor: color,
      backgroundColor: C.transparent,
      strokeWidth: 1,
      roughness: 0,
      roundness: null,
      text: str,
      fontSize: size,
      fontFamily: 1, // Virgil
      textAlign: align,
      verticalAlign: valign,
      containerId,
      originalText: str,
      lineHeight: 1.25,
      baseline: Math.round(size * 0.9),
    }),
  };
}

function labeledRect(id, x, y, w, h, label, opts = {}) {
  const {
    stroke = C.ink,
    fill = C.transparent,
    dashed = false,
    fontSize = 16,
    textColor = C.ink,
  } = opts;
  const rid = id;
  const tid = `${id}_t`;
  const r = rect(rid, x, y, w, h, { stroke, fill, dashed });
  const { width: tw, height: th } = estimateTextSize(label, fontSize);
  const tx = x + (w - tw) / 2;
  const ty = y + (h - th) / 2;
  const t = text(tid, tx, ty, label, {
    size: fontSize,
    color: textColor,
    align: "center",
    valign: "middle",
    containerId: rid,
  });
  r.boundElements = [{ id: tid, type: "text" }];
  return [r, t];
}

function arrow(id, x, y, points, opts = {}) {
  const {
    stroke = C.muted,
    dashed = false,
    endArrowhead = "arrow",
    startArrowhead = null,
    label = null,
  } = opts;
  const els = [];
  const a = {
    ...base({
      id,
      type: "arrow",
      x,
      y,
      width: Math.abs(points[points.length - 1][0]),
      height: Math.abs(points[points.length - 1][1]),
      strokeColor: stroke,
      backgroundColor: C.transparent,
      strokeStyle: dashed ? "dashed" : "solid",
      strokeWidth: 2,
      roundness: { type: 2 },
      points,
      lastCommittedPoint: null,
      startBinding: null,
      endBinding: null,
      startArrowhead,
      endArrowhead,
    }),
  };
  els.push(a);
  if (label) {
    const mid = points[Math.floor(points.length / 2)] || points[points.length - 1];
    const { width: tw, height: th } = estimateTextSize(label, 12);
    els.push(
      text(`${id}_lbl`, x + mid[0] / 2 - tw / 2, y + mid[1] / 2 - th - 4, label, {
        size: 12,
        color: C.muted,
        align: "center",
      })
    );
  }
  return els;
}

/** Straight arrow from (x1,y1) to (x2,y2) with optional label. */
function connect(id, x1, y1, x2, y2, opts = {}) {
  return arrow(id, x1, y1, [[0, 0], [x2 - x1, y2 - y1]], opts);
}

function comparePanel(x, y, w, h, title, isBad = true) {
  const stroke = isBad ? C.red.stroke : C.green.stroke;
  const fill = isBad ? C.red.fill : C.green.fill;
  const els = [];
  els.push(
    rect(uid("panel"), x, y, w, h, {
      stroke,
      fill,
      dashed: true,
      strokeWidth: 2,
    })
  );
  // lighten fill via opacity on a clone? Excalidraw opacity is per-element;
  // use pastel fill as-is (already light). Overlay white-ish by using pastel.
  els.push(
    text(uid("pt"), x + 16, y + 14, title, { size: 18, color: stroke })
  );
  return els;
}

function groupFrame(x, y, w, h, title) {
  const els = [];
  els.push(
    rect(uid("grp"), x, y, w, h, {
      stroke: C.gray.stroke,
      fill: C.transparent,
      dashed: true,
      strokeWidth: 1,
    })
  );
  els.push(text(uid("gt"), x + 10, y + 8, title, { size: 14, color: C.muted }));
  return els;
}

function note(str, x, y, size = 14) {
  return [text(uid("note"), x, y, str, { size, color: C.muted })];
}

function caption(str, cx, y, color) {
  const { width } = estimateTextSize(str, 14);
  return [
    text(uid("cap"), cx - width / 2, y, str, {
      size: 14,
      color,
      align: "center",
    }),
  ];
}

function titleText(str) {
  return [text(uid("title"), 36, 24, str, { size: 22, color: C.ink })];
}

function subtitle() {
  return [
    text(uid("sub"), 36, 52, "System Design Interview Guide", {
      size: 13,
      color: C.muted,
    }),
  ];
}

// Typed box helpers — return [elements..., boxMeta]
function box(label, x, y, w, h, palette, fontSize = 15) {
  const id = uid("box");
  const els = labeledRect(id, x, y, w, h, label, {
    stroke: palette.stroke,
    fill: palette.fill,
    fontSize,
  });
  return {
    els,
    id,
    x,
    y,
    w,
    h,
    cx: x + w / 2,
    cy: y + h / 2,
    right: x + w,
    left: x,
    top: y,
    bottom: y + h,
  };
}

function client(label, x, y, w = 120, h = 60) {
  return box(label, x, y, w, h, CLIENT);
}
function network(label, x, y, w = 130, h = 60) {
  return box(label, x, y, w, h, NETWORK);
}
function compute(label, x, y, w = 130, h = 60) {
  return box(label, x, y, w, h, COMPUTE);
}
function cache(label, x, y, w = 130, h = 60) {
  return box(label, x, y, w, h, CACHE);
}
function db(label, x, y, w = 130, h = 70) {
  return box(label, x, y, w, h, DB);
}
function storage(label, x, y, w = 130, h = 60) {
  return box(label, x, y, w, h, STORAGE);
}
function queue(label, x, y, w = 120, h = 55) {
  return box(label, x, y, w, h, QUEUE);
}
function external(label, x, y, w = 120, h = 55) {
  return box(label, x, y, w, h, EXTERNAL);
}
function highlight(label, x, y, w = 140, h = 60) {
  return box(label, x, y, w, h, HIGHLIGHT);
}

/** Edge between two box metas (side heuristic). */
function edge(a, b, label = "", opts = {}) {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  let x1, y1, x2, y2;
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx >= 0) {
      x1 = a.right;
      y1 = a.cy;
      x2 = b.left;
      y2 = b.cy;
    } else {
      x1 = a.left;
      y1 = a.cy;
      x2 = b.right;
      y2 = b.cy;
    }
  } else {
    if (dy >= 0) {
      x1 = a.cx;
      y1 = a.bottom;
      x2 = b.cx;
      y2 = b.top;
    } else {
      x1 = a.cx;
      y1 = a.top;
      x2 = b.cx;
      y2 = b.bottom;
    }
  }
  return connect(uid("arr"), x1, y1, x2, y2, {
    label: label || null,
    startArrowhead: opts.bidi ? "arrow" : null,
    dashed: !!opts.dashed,
    stroke: C.muted,
  });
}

function flatten(...parts) {
  const out = [];
  for (const p of parts) {
    if (!p) continue;
    if (Array.isArray(p)) out.push(...flatten(...p));
    else if (p.els) out.push(...p.els);
    else out.push(p);
  }
  return out;
}

function doc(elements) {
  return {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements,
    appState: {
      gridSize: null,
      viewBackgroundColor: "#ffffff",
    },
    files: {},
  };
}

function legend(items, x = 36, y = 520) {
  // items: [{name, palette}]
  const els = [];
  const pw = 24 + items.length * 120;
  els.push(
    rect(uid("leg"), x, y, pw, 48, {
      stroke: C.gray.stroke,
      fill: C.white,
      strokeWidth: 1,
    })
  );
  els.push(text(uid("legt"), x + 10, y + 6, "Legend", { size: 11, color: C.muted }));
  items.forEach((it, i) => {
    const bx = x + 12 + i * 120;
    const by = y + 24;
    els.push(
      ...labeledRect(uid("li"), bx, by, 14, 14, "", {
        stroke: it.palette.stroke,
        fill: it.palette.fill,
        fontSize: 8,
      }).filter((e) => e.type === "rectangle")
    );
    els.push(
      text(uid("ln"), bx + 20, by - 1, it.name, { size: 12, color: C.ink })
    );
  });
  return els;
}

// ═══════════════════════════════════════════════════════════════════
// DIAGRAMS
// ═══════════════════════════════════════════════════════════════════

function apiAggregation() {
  const els = [...titleText("API Aggregation: Without vs With Gateway"), ...subtitle()];
  els.push(...comparePanel(40, 80, 500, 420, "Without aggregation", true));
  const phone = client("Mobile app", 70, 200, 120, 64);
  const p = compute("Profile\nservice", 300, 140, 140, 56);
  const o = compute("Orders\nservice", 300, 240, 140, 56);
  const r = compute("Recs\nservice", 300, 340, 140, 56);
  els.push(...flatten(phone, p, o, r));
  els.push(...edge(phone, p, "1. profile"));
  els.push(...edge(phone, o, "2. orders"));
  els.push(...edge(phone, r, "3. recs"));
  els.push(...caption("Three calls over a flaky mobile network", 290, 480, C.red.stroke));

  els.push(...comparePanel(560, 80, 500, 420, "With API gateway / BFF", false));
  const phone2 = client("Mobile app", 590, 220, 120, 64);
  const gw = highlight("API Gateway\n(aggregates)", 760, 210, 150, 70);
  const p2 = compute("Profile", 940, 130, 90, 48);
  const o2 = compute("Orders", 940, 220, 90, 48);
  const r2 = compute("Recs", 940, 310, 90, 48);
  els.push(...flatten(phone2, gw, p2, o2, r2));
  els.push(...edge(phone2, gw, "1 call"));
  els.push(...edge(gw, p2));
  els.push(...edge(gw, o2));
  els.push(...edge(gw, r2));
  els.push(
    ...caption(
      "One call · gateway fans out on the fast datacenter network",
      810,
      480,
      C.green.stroke
    )
  );
  els.push(
    ...note(
      "Gateway / BFF aggregates for the screen; keep domain logic in the services",
      40,
      530
    )
  );
  return doc(els);
}

function verticalVsHorizontal() {
  const els = [...titleText("Vertical vs Horizontal Scaling"), ...subtitle()];
  els.push(...comparePanel(40, 80, 500, 360, "Without horizontal scale (scale up)", true));
  const c1 = client("Users", 70, 200, 100, 56);
  const big = compute("One bigger\nmachine", 250, 170, 180, 100);
  els.push(...flatten(c1, big));
  els.push(...edge(c1, big, "all traffic"));
  els.push(...caption("Simple · hits a ceiling · big blast radius", 290, 420, C.red.stroke));

  els.push(...comparePanel(560, 80, 500, 360, "With horizontal scale (scale out)", false));
  const c2 = client("Users", 590, 210, 100, 56);
  const lb = highlight("Load\nbalancer", 720, 210, 120, 60);
  const a = compute("App 1", 890, 130, 100, 48);
  const b = compute("App 2", 890, 210, 100, 48);
  const c = compute("App 3", 890, 290, 100, 48);
  els.push(...flatten(c2, lb, a, b, c));
  els.push(...edge(c2, lb));
  els.push(...edge(lb, a));
  els.push(...edge(lb, b));
  els.push(...edge(lb, c));
  els.push(
    ...caption("Add machines · needs stateless apps + partitioned data", 810, 420, C.green.stroke)
  );
  els.push(
    ...note(
      "Interviews: name which tier scales which way — web tier out, early DB often up first",
      40,
      480
    )
  );
  return doc(els);
}

function cacheAsideVsDirect() {
  const els = [...titleText("Without Cache vs Cache-Aside"), ...subtitle()];
  els.push(...comparePanel(40, 80, 500, 360, "Without a cache", true));
  const app1 = compute("App", 80, 210, 110, 56);
  const db1 = db("Database", 280, 200, 150, 70);
  els.push(...flatten(app1, db1));
  els.push(...edge(app1, db1, "every read"));
  els.push(...caption("Every request hits the database · slow under load", 290, 420, C.red.stroke));

  els.push(...comparePanel(560, 80, 500, 360, "With cache-aside", false));
  const app2 = compute("App", 590, 210, 110, 56);
  const ca = highlight("Cache\n(Redis)", 760, 130, 140, 70);
  const db2 = db("Database", 760, 270, 150, 70);
  els.push(...flatten(app2, ca, db2));
  els.push(...edge(app2, ca, "1. get"));
  els.push(...edge(app2, db2, "2. miss → load"));
  els.push(
    ...caption("Hot keys served from memory · app owns read/write path", 810, 420, C.green.stroke)
  );
  els.push(...note("Invalidate or TTL on write · watch stampedes on popular keys", 40, 480));
  return doc(els);
}

function microservicesVsMonolith() {
  const els = [...titleText("Monolith vs Microservices"), ...subtitle()];
  els.push(...comparePanel(40, 80, 500, 320, "Without service split", true));
  const mono = compute("Single app\nall modules", 80, 170, 180, 90);
  const mdb = db("Shared DB", 320, 180, 150, 70);
  els.push(...flatten(mono, mdb));
  els.push(...edge(mono, mdb, "SQL / txns"));
  els.push(...caption("Simple to build · scale the whole app together", 290, 380, C.red.stroke));

  els.push(...comparePanel(560, 80, 500, 320, "With service split", false));
  const gw = highlight("API Gateway", 590, 150, 140, 55);
  const s1 = compute("Svc A", 770, 115, 100, 45);
  const s2 = compute("Svc B", 770, 185, 100, 45);
  const s3 = compute("Svc C", 770, 255, 100, 45);
  const bus = queue("Events", 910, 185, 110, 50);
  els.push(...flatten(gw, s1, s2, s3, bus));
  els.push(...edge(gw, s1));
  els.push(...edge(gw, s2));
  els.push(...edge(gw, s3));
  els.push(...edge(s1, bus, "", { dashed: true }));
  els.push(...edge(bus, s3, "", { dashed: true }));
  els.push(
    ...caption("Scale hot paths alone · more network & ops work", 810, 380, C.green.stroke)
  );
  els.push(
    ...note(
      "Senior move: start modular monolith; extract when team/scale demand clear seams",
      40,
      440
    )
  );
  return doc(els);
}

function websocketVsPolling() {
  const els = [...titleText("WebSocket vs SSE vs Polling"), ...subtitle()];
  els.push(...comparePanel(40, 80, 340, 280, "Without a live channel", true));
  const c1 = client("Client", 70, 160, 100, 55);
  const s1 = compute("Server", 220, 160, 110, 55);
  els.push(...flatten(c1, s1));
  els.push(...edge(c1, s1, "poll… poll…", { bidi: true }));
  els.push(...caption("Many empty requests · simple but wasteful", 210, 340, C.red.stroke));

  els.push(...comparePanel(400, 80, 660, 280, "With long-lived stream", false));
  const c2 = client("Client", 430, 140, 100, 55);
  const s2 = compute("Server", 580, 140, 110, 55);
  els.push(...flatten(c2, s2));
  els.push(...edge(c2, s2, "SSE ↓ one-way"));
  const c3 = client("Client", 740, 220, 100, 55);
  const s3 = compute("Server", 890, 220, 110, 55);
  els.push(...flatten(c3, s3));
  els.push(...edge(c3, s3, "WS ↔ chat", { bidi: true }));
  els.push(
    ...caption(
      "Server pushes when something happens · fewer wasted calls",
      730,
      340,
      C.green.stroke
    )
  );
  els.push(
    ...note(
      "Pick by direction (one-way vs two-way), proxies/firewalls, and reconnect story",
      40,
      400
    )
  );
  return doc(els);
}

function messaging() {
  const els = [...titleText("Messaging: Queue vs Pub/Sub"), ...subtitle()];
  els.push(...comparePanel(40, 80, 500, 300, "Without fan-out (work queue)", true));
  const prod = compute("Producer", 70, 170, 120, 55);
  const q = queue("Queue", 230, 175, 120, 50);
  const w1 = compute("Worker 1", 400, 130, 110, 50);
  const w2 = compute("Worker 2", 400, 220, 110, 50);
  els.push(...flatten(prod, q, w1, w2));
  els.push(...edge(prod, q));
  els.push(...edge(q, w1, "1 msg → 1"));
  els.push(...edge(q, w2));
  els.push(...caption("Competing workers · each job done once", 290, 360, C.red.stroke));

  els.push(...comparePanel(560, 80, 500, 300, "With fan-out (pub/sub)", false));
  const p2 = compute("Producer", 590, 170, 120, 50);
  const topic = queue("Topic", 750, 170, 110, 50);
  const s1 = compute("Email", 910, 110, 110, 45);
  const s2 = compute("Search", 910, 175, 110, 45);
  const s3 = compute("Analytics", 910, 240, 120, 45);
  els.push(...flatten(p2, topic, s1, s2, s3));
  els.push(...edge(p2, topic));
  els.push(...edge(topic, s1));
  els.push(...edge(topic, s2));
  els.push(...edge(topic, s3));
  els.push(...caption("One publish · many independent subscribers", 810, 360, C.green.stroke));
  els.push(
    ...note(
      "At-least-once + idempotent consumers · poison → DLQ · streams add replay via offsets",
      40,
      420
    )
  );
  return doc(els);
}

function dnsResolution() {
  const els = [...titleText("DNS Resolution"), ...subtitle()];
  const browser = client("Browser /\nOS stub", 40, 200, 130, 70);
  const resolver = network("Recursive\nresolver", 210, 200, 140, 70);
  const root = network("Root NS", 400, 100, 120, 55);
  const tld = network("TLD NS\n(.com)", 400, 200, 120, 60);
  const auth = network("Auth NS\n(example.com)", 400, 310, 150, 60);
  const cdn = compute("CDN / origin\nA/AAAA", 620, 200, 150, 70);
  const cacheBox = cache("DNS cache\n(TTL)", 210, 340, 140, 60);
  els.push(...flatten(browser, resolver, root, tld, auth, cdn, cacheBox));
  els.push(...edge(browser, resolver, "1. query"));
  els.push(...edge(resolver, root, "2. root?"));
  els.push(...edge(resolver, tld, "3. TLD?"));
  els.push(...edge(resolver, auth, "4. auth?"));
  els.push(...edge(resolver, cdn, "5. answer"));
  els.push(...edge(resolver, cacheBox, "cache TTL", { dashed: true }));
  els.push(
    ...note(
      "TTL controls failover speed · GeoDNS / Anycast for regional steering · blunt LB only",
      40,
      440
    )
  );
  els.push(
    ...legend(
      [
        { name: "Client", palette: CLIENT },
        { name: "Network", palette: NETWORK },
        { name: "Compute", palette: COMPUTE },
        { name: "Cache", palette: CACHE },
      ],
      36,
      490
    )
  );
  return doc(els);
}

function loadBalancing() {
  const els = [...titleText("Load Balancing Patterns"), ...subtitle()];
  const c = client("Clients", 40, 230, 110, 56);
  const dns = network("DNS /\nAnycast", 190, 230, 120, 60);
  const l4 = network("L4 LB\n(TCP/UDP)", 360, 140, 130, 60);
  const l7 = network("L7 LB\n(HTTP)", 360, 320, 130, 60);
  const a = compute("App A", 560, 100, 110, 50);
  const b = compute("App B", 560, 180, 110, 50);
  const c1 = compute("App C", 560, 280, 110, 50);
  const d1 = compute("App D", 560, 360, 110, 50);
  els.push(...flatten(c, dns, l4, l7, a, b, c1, d1));
  els.push(...edge(c, dns));
  els.push(...edge(dns, l4));
  els.push(...edge(dns, l7));
  els.push(...edge(l4, a, "RR / least-conn"));
  els.push(...edge(l4, b));
  els.push(...edge(l7, c1, "path / header"));
  els.push(...edge(l7, d1));
  els.push(...groupFrame(720, 120, 340, 220, "Algorithms"));
  els.push(
    ...note(
      "• Round-robin / weighted RR\n• Least connections\n• Consistent hash (sticky sessions)\n• Health checks + drain",
      740,
      160,
      14
    )
  );
  return doc(els);
}

function cachingStrategies() {
  const els = [...titleText("Caching Strategies"), ...subtitle()];
  els.push(...groupFrame(40, 80, 500, 170, "Cache-aside"));
  const app1 = compute("App", 60, 130, 100, 50);
  const ca = cache("Cache", 200, 130, 110, 50);
  const db1 = db("DB", 360, 120, 110, 60);
  els.push(...flatten(app1, ca, db1));
  els.push(...edge(app1, ca, "1 get"));
  els.push(...edge(app1, db1, "2 miss→load"));
  els.push(...note("App owns reads/writes", 60, 210, 13));

  els.push(...groupFrame(560, 80, 500, 170, "Read-through"));
  const app2 = compute("App", 580, 130, 100, 50);
  const rt = cache("Cache\n(+loader)", 720, 120, 130, 60);
  const db2 = db("DB", 900, 120, 110, 60);
  els.push(...flatten(app2, rt, db2));
  els.push(...edge(app2, rt, "get"));
  els.push(...edge(rt, db2, "miss load"));

  els.push(...groupFrame(40, 280, 500, 170, "Write-through"));
  const app3 = compute("App", 60, 330, 100, 50);
  const wt = cache("Cache", 200, 330, 110, 50);
  const db3 = db("DB", 360, 320, 110, 60);
  els.push(...flatten(app3, wt, db3));
  els.push(...edge(app3, wt, "write"));
  els.push(...edge(wt, db3, "sync write"));

  els.push(...groupFrame(560, 280, 500, 170, "Write-behind"));
  const app4 = compute("App", 580, 330, 100, 50);
  const wb = cache("Cache", 720, 330, 110, 50);
  const q = queue("Async Q", 880, 290, 110, 45);
  const db4 = db("DB", 880, 360, 110, 60);
  els.push(...flatten(app4, wb, q, db4));
  els.push(...edge(app4, wb, "write"));
  els.push(...edge(wb, q, "flush", { dashed: true }));
  els.push(...edge(q, db4, "", { dashed: true }));

  els.push(
    ...note(
      "CDN = geo cache for static · invalidate / TTL / versioned keys · stampede: lock or probabilistic early expire",
      40,
      480
    )
  );
  return doc(els);
}

function shardingConsistentHash() {
  const els = [...titleText("Sharding & Consistent Hashing"), ...subtitle()];
  const cl = client("Client /\nrouter", 40, 230, 120, 70);
  const ring = network("Hash ring\nkey → vnode", 210, 230, 150, 70);
  const s1 = db("Shard 1\nvnodes", 430, 100, 130, 70);
  const s2 = db("Shard 2\nvnodes", 430, 230, 130, 70);
  const s3 = db("Shard 3\nvnodes", 430, 360, 130, 70);
  const hot = compute("Hot key\nrisk", 640, 230, 130, 60);
  els.push(...flatten(cl, ring, s1, s2, s3, hot));
  els.push(...edge(cl, ring, "hash(key)"));
  els.push(...edge(ring, s1));
  els.push(...edge(ring, s2));
  els.push(...edge(ring, s3));
  els.push(...edge(s2, hot, "viral key", { dashed: true }));
  els.push(
    ...note(
      "Virtual nodes → even spread · reshard moves fraction of keys · protect hotspots with local cache / split",
      40,
      470
    )
  );
  return doc(els);
}

function replicationFailover() {
  const els = [...titleText("Replication & Failover"), ...subtitle()];
  const app = compute("App /\nproxy", 40, 230, 120, 70);
  const primary = db("Primary\n(writes)", 220, 140, 140, 70);
  const r1 = db("Replica 1", 440, 80, 130, 65);
  const r2 = db("Replica 2", 440, 200, 130, 65);
  const mon = network("Health\nmonitor", 220, 340, 140, 60);
  const promote = compute("Promote\n+ fence", 440, 360, 140, 60);
  els.push(...flatten(app, primary, r1, r2, mon, promote));
  els.push(...edge(app, primary, "writes"));
  els.push(...edge(app, r1, "reads", { dashed: true }));
  els.push(...edge(app, r2, "reads", { dashed: true }));
  els.push(...edge(primary, r1, "async/sync log"));
  els.push(...edge(primary, r2, "async/sync log"));
  els.push(...edge(mon, primary, "probe"));
  els.push(...edge(mon, promote, "failover"));
  els.push(...edge(promote, r1, "elect", { dashed: true }));
  els.push(
    ...note(
      "Fencing prevents split-brain · RPO/RTO from sync vs async · lag monitoring on replicas",
      40,
      460
    )
  );
  return doc(els);
}

function capPacelc() {
  const els = [...titleText("CAP & PACELC"), ...subtitle()];
  els.push(...groupFrame(40, 90, 500, 230, "Under partition (CAP)"));
  const cp = compute("CP\nrefuse / block", 70, 150, 170, 80);
  const ap = cache("AP\nserve possibly\nstale", 310, 150, 180, 90);
  els.push(...flatten(cp, ap));
  els.push(...note("C vs A when P happens", 70, 270, 14));

  els.push(...groupFrame(560, 90, 500, 230, "Else (PACELC)"));
  const lat = network("Prefer\nLatency", 590, 150, 170, 80);
  const cons = db("Prefer\nConsistency", 820, 150, 180, 80);
  els.push(...flatten(lat, cons));
  els.push(...note("When no partition: L vs C", 590, 270, 14));

  els.push(
    ...note(
      "Interview use: name the tradeoff for THIS design under partition AND in steady state — don't recite the acronym alone",
      40,
      360
    )
  );
  return doc(els);
}

function rateLimiting() {
  const els = [...titleText("Rate Limiting"), ...subtitle()];
  const c = client("Client", 40, 210, 110, 56);
  const gw = network("API Gateway\n/ middleware", 190, 200, 160, 70);
  const rl = compute("Rate Limiter", 400, 210, 140, 56);
  const redis = cache("Redis\ncounters / tokens", 590, 200, 160, 70);
  const rules = db("Rules\n(per key)", 400, 350, 140, 70);
  const app = compute("Upstream\nAPI", 820, 210, 130, 60);
  els.push(...flatten(c, gw, rl, redis, rules, app));
  els.push(...edge(c, gw, "request"));
  els.push(...edge(gw, rl, "check"));
  els.push(...edge(rl, redis, "INCR / Lua"));
  els.push(...edge(rl, rules, "load rules", { dashed: true }));
  els.push(...edge(rl, app, "allow / 429"));
  els.push(
    ...note(
      "Token bucket · sliding window · fixed window · keys: user / IP / API key · Retry-After header",
      40,
      460
    )
  );
  return doc(els);
}

function bloomFilter() {
  const els = [...titleText("Bloom Filter"), ...subtitle()];
  const item = client('Item\n"url-42"', 40, 210, 120, 70);
  const h1 = network("hash₁", 210, 120, 100, 50);
  const h2 = network("hash₂", 210, 210, 100, 50);
  const h3 = network("hash₃", 210, 300, 100, 50);
  const bits = cache("Bit array m\n[0 1 0 1 … 1 0]", 380, 190, 220, 90);
  const maybe = compute("Maybe\npresent", 670, 130, 140, 60);
  const no = db("Definitely\nNOT", 670, 280, 140, 70);
  els.push(...flatten(item, h1, h2, h3, bits, maybe, no));
  els.push(...edge(item, h1));
  els.push(...edge(item, h2));
  els.push(...edge(item, h3));
  els.push(...edge(h1, bits));
  els.push(...edge(h2, bits));
  els.push(...edge(h3, bits));
  els.push(...edge(bits, maybe, "all k bits = 1"));
  els.push(...edge(bits, no, "any bit = 0"));
  els.push(
    ...note(
      "No false negatives (for inserts) · tunable FPR · crawlers / caches / DB existence checks",
      40,
      420
    )
  );
  return doc(els);
}

function circuitBreaker() {
  const els = [...titleText("Circuit Breaker States"), ...subtitle()];
  const closed = cache("CLOSED\npass through\ncount failures", 80, 200, 200, 100);
  const open_ = db("OPEN\nfail fast\ncooldown", 420, 200, 200, 100);
  const half = compute("HALF-OPEN\nprobe subset", 760, 200, 200, 100);
  els.push(...flatten(closed, open_, half));
  els.push(...edge(closed, open_, "failures ≥ threshold"));
  els.push(...edge(open_, half, "timer elapsed"));
  els.push(...edge(half, closed, "probe OK"));
  els.push(...edge(half, open_, "probe fail", { dashed: true }));
  els.push(
    ...note(
      "Pair with timeouts, bulkheads, retries with jitter · prevent retry storms",
      80,
      380
    )
  );
  return doc(els);
}

function observability() {
  const els = [...titleText("Observability — Three Pillars"), ...subtitle()];
  const svc = compute("Services", 40, 220, 130, 60);
  const metrics = cache("Metrics\nRED / USE\nhistograms", 230, 100, 160, 90);
  const logs = network("Logs\nstructured\n+ correlate IDs", 230, 230, 160, 90);
  const traces = queue("Traces\nspans /\nexemplars", 230, 370, 160, 90);
  const dash = compute("Dashboards\n+ alerts", 480, 220, 160, 70);
  const oncall = client("On-call\nresponse", 720, 220, 140, 70);
  els.push(...flatten(svc, metrics, logs, traces, dash, oncall));
  els.push(...edge(svc, metrics));
  els.push(...edge(svc, logs));
  els.push(...edge(svc, traces));
  els.push(...edge(metrics, dash));
  els.push(...edge(logs, dash));
  els.push(...edge(traces, dash));
  els.push(...edge(dash, oncall, "page"));
  els.push(
    ...note(
      "SLIs → SLOs → error budget · golden signals · link metrics↔traces via exemplars",
      40,
      500
    )
  );
  return doc(els);
}

function urlShortener() {
  const els = [...titleText("URL Shortener"), ...subtitle()];
  const c = client("Client\n(Web / Mobile)", 40, 200, 130, 70);
  const lb = network("Load Balancer", 210, 200, 140, 70);
  const api = compute("API Service\ncreate / redirect", 400, 200, 160, 70);
  const redis = cache("Redis\ncode → URL", 620, 110, 140, 70);
  const pg = db("Postgres\nlinks table", 620, 260, 140, 70);
  const q = queue("Analytics\nqueue", 820, 200, 130, 60);
  const w = compute("Workers", 990, 200, 110, 60);
  els.push(...flatten(c, lb, api, redis, pg, q, w));
  els.push(...edge(c, lb, "HTTPS"));
  els.push(...edge(lb, api));
  els.push(...edge(api, redis, "read/write"));
  els.push(...edge(api, pg, "persist"));
  els.push(...edge(api, q, "clicks"));
  els.push(...edge(q, w, "async"));
  els.push(
    ...note("Create: write DB → warm cache · Redirect: cache then DB · 302 Location", 40, 400)
  );
  return doc(els);
}

function newsFeed() {
  const els = [...titleText("News Feed (Hybrid Fan-out)"), ...subtitle()];
  const c = client("Client", 40, 220, 110, 56);
  const gw = network("API / BFF", 190, 220, 130, 56);
  const feed = compute("Feed service", 370, 130, 140, 56);
  const post = compute("Post service", 370, 280, 140, 56);
  const q = queue("Post events", 560, 280, 130, 50);
  const fo = compute("Fan-out\nworkers", 560, 130, 130, 60);
  const fcache = cache("Feed cache\n(Redis lists)", 750, 110, 150, 70);
  const graph = db("Follow graph", 750, 230, 140, 65);
  const posts = db("Posts DB", 750, 340, 140, 65);
  els.push(...flatten(c, gw, feed, post, q, fo, fcache, graph, posts));
  els.push(...edge(c, gw));
  els.push(...edge(gw, feed, "read"));
  els.push(...edge(gw, post, "create"));
  els.push(...edge(post, q));
  els.push(...edge(q, fo));
  els.push(...edge(fo, fcache, "push"));
  els.push(...edge(fo, graph, "followers"));
  els.push(...edge(feed, fcache));
  els.push(...edge(feed, posts, "hydrate", { dashed: true }));
  els.push(
    ...note(
      "Hybrid: fan-out on write for normal users; pull for celebrities · timeline merge",
      40,
      450
    )
  );
  return doc(els);
}

function chatMessaging() {
  const els = [...titleText("Chat & Messaging"), ...subtitle()];
  const c = client("Clients\n(WS)", 40, 220, 120, 70);
  const gw = network("WS Gateway\nconn map", 200, 220, 150, 70);
  const chat = compute("Chat service", 400, 220, 140, 60);
  const pres = cache("Presence\n(Redis)", 600, 110, 140, 60);
  const store = db("Message\nstore", 600, 230, 140, 70);
  const q = queue("Delivery\n/ push Q", 600, 360, 140, 55);
  const push = external("Push\nAPNs/FCM", 810, 360, 130, 55);
  els.push(...flatten(c, gw, chat, pres, store, q, push));
  els.push(...edge(c, gw, "WS", { bidi: true }));
  els.push(...edge(gw, chat));
  els.push(...edge(chat, pres));
  els.push(...edge(chat, store, "persist"));
  els.push(...edge(chat, q, "offline"));
  els.push(...edge(q, push));
  els.push(
    ...note(
      "Sticky sessions or conn registry · fan-out to online devices · at-least-once + client dedup",
      40,
      460
    )
  );
  return doc(els);
}

function uberDispatch() {
  const els = [...titleText("Uber-like Dispatch"), ...subtitle()];
  const rider = client("Rider app", 40, 120, 120, 56);
  const driver = client("Driver app", 40, 300, 120, 56);
  const gw = network("API / WS", 200, 210, 130, 56);
  const geo = compute("Location\ningest", 380, 100, 130, 60);
  const match = compute("Matching", 380, 220, 130, 56);
  const trips = compute("Trips", 380, 350, 130, 56);
  const idx = cache("Geo index\n(quad/H3)", 570, 100, 150, 60);
  const q = queue("Events", 570, 230, 120, 50);
  const tdb = db("Trips DB", 570, 340, 130, 65);
  els.push(...flatten(rider, driver, gw, geo, match, trips, idx, q, tdb));
  els.push(...edge(rider, gw));
  els.push(...edge(driver, gw));
  els.push(...edge(gw, geo));
  els.push(...edge(gw, match));
  els.push(...edge(gw, trips));
  els.push(...edge(geo, idx));
  els.push(...edge(match, idx, "nearby"));
  els.push(...edge(match, q));
  els.push(...edge(trips, tdb));
  els.push(...edge(trips, q));
  els.push(
    ...note(
      "Update location sparsely · match in geo cells · trip state machine · surge as pricing service",
      40,
      460
    )
  );
  return doc(els);
}

function videoStreaming() {
  const els = [...titleText("Video Streaming"), ...subtitle()];
  const up = client("Uploader", 40, 200, 110, 56);
  const api = compute("Upload API", 190, 200, 130, 56);
  const raw = storage("Object store\nraw", 360, 110, 150, 60);
  const q = queue("Transcode\njobs", 360, 260, 140, 55);
  const workers = compute("Transcoders\nHLS/DASH", 560, 200, 150, 70);
  const pack = storage("Packaged\nsegments", 760, 110, 140, 60);
  const cdn = network("CDN", 760, 260, 120, 50);
  const viewer = client("Viewer", 950, 200, 110, 56);
  els.push(...flatten(up, api, raw, q, workers, pack, cdn, viewer));
  els.push(...edge(up, api));
  els.push(...edge(api, raw));
  els.push(...edge(api, q));
  els.push(...edge(q, workers));
  els.push(...edge(workers, pack));
  els.push(...edge(pack, cdn));
  els.push(...edge(cdn, viewer, "play"));
  els.push(
    ...note("ABR bitrates · origin shield · DRM optional · hot storage → cold archive", 40, 400)
  );
  return doc(els);
}

function dropbox() {
  const els = [...titleText("Dropbox-like File Sync"), ...subtitle()];
  const c = client("Desktop /\nmobile client", 40, 220, 140, 70);
  const api = compute("Sync /\nmetadata API", 230, 220, 150, 70);
  const chunk = storage("Chunk store\n(content-addr)", 440, 100, 170, 70);
  const meta = db("Metadata\nDB", 440, 230, 140, 70);
  const dedup = cache("Dedup /\nblock index", 440, 360, 160, 60);
  const notify = queue("Notify Q", 680, 220, 120, 50);
  const peers = client("Other\ndevices", 860, 220, 120, 60);
  els.push(...flatten(c, api, chunk, meta, dedup, notify, peers));
  els.push(...edge(c, api));
  els.push(...edge(api, chunk, "blocks"));
  els.push(...edge(api, meta));
  els.push(...edge(api, dedup, "hash?"));
  els.push(...edge(api, notify));
  els.push(...edge(notify, peers, "invalidate"));
  els.push(
    ...note(
      "Chunk + hash · upload only missing blocks · conflict: last-writer or branch · notifications wake clients",
      40,
      460
    )
  );
  return doc(els);
}

function notificationSystem() {
  const els = [...titleText("Notification System"), ...subtitle()];
  const prod = compute("Producers\n(services)", 40, 220, 140, 70);
  const api = compute("Notif API", 220, 220, 130, 70);
  const q = queue("Priority\nqueues", 400, 220, 130, 70);
  const w = compute("Workers", 580, 220, 120, 70);
  const prefs = db("Prefs /\nquiet hours", 580, 370, 150, 70);
  const push = external("Push\nAPNs/FCM", 760, 100, 140, 50);
  const email = external("Email", 760, 180, 140, 50);
  const sms = external("SMS", 760, 260, 140, 50);
  const inapp = external("In-app", 760, 340, 140, 50);
  els.push(...flatten(prod, api, q, w, prefs, push, email, sms, inapp));
  els.push(...edge(prod, api, "enqueue"));
  els.push(...edge(api, q));
  els.push(...edge(q, w));
  els.push(...edge(w, prefs, "check", { dashed: true }));
  els.push(...edge(w, push));
  els.push(...edge(w, email));
  els.push(...edge(w, sms));
  els.push(...edge(w, inapp));
  els.push(
    ...note("Idempotency keys · backoff on 5xx · respect quiet hours before send", 40, 480)
  );
  return doc(els);
}

function nearbyPlaces() {
  const els = [...titleText("Nearby Places (Yelp-like)"), ...subtitle()];
  const c = client("User\nlat/lng", 40, 220, 120, 70);
  const api = compute("Search API", 210, 220, 130, 56);
  const geo = cache("Geo index\n(geohash/H3)", 400, 120, 170, 70);
  const biz = db("Business\nDB", 400, 280, 140, 70);
  const rank = compute("Ranker\ndistance+score", 630, 220, 160, 70);
  const rcache = cache("Result\ncache", 850, 220, 130, 60);
  els.push(...flatten(c, api, geo, biz, rank, rcache));
  els.push(...edge(c, api));
  els.push(...edge(api, geo, "cells"));
  els.push(...edge(api, biz));
  els.push(...edge(api, rank));
  els.push(...edge(rank, rcache));
  els.push(
    ...note(
      "Expand rings of cells · filter categories · cache popular tiles · personalization light",
      40,
      420
    )
  );
  return doc(els);
}

function groupChat() {
  const els = [...titleText("Group Chat (Slack-like)"), ...subtitle()];
  const c = client("Clients", 40, 220, 110, 56);
  const gw = network("WS Gateway", 190, 220, 140, 56);
  const chan = compute("Channel\nservice", 380, 100, 140, 60);
  const msg = compute("Message\nservice", 380, 220, 140, 60);
  const mem = compute("Membership", 380, 340, 140, 56);
  const store = db("Messages\nDB", 590, 220, 140, 70);
  const fan = queue("Fan-out\nevents", 590, 100, 130, 55);
  els.push(...flatten(c, gw, chan, msg, mem, store, fan));
  els.push(...edge(c, gw, "", { bidi: true }));
  els.push(...edge(gw, chan));
  els.push(...edge(gw, msg));
  els.push(...edge(gw, mem));
  els.push(...edge(msg, store));
  els.push(...edge(msg, fan));
  els.push(...edge(fan, gw, "push members", { dashed: true }));
  els.push(
    ...note(
      "Large channels: fan-out via pubsub · history paginated · unread cursors per member",
      40,
      440
    )
  );
  return doc(els);
}

function ecommerceCheckout() {
  const els = [...titleText("E-commerce Checkout"), ...subtitle()];
  const c = client("Shopper", 40, 220, 110, 56);
  const api = compute("Checkout\nAPI", 190, 220, 130, 60);
  const cart = cache("Cart\n(Redis)", 370, 100, 130, 60);
  const inv = db("Inventory\nlocks", 370, 230, 140, 70);
  const orders = db("Orders", 370, 360, 130, 65);
  const pay = external("Payments", 570, 220, 130, 50);
  const fulfill = queue("Fulfillment\nQ", 750, 220, 140, 55);
  const wh = compute("Warehouse", 940, 220, 130, 55);
  els.push(...flatten(c, api, cart, inv, orders, pay, fulfill, wh));
  els.push(...edge(c, api));
  els.push(...edge(api, cart));
  els.push(...edge(api, inv, "reserve"));
  els.push(...edge(api, orders));
  els.push(...edge(api, pay, "charge"));
  els.push(...edge(api, fulfill));
  els.push(...edge(fulfill, wh));
  els.push(
    ...note(
      "Reserve stock with TTL · saga / compensate on pay fail · idempotent order create",
      40,
      470
    )
  );
  return doc(els);
}

function recommendationFeed() {
  const els = [...titleText("Recommendation & Feed Ranking"), ...subtitle()];
  const c = client("User", 40, 220, 100, 56);
  const api = compute("Feed API", 180, 220, 120, 56);
  const cand = compute("Candidate\ngenerators", 350, 120, 150, 70);
  const feats = cache("Feature\nstore", 350, 280, 140, 70);
  const rank = compute("Ranker\n(ML model)", 560, 220, 150, 70);
  const filt = compute("Filters\npolicy / dedup", 760, 220, 150, 70);
  const out = client("Ranked\nfeed", 960, 220, 120, 60);
  els.push(...flatten(c, api, cand, feats, rank, filt, out));
  els.push(...edge(c, api));
  els.push(...edge(api, cand));
  els.push(...edge(api, feats));
  els.push(...edge(cand, rank));
  els.push(...edge(feats, rank));
  els.push(...edge(rank, filt));
  els.push(...edge(filt, out));
  els.push(
    ...note(
      "Multi-stage funnel · retrieve → rank → filter · online features vs batch · A/B + holdouts",
      40,
      420
    )
  );
  return doc(els);
}

function searchInvertedIndex() {
  const els = [...titleText("Search — Inverted Index"), ...subtitle()];
  const docs = storage("Documents", 40, 140, 130, 56);
  const analyze = compute("Analyzer\ntokenize·stem", 220, 140, 160, 70);
  const idx = cache("Inverted index\nterm → postings", 440, 120, 200, 90);
  const q = client('Query\n"system design"', 40, 340, 160, 70);
  const search = compute("Query engine", 260, 340, 140, 56);
  const rank = compute("Ranking\nBM25 / LTR", 470, 340, 150, 60);
  const hits = client("Top-K", 690, 340, 110, 56);
  els.push(...flatten(docs, analyze, idx, q, search, rank, hits));
  els.push(...edge(docs, analyze, "index"));
  els.push(...edge(analyze, idx));
  els.push(...edge(q, search));
  els.push(...edge(search, idx, "lookup"));
  els.push(...edge(search, rank));
  els.push(...edge(rank, hits));
  els.push(
    ...note(
      "Intersect postings · positional phrases · shard by term or doc · NRT refresh vs durability",
      40,
      460
    )
  );
  return doc(els);
}

function typeahead() {
  const els = [...titleText("Typeahead / Autocomplete"), ...subtitle()];
  const user = client('User types\n"sys…"', 40, 220, 130, 70);
  const edgeC = network("Edge / CDN\nprefix cache", 210, 220, 150, 70);
  const api = compute("Suggest API", 420, 220, 130, 56);
  const trie = cache("Trie / prefix\nindex", 610, 120, 160, 70);
  const rank = compute("Ranker\npopularity", 610, 280, 160, 70);
  const store = db("Query logs\n/ freq", 840, 210, 150, 70);
  els.push(...flatten(user, edgeC, api, trie, rank, store));
  els.push(...edge(user, edgeC));
  els.push(...edge(edgeC, api, "miss"));
  els.push(...edge(api, trie, "prefix"));
  els.push(...edge(api, rank));
  els.push(...edge(rank, store, "offline", { dashed: true }));
  els.push(
    ...note(
      "Debounce client · cache hot prefixes at edge · limit candidates · light personalization",
      40,
      420
    )
  );
  return doc(els);
}

function webCrawler() {
  const els = [...titleText("Web Crawler"), ...subtitle()];
  const seed = client("Seed URLs", 40, 220, 120, 56);
  const fq = queue("Frontier\nqueue", 200, 220, 130, 60);
  const fetcher = compute("Fetchers\n(politeness)", 380, 220, 150, 70);
  const dns = network("DNS cache", 380, 360, 130, 50);
  const store = storage("Content\nstore", 590, 120, 130, 60);
  const parse = compute("Parser /\nlinks", 590, 250, 130, 60);
  const seen = cache("URL seen?\nBloom+DB", 790, 250, 150, 70);
  const idx = db("Index /\nmetadata", 790, 120, 140, 65);
  els.push(...flatten(seed, fq, fetcher, dns, store, parse, seen, idx));
  els.push(...edge(seed, fq));
  els.push(...edge(fq, fetcher));
  els.push(...edge(fetcher, dns, "", { dashed: true }));
  els.push(...edge(fetcher, store, "raw"));
  els.push(...edge(fetcher, parse));
  els.push(...edge(parse, seen, "new?"));
  els.push(...edge(seen, fq, "enqueue", { dashed: true }));
  els.push(...edge(parse, idx));
  els.push(
    ...note("robots.txt · per-host politeness · Bloom for seen · prioritize frontier", 40, 460)
  );
  return doc(els);
}

function ticketBooking() {
  const els = [...titleText("Ticket Booking Concurrency"), ...subtitle()];
  const user = client("User", 40, 220, 110, 56);
  const api = compute("Booking API", 190, 220, 140, 56);
  const seat = cache("Seat locks\n(Redis TTL)", 380, 100, 160, 70);
  const inv = db("Inventory\nrows/versions", 380, 260, 170, 70);
  const pay = external("Payments", 610, 220, 130, 50);
  const conf = compute("Confirm /\nissue ticket", 790, 220, 160, 60);
  const q = queue("Timeout /\nrelease", 610, 370, 140, 55);
  els.push(...flatten(user, api, seat, inv, pay, conf, q));
  els.push(...edge(user, api, "hold"));
  els.push(...edge(api, seat, "SET NX+TTL"));
  els.push(...edge(api, inv, "version check"));
  els.push(...edge(api, pay, "charge"));
  els.push(...edge(pay, conf, "ok"));
  els.push(...edge(q, seat, "expire→free", { dashed: true }));
  els.push(
    ...note(
      "Avoid oversell: lock or conditional UPDATE · TTL holds · compensate on pay fail",
      40,
      460
    )
  );
  return doc(els);
}

function payments() {
  const els = [...titleText("Payment Idempotency"), ...subtitle()];
  const c = client("Client\nIdempotency-Key", 40, 220, 160, 70);
  const api = compute("Payments API", 250, 230, 140, 56);
  const store = cache("Idempotency\nstore", 450, 100, 160, 70);
  const ledger = db("Ledger /\nintents", 450, 270, 150, 70);
  const psp = external("PSP\n(Stripe etc.)", 680, 230, 140, 60);
  const wh = queue("Webhook Q", 880, 230, 130, 50);
  els.push(...flatten(c, api, store, ledger, psp, wh));
  els.push(...edge(c, api, "POST /charge"));
  els.push(...edge(api, store, "lookup/save"));
  els.push(...edge(api, ledger, "intent"));
  els.push(...edge(api, psp, "create"));
  els.push(...edge(psp, wh, "events"));
  els.push(...edge(wh, api, "reconcile", { dashed: true }));
  els.push(
    ...note(
      "Same key → same response · no double charge · webhook reorder → intent state machine",
      40,
      420
    )
  );
  return doc(els);
}

function interviewFlow() {
  const els = [...titleText("Interview Flow: Clarify → HLD"), ...subtitle()];
  const s1 = client("1. Clarify\n5–8 min\nusers · scale · NFRs", 40, 180, 220, 110);
  const s2 = compute("2. Capacity\n5 min\nQPS · storage · BW", 300, 180, 220, 110);
  const s3 = network("3. High-level\n10–15 min\nboxes + APIs", 560, 180, 220, 110);
  const s4 = cache("4. Deep dive\n10 min\ntradeoffs · SLO", 820, 180, 220, 110);
  els.push(...flatten(s1, s2, s3, s4));
  els.push(...edge(s1, s2));
  els.push(...edge(s2, s3));
  els.push(...edge(s3, s4));
  els.push(
    ...note(
      "Speak while drawing · check in after each step · NFRs top-right · never invent requirements — ask",
      40,
      360
    )
  );
  return doc(els);
}

function whiteboardTemplate() {
  const els = [...titleText("Whiteboard Starter Template"), ...subtitle()];
  els.push(...groupFrame(40, 100, 170, 200, "Clients"));
  els.push(...client("Web /\nMobile", 60, 160, 130, 70).els);
  els.push(...groupFrame(230, 100, 190, 200, "Edge"));
  els.push(...network("DNS / CDN\n/ LB", 250, 160, 150, 70).els);
  els.push(...groupFrame(440, 100, 280, 200, "Services"));
  els.push(...compute("API /\ncore services", 480, 160, 200, 80).els);
  els.push(...groupFrame(740, 100, 340, 200, "Data"));
  els.push(...cache("Cache", 760, 130, 110, 50).els);
  els.push(...db("DB", 900, 120, 110, 60).els);
  els.push(...queue("Queue", 760, 230, 110, 45).els);
  els.push(...storage("Objects", 900, 230, 110, 45).els);

  els.push(...groupFrame(40, 340, 520, 130, "NFR box (top-right habit)"));
  els.push(
    ...note(
      "Latency p99 · availability · consistency · scale\nWrite numbers under title · check in with interviewer",
      60,
      380,
      14
    )
  );
  els.push(
    ...note(
      "Left → right data flow · leave space for deep-dive callouts under the main path",
      40,
      510
    )
  );
  return doc(els);
}

// Additional diagram builders — appended into gen_excalidraw_diagrams.mjs before DIAGRAMS registry

function osiModel() {
  const els = [...titleText("OSI Model (Interview View)"), ...subtitle()];
  const layers = [
    { name: "7 Application\nHTTP, gRPC, DNS apps", pal: CLIENT },
    { name: "6 Presentation\nencoding / TLS data", pal: NETWORK },
    { name: "5 Session\nsessions / dialogs", pal: HIGHLIGHT },
    { name: "4 Transport\nTCP / UDP  (L4 LB)", pal: COMPUTE },
    { name: "3 Network\nIP routing", pal: CACHE },
    { name: "2 Data Link\nframes / MAC", pal: QUEUE },
    { name: "1 Physical\ncables / bits", pal: EXTERNAL },
  ];
  layers.forEach((L, i) => {
    const b = box(L.name, 120, 90 + i * 58, 420, 50, L.pal, 14);
    els.push(...b.els);
  });
  els.push(...groupFrame(580, 90, 420, 380, "Why interviews care"));
  els.push(
    ...note(
      "• L4 LB = TCP/UDP ports & IPs\n• L7 LB = HTTP path/host/headers\n• TLS often discussed near\n  presentation / app edge\n• You rarely design L1–L2,\n  but the vocabulary matters",
      600,
      140,
      15
    )
  );
  els.push(
    ...note("Stack: app talks \"down\"; wires talk \"up\"", 120, 510, 14)
  );
  return doc(els);
}

function tcpVsUdp() {
  const els = [...titleText("TCP vs UDP"), ...subtitle()];
  els.push(...comparePanel(40, 90, 480, 380, "TCP — connection + reliability", false));
  els.push(...comparePanel(560, 90, 480, 380, "UDP — connectionless + speed", true));
  const c1 = client("Client", 80, 180, 110, 50);
  const s1 = compute("Server", 340, 180, 110, 50);
  els.push(...flatten(c1, s1));
  els.push(...edge(c1, s1, "handshake"));
  els.push(...edge(s1, c1, "acks / order", { dashed: true }));
  els.push(
    ...note(
      "• Ordered, reliable streams\n• Retransmit lost packets\n• Congestion control\n• Used by HTTP, most DBs\n• Higher overhead",
      80,
      280,
      14
    )
  );
  const c2 = client("Client", 600, 180, 110, 50);
  const s2 = compute("Server", 860, 180, 110, 50);
  els.push(...flatten(c2, s2));
  els.push(...edge(c2, s2, "datagrams"));
  els.push(
    ...note(
      "• No connection setup\n• No delivery guarantee\n• App handles loss\n• DNS, VoIP, games, QUIC base\n• Lower latency",
      600,
      280,
      14
    )
  );
  els.push(
    ...note(
      "Pick TCP when correctness of bytes matters; UDP when late data is worse than lost data.",
      40,
      500
    )
  );
  return doc(els);
}

function clusteringActiveActivePassive() {
  const els = [...titleText("Clustering: Active-Active vs Active-Passive"), ...subtitle()];
  els.push(...groupFrame(40, 90, 500, 320, "Active-Active"));
  const lb1 = network("Load balancer", 200, 130, 160, 50);
  const n1 = compute("Node A\nserving", 80, 230, 140, 70);
  const n2 = compute("Node B\nserving", 320, 230, 140, 70);
  els.push(...flatten(lb1, n1, n2));
  els.push(...edge(lb1, n1));
  els.push(...edge(lb1, n2));
  els.push(...note("Both nodes take traffic\n= capacity + HA", 80, 330, 14));

  els.push(...groupFrame(560, 90, 500, 320, "Active-Passive"));
  const lb2 = network("VIP / failover", 720, 130, 160, 50);
  const n3 = compute("Node A\nACTIVE", 600, 230, 140, 70);
  const n4 = compute("Node B\nSTANDBY", 840, 230, 140, 70);
  els.push(...flatten(lb2, n3, n4));
  els.push(...edge(lb2, n3));
  els.push(...edge(lb2, n4, "promote on fail", { dashed: true }));
  els.push(...note("Standby idle until failover\n= simpler consistency", 600, 330, 14));

  els.push(
    ...note(
      "Cluster ≠ load balancer: cluster nodes cooperate; LB spreads requests to unaware backends. Often used together.",
      40,
      440
    )
  );
  return doc(els);
}

function storageFileBlockObject() {
  const els = [...titleText("File vs Block vs Object Storage"), ...subtitle()];
  const f = storage("File / NAS\npaths & folders", 60, 160, 280, 100);
  const b = storage("Block\nvolumes / disks", 380, 160, 280, 100);
  const o = storage("Object\nbuckets + keys", 700, 160, 280, 100);
  els.push(...flatten(f, b, o));
  els.push(
    ...note(
      "File: shared home dirs, lift-and-shift apps\nBlock: DB disks, VMs, low-level I/O\nObject: images, video, backups, data lakes",
      60,
      300,
      15
    )
  );
  els.push(
    ...note(
      "HDFS idea: split huge files into blocks, replicate across commodity nodes for throughput + fault tolerance.",
      60,
      400,
      14
    )
  );
  return doc(els);
}

function sagaVs2pc() {
  const els = [...titleText("Distributed Tx: 2PC vs Sagas"), ...subtitle()];
  els.push(...comparePanel(40, 90, 480, 400, "Two-phase commit (2PC)", true));
  const coord = highlight("Coordinator", 180, 160, 160, 50);
  const p1 = db("DB A", 80, 280, 120, 60);
  const p2 = db("DB B", 220, 280, 120, 60);
  const p3 = db("DB C", 360, 280, 120, 60);
  els.push(...flatten(coord, p1, p2, p3));
  els.push(...edge(coord, p1, "prepare"));
  els.push(...edge(coord, p2, "prepare"));
  els.push(...edge(coord, p3, "prepare"));
  els.push(...note("Then commit/abort all\nBlocking if coordinator dies", 80, 370, 13));

  els.push(...comparePanel(560, 90, 500, 400, "Saga (practical interview answer)", false));
  const o1 = compute("Reserve\ninventory", 590, 160, 140, 55);
  const o2 = compute("Charge\npayment", 760, 160, 140, 55);
  const o3 = compute("Ship\norder", 930, 160, 120, 55);
  els.push(...flatten(o1, o2, o3));
  els.push(...edge(o1, o2, "next"));
  els.push(...edge(o2, o3, "next"));
  const c1 = queue("Compensate\nrelease stock", 590, 280, 160, 55);
  const c2 = queue("Compensate\nrefund", 780, 280, 140, 55);
  els.push(...flatten(c1, c2));
  els.push(...edge(o2, c1, "on fail", { dashed: true }));
  els.push(...edge(o3, c2, "on fail", { dashed: true }));
  els.push(
    ...note(
      "Local ACID steps + compensations\nChoreography (events) or\nOrchestration (conductor)",
      590,
      370,
      13
    )
  );
  return doc(els);
}

function nTier() {
  const els = [...titleText("N-Tier Architecture"), ...subtitle()];
  const pres = client("Presentation tier\nBrowser / mobile / UI", 300, 100, 420, 70);
  const app = compute("Application tier\nBusiness logic / APIs", 300, 220, 420, 70);
  const data = db("Data tier\nDatabases / caches / files", 300, 340, 420, 80);
  els.push(...flatten(pres, app, data));
  els.push(...edge(pres, app, "HTTPS"));
  els.push(...edge(app, data, "SQL / drivers"));
  els.push(
    ...note(
      "Classic split: UI ≠ logic ≠ storage. Microservices still often map to these concerns across many services.",
      60,
      460
    )
  );
  return doc(els);
}

function cqrs() {
  const els = [...titleText("CQRS — Separate Read & Write Models"), ...subtitle()];
  const c = client("Clients", 60, 220, 110, 55);
  const api = compute("API", 220, 220, 100, 55);
  const wr = compute("Write model\ncommands", 380, 120, 180, 70);
  const rd = compute("Read model\nqueries", 380, 300, 180, 70);
  const wdb = db("Write DB\nnormalized", 620, 110, 160, 80);
  const rdb = db("Read DB /\ncache / search", 620, 290, 160, 80);
  const bus = queue("Events", 420, 220, 100, 50);
  els.push(...flatten(c, api, wr, rd, wdb, rdb, bus));
  els.push(...edge(c, api));
  els.push(...edge(api, wr, "commands"));
  els.push(...edge(api, rd, "queries"));
  els.push(...edge(wr, wdb));
  els.push(...edge(rd, rdb));
  els.push(...edge(wr, bus, "publish"));
  els.push(...edge(bus, rdb, "project", { dashed: true }));
  els.push(
    ...note(
      "Writes optimized for integrity; reads optimized for screens. Often pairs with event sourcing — not mandatory.",
      40,
      420
    )
  );
  return doc(els);
}

function geohashQuadtree() {
  const els = [...titleText("Geohash & Quadtrees (Nearby Search)"), ...subtitle()];
  els.push(...groupFrame(40, 90, 480, 360, "Geohash grid"));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = box(
        `cell\n${r}${c}`,
        80 + c * 130,
        140 + r * 90,
        110,
        70,
        c === 1 && r === 1 ? HIGHLIGHT : CACHE,
        13
      );
      els.push(...cell.els);
    }
  }
  els.push(...note("Encode lat/lng → string prefix\nNearby = same/neighbor prefixes", 80, 410, 13));

  els.push(...groupFrame(560, 90, 480, 360, "Quadtree"));
  const root = box("World", 700, 130, 160, 50, NETWORK, 14);
  const q1 = box("NW", 600, 220, 100, 45, COMPUTE, 13);
  const q2 = box("NE", 760, 220, 100, 45, COMPUTE, 13);
  const q3 = box("SW", 600, 300, 100, 45, COMPUTE, 13);
  const q4 = box("SE hot", 760, 300, 100, 45, HIGHLIGHT, 13);
  const q4a = box("split", 880, 360, 90, 40, QUEUE, 12);
  els.push(...flatten(root, q1, q2, q3, q4, q4a));
  els.push(...edge(root, q1));
  els.push(...edge(root, q2));
  els.push(...edge(root, q3));
  els.push(...edge(root, q4));
  els.push(...edge(q4, q4a, "dense"));
  els.push(...note("Subdivide busy squares only\nAdaptive to density", 600, 410, 13));
  return doc(els);
}

function redundantLoadBalancer() {
  const els = [...titleText("Redundant Load Balancers (No SPOF)"), ...subtitle()];
  const c = client("Clients", 60, 240, 110, 55);
  const vip = network("VIP /\nDNS", 220, 240, 120, 60);
  const active = network("LB Active", 400, 140, 140, 60);
  const passive = network("LB Passive\nstandby", 400, 320, 140, 60);
  const a1 = compute("App 1", 620, 120, 110, 50);
  const a2 = compute("App 2", 620, 200, 110, 50);
  const a3 = compute("App 3", 620, 280, 110, 50);
  const a4 = compute("App 4", 620, 360, 110, 50);
  els.push(...flatten(c, vip, active, passive, a1, a2, a3, a4));
  els.push(...edge(c, vip));
  els.push(...edge(vip, active));
  els.push(...edge(vip, passive, "failover", { dashed: true }));
  els.push(...edge(active, a1));
  els.push(...edge(active, a2));
  els.push(...edge(active, a3));
  els.push(...edge(active, a4));
  els.push(
    ...note(
      "Health-check between LBs; on active death, passive takes VIP. Multi-AZ active-active LBs also common in cloud.",
      40,
      450
    )
  );
  return doc(els);
}

function cacheWritePolicies() {
  const els = [...titleText("Cache Write Policies"), ...subtitle()];
  // Write-through
  els.push(...groupFrame(40, 90, 320, 280, "Write-through"));
  const a1 = compute("App", 60, 150, 90, 45);
  const c1 = cache("Cache", 170, 150, 90, 45);
  const d1 = db("DB", 280, 145, 60, 55);
  els.push(...flatten(a1, c1, d1));
  els.push(...edge(a1, c1));
  els.push(...edge(c1, d1, "sync"));
  els.push(...note("Write hits both\nConsistent, slower writes", 60, 230, 13));

  // Write-around
  els.push(...groupFrame(380, 90, 320, 280, "Write-around"));
  const a2 = compute("App", 400, 150, 90, 45);
  const c2 = cache("Cache", 510, 150, 90, 45);
  const d2 = db("DB", 620, 145, 60, 55);
  els.push(...flatten(a2, c2, d2));
  els.push(...edge(a2, d2, "write"));
  els.push(...edge(a2, c2, "read miss", { dashed: true }));
  els.push(...note("Skip cache on write\nAvoids write pollution", 400, 230, 13));

  // Write-back
  els.push(...groupFrame(720, 90, 320, 280, "Write-back / behind"));
  const a3 = compute("App", 740, 150, 90, 45);
  const c3 = cache("Cache", 850, 150, 90, 45);
  const d3 = db("DB", 960, 200, 60, 55);
  els.push(...flatten(a3, c3, d3));
  els.push(...edge(a3, c3, "ack"));
  els.push(...edge(c3, d3, "async", { dashed: true }));
  els.push(...note("Fast writes; crash can\nlose unflushed data", 740, 230, 13));

  els.push(
    ...note(
      "Eviction reminder: FIFO · LIFO · LRU · MRU · LFU · Random — LRU is the interview default unless access patterns say otherwise.",
      40,
      400
    )
  );
  return doc(els);
}


// ─── registry ─────────────────────────────────────────────────────
const DIAGRAMS = {
  "osi-model": osiModel,
  "tcp-vs-udp": tcpVsUdp,
  "clustering-active-active-passive": clusteringActiveActivePassive,
  "storage-file-block-object": storageFileBlockObject,
  "saga-vs-2pc": sagaVs2pc,
  "n-tier": nTier,
  "cqrs": cqrs,
  "geohash-quadtree": geohashQuadtree,
  "redundant-load-balancer": redundantLoadBalancer,
  "cache-write-policies": cacheWritePolicies,
  "api-aggregation": apiAggregation,
  "vertical-vs-horizontal-scale": verticalVsHorizontal,
  "cache-aside-vs-direct": cacheAsideVsDirect,
  "microservices-vs-monolith": microservicesVsMonolith,
  "websocket-vs-polling": websocketVsPolling,
  messaging,
  "dns-resolution": dnsResolution,
  "load-balancing": loadBalancing,
  "caching-strategies": cachingStrategies,
  "sharding-consistent-hash": shardingConsistentHash,
  "replication-failover": replicationFailover,
  "cap-pacelc": capPacelc,
  "rate-limiting": rateLimiting,
  "bloom-filter": bloomFilter,
  "circuit-breaker": circuitBreaker,
  observability,
  "url-shortener": urlShortener,
  "news-feed": newsFeed,
  "chat-messaging": chatMessaging,
  "uber-dispatch": uberDispatch,
  "video-streaming": videoStreaming,
  dropbox,
  "notification-system": notificationSystem,
  "nearby-places": nearbyPlaces,
  "group-chat": groupChat,
  "ecommerce-checkout": ecommerceCheckout,
  "recommendation-feed": recommendationFeed,
  "search-inverted-index": searchInvertedIndex,
  typeahead,
  "web-crawler": webCrawler,
  "ticket-booking": ticketBooking,
  payments,
  "interview-flow": interviewFlow,
  "whiteboard-template": whiteboardTemplate,
};

function run() {
  mkdirSync(EXCAL_DIR, { recursive: true });
  mkdirSync(PNG_DIR, { recursive: true });

  const names = Object.keys(DIAGRAMS);
  console.log(`Generating ${names.length} Excalidraw diagrams…`);

  for (const name of names) {
    _seq = 1;
    const document = DIAGRAMS[name]();
    const excalPath = join(EXCAL_DIR, `${name}.excalidraw`);
    writeFileSync(excalPath, JSON.stringify(document, null, 2));
    console.log(`  wrote ${name}.excalidraw (${document.elements.length} elements)`);
  }

  console.log("\nExporting PNGs at scale 2…");
  let ok = 0;
  for (const name of names) {
    const excalPath = join(EXCAL_DIR, `${name}.excalidraw`);
    const pngPath = join(PNG_DIR, `${name}.png`);
    try {
      execSync(
        `npx excalidraw-export "${excalPath}" --scale 2 -o "${pngPath}"`,
        { cwd: ROOT, stdio: "pipe", timeout: 60000 }
      );
      const st = statSync(pngPath);
      console.log(`  ✓ ${name}.png (${Math.round(st.size / 1024)} KB)`);
      ok++;
    } catch (err) {
      const msg = err.stderr ? err.stderr.toString() : err.message;
      console.error(`  ✗ ${name}: ${msg}`);
      throw err;
    }
  }
  console.log(`\nDone. ${ok}/${names.length} diagrams → diagrams/excalidraw + diagrams/png`);
}

run();
