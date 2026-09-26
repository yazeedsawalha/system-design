/**
 * Tiny diagram engine: authored coordinates in, clean SVG out.
 * Design system: Inter type, one semantic color per component family,
 * icon tiles, pill labels that sit on top of edges (never collide), numbered steps.
 */

export const T = {
  ink: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  faint: "#94A3B8",
  line: "#CBD5E1",
  hair: "#E2E8F0",
  paper: "#FFFFFF",
  canvas: "#F8FAFC",
};

// Semantic tones: [accent, soft background, border]
export const TONES = {
  client: ["#475569", "#F1F5F9", "#CBD5E1"],
  edge: ["#7C3AED", "#F5F3FF", "#DDD6FE"],
  compute: ["#2563EB", "#EFF6FF", "#BFDBFE"],
  cache: ["#D97706", "#FFFBEB", "#FDE68A"],
  data: ["#059669", "#ECFDF5", "#A7F3D0"],
  queue: ["#DB2777", "#FDF2F8", "#FBCFE8"],
  storage: ["#0891B2", "#ECFEFF", "#A5F3FC"],
  search: ["#4F46E5", "#EEF2FF", "#C7D2FE"],
  external: ["#64748B", "#F8FAFC", "#CBD5E1"],
  good: ["#16A34A", "#F0FDF4", "#BBF7D0"],
  bad: ["#DC2626", "#FEF2F2", "#FECACA"],
  warn: ["#D97706", "#FFFBEB", "#FDE68A"],
  info: ["#2563EB", "#EFF6FF", "#BFDBFE"],
  neutral: ["#475569", "#F8FAFC", "#E2E8F0"],
  ink: ["#0F172A", "#F1F5F9", "#CBD5E1"],
};

// kind -> [tone, icon]
const KINDS = {
  user: ["client", "user"],
  users: ["client", "users"],
  mobile: ["client", "mobile"],
  browser: ["client", "browser"],
  dns: ["edge", "globe"],
  cdn: ["edge", "cdn"],
  lb: ["edge", "split"],
  gateway: ["edge", "gateway"],
  proxy: ["edge", "shield"],
  firewall: ["bad", "shield"],
  service: ["compute", "server"],
  worker: ["compute", "gear"],
  function: ["compute", "bolt"],
  container: ["compute", "box"],
  ws: ["compute", "plug"],
  cache: ["cache", "bolt"],
  db: ["data", "db"],
  replica: ["data", "db"],
  queue: ["queue", "queue"],
  stream: ["queue", "stream"],
  storage: ["storage", "bucket"],
  file: ["storage", "file"],
  search: ["search", "search"],
  ml: ["search", "spark"],
  external: ["external", "cloud"],
  auth: ["edge", "key"],
  monitor: ["neutral", "chart"],
  clock: ["neutral", "clock"],
  lock: ["warn", "lock"],
  mail: ["queue", "mail"],
  bell: ["queue", "bell"],
  map: ["data", "pin"],
  coord: ["neutral", "crown"],
  money: ["good", "card"],
  video: ["storage", "play"],
  doc: ["neutral", "file"],
  check: ["good", "check"],
  x: ["bad", "x"],
  warn: ["warn", "alert"],
  idea: ["cache", "idea"],
  code: ["ink", "code"],
  region: ["neutral", "globe"],
};

