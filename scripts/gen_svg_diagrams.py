#!/usr/bin/env python3
"""Generate polished Google/AWS-style SVG architecture diagrams for GitHub README inline rendering."""
from __future__ import annotations

import html
from pathlib import Path
from typing import List, Optional, Tuple

OUT = Path("/workspace/system-design-site/diagrams/svg")

# Palette (Google Cloud / AWS architecture style)
CLIENT = ("#E8F0FE", "#1A73E8")
NETWORK = ("#F3E8FD", "#A142F4")
COMPUTE = ("#FEF7E0", "#F9AB00")
CACHE = ("#E6F4EA", "#34A853")
DB = ("#FCE8E6", "#D93025")
STORAGE = ("#E6F4EA", "#188038")
QUEUE = ("#FFF8E1", "#F57C00")
EXTERNAL = ("#F1F3F4", "#5F6368")
TITLE_COLOR = "#202124"
SUB_COLOR = "#5F6368"
LEGEND_BORDER = "#DADCE0"
ARROW = "#5F6368"
WHITE = "#FFFFFF"


class SvgDiagram:
    def __init__(self, name: str, title: str, w: int = 1100, h: int = 640):
        self.name = name
        self.title = title
        self.w = w
        self.h = h
        self.parts: List[str] = []
        self._aid = 0
        self._boxes: dict = {}  # id -> (cx, cy, x, y, w, h) for edge routing
        self._add_chrome()

    def nid(self) -> str:
        self._aid += 1
        return f"n{self._aid}"

    def esc(self, s: str) -> str:
        return html.escape(s)

    def _add_chrome(self):
        # white background
        self.parts.append(
            f'<rect width="100%" height="100%" fill="{WHITE}"/>'
        )
        self.parts.append(
            f'<text x="36" y="36" font-family="Helvetica,Arial,sans-serif" font-size="18" '
            f'font-weight="700" fill="{TITLE_COLOR}">{self.esc(self.title)}</text>'
        )
        self.parts.append(
            f'<text x="36" y="56" font-family="Helvetica,Arial,sans-serif" font-size="11" '
            f'fill="{SUB_COLOR}">System Design Interview Guide</text>'
        )

    def box(
        self,
        label: str,
        x: float,
        y: float,
        w: float,
        h: float,
        fill: str,
        stroke: str,
        *,
        cylinder: bool = False,
        font_size: int = 12,
        bid: Optional[str] = None,
    ) -> str:
        bid = bid or self.nid()
        cx, cy = x + w / 2, y + h / 2
        self._boxes[bid] = (cx, cy, x, y, w, h)
        lines = label.split("\n")
        if cylinder:
            # simple cylinder: ellipse top + body + ellipse bottom
            ry = 10
            body_h = h - ry
            path = (
                f'M {x},{y + ry} '
                f'L {x},{y + body_h} '
                f'A {w/2},{ry} 0 0 0 {x+w},{y + body_h} '
                f'L {x+w},{y + ry} '
                f'A {w/2},{ry} 0 0 0 {x},{y + ry} Z'
            )
            self.parts.append(
                f'<path d="{path}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'
            )
            self.parts.append(
                f'<ellipse cx="{cx}" cy="{y + ry}" rx="{w/2}" ry="{ry}" '
                f'fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'
            )
            text_y0 = y + h / 2 - (len(lines) - 1) * (font_size + 2) / 2 + 4
        else:
            self.parts.append(
                f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" ry="10" '
                f'fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'
            )
            text_y0 = y + h / 2 - (len(lines) - 1) * (font_size + 2) / 2 + font_size / 3
        for i, line in enumerate(lines):
            ty = text_y0 + i * (font_size + 2)
            weight = "700" if i == 0 else "400"
            self.parts.append(
                f'<text x="{cx}" y="{ty}" text-anchor="middle" '
                f'font-family="Helvetica,Arial,sans-serif" font-size="{font_size}" '
                f'font-weight="{weight}" fill="{TITLE_COLOR}">{self.esc(line)}</text>'
            )
        return bid

    def note(self, label: str, x: float, y: float, w: float, h: float, size: int = 11):
        lines = label.split("\n")
        for i, line in enumerate(lines):
            self.parts.append(
                f'<text x="{x}" y="{y + 14 + i * (size + 4)}" '
                f'font-family="Helvetica,Arial,sans-serif" font-size="{size}" '
                f'fill="{SUB_COLOR}">{self.esc(line)}</text>'
            )

    def group(self, label: str, x: float, y: float, w: float, h: float):
        self.parts.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" ry="8" '
            f'fill="none" stroke="{LEGEND_BORDER}" stroke-width="1" '
            f'stroke-dasharray="6 4"/>'
        )
        self.parts.append(
            f'<text x="{x + 10}" y="{y + 16}" font-family="Helvetica,Arial,sans-serif" '
            f'font-size="11" fill="{SUB_COLOR}">{self.esc(label)}</text>'
        )

    def _anchor(self, bid: str, side: str) -> Tuple[float, float]:
        cx, cy, x, y, w, h = self._boxes[bid]
        if side == "right":
            return x + w, cy
        if side == "left":
            return x, cy
        if side == "top":
            return cx, y
        if side == "bottom":
            return cx, y + h
        return cx, cy

    def edge(
        self,
        src: str,
        tgt: str,
        label: str = "",
        *,
        dashed: bool = False,
        bidi: bool = False,
        via: Optional[List[Tuple[float, float]]] = None,
    ):
        """Draw arrow from src box to tgt box (left-to-right heuristic)."""
        scx, scy, sx, sy, sw, sh = self._boxes[src]
        tcx, tcy, tx, ty, tw, th = self._boxes[tgt]
        # choose sides
        dx = tcx - scx
        dy = tcy - scy
        if abs(dx) >= abs(dy):
            if dx >= 0:
                x1, y1 = self._anchor(src, "right")
                x2, y2 = self._anchor(tgt, "left")
            else:
                x1, y1 = self._anchor(src, "left")
                x2, y2 = self._anchor(tgt, "right")
        else:
            if dy >= 0:
                x1, y1 = self._anchor(src, "bottom")
                x2, y2 = self._anchor(tgt, "top")
            else:
                x1, y1 = self._anchor(src, "top")
                x2, y2 = self._anchor(tgt, "bottom")

        dash = ' stroke-dasharray="6 4"' if dashed else ""
        marker = ' marker-end="url(#arrow)"'
        if bidi:
            marker = ' marker-start="url(#arrow)" marker-end="url(#arrow)"'

        if via:
            pts = " ".join(f"{px},{py}" for px, py in via)
            d = f"M {x1},{y1} L {pts} L {x2},{y2}"
        else:
            # orthogonal elbow for cleaner look when not aligned
            if abs(dx) >= abs(dy) and abs(y1 - y2) > 8:
                mid = (x1 + x2) / 2
                d = f"M {x1},{y1} L {mid},{y1} L {mid},{y2} L {x2},{y2}"
            elif abs(dy) > abs(dx) and abs(x1 - x2) > 8:
                mid = (y1 + y2) / 2
                d = f"M {x1},{y1} L {x1},{mid} L {x2},{mid} L {x2},{y2}"
            else:
                d = f"M {x1},{y1} L {x2},{y2}"

        self.parts.append(
            f'<path d="{d}" fill="none" stroke="{ARROW}" stroke-width="1.5"{dash}{marker}/>'
        )
        if label:
            mx, my = (x1 + x2) / 2, (y1 + y2) / 2 - 6
            self.parts.append(
                f'<text x="{mx}" y="{my}" text-anchor="middle" '
                f'font-family="Helvetica,Arial,sans-serif" font-size="10" '
                f'fill="{SUB_COLOR}">{self.esc(label)}</text>'
            )

    def legend(
        self,
        x: float = 36,
        y: Optional[float] = None,
        items: Optional[List[Tuple[str, Tuple[str, str]]]] = None,
    ):
        if y is None:
            y = self.h - 70
        if items is None:
            items = [
                ("Client", CLIENT),
                ("Network", NETWORK),
                ("Compute", COMPUTE),
                ("Cache", CACHE),
                ("Database", DB),
                ("Queue", QUEUE),
            ]
        pw = 20 + len(items) * 115
        self.parts.append(
            f'<rect x="{x}" y="{y}" width="{pw}" height="50" rx="8" ry="8" '
            f'fill="{WHITE}" stroke="{LEGEND_BORDER}" stroke-width="1"/>'
        )
        self.parts.append(
            f'<text x="{x + 10}" y="{y + 14}" font-family="Helvetica,Arial,sans-serif" '
            f'font-size="10" font-weight="700" fill="{SUB_COLOR}">Legend</text>'
        )
        for i, (name, (fill, stroke)) in enumerate(items):
            bx = x + 12 + i * 115
            by = y + 24
            self.parts.append(
                f'<rect x="{bx}" y="{by}" width="16" height="16" rx="4" ry="4" '
                f'fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'
            )
            self.parts.append(
                f'<text x="{bx + 22}" y="{by + 13}" font-family="Helvetica,Arial,sans-serif" '
                f'font-size="11" fill="{TITLE_COLOR}">{self.esc(name)}</text>'
            )

    def write(self):
        OUT.mkdir(parents=True, exist_ok=True)
        defs = """
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#5F6368"/>
    </marker>
  </defs>"""
        body = "\n".join(self.parts)
        svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}"
     viewBox="0 0 {self.w} {self.h}" role="img" aria-label="{self.esc(self.title)}">
{defs}
{body}
</svg>
'''
        path = OUT / f"{self.name}.svg"
        path.write_text(svg)
        print(f"wrote {path.name} ({path.stat().st_size} bytes)")


# ─── typed helpers ──────────────────────────────────────────────────────────

def client(d, label, x, y, w=110, h=56):
    return d.box(label, x, y, w, h, *CLIENT)


def network(d, label, x, y, w=130, h=56):
    return d.box(label, x, y, w, h, *NETWORK)


def compute(d, label, x, y, w=130, h=56):
    return d.box(label, x, y, w, h, *COMPUTE)


def cache(d, label, x, y, w=120, h=56):
    return d.box(label, x, y, w, h, *CACHE)


def db(d, label, x, y, w=120, h=64):
    return d.box(label, x, y, w, h, *DB, cylinder=True)


def storage(d, label, x, y, w=120, h=56):
    return d.box(label, x, y, w, h, *STORAGE)


def queue(d, label, x, y, w=120, h=50):
    return d.box(label, x, y, w, h, *QUEUE)


def external(d, label, x, y, w=120, h=50):
    return d.box(label, x, y, w, h, *EXTERNAL)


# ═══════════════════════════════════════════════════════════════════════════
# FOUNDATIONS
# ═══════════════════════════════════════════════════════════════════════════

def dns_resolution():
    d = SvgDiagram("dns-resolution", "DNS Resolution", 1100, 580)
    browser = client(d, "Browser /\nOS stub", 40, 180, 120, 64)
    resolver = network(d, "Recursive\nresolver", 200, 180, 130, 64)
    root = network(d, "Root NS", 380, 80, 110, 50)
    tld = network(d, "TLD NS\n(.com)", 380, 180, 110, 56)
    auth = network(d, "Auth NS\n(example.com)", 380, 290, 140, 56)
    cdn = compute(d, "CDN / origin\nA/AAAA", 580, 180, 140, 64)
    cache_box = cache(d, "DNS cache\n(TTL)", 200, 320, 130, 56)
    d.edge(browser, resolver, "1. query")
    d.edge(resolver, root, "2. root?")
    d.edge(resolver, tld, "3. TLD?")
    d.edge(resolver, auth, "4. auth?")
    d.edge(resolver, cdn, "5. answer")
    d.edge(resolver, cache_box, "cache TTL", dashed=True)
    d.note("TTL controls failover speed · GeoDNS / Anycast for regional steering · blunt LB only", 40, 420, 700, 40)
    d.legend()
    d.write()


def load_balancing():
    d = SvgDiagram("load-balancing", "Load Balancing Patterns", 1100, 620)
    c = client(d, "Clients", 40, 220, 100, 56)
    dns = network(d, "DNS /\nAnycast", 180, 220, 110, 56)
    l4 = network(d, "L4 LB\n(TCP/UDP)", 340, 140, 120, 56)
    l7 = network(d, "L7 LB\n(HTTP)", 340, 300, 120, 56)
    a = compute(d, "App A", 520, 100, 100, 50)
    b = compute(d, "App B", 520, 180, 100, 50)
    c1 = compute(d, "App C", 520, 260, 100, 50)
    d1 = compute(d, "App D", 520, 340, 100, 50)
    d.edge(c, dns)
    d.edge(dns, l4)
    d.edge(dns, l7)
    d.edge(l4, a, "RR / least-conn")
    d.edge(l4, b)
    d.edge(l7, c1, "path / header")
    d.edge(l7, d1)
    d.group("Algorithms", 680, 120, 360, 200)
    d.note("• Round-robin / weighted RR\n• Least connections\n• Consistent hash (sticky sessions)\n• Health checks + drain", 700, 150, 320, 140, size=12)
    d.legend()
    d.write()


def caching_strategies():
    d = SvgDiagram("caching-strategies", "Caching Strategies", 1100, 640)
    # Cache-aside
    d.group("Cache-aside", 40, 80, 500, 160)
    app1 = compute(d, "App", 60, 120, 90, 50)
    ca = cache(d, "Cache", 200, 120, 100, 50)
    db1 = db(d, "DB", 350, 115, 100, 60)
    d.edge(app1, ca, "1 get")
    d.edge(app1, db1, "2 miss→load")
    d.note("App owns reads/writes", 60, 190, 200, 30)

    # Read-through
    d.group("Read-through", 560, 80, 500, 160)
    app2 = compute(d, "App", 580, 120, 90, 50)
    rt = cache(d, "Cache\n(+loader)", 720, 115, 110, 60)
    db2 = db(d, "DB", 880, 115, 100, 60)
    d.edge(app2, rt, "get")
    d.edge(rt, db2, "miss load")

    # Write-through
    d.group("Write-through", 40, 270, 500, 160)
    app3 = compute(d, "App", 60, 310, 90, 50)
    wt = cache(d, "Cache", 200, 310, 100, 50)
    db3 = db(d, "DB", 350, 305, 100, 60)
    d.edge(app3, wt, "write")
    d.edge(wt, db3, "sync write")

    # Write-behind
    d.group("Write-behind", 560, 270, 500, 160)
    app4 = compute(d, "App", 580, 310, 90, 50)
    wb = cache(d, "Cache", 720, 310, 100, 50)
    q = queue(d, "Async Q", 860, 250, 100, 45)
    db4 = db(d, "DB", 860, 330, 100, 60)
    d.edge(app4, wb, "write")
    d.edge(wb, q, "flush", dashed=True)
    d.edge(q, db4, dashed=True)

    d.note("CDN = geo cache for static · invalidate / TTL / versioned keys · stampede: lock or probabilistic early expire", 40, 460, 900, 40)
    d.legend()
    d.write()


def sharding_consistent_hash():
    d = SvgDiagram("sharding-consistent-hash", "Sharding & Consistent Hashing", 1100, 600)
    client_ = client(d, "Client /\nrouter", 40, 220, 110, 64)
    ring = network(d, "Hash ring\nkey → vnode", 200, 220, 140, 64)
    s1 = db(d, "Shard 1\nvnodes", 400, 100, 120, 70)
    s2 = db(d, "Shard 2\nvnodes", 400, 220, 120, 70)
    s3 = db(d, "Shard 3\nvnodes", 400, 340, 120, 70)
    hot = compute(d, "Hot key\nrisk", 600, 220, 120, 56)
    d.edge(client_, ring, "hash(key)")
    d.edge(ring, s1)
    d.edge(ring, s2)
    d.edge(ring, s3)
    d.edge(s2, hot, "viral key", dashed=True)
    d.note("Virtual nodes → even spread · reshard moves fraction of keys · protect hotspots with local cache / split", 40, 450, 800, 40)
    d.legend(items=[("Client", CLIENT), ("Network / Ring", NETWORK), ("Compute", COMPUTE), ("Database", DB)])
    d.write()


def replication_failover():
    d = SvgDiagram("replication-failover", "Replication & Failover", 1100, 580)
    app = compute(d, "App /\nproxy", 40, 220, 110, 64)
    primary = db(d, "Primary\n(writes)", 220, 140, 130, 70)
    r1 = db(d, "Replica 1", 420, 80, 120, 64)
    r2 = db(d, "Replica 2", 420, 200, 120, 64)
    mon = network(d, "Health\nmonitor", 220, 320, 130, 56)
    promote = compute(d, "Promote\n+ fence", 420, 340, 130, 56)
    d.edge(app, primary, "writes")
    d.edge(app, r1, "reads", dashed=True)
    d.edge(app, r2, "reads", dashed=True)
    d.edge(primary, r1, "async/sync log")
    d.edge(primary, r2, "async/sync log")
    d.edge(mon, primary, "probe")
    d.edge(mon, promote, "failover")
    d.edge(promote, r1, "elect", dashed=True)
    d.note("Fencing prevents split-brain · RPO/RTO from sync vs async · lag monitoring on replicas", 40, 450, 800, 40)
    d.legend()
    d.write()


def cap_pacelc():
    d = SvgDiagram("cap-pacelc", "CAP & PACELC", 1100, 560)
    d.group("Under partition (CAP)", 40, 90, 500, 220)
    cp = compute(d, "CP\nrefuse / block", 70, 150, 160, 70)
    ap = cache(d, "AP\nserve possibly\nstale", 300, 150, 180, 80)
    d.note("C vs A when P happens", 70, 260, 200, 30)

    d.group("Else (PACELC)", 560, 90, 500, 220)
    lat = network(d, "Prefer\nLatency", 590, 150, 160, 70)
    cons = db(d, "Prefer\nConsistency", 820, 150, 160, 70)
    d.note("When no partition: L vs C", 590, 260, 250, 30)

    d.note("Interview use: name the tradeoff for THIS design under partition AND in steady state — don't recite the acronym alone", 40, 360, 950, 50)
    d.legend(items=[("CP / Compute", COMPUTE), ("AP / Cache", CACHE), ("Latency", NETWORK), ("Consistency", DB)])
    d.write()


def messaging():
    d = SvgDiagram("messaging", "Messaging: Queue vs Pub/Sub", 1100, 600)
    prod = compute(d, "Producer", 40, 200, 110, 56)

    d.group("Work queue (competing)", 190, 90, 400, 220)
    q = queue(d, "Queue", 220, 160, 110, 50)
    w1 = compute(d, "Worker 1", 380, 120, 110, 50)
    w2 = compute(d, "Worker 2", 380, 200, 110, 50)
    d.edge(prod, q)
    d.edge(q, w1, "1 msg → 1")
    d.edge(q, w2)

    d.group("Pub/Sub (fan-out)", 620, 90, 440, 220)
    topic = queue(d, "Topic /\nstream", 650, 160, 120, 56)
    s1 = compute(d, "Sub A\nemail", 820, 110, 110, 50)
    s2 = compute(d, "Sub B\nsearch", 820, 180, 110, 50)
    s3 = compute(d, "Sub C\nanalytics", 820, 250, 120, 50)
    # second producer edge visually from shared
    p2 = compute(d, "Producer", 40, 360, 110, 50)
    d.edge(p2, topic)
    d.edge(topic, s1)
    d.edge(topic, s2)
    d.edge(topic, s3)

    d.note("At-least-once + idempotent consumers · poison messages → DLQ · Kafka: offsets + replay", 40, 450, 800, 40)
    d.legend(items=[("Compute", COMPUTE), ("Queue / Topic", QUEUE)])
    d.write()


def rate_limiting():
    d = SvgDiagram("rate-limiting", "Rate Limiting", 1100, 580)
    c = client(d, "Client", 40, 200, 100, 56)
    gw = network(d, "API Gateway\n/ middleware", 180, 190, 150, 70)
    rl = compute(d, "Rate Limiter", 380, 200, 130, 56)
    redis = cache(d, "Redis\ncounters / tokens", 560, 190, 150, 70)
    rules = db(d, "Rules\n(per key)", 380, 340, 130, 64)
    app = compute(d, "Upstream\nAPI", 780, 200, 120, 56)
    d.edge(c, gw, "request")
    d.edge(gw, rl, "check")
    d.edge(rl, redis, "INCR / Lua")
    d.edge(rl, rules, "load rules", dashed=True)
    d.edge(rl, app, "allow / 429")
    d.note("Token bucket · sliding window · fixed window · keys: user / IP / API key · Retry-After header", 40, 450, 850, 40)
    d.legend()
    d.write()


def websocket_vs_polling():
    d = SvgDiagram("websocket-vs-polling", "WebSocket vs SSE vs Polling", 1100, 600)
    d.group("Short polling", 40, 90, 320, 200)
    c1 = client(d, "Client", 60, 140, 90, 50)
    s1 = compute(d, "Server", 200, 140, 100, 50)
    d.edge(c1, s1, "GET…GET…", bidi=True)
    d.note("Simple · wasteful", 60, 220, 200, 30)

    d.group("Long polling", 380, 90, 320, 200)
    c2 = client(d, "Client", 400, 140, 90, 50)
    s2 = compute(d, "Server", 540, 140, 100, 50)
    d.edge(c2, s2, "hold until event")
    d.note("HTTP-friendly", 400, 220, 200, 30)

    d.group("WebSocket / SSE", 720, 90, 340, 200)
    c3 = client(d, "Client", 740, 140, 90, 50)
    s3 = compute(d, "Server", 890, 140, 100, 50)
    d.edge(c3, s3, "WS bi / SSE ↓", bidi=True)
    d.note("WS: chat · SSE: feeds", 740, 220, 250, 30)

    d.note("Pick by directionality, firewall friendliness, fan-out fan-in, and reconnect story", 40, 350, 900, 40)
    d.legend(items=[("Client", CLIENT), ("Compute", COMPUTE)])
    d.write()


def bloom_filter():
    d = SvgDiagram("bloom-filter", "Bloom Filter", 1100, 560)
    item = client(d, "Item\n\"url-42\"", 40, 200, 110, 64)
    h1 = network(d, "hash₁", 200, 120, 90, 50)
    h2 = network(d, "hash₂", 200, 200, 90, 50)
    h3 = network(d, "hash₃", 200, 280, 90, 50)
    bits = cache(d, "Bit array m\n[0 1 0 1 … 1 0]", 360, 180, 200, 80)
    maybe = compute(d, "Maybe\npresent", 620, 120, 130, 56)
    no = db(d, "Definitely\nNOT", 620, 260, 130, 70)
    d.edge(item, h1)
    d.edge(item, h2)
    d.edge(item, h3)
    d.edge(h1, bits)
    d.edge(h2, bits)
    d.edge(h3, bits)
    d.edge(bits, maybe, "all k bits = 1")
    d.edge(bits, no, "any bit = 0")
    d.note("No false negatives (for inserts) · tunable FPR · crawlers / caches / DB existence checks", 40, 400, 850, 40)
    d.legend(items=[("Item", CLIENT), ("Hashes", NETWORK), ("Bit array", CACHE), ("Maybe", COMPUTE), ("Absent", DB)])
    d.write()


def circuit_breaker():
    d = SvgDiagram("circuit-breaker", "Circuit Breaker States", 1100, 560)
    closed = cache(d, "CLOSED\npass through\ncount failures", 80, 200, 180, 90)
    open_ = db(d, "OPEN\nfail fast\ncooldown", 420, 200, 180, 90)
    half = compute(d, "HALF-OPEN\nprobe subset", 760, 200, 180, 90)
    d.edge(closed, open_, "failures ≥ threshold")
    d.edge(open_, half, "timer elapsed")
    d.edge(half, closed, "probe OK")
    d.edge(half, open_, "probe fail", dashed=True)
    d.note("Pair with timeouts, bulkheads, retries with jitter · prevent retry storms", 80, 370, 800, 40)
    d.legend(items=[("Closed / healthy", CACHE), ("Open / trip", DB), ("Half-open", COMPUTE)])
    d.write()


def observability():
    d = SvgDiagram("observability", "Observability — Three Pillars", 1100, 580)
    svc = compute(d, "Services", 40, 200, 120, 56)
    metrics = cache(d, "Metrics\nRED / USE\nhistograms", 220, 100, 150, 80)
    logs = network(d, "Logs\nstructured\n+ correlate IDs", 220, 220, 150, 80)
    traces = queue(d, "Traces\nspans /\nexemplars", 220, 360, 150, 80)
    dash = compute(d, "Dashboards\n+ alerts", 460, 200, 150, 70)
    oncall = client(d, "On-call\nresponse", 680, 200, 130, 70)
    d.edge(svc, metrics)
    d.edge(svc, logs)
    d.edge(svc, traces)
    d.edge(metrics, dash)
    d.edge(logs, dash)
    d.edge(traces, dash)
    d.edge(dash, oncall, "page")
    d.note("SLIs → SLOs → error budget · golden signals · link metrics↔traces via exemplars", 40, 480, 850, 40)
    d.legend(items=[("Client", CLIENT), ("Network / Logs", NETWORK), ("Compute", COMPUTE), ("Cache / Metrics", CACHE), ("Queue / Traces", QUEUE)])
    d.write()


def microservices_vs_monolith():
    d = SvgDiagram("microservices-vs-monolith", "Monolith vs Microservices", 1100, 620)
    d.group("Monolith", 40, 90, 480, 280)
    mono = compute(d, "Single deployable\nmodules / packages", 80, 160, 200, 80)
    mdb = db(d, "Shared DB", 320, 165, 140, 70)
    d.edge(mono, mdb)
    d.note("Simple txns · one deploy", 80, 280, 250, 30)

    d.group("Microservices", 560, 90, 500, 280)
    gw = network(d, "API Gateway", 590, 140, 130, 50)
    s1 = compute(d, "Svc A", 760, 110, 100, 45)
    s2 = compute(d, "Svc B", 760, 175, 100, 45)
    s3 = compute(d, "Svc C", 760, 240, 100, 45)
    bus = queue(d, "Events", 900, 170, 100, 50)
    d.edge(gw, s1)
    d.edge(gw, s2)
    d.edge(gw, s3)
    d.edge(s1, bus, dashed=True)
    d.edge(bus, s3, dashed=True)

    d.note("Senior move: start modular monolith; extract when team/scale demand clear seams", 40, 420, 900, 40)
    d.legend()
    d.write()


# ═══════════════════════════════════════════════════════════════════════════
# DESIGN WALKTHROUGHS
# ═══════════════════════════════════════════════════════════════════════════

def url_shortener():
    d = SvgDiagram("url-shortener", "URL Shortener", 1100, 560)
    c = client(d, "Client\n(Web / Mobile)", 40, 180, 120, 64)
    lb = network(d, "Load Balancer", 200, 180, 130, 64)
    api = compute(d, "API Service\ncreate / redirect", 380, 180, 150, 64)
    redis = cache(d, "Redis\ncode → URL", 590, 100, 130, 64)
    pg = db(d, "Postgres\nlinks table", 590, 240, 130, 70)
    q = queue(d, "Analytics\nqueue", 780, 180, 120, 56)
    w = compute(d, "Workers", 950, 180, 100, 56)
    d.edge(c, lb, "HTTPS")
    d.edge(lb, api)
    d.edge(api, redis, "read/write")
    d.edge(api, pg, "persist")
    d.edge(api, q, "clicks")
    d.edge(q, w, "async")
    d.note("Create: write DB → warm cache · Redirect: cache then DB · 302 Location", 40, 380, 700, 40)
    d.legend()
    d.write()


def news_feed():
    d = SvgDiagram("news-feed", "News Feed (Hybrid Fan-out)", 1100, 600)
    c = client(d, "Client", 40, 200, 100, 56)
    gw = network(d, "API / BFF", 180, 200, 120, 56)
    feed = compute(d, "Feed service", 350, 120, 130, 56)
    post = compute(d, "Post service", 350, 260, 130, 56)
    q = queue(d, "Post events", 530, 260, 120, 50)
    fo = compute(d, "Fan-out\nworkers", 530, 120, 120, 56)
    fcache = cache(d, "Feed cache\n(Redis lists)", 710, 100, 140, 64)
    graph = db(d, "Follow graph", 710, 210, 130, 64)
    posts = db(d, "Posts DB", 710, 320, 130, 64)
    d.edge(c, gw)
    d.edge(gw, feed, "read")
    d.edge(gw, post, "create")
    d.edge(post, q)
    d.edge(q, fo)
    d.edge(fo, fcache, "push")
    d.edge(fo, graph, "followers")
    d.edge(feed, fcache)
    d.edge(feed, posts, "hydrate", dashed=True)
    d.note("Hybrid: fan-out on write for normal users; pull for celebrities · timeline merge", 40, 430, 800, 40)
    d.legend()
    d.write()


def chat_messaging():
    d = SvgDiagram("chat-messaging", "Chat & Messaging", 1100, 580)
    c = client(d, "Clients\n(WS)", 40, 200, 110, 64)
    gw = network(d, "WS Gateway\nconn map", 190, 200, 140, 64)
    chat = compute(d, "Chat service", 380, 200, 130, 56)
    pres = cache(d, "Presence\n(Redis)", 560, 100, 130, 56)
    store = db(d, "Message\nstore", 560, 220, 130, 70)
    q = queue(d, "Delivery\n/ push Q", 560, 340, 130, 50)
    push = external(d, "Push\nAPNs/FCM", 760, 340, 120, 50)
    d.edge(c, gw, "WS", bidi=True)
    d.edge(gw, chat)
    d.edge(chat, pres)
    d.edge(chat, store, "persist")
    d.edge(chat, q, "offline")
    d.edge(q, push)
    d.note("Sticky sessions or conn registry · fan-out to online devices · at-least-once + client dedup", 40, 440, 850, 40)
    d.legend(items=[("Client", CLIENT), ("Network", NETWORK), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Queue", QUEUE), ("External", EXTERNAL)])
    d.write()


def uber_dispatch():
    d = SvgDiagram("uber-dispatch", "Uber-like Dispatch", 1100, 600)
    rider = client(d, "Rider app", 40, 120, 110, 56)
    driver = client(d, "Driver app", 40, 280, 110, 56)
    gw = network(d, "API / WS", 190, 200, 120, 56)
    geo = compute(d, "Location\ningest", 350, 100, 120, 56)
    match = compute(d, "Matching", 350, 220, 120, 56)
    trips = compute(d, "Trips", 350, 340, 120, 56)
    idx = cache(d, "Geo index\n(quad/H3)", 530, 100, 130, 56)
    q = queue(d, "Events", 530, 220, 110, 50)
    tdb = db(d, "Trips DB", 530, 330, 120, 64)
    d.edge(rider, gw)
    d.edge(driver, gw)
    d.edge(gw, geo)
    d.edge(gw, match)
    d.edge(gw, trips)
    d.edge(geo, idx)
    d.edge(match, idx, "nearby")
    d.edge(match, q)
    d.edge(trips, tdb)
    d.edge(trips, q)
    d.note("Update location sparsely · match in geo cells · trip state machine · surge as pricing service", 40, 450, 850, 40)
    d.legend()
    d.write()


def video_streaming():
    d = SvgDiagram("video-streaming", "Video Streaming", 1100, 580)
    up = client(d, "Uploader", 40, 180, 100, 56)
    api = compute(d, "Upload API", 180, 180, 120, 56)
    raw = storage(d, "Object store\nraw", 340, 100, 130, 56)
    q = queue(d, "Transcode\njobs", 340, 240, 130, 50)
    workers = compute(d, "Transcoders\nHLS/DASH", 520, 180, 140, 64)
    pack = storage(d, "Packaged\nsegments", 710, 100, 130, 56)
    cdn = network(d, "CDN", 710, 240, 110, 50)
    viewer = client(d, "Viewer", 880, 180, 100, 56)
    d.edge(up, api)
    d.edge(api, raw)
    d.edge(api, q)
    d.edge(q, workers)
    d.edge(workers, pack)
    d.edge(pack, cdn)
    d.edge(cdn, viewer, "play")
    d.note("ABR bitrates · origin shield · DRM optional · hot storage → cold archive", 40, 380, 800, 40)
    d.legend(items=[("Client", CLIENT), ("Network / CDN", NETWORK), ("Compute", COMPUTE), ("Queue", QUEUE), ("Storage", STORAGE)])
    d.write()


def dropbox():
    d = SvgDiagram("dropbox", "Dropbox-like File Sync", 1100, 580)
    c = client(d, "Desktop /\nmobile client", 40, 200, 130, 64)
    api = compute(d, "Sync /\nmetadata API", 220, 200, 140, 64)
    chunk = storage(d, "Chunk store\n(content-addr)", 420, 100, 150, 64)
    meta = db(d, "Metadata\nDB", 420, 220, 130, 70)
    dedup = cache(d, "Dedup /\nblock index", 420, 340, 150, 56)
    notify = queue(d, "Notify Q", 640, 200, 110, 50)
    peers = client(d, "Other\ndevices", 800, 200, 110, 56)
    d.edge(c, api)
    d.edge(api, chunk, "blocks")
    d.edge(api, meta)
    d.edge(api, dedup, "hash?")
    d.edge(api, notify)
    d.edge(notify, peers, "invalidate")
    d.note("Chunk + hash · upload only missing blocks · conflict: last-writer or branch · notifications wake clients", 40, 440, 900, 40)
    d.legend()
    d.write()


def notification_system():
    d = SvgDiagram("notification-system", "Notification System", 1100, 600)
    prod = compute(d, "Producers\n(services)", 40, 200, 130, 64)
    api = compute(d, "Notif API", 210, 200, 120, 64)
    q = queue(d, "Priority\nqueues", 370, 200, 120, 64)
    w = compute(d, "Workers", 530, 200, 110, 64)
    prefs = db(d, "Prefs /\nquiet hours", 530, 340, 140, 70)
    push = external(d, "Push\nAPNs/FCM", 700, 100, 130, 50)
    email = external(d, "Email", 700, 180, 130, 50)
    sms = external(d, "SMS", 700, 260, 130, 50)
    inapp = external(d, "In-app", 700, 340, 130, 50)
    d.edge(prod, api, "enqueue")
    d.edge(api, q)
    d.edge(q, w)
    d.edge(w, prefs, "check", dashed=True)
    d.edge(w, push)
    d.edge(w, email)
    d.edge(w, sms)
    d.edge(w, inapp)
    d.note("Idempotency keys · backoff on 5xx · respect quiet hours before send", 40, 460, 700, 40)
    d.legend(items=[("Compute", COMPUTE), ("Database", DB), ("Queue", QUEUE), ("External", EXTERNAL)])
    d.write()


def nearby_places():
    d = SvgDiagram("nearby-places", "Nearby Places (Yelp-like)", 1100, 560)
    c = client(d, "User\nlat/lng", 40, 200, 110, 64)
    api = compute(d, "Search API", 200, 200, 120, 56)
    geo = cache(d, "Geo index\n(geohash/H3)", 370, 120, 150, 64)
    biz = db(d, "Business\nDB", 370, 260, 130, 70)
    rank = compute(d, "Ranker\ndistance+score", 580, 200, 150, 64)
    rcache = cache(d, "Result\ncache", 780, 200, 120, 56)
    d.edge(c, api)
    d.edge(api, geo, "cells")
    d.edge(api, biz)
    d.edge(api, rank)
    d.edge(rank, rcache)
    d.note("Expand rings of cells · filter categories · cache popular tiles · personalization light", 40, 400, 800, 40)
    d.legend()
    d.write()


def group_chat():
    d = SvgDiagram("group-chat", "Group Chat (Slack-like)", 1100, 580)
    c = client(d, "Clients", 40, 200, 100, 56)
    gw = network(d, "WS Gateway", 180, 200, 130, 56)
    chan = compute(d, "Channel\nservice", 360, 100, 130, 56)
    msg = compute(d, "Message\nservice", 360, 200, 130, 56)
    mem = compute(d, "Membership", 360, 300, 130, 56)
    store = db(d, "Messages\nDB", 560, 200, 130, 70)
    fan = queue(d, "Fan-out\nevents", 560, 100, 120, 50)
    d.edge(c, gw, bidi=True)
    d.edge(gw, chan)
    d.edge(gw, msg)
    d.edge(gw, mem)
    d.edge(msg, store)
    d.edge(msg, fan)
    d.edge(fan, gw, "push members", dashed=True)
    d.note("Large channels: fan-out via pubsub · history paginated · unread cursors per member", 40, 420, 850, 40)
    d.legend()
    d.write()


def ecommerce_checkout():
    d = SvgDiagram("ecommerce-checkout", "E-commerce Checkout", 1100, 600)
    c = client(d, "Shopper", 40, 200, 100, 56)
    api = compute(d, "Checkout\nAPI", 180, 200, 120, 56)
    cart = cache(d, "Cart\n(Redis)", 340, 100, 120, 56)
    inv = db(d, "Inventory\nlocks", 340, 220, 130, 70)
    orders = db(d, "Orders", 340, 340, 120, 64)
    pay = external(d, "Payments", 530, 200, 120, 50)
    fulfill = queue(d, "Fulfillment\nQ", 700, 200, 130, 50)
    wh = compute(d, "Warehouse", 880, 200, 120, 50)
    d.edge(c, api)
    d.edge(api, cart)
    d.edge(api, inv, "reserve")
    d.edge(api, orders)
    d.edge(api, pay, "charge")
    d.edge(api, fulfill)
    d.edge(fulfill, wh)
    d.note("Reserve stock with TTL · saga / compensate on pay fail · idempotent order create", 40, 450, 800, 40)
    d.legend(items=[("Client", CLIENT), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Queue", QUEUE), ("External", EXTERNAL)])
    d.write()


def recommendation_feed():
    d = SvgDiagram("recommendation-feed", "Recommendation & Feed Ranking", 1100, 580)
    c = client(d, "User", 40, 200, 90, 56)
    api = compute(d, "Feed API", 170, 200, 110, 56)
    cand = compute(d, "Candidate\ngenerators", 330, 120, 140, 64)
    feats = cache(d, "Feature\nstore", 330, 260, 130, 64)
    rank = compute(d, "Ranker\n(ML model)", 530, 200, 140, 64)
    filt = compute(d, "Filters\npolicy / dedup", 720, 200, 140, 64)
    out = client(d, "Ranked\nfeed", 910, 200, 110, 56)
    d.edge(c, api)
    d.edge(api, cand)
    d.edge(api, feats)
    d.edge(cand, rank)
    d.edge(feats, rank)
    d.edge(rank, filt)
    d.edge(filt, out)
    d.note("Multi-stage funnel · retrieve → rank → filter · online features vs batch · A/B + holdouts", 40, 400, 850, 40)
    d.legend(items=[("Client", CLIENT), ("Compute", COMPUTE), ("Cache / Features", CACHE)])
    d.write()


def search_inverted_index():
    d = SvgDiagram("search-inverted-index", "Search — Inverted Index", 1100, 580)
    docs = storage(d, "Documents", 40, 140, 120, 56)
    analyze = compute(d, "Analyzer\ntokenize·stem", 210, 140, 140, 64)
    idx = cache(d, "Inverted index\nterm → postings", 410, 120, 180, 80)
    q = client(d, "Query\n\"system design\"", 40, 320, 150, 64)
    search = compute(d, "Query engine", 250, 320, 130, 56)
    rank = compute(d, "Ranking\nBM25 / LTR", 450, 320, 140, 56)
    hits = client(d, "Top-K", 660, 320, 100, 56)
    d.edge(docs, analyze, "index")
    d.edge(analyze, idx)
    d.edge(q, search)
    d.edge(search, idx, "lookup")
    d.edge(search, rank)
    d.edge(rank, hits)
    d.note("Intersect postings · positional phrases · shard by term or doc · NRT refresh vs durability", 40, 440, 850, 40)
    d.legend(items=[("Client / Query", CLIENT), ("Compute", COMPUTE), ("Cache / Index", CACHE), ("Storage", STORAGE)])
    d.write()


def typeahead():
    d = SvgDiagram("typeahead", "Typeahead / Autocomplete", 1100, 560)
    user = client(d, "User types\n\"sys…\"", 40, 200, 120, 64)
    edge = network(d, "Edge / CDN\nprefix cache", 200, 200, 140, 64)
    api = compute(d, "Suggest API", 390, 200, 120, 56)
    trie = cache(d, "Trie / prefix\nindex", 560, 120, 140, 64)
    rank = compute(d, "Ranker\npopularity", 560, 260, 150, 64)
    store = db(d, "Query logs\n/ freq", 770, 190, 140, 70)
    d.edge(user, edge)
    d.edge(edge, api, "miss")
    d.edge(api, trie, "prefix")
    d.edge(api, rank)
    d.edge(rank, store, "offline", dashed=True)
    d.note("Debounce client · cache hot prefixes at edge · limit candidates · light personalization", 40, 400, 800, 40)
    d.legend()
    d.write()


def web_crawler():
    d = SvgDiagram("web-crawler", "Web Crawler", 1100, 600)
    seed = client(d, "Seed URLs", 40, 200, 110, 56)
    fq = queue(d, "Frontier\nqueue", 190, 200, 120, 56)
    fetcher = compute(d, "Fetchers\n(politeness)", 350, 200, 140, 64)
    dns = network(d, "DNS cache", 350, 330, 120, 50)
    store = storage(d, "Content\nstore", 550, 120, 120, 56)
    parse = compute(d, "Parser /\nlinks", 550, 230, 120, 56)
    seen = cache(d, "URL seen?\nBloom+DB", 740, 230, 140, 64)
    idx = db(d, "Index /\nmetadata", 740, 120, 130, 64)
    d.edge(seed, fq)
    d.edge(fq, fetcher)
    d.edge(fetcher, dns, dashed=True)
    d.edge(fetcher, store, "raw")
    d.edge(fetcher, parse)
    d.edge(parse, seen, "new?")
    d.edge(seen, fq, "enqueue", dashed=True)
    d.edge(parse, idx)
    d.note("robots.txt · per-host politeness · Bloom for seen · prioritize frontier", 40, 440, 800, 40)
    d.legend(items=[("Client", CLIENT), ("Network", NETWORK), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Queue", QUEUE), ("Storage", STORAGE)])
    d.write()


def ticket_booking():
    d = SvgDiagram("ticket-booking", "Ticket Booking Concurrency", 1100, 580)
    user = client(d, "User", 40, 200, 100, 56)
    api = compute(d, "Booking API", 180, 200, 120, 56)
    seat = cache(d, "Seat locks\n(Redis TTL)", 350, 100, 140, 64)
    inv = db(d, "Inventory\nrows/versions", 350, 240, 150, 70)
    pay = external(d, "Payments", 560, 200, 120, 50)
    conf = compute(d, "Confirm /\nissue ticket", 730, 200, 140, 56)
    q = queue(d, "Timeout /\nrelease", 560, 340, 130, 50)
    d.edge(user, api, "hold")
    d.edge(api, seat, "SET NX+TTL")
    d.edge(api, inv, "version check")
    d.edge(api, pay, "charge")
    d.edge(pay, conf, "ok")
    d.edge(q, seat, "expire→free", dashed=True)
    d.note("Avoid oversell: lock or conditional UPDATE · TTL holds · compensate on pay fail", 40, 440, 850, 40)
    d.legend(items=[("Client", CLIENT), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Queue", QUEUE), ("External", EXTERNAL)])
    d.write()


def payments():
    d = SvgDiagram("payments", "Payment Idempotency", 1100, 560)
    c = client(d, "Client\nIdempotency-Key", 40, 200, 150, 70)
    api = compute(d, "Payments API", 240, 210, 130, 56)
    store = cache(d, "Idempotency\nstore", 430, 100, 150, 70)
    ledger = db(d, "Ledger /\nintents", 430, 250, 140, 70)
    psp = external(d, "PSP\n(Stripe etc.)", 650, 210, 130, 56)
    wh = queue(d, "Webhook Q", 840, 210, 120, 50)
    d.edge(c, api, "POST /charge")
    d.edge(api, store, "lookup/save")
    d.edge(api, ledger, "intent")
    d.edge(api, psp, "create")
    d.edge(psp, wh, "events")
    d.edge(wh, api, "reconcile", dashed=True)
    d.note("Same key → same response · no double charge · webhook reorder → intent state machine", 40, 400, 850, 40)
    d.legend(items=[("Client", CLIENT), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Queue", QUEUE), ("External", EXTERNAL)])
    d.write()


def interview_flow():
    d = SvgDiagram("interview-flow", "Interview Flow: Clarify → HLD", 1100, 560)
    s1 = client(d, "1. Clarify\n5–8 min\nusers · scale · NFRs", 40, 180, 200, 100)
    s2 = compute(d, "2. Capacity\n5 min\nQPS · storage · BW", 280, 180, 200, 100)
    s3 = network(d, "3. High-level\n10–15 min\nboxes + APIs", 520, 180, 200, 100)
    s4 = cache(d, "4. Deep dive\n10 min\ntradeoffs · SLO", 760, 180, 200, 100)
    d.edge(s1, s2)
    d.edge(s2, s3)
    d.edge(s3, s4)
    d.note("Speak while drawing · check in after each step · NFRs top-right · never invent requirements — ask", 40, 340, 900, 50)
    d.legend(items=[("Clarify", CLIENT), ("Capacity", COMPUTE), ("HLD", NETWORK), ("Deep dive", CACHE)])
    d.write()


def whiteboard_template():
    d = SvgDiagram("whiteboard-template", "Whiteboard Starter Template", 1100, 620)
    d.group("Clients", 40, 100, 160, 200)
    client(d, "Web /\nMobile", 60, 160, 120, 64)
    d.group("Edge", 220, 100, 180, 200)
    network(d, "DNS / CDN\n/ LB", 240, 160, 140, 64)
    d.group("Services", 420, 100, 280, 200)
    compute(d, "API /\ncore services", 460, 150, 200, 80)
    d.group("Data", 720, 100, 340, 200)
    cache(d, "Cache", 740, 130, 100, 50)
    db(d, "DB", 860, 120, 100, 60)
    queue(d, "Queue", 740, 220, 100, 45)
    storage(d, "Objects", 860, 220, 100, 45)

    d.group("NFR box (top-right habit)", 40, 340, 500, 120)
    d.note("Latency p99 · availability · consistency · scale\nWrite numbers under title · check in with interviewer", 60, 370, 450, 80, size=12)

    d.note("Left → right data flow · leave space for deep-dive callouts under the main path", 40, 500, 900, 40)
    d.legend()
    d.write()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    generators = [
        dns_resolution,
        load_balancing,
        caching_strategies,
        sharding_consistent_hash,
        replication_failover,
        cap_pacelc,
        messaging,
        rate_limiting,
        websocket_vs_polling,
        bloom_filter,
        circuit_breaker,
        observability,
        microservices_vs_monolith,
        url_shortener,
        news_feed,
        chat_messaging,
        uber_dispatch,
        video_streaming,
        dropbox,
        notification_system,
        nearby_places,
        group_chat,
        ecommerce_checkout,
        recommendation_feed,
        search_inverted_index,
        typeahead,
        web_crawler,
        ticket_booking,
        payments,
        interview_flow,
        whiteboard_template,
    ]
    for g in generators:
        g()
    print(f"\nGenerated {len(generators)} SVGs in {OUT}")


if __name__ == "__main__":
    main()