// 24x24 stroke icons (lucide-style, original paths)
const ICONS = {
  user: `<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>`,
  users: `<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.8 3-6 6.5-6s6.5 2.2 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14c2.2.6 3.5 2.6 3.5 6"/>`,
  mobile: `<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/>`,
  browser: `<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M2.5 9h19"/><circle cx="6" cy="6.5" r=".6"/><circle cx="8.5" cy="6.5" r=".6"/>`,
  globe: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>`,
  cdn: `<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5 4 4 0 0 1 17.5 18z"/><path d="M9 14h6M12 11v6"/>`,
  split: `<path d="M3 12h6"/><path d="M9 12l5-6h7"/><path d="M9 12l5 6h7"/><path d="M18 3l3 3-3 3"/><path d="M18 15l3 3-3 3"/>`,
  gateway: `<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M12 4v16"/><path d="M7 9l-2 3 2 3"/><path d="M17 9l2 3-2 3"/>`,
  shield: `<path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>`,
  server: `<rect x="3" y="3.5" width="18" height="7" rx="2"/><rect x="3" y="13.5" width="18" height="7" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>`,
  bolt: `<path d="M13 2.5L4.5 13.5H12l-1 8 8.5-11H12z"/>`,
  box: `<path d="M12 2.5l8.5 4.5v10L12 21.5 3.5 17V7z"/><path d="M3.5 7L12 11.5 20.5 7M12 11.5v10"/>`,
  plug: `<path d="M9 2.5v5M15 2.5v5"/><path d="M6 7.5h12v3a6 6 0 0 1-12 0z"/><path d="M12 16.5v5"/>`,
  db: `<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>`,
  queue: `<rect x="2.5" y="7" width="4" height="10" rx="1"/><rect x="8.5" y="7" width="4" height="10" rx="1"/><rect x="14.5" y="7" width="4" height="10" rx="1"/><path d="M20.5 12h1.5"/>`,
  stream: `<path d="M2.5 7c3 0 3-2 6-2s3 2 6 2 3-2 6-2"/><path d="M2.5 12c3 0 3-2 6-2s3 2 6 2 3-2 6-2"/><path d="M2.5 17c3 0 3-2 6-2s3 2 6 2 3-2 6-2"/>`,
  bucket: `<path d="M3.5 6h17l-2 14a2 2 0 0 1-2 1.5h-9a2 2 0 0 1-2-1.5z"/><ellipse cx="12" cy="6" rx="8.5" ry="2.5"/>`,
  file: `<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M8 13h8M8 17h5"/>`,
  search: `<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>`,
  spark: `<path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23"/>`,
  cloud: `<path d="M7 19a5 5 0 0 1-.7-10A6.5 6.5 0 0 1 19 10a4.5 4.5 0 0 1-.5 9z"/>`,
  key: `<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M17 6l3 3M14.5 8.5l2.5 2.5"/>`,
  chart: `<path d="M3.5 3.5v17h17"/><path d="M7.5 15l4-5 3.5 3 5-7"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>`,
  lock: `<rect x="4.5" y="10.5" width="15" height="11" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>`,
  mail: `<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/>`,
  bell: `<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>`,
  pin: `<path d="M12 21.5s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9.5" r="2.5"/>`,
  crown: `<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>`,
  card: `<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>`,
  play: `<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M10 9v6l5-3z"/>`,
  check: `<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9.5"/>`,
  x: `<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>`,
  alert: `<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>`,
  idea: `<path d="M9 18h6M10 21.5h4"/><path d="M8.5 15c-1.8-1.3-3-3.4-3-5.7a6.5 6.5 0 0 1 13 0c0 2.3-1.2 4.4-3 5.7z"/>`,
  code: `<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>`,
};

export function icon(name, x, y, size, color, sw = 1.8) {
  const s = size / 24;
  return `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${sw / s}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.box}</g>`;
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Inter advance widths (em) — close enough for layout; renderer re-fits pills.
export function textWidth(str, size = 14, weight = 500) {
  const k = weight >= 700 ? 0.56 : weight >= 600 ? 0.535 : 0.51;
  let w = 0;
  for (const ch of String(str)) {
    if ("il.,:;|'!".includes(ch)) w += 0.28;
    else if ("mwMW".includes(ch)) w += 0.85;
    else if (ch === " ") w += 0.28;
    else if (/[A-Z]/.test(ch)) w += 0.64;
    else if (/[0-9]/.test(ch)) w += 0.57;
    else w += k;
  }
  return w * size;
}

export function wrap(str, maxW, size = 14, weight = 400) {
  const out = [];
  for (const para of String(str).split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const t = line ? line + " " + word : word;
      if (textWidth(t, size, weight) > maxW && line) {
        out.push(line);
        line = word;
      } else line = t;
    }
    out.push(line);
  }
  return out;
}

function textLines(lines, x, y, { size = 14, weight = 400, color = T.body, lh = 1.45, anchor = "start", mono = false } = {}) {
  const fam = mono ? `font-family="JetBrains Mono"` : "";
  return lines
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * size * lh}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" ${fam}>${rich(l)}</text>`
    )
    .join("");
}

// **bold** inline support
function rich(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, `<tspan font-weight="700" fill="${T.ink}">$1</tspan>`);
}

export class Diagram {
  constructor({ w = 1400, h = 760, title, subtitle, takeaway, eyebrow, bare = true }) {
    this.bare = bare; // bare = no title block, no footer bar (content only)
    this.w = w;
    this.h = h;
    this.title = title;
    this.subtitle = subtitle;
    this.takeaway = takeaway;
    this.eyebrow = eyebrow;
    this.nodes = {};
    this.back = [];
    this.mid = [];
    this.front = [];
    this.top = 132; // content starts here
  }

  // ---------- containers ----------
  group({ x, y, w, h, label, tone = "neutral", dashed = true, fill = true }) {
    const [a, bg, br] = TONES[tone];
    this.back.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill ? bg : "none"}" fill-opacity="${fill ? 0.55 : 0}" stroke="${br}" stroke-width="1.5" ${dashed ? `stroke-dasharray="6 5"` : ""}/>`
    );
    if (label)
      this.back.push(
        `<text x="${x + 16}" y="${y + 24}" font-size="12" font-weight="700" letter-spacing="0.08em" fill="${a}">${esc(label.toUpperCase())}</text>`
      );
    return this;
  }

  // Simple frame: soft tinted border, title as plain coloured text (no header bar)
  frame({ x, y, w, h, title, tone = "neutral" }) {
    const [a, bg, br] = TONES[tone];
    this.back.push(`<rect class="frame" x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${T.paper}" stroke="${br}" stroke-width="2"/>`);
    if (title) this.back.push(`<text x="${x + 28}" y="${y + 44}" font-size="20" font-weight="800" letter-spacing="-0.01em" fill="${a}">${esc(title)}</text>`);
    return this;
  }

  // Section box: soft tinted border + title as plain coloured text (no header bar, no tag)
  panel({ x, y, w, h, title, tone = "neutral" }) {
    const [a, bg, br] = TONES[tone];
    this.back.push(
      `<rect class="frame" x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${T.paper}" stroke="${br}" stroke-width="2"/>`,
      `<text x="${x + 24}" y="${y + 34}" font-size="17" font-weight="800" letter-spacing="-0.01em" fill="${a}">${esc(title)}</text>`
    );
    return this;
  }

  // ---------- nodes ----------
  node({ id, x, y, w = 210, h = 68, kind = "service", title, sub, tone, icon: ic, emphasis = false, ghost = false }) {
    const [kt, ki] = KINDS[kind] || KINDS.service;
    const [a, bg, br] = TONES[tone || kt];
    const n = { id, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
    if (id) this.nodes[id] = n;
    const compact = h < 56;
    const is = compact ? 30 : 40;
    const ix = x + 14;
    const iy = y + (h - is) / 2;
    const tx = ix + is + 12;
    const maxT = w - (tx - x) - 12;
    const tLines = wrap(title, maxT, 15, 600);
    const sLines = sub ? wrap(sub, maxT, 12.5, 400) : [];
    const blockH = tLines.length * 19 + sLines.length * 17;
    let ty = y + h / 2 - blockH / 2 + 14;
    this.mid.push(
      `<g${ghost ? ` opacity="0.45"` : ""}>`,
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${T.paper}" stroke="${emphasis ? a : br}" stroke-width="${emphasis ? 2.25 : 1.5}" filter="url(#sh)" ${ghost ? `stroke-dasharray="5 4"` : ""}/>`,
      `<rect x="${ix}" y="${iy}" width="${is}" height="${is}" rx="${compact ? 8 : 10}" fill="${bg}"/>`,
      icon(ic || ki, ix + is * 0.2, iy + is * 0.2, is * 0.6, a),
      textLines(tLines, tx, ty, { size: 15, weight: 600, color: T.ink, lh: 19 / 15 }),
      sLines.length ? textLines(sLines, tx, ty + tLines.length * 19 - 1, { size: 12.5, color: T.muted, lh: 17 / 12.5 }) : "",
      `</g>`
    );
    return n;
  }

  // simple centered box (no icon) — for stacks, cells, chips
  box({ id, x, y, w, h, text, sub, tone = "neutral", solid = false, size = 15, weight = 600, align = "middle", rx = 12 }) {
    const [a, bg, br] = TONES[tone];
    if (id) this.nodes[id] = { id, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
    const fill = solid ? a : bg;
    const fg = solid ? "#fff" : T.ink;
    const sfg = solid ? "rgba(255,255,255,.85)" : T.muted;
    const tLines = String(text).split("\n");
    const sLines = sub ? wrap(sub, w - 24, 12.5) : [];
    const blockH = tLines.length * size * 1.3 + sLines.length * 17;
    const ty = y + h / 2 - blockH / 2 + size * 0.95;
    const tx = align === "middle" ? x + w / 2 : x + 16;
    this.mid.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${solid ? a : br}" stroke-width="1.5"/>`,
      textLines(tLines, tx, ty, { size, weight, color: fg, lh: 1.3, anchor: align }),
      sLines.length ? textLines(sLines, tx, ty + tLines.length * size * 1.3 - 2, { size: 12.5, color: sfg, lh: 17 / 12.5, anchor: align }) : ""
    );
    return this.nodes[id];
  }

  diamond({ id, cx, cy, w = 190, h = 96, text, tone = "warn" }) {
    const [a, bg, br] = TONES[tone];
    this.nodes[id] = { id, x: cx - w / 2, y: cy - h / 2, w, h, cx, cy, diamond: true };
    const lines = String(text).split("\n");
    this.mid.push(
      `<path d="M${cx} ${cy - h / 2}L${cx + w / 2} ${cy}L${cx} ${cy + h / 2}L${cx - w / 2} ${cy}z" fill="${bg}" stroke="${a}" stroke-width="1.75" stroke-linejoin="round"/>`,
      textLines(lines, cx, cy - ((lines.length - 1) * 18) / 2 + 5, { size: 14, weight: 600, color: T.ink, lh: 18 / 14, anchor: "middle" })
    );
    return this;
  }

  cylinder({ id, x, y, w = 150, h = 110, title, sub, tone = "data" }) {
    const [a, bg, br] = TONES[tone];
    const ry = 12;
    this.nodes[id] = { id, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
    this.mid.push(
      `<path d="M${x} ${y + ry}v${h - 2 * ry}a${w / 2} ${ry} 0 0 0 ${w} 0v-${h - 2 * ry}" fill="${bg}" stroke="${a}" stroke-width="1.5"/>`,
      `<ellipse cx="${x + w / 2}" cy="${y + ry}" rx="${w / 2}" ry="${ry}" fill="${T.paper}" stroke="${a}" stroke-width="1.5"/>`,
      textLines([title], x + w / 2, y + h / 2 + 10, { size: 15, weight: 600, color: T.ink, anchor: "middle" }),
      sub ? textLines(wrap(sub, w - 16, 12), x + w / 2, y + h / 2 + 28, { size: 12, color: T.muted, anchor: "middle", lh: 1.3 }) : ""
    );
    return this;
  }

  // ---------- edges ----------
  anchor(n, side) {
    switch (side) {
      case "l": return [n.x, n.cy];
      case "r": return [n.x + n.w, n.cy];
      case "t": return [n.cx, n.y];
      case "b": return [n.cx, n.y + n.h];
    }
  }
  autoSides(a, b) {
    const dx = b.cx - a.cx, dy = b.cy - a.cy;
    const overlapX = Math.abs(dx) < (a.w + b.w) / 2 - 10;
    if (!overlapX && Math.abs(dx) * 0.6 >= Math.abs(dy) - (a.h + b.h) / 2) return dx > 0 ? ["r", "l"] : ["l", "r"];
    return dy > 0 ? ["b", "t"] : ["t", "b"];
  }

  /**
   * edge(from, to, opts)
   * from/to: node id or [x,y]
   * opts: label, step, dashed, tone, sides:"rl", route:"straight"|"h"|"v"|"hv"|"vh", via:[[x,y]], both, labelAt (0..1), dx/dy offsets for label
   */
  edge(from, to, o = {}) {
    const A = typeof from === "string" ? this.nodes[from] : null;
    const B = typeof to === "string" ? this.nodes[to] : null;
    if ((typeof from === "string" && !A) || (typeof to === "string" && !B)) throw new Error(`edge: missing node ${from}->${to}`);
    let [sa, sb] = o.sides ? o.sides.split("") : A && B ? this.autoSides(A, B) : ["r", "l"];
    let p1 = A ? this.anchor(A, sa) : from;
    let p2 = B ? this.anchor(B, sb) : to;
    if (o.off1) p1 = [p1[0] + (o.off1[0] || 0), p1[1] + (o.off1[1] || 0)];
    if (o.off2) p2 = [p2[0] + (o.off2[0] || 0), p2[1] + (o.off2[1] || 0)];
    let pts = [p1];
    if (o.via) pts.push(...o.via);
    else {
      const route = o.route || "auto";
      const horiz = "lr".includes(sa);
      if (route === "straight") {}
      else if (route === "auto") {
        if (horiz && Math.abs(p1[1] - p2[1]) > 1 && "lr".includes(sb)) {
          const mx = o.mid ?? (p1[0] + p2[0]) / 2;
          pts.push([mx, p1[1]], [mx, p2[1]]);
        } else if (!horiz && Math.abs(p1[0] - p2[0]) > 1 && "tb".includes(sb)) {
          const my = o.mid ?? (p1[1] + p2[1]) / 2;
          pts.push([p1[0], my], [p2[0], my]);
        } else if (horiz && "tb".includes(sb)) pts.push([p2[0], p1[1]]);
        else if (!horiz && "lr".includes(sb)) pts.push([p1[0], p2[1]]);
      }
    }
    pts.push(p2);
    const tone = o.tone ? TONES[o.tone][0] : o.hot ? "#2563EB" : "#94A3B8";
    const d = roundedPath(pts, 10);
    const mk = o.tone ? `a-${o.tone}` : o.hot ? "a-hot" : "a-def";
    this.used = this.used || new Set();
    this.used.add(JSON.stringify([mk, tone]));
    this.mid.unshift(
      `<path d="${d}" fill="none" stroke="${tone}" stroke-width="${o.hot || o.tone ? 2 : 1.75}" ${o.dashed ? `stroke-dasharray="6 5"` : ""} stroke-linecap="round" stroke-linejoin="round" ${o.noArrow ? "" : `marker-end="url(#${mk})"`} ${o.both ? `marker-start="url(#${mk})"` : ""}/>`
    );
    if (o.label || o.step) {
      const [lx, ly] = o.at || pointAlong(pts, o.labelAt ?? 0.5);
      this.pill(lx + (o.dx || 0), ly + (o.dy || 0), o.label, { step: o.step, tone: o.tone, mono: o.mono });
    }
    return this;
  }

  pill(x, y, label, { step, tone, mono, size = 12.5 } = {}) {
    const color = tone ? TONES[tone][0] : T.body;
    const lw = label ? textWidth(label, size, 500) * (mono ? 1.12 : 1) : 0;
    const sw = step ? 22 : 0;
    const gap = step && label ? 6 : 0;
    const padX = label ? 10 : 3;
    const w = lw + sw + gap + padX * 2;
    const h = 26;
    const x0 = x - w / 2;
    let s = `<g class="pill">`;
    s += `<rect x="${x0}" y="${y - h / 2}" width="${w}" height="${h}" rx="13" fill="${T.paper}" stroke="${T.hair}" stroke-width="1.25"/>`;
    if (step) {
      s += `<circle cx="${x0 + padX + 11}" cy="${y}" r="11" fill="${tone ? color : T.ink}"/><text x="${x0 + padX + 11}" y="${y + 4.2}" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">${step}</text>`;
    }
    if (label)
      s += `<text x="${x0 + padX + sw + gap}" y="${y + 4.4}" font-size="${size}" font-weight="500" fill="${color}" ${mono ? `font-family="JetBrains Mono"` : ""}>${esc(label)}</text>`;
    s += `</g>`;
    this.front.push(s);
    return this;
  }

  // ---------- text & callouts ----------
  text(x, y, str, opts = {}) {
    if (/^\s*[✓✗]/.test(String(str))) return 0; // pros/cons belong in the lesson text, not the picture
    const lines = opts.maxW ? wrap(str, opts.maxW, opts.size || 14, opts.weight || 400) : String(str).split("\n");
    this.front.push(textLines(lines, x, y, opts));
    return lines.length * (opts.size || 14) * (opts.lh || 1.45);
  }

  label(x, y, str, { tone = "neutral", size = 12, anchor = "start" } = {}) {
    this.front.push(
      `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" letter-spacing="0.08em" fill="${TONES[tone][0]}" text-anchor="${anchor}">${esc(String(str).toUpperCase())}</text>`
    );
    return this;
  }

  note({ x, y, w, title, lines = [], tone = "neutral", icon: ic, bullets = true, size = 13.5 }) {
    const [a, bg, br] = TONES[tone];
    const inner = w - 36;
    const wrapped = lines.map((l) => wrap(l, inner - (bullets ? 14 : 0), size));
    const bodyH = wrapped.reduce((s, l) => s + l.length * size * 1.5, 0) + (lines.length - 1) * 6;
    const h = 20 + (title ? 30 : 0) + bodyH + 14;
    this.back.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${bg}" stroke="${br}" stroke-width="1.25"/>`);
    let cy = y + 20;
    if (title) {
      const ix = ic ? 24 : 0;
      if (ic) this.front.push(icon(ic, x + 18, cy - 3, 18, a, 2));
      this.front.push(`<text x="${x + 18 + ix}" y="${cy + 11}" font-size="14" font-weight="700" fill="${a}">${esc(title)}</text>`);
      cy += 32;
    }
    for (const wl of wrapped) {
      if (bullets) this.front.push(`<circle cx="${x + 22}" cy="${cy + size * 0.62}" r="2.5" fill="${a}"/>`);
      this.front.push(textLines(wl, x + 18 + (bullets ? 14 : 0), cy + size, { size, color: T.body, lh: 1.5 }));
      cy += wl.length * size * 1.5 + 6;
    }
    return h;
  }

  stepCircle(x, y, n, tone = "ink", r = 14) {
    this.front.push(
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${TONES[tone][0]}"/><text x="${x}" y="${y + r * 0.34}" font-size="${r * 0.95}" font-weight="700" fill="#fff" text-anchor="middle">${n}</text>`
    );
    return this;
  }

  raw(svg, layer = "front") {
    this[layer].push(svg);
    return this;
  }

  // ---------- output ----------
  svg() {
    const W = this.w;
    if (this.bare) { this.title = this.subtitle = this.eyebrow = this.takeaway = null; }
    const footH = this.takeaway ? 64 : 0;
    const H = this.h + footH;
    const markers = [...(this.used || [])]
      .map((j) => {
        const [id, c] = JSON.parse(j);
        return `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M1 1.2L8.8 5 1 8.8z" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/></marker>`;
      })
      .join("");
    let head = "";
    let y = 52;
    if (this.eyebrow) {
      head += `<text x="48" y="${y}" font-size="12.5" font-weight="700" letter-spacing="0.12em" fill="#2563EB">${esc(this.eyebrow.toUpperCase())}</text>`;
      y += 34;
    } else y += 8;
    if (this.title) head += `<text x="48" y="${y}" font-size="30" font-weight="800" letter-spacing="-0.02em" fill="${T.ink}">${esc(this.title)}</text>`;
    if (this.subtitle) head += `<text x="48" y="${y + 30}" font-size="16" fill="${T.muted}">${rich(this.subtitle)}</text>`;
    let foot = "";
    if (this.takeaway) {
      const fy = this.h;
      foot += `<rect x="32" y="${fy}" width="${W - 64}" height="44" rx="12" fill="#0F172A"/>`;
      foot += icon("idea", 48, fy + 11, 22, "#FCD34D", 2);
      foot += `<text x="80" y="${fy + 27.5}" font-size="14.5" font-weight="500" fill="#E2E8F0"><tspan font-weight="700" fill="#FCD34D">Key idea  </tspan>${esc(this.takeaway)}</text>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter, -apple-system, Segoe UI, Helvetica, Arial, sans-serif">
<defs>${markers}
<filter id="sh" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#0F172A" flood-opacity="0.07"/></filter>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#E2E8F0"/></pattern>
</defs>
<rect x="-3000" y="-3000" width="${W + 6000}" height="${H + 6000}" fill="${T.canvas}"/>
<rect x="-3000" y="-3000" width="${W + 6000}" height="${H + 6000}" fill="url(#dots)"/>
<g id="content">
${head}
${this.back.join("\n")}
${this.mid.join("\n")}
${this.front.join("\n")}
${foot}
</g>
</svg>`;
  }
}

function roundedPath(pts, r) {
  if (pts.length < 3) return `M${pts[0][0]} ${pts[0][1]}L${pts[1][0]} ${pts[1][1]}`;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const l1 = Math.hypot(x1 - x0, y1 - y0), l2 = Math.hypot(x2 - x1, y2 - y1);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    if (rr < 0.5) { d += `L${x1} ${y1}`; continue; }
    const ax = x1 - ((x1 - x0) / l1) * rr, ay = y1 - ((y1 - y0) / l1) * rr;
    const bx = x1 + ((x2 - x1) / l2) * rr, by = y1 + ((y2 - y1) / l2) * rr;
    d += `L${ax} ${ay}Q${x1} ${y1} ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  return d + `L${last[0]} ${last[1]}`;
}

function pointAlong(pts, t) {
  // place on the longest segment when t = 0.5 (reads best), else by arc length
  if (t === 0.5 && pts.length > 2) {
    let best = 0, bi = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      if (l > best) { best = l; bi = i; }
    }
    return [(pts[bi][0] + pts[bi + 1][0]) / 2, (pts[bi][1] + pts[bi + 1][1]) / 2];
  }
  let total = 0;
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segs.push(l);
    total += l;
  }
  let target = total * t;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) {
      const k = target / segs[i];
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    target -= segs[i];
  }
  return pts[pts.length - 1];
}

// ---------- higher-level helpers ----------

/** Sequence diagram: actors across the top, messages down the page. */
export function sequence(d, { x, y, w, actors, messages, rowH = 46, actorW = 170 }) {
  const n = actors.length;
  const gap = (w - actorW) / (n - 1);
  const xs = actors.map((_, i) => x + actorW / 2 + i * gap);
  const bottom = y + 70 + messages.length * rowH + 10;
  actors.forEach((a, i) => {
    d.raw(`<line x1="${xs[i]}" y1="${y + 60}" x2="${xs[i]}" y2="${bottom}" stroke="${T.line}" stroke-width="1.5" stroke-dasharray="4 5"/>`, "back");
    d.node({ x: xs[i] - actorW / 2, y, w: actorW, h: 56, kind: a.kind, title: a.title, sub: a.sub });
  });
  messages.forEach((m, i) => {
    const my = y + 96 + i * rowH;
    if (m.note) {
      const [a, bg, br] = TONES[m.tone || "warn"];
      const x1 = xs[m.from], x2 = xs[m.to ?? m.from];
      const need = textWidth(m.note, 12.5, 600) + 32;
      let lx = Math.min(x1, x2) - 70, rx = Math.max(x1, x2) + 70;
      if (rx - lx < need) { const c = (lx + rx) / 2; lx = c - need / 2; rx = c + need / 2; }
      if (lx < x) { rx += x - lx; lx = x; }
      if (rx > x + w) { lx -= rx - (x + w); rx = x + w; }
      d.raw(`<rect x="${lx}" y="${my - 15}" width="${rx - lx}" height="30" rx="8" fill="${bg}" stroke="${br}"/>`, "front");
      d.raw(`<text x="${(lx + rx) / 2}" y="${my + 4.5}" font-size="12.5" font-weight="600" fill="${a}" text-anchor="middle">${esc(m.note)}</text>`, "front");
      return;
    }
    const x1 = xs[m.from], x2 = xs[m.to];
    if (m.from === m.to) {
      d.edge([x1, my - 10], [x1, my + 12], { via: [[x1 + 40, my - 10], [x1 + 40, my + 12]], tone: m.tone, dashed: m.dashed });
      d.raw(textLines([m.label], x1 + 50, my + 5, { size: 12.5, color: T.body, weight: 500 }), "front");
      return;
    }
    const dir = x2 > x1 ? 1 : -1;
    d.edge([x1 + dir * 4, my], [x2 - dir * 4, my], { route: "straight", tone: m.tone, dashed: m.dashed, label: m.label, step: m.step, at: [(x1 + x2) / 2, my - 0.5] });
  });
  return bottom;
}

/** Horizontal bar chart (log or linear). */
export function bars(d, { x, y, w, rows, rowH = 40, labelW = 300, unit = "", log = false, max }) {
  const vals = rows.map((r) => r.v);
  const mx = max ?? Math.max(...vals);
  const scale = (v) => (log ? Math.log10(v + 1) / Math.log10(mx + 1) : v / mx);
  rows.forEach((r, i) => {
    const yy = y + i * rowH;
    const bw = Math.max(4, (w - labelW - 150) * scale(r.v));
    const [a, bg] = TONES[r.tone || "info"];
    d.raw(textLines([r.label], x, yy + rowH / 2 + 5, { size: 14, weight: 500, color: T.ink }), "front");
    d.raw(`<rect x="${x + labelW}" y="${yy + 8}" width="${w - labelW - 150}" height="${rowH - 16}" rx="6" fill="#F1F5F9"/>`, "back");
    d.raw(`<rect x="${x + labelW}" y="${yy + 8}" width="${bw}" height="${rowH - 16}" rx="6" fill="${a}"/>`, "mid");
    d.raw(textLines([r.text ?? `${r.v}${unit}`], x + labelW + bw + 10, yy + rowH / 2 + 5, { size: 13.5, weight: 700, color: a }), "front");
  });
  return y + rows.length * rowH;
}

/** Table/grid of cells. cols: [{title,w}], rows: [[cell...]] where cell string or {t, tone} */
export function table(d, { x, y, cols, rows, rowH = 44, headH = 44, size = 13.5 }) {
  const W = cols.reduce((s, c) => s + c.w, 0);
  const H = headH + rows.length * rowH;
  d.raw(`<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="14" fill="${T.paper}" stroke="${T.hair}" stroke-width="1.5" filter="url(#sh)"/>`, "back");
  d.raw(`<path d="M${x} ${y + 14}a14 14 0 0 1 14-14h${W - 28}a14 14 0 0 1 14 14v${headH - 14}h-${W}z" fill="#0F172A"/>`, "back");
  let cx = x;
  cols.forEach((c) => {
    d.raw(textLines([c.title], cx + 16, y + headH / 2 + 5, { size: 13, weight: 700, color: "#F8FAFC" }), "front");
    cx += c.w;
  });
  rows.forEach((r, i) => {
    const ry = y + headH + i * rowH;
    if (i % 2 === 1) d.raw(`<rect x="${x + 1}" y="${ry}" width="${W - 2}" height="${rowH}" fill="#F8FAFC"/>`, "back");
    if (i > 0) d.raw(`<line x1="${x}" y1="${ry}" x2="${x + W}" y2="${ry}" stroke="${T.hair}"/>`, "back");
    let cx2 = x;
    r.forEach((cell, j) => {
      const c = typeof cell === "string" ? { t: cell } : cell;
      const lines = wrap(c.t, cols[j].w - 28, size, j === 0 ? 600 : 400);
      const ty = ry + rowH / 2 - ((lines.length - 1) * size * 1.35) / 2 + 5;
      if (c.tone) {
        const [a, bg] = TONES[c.tone];
        const tw = Math.min(cols[j].w - 24, textWidth(lines[0], size, 600) + 22);
        if (lines.length === 1) d.raw(`<rect x="${cx2 + 12}" y="${ry + rowH / 2 - 13}" width="${tw}" height="26" rx="13" fill="${bg}"/>`, "mid");
        d.raw(textLines(lines, cx2 + 23, ty, { size, weight: 600, color: a, lh: 1.35 }), "front");
      } else d.raw(textLines(lines, cx2 + 16, ty, { size, weight: j === 0 ? 600 : 400, color: j === 0 ? T.ink : T.body, lh: 1.35 }), "front");
      cx2 += cols[j].w;
    });
  });
  return y + H;
}
