#!/usr/bin/env python3
"""Generate polished Google/AWS-style draw.io architecture diagrams."""
from __future__ import annotations
import html
import os
from pathlib import Path
from typing import List, Optional, Tuple

OUT = Path("/workspace/system-design-site/diagrams")

# Palette
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
LEGEND_BG = "#FFFFFF"
LEGEND_BORDER = "#DADCE0"

FONT = "Helvetica"
EDGE = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=blockThin;endFill=1;strokeWidth=1.5;strokeColor=#5F6368;fontFamily=Helvetica;fontSize=10;fontColor=#5F6368;"
EDGE_DASH = EDGE + "dashed=1;dashPattern=6 4;"
EDGE_BIDI = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;startArrow=blockThin;startFill=1;endArrow=blockThin;endFill=1;strokeWidth=1.5;strokeColor=#5F6368;fontFamily=Helvetica;fontSize=10;fontColor=#5F6368;"


class Diagram:
    def __init__(self, name: str, title: str, w: int = 1200, h: int = 850):
        self.name = name
        self.title = title
        self.w = w
        self.h = h
        self.cells: List[str] = []
        self._id = 2
        self._add_title()

    def nid(self) -> str:
        i = self._id
        self._id += 1
        return str(i)

    def _esc(self, s: str) -> str:
        return html.escape(s).replace("\n", "&#xa;")

    def _add_title(self):
        tid = self.nid()
        self.cells.append(
            f'<mxCell id="{tid}" value="{self._esc(self.title)}" '
            f'style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;'
            f'whiteSpace=wrap;rounded=0;fontSize=17;fontStyle=1;fontFamily={FONT};fontColor={TITLE_COLOR};" '
            f'vertex="1" parent="1"><mxGeometry x="40" y="24" width="700" height="28" as="geometry"/></mxCell>'
        )
        sid = self.nid()
        self.cells.append(
            f'<mxCell id="{sid}" value="System Design Interview Guide" '
            f'style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;'
            f'whiteSpace=wrap;rounded=0;fontSize=11;fontFamily={FONT};fontColor={SUB_COLOR};" '
            f'vertex="1" parent="1"><mxGeometry x="40" y="50" width="280" height="18" as="geometry"/></mxCell>'
        )

    def box(self, label: str, x: float, y: float, w: float, h: float,
            fill: str, stroke: str, *, cylinder: bool = False, font_size: int = 12) -> str:
        cid = self.nid()
        if cylinder:
            style = (
                f"shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=12;"
                f"fillColor={fill};strokeColor={stroke};strokeWidth=1.5;fontStyle=1;fontSize={font_size};"
                f"fontFamily={FONT};fontColor={TITLE_COLOR};"
                f"shadow=1;"
            )
        else:
            style = (
                f"rounded=1;whiteSpace=wrap;html=1;arcSize=12;"
                f"fillColor={fill};strokeColor={stroke};strokeWidth=1.5;fontStyle=1;fontSize={font_size};"
                f"fontFamily={FONT};fontColor={TITLE_COLOR};"
                f"shadow=1;"
            )
        self.cells.append(
            f'<mxCell id="{cid}" value="{self._esc(label)}" style="{style}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
        )
        return cid

    def note(self, label: str, x: float, y: float, w: float, h: float, size: int = 11) -> str:
        cid = self.nid()
        style = (
            f"text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;"
            f"whiteSpace=wrap;rounded=0;fontSize={size};fontFamily={FONT};fontColor={SUB_COLOR};"
        )
        self.cells.append(
            f'<mxCell id="{cid}" value="{self._esc(label)}" style="{style}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
        )
        return cid

    def group(self, label: str, x: float, y: float, w: float, h: float) -> str:
        cid = self.nid()
        style = (
            f"rounded=1;whiteSpace=wrap;html=1;arcSize=8;fillColor=none;strokeColor=#DADCE0;"
            f"strokeWidth=1;dashed=1;dashPattern=6 4;verticalAlign=top;fontStyle=0;fontSize=11;"
            f"fontFamily={FONT};fontColor={SUB_COLOR};align=left;spacingLeft=8;spacingTop=4;"
        )
        self.cells.append(
            f'<mxCell id="{cid}" value="{self._esc(label)}" style="{style}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'
        )
        return cid

    def edge(self, src: str, tgt: str, label: str = "", *, dashed: bool = False,
             bidi: bool = False, exitX=None, exitY=None, entryX=None, entryY=None) -> str:
        eid = self.nid()
        style = EDGE_BIDI if bidi else (EDGE_DASH if dashed else EDGE)
        extras = ""
        if exitX is not None:
            extras += f' exitX="{exitX}" exitY="{exitY}" exitDx="0" exitDy="0"'
        if entryX is not None:
            extras += f' entryX="{entryX}" entryY="{entryY}" entryDx="0" entryDy="0"'
        val = f' value="{self._esc(label)}"' if label else ""
        self.cells.append(
            f'<mxCell id="{eid}"{val} style="{style}" edge="1" parent="1" source="{src}" target="{tgt}"{extras}>'
            f'<mxGeometry relative="1" as="geometry"/></mxCell>'
        )
        return eid

    def legend(self, x: float = 40, y: float = None, items: Optional[List[Tuple[str, Tuple[str, str]]]] = None):
        if y is None:
            y = self.h - 110
        if items is None:
            items = [
                ("Client", CLIENT),
                ("Network", NETWORK),
                ("Compute", COMPUTE),
                ("Cache", CACHE),
                ("Database", DB),
                ("Queue", QUEUE),
            ]
        # background panel
        pid = self.nid()
        pw = 18 + len(items) * 118
        self.cells.append(
            f'<mxCell id="{pid}" value="" style="rounded=1;whiteSpace=wrap;html=1;arcSize=8;'
            f'fillColor=#FFFFFF;strokeColor={LEGEND_BORDER};strokeWidth=1;shadow=0;" '
            f'vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{pw}" height="56" as="geometry"/></mxCell>'
        )
        lid = self.nid()
        self.cells.append(
            f'<mxCell id="{lid}" value="Legend" style="text;html=1;strokeColor=none;fillColor=none;'
            f'align=left;verticalAlign=middle;fontSize=10;fontStyle=1;fontFamily={FONT};fontColor={SUB_COLOR};" '
            f'vertex="1" parent="1"><mxGeometry x="{x + 10}" y="{y + 4}" width="60" height="16" as="geometry"/></mxCell>'
        )
        for i, (name, (fill, stroke)) in enumerate(items):
            bx = x + 12 + i * 118
            by = y + 24
            bid = self.nid()
            self.cells.append(
                f'<mxCell id="{bid}" value="" style="rounded=1;whiteSpace=wrap;html=1;arcSize=20;'
                f'fillColor={fill};strokeColor={stroke};strokeWidth=1.5;" vertex="1" parent="1">'
                f'<mxGeometry x="{bx}" y="{by}" width="18" height="18" as="geometry"/></mxCell>'
            )
            tid = self.nid()
            self.cells.append(
                f'<mxCell id="{tid}" value="{self._esc(name)}" style="text;html=1;strokeColor=none;fillColor=none;'
                f'align=left;verticalAlign=middle;fontSize=11;fontFamily={FONT};fontColor={TITLE_COLOR};" '
                f'vertex="1" parent="1"><mxGeometry x="{bx + 24}" y="{by - 2}" width="90" height="22" as="geometry"/></mxCell>'
            )

    def write(self):
        body = "\n".join(self.cells)
        xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-09-25T22:00:00.000Z" agent="system-design-interview-guide" version="22.1.0" type="device">
  <diagram id="{self.name}" name="{self.name}">
    <mxGraphModel dx="1400" dy="900" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{self.w}" pageHeight="{self.h}" math="0" shadow="0" background="#ffffff">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
{body}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
'''
        path = OUT / f"{self.name}.drawio"
        path.write_text(xml)
        print(f"wrote {path.name}")


# ─── helpers for common patterns ───────────────────────────────────────────

def client(d: Diagram, label, x, y, w=110, h=56):
    return d.box(label, x, y, w, h, *CLIENT)

def network(d: Diagram, label, x, y, w=130, h=56):
    return d.box(label, x, y, w, h, *NETWORK)

def compute(d: Diagram, label, x, y, w=130, h=56):
    return d.box(label, x, y, w, h, *COMPUTE)

def cache(d: Diagram, label, x, y, w=120, h=56):
    return d.box(label, x, y, w, h, *CACHE)

def db(d: Diagram, label, x, y, w=120, h=64):
    return d.box(label, x, y, w, h, *DB, cylinder=True)

def storage(d: Diagram, label, x, y, w=120, h=56):
    return d.box(label, x, y, w, h, *STORAGE)

def queue(d: Diagram, label, x, y, w=120, h=50):
    return d.box(label, x, y, w, h, *QUEUE)

def external(d: Diagram, label, x, y, w=120, h=50):
    return d.box(label, x, y, w, h, *EXTERNAL)


# ═══════════════════════════════════════════════════════════════════════════
# UPGRADED ORIGINALS
# ═══════════════════════════════════════════════════════════════════════════

def url_shortener():
    d = Diagram("url-shortener", "URL Shortener", 1200, 780)
    c = client(d, "Client\n(Web / Mobile)", 50, 160, 120, 64)
    lb = network(d, "Load Balancer", 220, 160, 130, 64)
    api = compute(d, "API Service\ncreate / redirect", 400, 160, 150, 64)
    redis = cache(d, "Redis\ncode → URL", 620, 90, 130, 64)
    pg = db(d, "Postgres\nlinks table", 620, 220, 130, 70)
    q = queue(d, "Analytics\nqueue", 820, 160, 120, 56)
    w = compute(d, "Workers", 990, 160, 110, 56)
    d.edge(c, lb, "HTTPS")
    d.edge(lb, api)
    d.edge(api, redis, "read / write")
    d.edge(api, pg, "persist")
    d.edge(api, q, "clicks")
    d.edge(q, w, "async")
    d.note("Create: write DB → warm cache · Redirect: cache then DB · 302 Location", 50, 340, 520, 40)
    d.legend()
    d.write()


def rate_limiter():
    d = Diagram("rate-limiter", "Distributed Rate Limiter", 1200, 780)
    c = client(d, "Client", 50, 180, 100, 56)
    gw = network(d, "API Gateway\n/ middleware", 200, 170, 140, 70)
    rl = compute(d, "Rate Limiter\nservice", 400, 170, 140, 70)
    redis = cache(d, "Redis\ncounters / tokens", 600, 160, 150, 70)
    cfg = db(d, "Rules config\n(per key)", 400, 300, 140, 70)
    app = compute(d, "Upstream\nAPI", 820, 180, 120, 56)
    d.edge(c, gw, "request")
    d.edge(gw, rl, "check")
    d.edge(rl, redis, "INCR / Lua")
    d.edge(rl, cfg, "load rules", dashed=True)
    d.edge(rl, app, "allow")
    d.note("Algorithms: token bucket · sliding window · fixed window\nKeys: user / IP / API key · return 429 + Retry-After", 50, 420, 560, 50)
    d.legend()
    d.write()


def notification_system():
    d = Diagram("notification-system", "Notification System", 1300, 820)
    prod = compute(d, "Producers\n(services)", 50, 180, 130, 64)
    api = compute(d, "Notif API", 230, 180, 120, 64)
    q = queue(d, "Priority\nqueues", 400, 180, 120, 64)
    w = compute(d, "Workers", 570, 180, 120, 64)
    prefs = db(d, "Prefs /\nquiet hours", 570, 310, 130, 70)
    push = external(d, "Push\n(APNs / FCM)", 760, 100, 130, 56)
    email = external(d, "Email\n(SES / SendGrid)", 760, 180, 130, 56)
    sms = external(d, "SMS\n(Twilio)", 760, 260, 130, 56)
    inapp = external(d, "In-app\nfeed", 760, 340, 130, 56)
    d.edge(prod, api, "enqueue")
    d.edge(api, q)
    d.edge(q, w)
    d.edge(w, prefs, "check", dashed=True)
    d.edge(w, push)
    d.edge(w, email)
    d.edge(w, sms)
    d.edge(w, inapp)
    d.note("Dedup by idempotency key · backoff on provider 5xx · user prefs before send", 50, 440, 560, 40)
    d.legend(items=[("Client", CLIENT), ("Network", NETWORK), ("Compute", COMPUTE), ("Database", DB), ("Queue", QUEUE), ("External", EXTERNAL)])
    d.write()


def news_feed():
    d = Diagram("news-feed", "News Feed (Hybrid Fan-out)", 1300, 820)
    c = client(d, "Client", 50, 200, 100, 56)
    gw = network(d, "API / BFF", 200, 200, 120, 56)
    feed = compute(d, "Feed service", 380, 140, 130, 56)
    post = compute(d, "Post service", 380, 260, 130, 56)
    q = queue(d, "Post events", 560, 260, 120, 50)
    fo = compute(d, "Fan-out\nworkers", 560, 140, 120, 56)
    fcache = cache(d, "Feed cache\n(Redis lists)", 740, 120, 140, 64)
    graph = db(d, "Follow graph", 740, 230, 130, 64)
    posts = db(d, "Posts DB", 740, 340, 130, 64)
    d.edge(c, gw)
    d.edge(gw, feed, "read feed")
    d.edge(gw, post, "create")
    d.edge(post, q)
    d.edge(q, fo)
    d.edge(fo, fcache, "push IDs")
    d.edge(feed, fcache, "pull")
    d.edge(feed, graph, "celebs?", dashed=True)
    d.edge(post, posts, "write")
    d.note("Hybrid: fan-out on write for normal users; fan-out on read for celebrities", 50, 450, 560, 40)
    d.legend()
    d.write()


def chat_messaging():
    d = Diagram("chat-messaging", "Chat / Messaging (1:1)", 1300, 820)
    a = client(d, "Client A", 50, 140, 100, 56)
    b = client(d, "Client B", 50, 280, 100, 56)
    gw = network(d, "WS Gateway\n(conn mgmt)", 220, 200, 140, 70)
    chat = compute(d, "Chat service", 420, 200, 130, 64)
    presence = cache(d, "Presence\n(Redis)", 420, 340, 130, 56)
    q = queue(d, "Msg queue\n/ Kafka", 610, 200, 130, 56)
    store = db(d, "Message store", 800, 190, 130, 70)
    fan = compute(d, "Fan-out /\ndelivery", 610, 320, 130, 56)
    d.edge(a, gw, "WS")
    d.edge(b, gw, "WS")
    d.edge(gw, chat)
    d.edge(chat, presence, "online?")
    d.edge(chat, q, "publish")
    d.edge(q, store, "persist")
    d.edge(q, fan)
    d.edge(fan, gw, "push", dashed=True)
    d.note("At-least-once delivery + client idempotency · presence heartbeats · offline inbox", 50, 450, 580, 40)
    d.legend()
    d.write()


def uber_dispatch():
    d = Diagram("uber-dispatch", "Ride Dispatch (Geo + Matching)", 1350, 860)
    rider = client(d, "Rider app", 50, 140, 110, 56)
    driver = client(d, "Driver app", 50, 260, 110, 56)
    gw = network(d, "API Gateway", 220, 190, 130, 64)
    trip = compute(d, "Trip service", 410, 120, 130, 56)
    match = compute(d, "Matching\nservice", 410, 220, 130, 56)
    loc = compute(d, "Location\ningest", 410, 330, 130, 56)
    geo = cache(d, "Geo index\n(S2 / Redis GEO)", 610, 260, 150, 64)
    trips = db(d, "Trips DB", 610, 120, 130, 70)
    ev = queue(d, "Events", 810, 200, 120, 50)
    d.edge(rider, gw)
    d.edge(driver, gw, "GPS")
    d.edge(gw, trip)
    d.edge(gw, match)
    d.edge(gw, loc)
    d.edge(loc, geo, "upsert")
    d.edge(match, geo, "nearby")
    d.edge(trip, trips)
    d.edge(match, trip, "assign")
    d.edge(trip, ev, "status")
    d.note("Match in geo cells · ETA from traffic · idempotent trip state machine", 50, 450, 520, 40)
    d.legend()
    d.write()


def video_streaming():
    d = Diagram("video-streaming", "Video Streaming (Upload + Playback)", 1350, 860)
    up = client(d, "Uploader", 50, 140, 110, 56)
    viewer = client(d, "Viewer", 50, 300, 110, 56)
    api = compute(d, "API", 220, 200, 110, 56)
    raw = storage(d, "Object store\n(raw)", 390, 120, 130, 56)
    tq = queue(d, "Transcode Q", 390, 220, 120, 50)
    tc = compute(d, "Transcoders\n(ABR ladders)", 560, 210, 140, 64)
    pkg = storage(d, "Packaged\nHLS / DASH", 750, 210, 130, 56)
    cdn = network(d, "CDN", 930, 300, 110, 56)
    meta = db(d, "Metadata DB", 560, 340, 130, 70)
    d.edge(up, api, "PUT")
    d.edge(api, raw)
    d.edge(api, tq)
    d.edge(tq, tc)
    d.edge(tc, pkg)
    d.edge(tc, meta, "ready")
    d.edge(viewer, cdn, "play")
    d.edge(cdn, pkg, "origin", dashed=True)
    d.edge(viewer, api, "catalog", dashed=True)
    d.note("ABR ladders · signed CDN URLs · origin shield · DRM optional", 50, 450, 480, 40)
    d.legend(items=[("Client", CLIENT), ("Network", NETWORK), ("Compute", COMPUTE), ("Storage", STORAGE), ("Database", DB), ("Queue", QUEUE)])
    d.write()


def dropbox():
    d = Diagram("dropbox", "Cloud File Sync (Dropbox-like)", 1300, 840)
    cl = client(d, "Desktop /\nmobile client", 50, 200, 130, 64)
    meta = compute(d, "Metadata\nservice", 250, 140, 130, 64)
    chunk = compute(d, "Block /\nchunk service", 250, 260, 130, 64)
    sync = network(d, "Sync notify\n(long poll / WS)", 250, 380, 140, 56)
    mdb = db(d, "Metadata DB", 460, 130, 130, 70)
    s3 = storage(d, "Chunk store\n(S3)", 460, 260, 130, 56)
    dedup = cache(d, "Dedup index\nhash → chunk", 460, 370, 140, 56)
    d.edge(cl, meta)
    d.edge(cl, chunk, "chunks")
    d.edge(cl, sync, "invalidate")
    d.edge(meta, mdb)
    d.edge(chunk, s3)
    d.edge(chunk, dedup)
    d.note("Chunk + content-hash dedup · client uploads chunks directly · metadata owns namespace", 50, 480, 600, 40)
    d.legend(items=[("Client", CLIENT), ("Network", NETWORK), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Storage", STORAGE)])
    d.write()


def nearby_places():
    d = Diagram("nearby-places", "Nearby Places / Yelp-like", 1200, 780)
    c = client(d, "Client", 50, 200, 100, 56)
    api = compute(d, "Search API", 210, 200, 120, 56)
    geo = cache(d, "Geo index\n(S2 / ES geo)", 400, 140, 140, 64)
    biz = db(d, "Business DB", 400, 260, 130, 70)
    rank = compute(d, "Ranker\ndistance + rating", 610, 200, 150, 56)
    rc = cache(d, "Result cache", 820, 200, 120, 56)
    d.edge(c, api)
    d.edge(api, geo, "radius")
    d.edge(api, biz, "hydrate")
    d.edge(api, rank)
    d.edge(rank, rc, "TTL")
    d.note("Geohash / S2 cells · precompute popular tiles · ranking blends distance + quality", 50, 400, 560, 40)
    d.legend()
    d.write()


def group_chat():
    d = Diagram("group-chat", "Group Chat (Slack / Discord-like)", 1300, 840)
    cl = client(d, "Clients", 50, 220, 100, 56)
    gw = network(d, "WS Gateway\nfleet", 210, 210, 130, 70)
    ch = compute(d, "Channel\nservice", 400, 140, 120, 56)
    msg = compute(d, "Message\nservice", 400, 240, 120, 56)
    mem = compute(d, "Membership\n+ roles", 400, 340, 120, 56)
    store = db(d, "Msg store\n(channel_id, ts)", 590, 230, 140, 70)
    fan = queue(d, "Fan-out /\nKafka", 590, 140, 120, 50)
    pres = cache(d, "Presence", 590, 350, 120, 50)
    d.edge(cl, gw, "WS")
    d.edge(gw, ch)
    d.edge(gw, msg)
    d.edge(gw, mem)
    d.edge(msg, store)
    d.edge(msg, fan, "push")
    d.edge(fan, gw, "broadcast", dashed=True)
    d.edge(mem, pres)
    d.note("Shard by channel_id · fan-out to online members · offline catch-up via history API", 50, 460, 580, 40)
    d.legend()
    d.write()


def collab_doc():
    d = Diagram("collab-doc", "Collaborative Document (OT / CRDT)", 1200, 800)
    a = client(d, "Editor A", 50, 160, 100, 56)
    b = client(d, "Editor B", 50, 280, 100, 56)
    gw = network(d, "Collab gateway\n(WS)", 220, 200, 140, 70)
    eng = compute(d, "OT / CRDT\nengine", 420, 200, 130, 70)
    snap = storage(d, "Snapshot\nstore", 620, 140, 120, 56)
    oplog = db(d, "Op log", 620, 250, 120, 70)
    pres = cache(d, "Presence /\ncursors", 420, 350, 130, 56)
    d.edge(a, gw)
    d.edge(b, gw)
    d.edge(gw, eng)
    d.edge(eng, snap, "periodic")
    d.edge(eng, oplog, "append")
    d.edge(eng, pres)
    d.note("Transform or merge ops · snapshot + op log for recovery · presence for cursors", 50, 460, 560, 40)
    d.legend(items=[("Client", CLIENT), ("Network", NETWORK), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Storage", STORAGE)])
    d.write()


def ecommerce_checkout():
    d = Diagram("ecommerce-checkout", "E-commerce Checkout & Inventory", 1300, 840)
    buyer = client(d, "Buyer", 50, 220, 100, 56)
    cart = compute(d, "Cart API", 210, 220, 110, 56)
    inv = compute(d, "Inventory\nservice", 380, 140, 120, 56)
    order = compute(d, "Order\nservice", 380, 240, 120, 56)
    pay = external(d, "Payments", 380, 350, 120, 50)
    odb = db(d, "Orders DB", 560, 230, 120, 70)
    res = cache(d, "Reservations\n(TTL locks)", 560, 130, 140, 56)
    fq = queue(d, "Fulfillment Q", 740, 240, 130, 50)
    d.edge(buyer, cart)
    d.edge(cart, inv, "reserve")
    d.edge(cart, order, "checkout")
    d.edge(order, pay, "charge")
    d.edge(order, odb)
    d.edge(inv, res)
    d.edge(order, fq, "ship")
    d.note("Idempotent payment · soft lock with TTL · saga / compensating cancel on failure", 50, 460, 560, 40)
    d.legend(items=[("Client", CLIENT), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Queue", QUEUE), ("External", EXTERNAL)])
    d.write()


def recommendation_feed():
    d = Diagram("recommendation-feed", "Recommendation / Feed Ranking", 1300, 840)
    c = client(d, "Client", 50, 220, 100, 56)
    api = compute(d, "Feed API", 200, 220, 110, 56)
    cand = compute(d, "Candidate\ngeneration", 370, 140, 130, 56)
    rank = compute(d, "Ranker\n(ML features)", 370, 240, 130, 56)
    filt = compute(d, "Filters\n(seen, safety)", 370, 340, 130, 56)
    feat = cache(d, "Feature store", 560, 200, 130, 56)
    items = db(d, "Item store", 560, 320, 130, 70)
    eng = queue(d, "Engagement\nevents", 740, 220, 130, 50)
    d.edge(c, api)
    d.edge(api, cand)
    d.edge(cand, rank)
    d.edge(rank, filt)
    d.edge(filt, api, "ranked list", dashed=True)
    d.edge(rank, feat)
    d.edge(cand, items)
    d.edge(api, eng, "offline+nearline", dashed=True)
    d.note("Multi-stage: retrieve → rank → filter · feature store for low-latency signals", 50, 460, 560, 40)
    d.legend()
    d.write()


def foundations_traffic():
    d = Diagram("foundations-traffic-tier", "Traffic / Edge Tier", 1400, 820)
    c = client(d, "Clients\n(Web / Mobile)", 40, 160, 140, 70)
    dns = network(d, "DNS\n(+ GeoDNS / Anycast)", 230, 160, 170, 70)
    cdn = network(d, "CDN / Edge\ncache", 450, 160, 140, 70)
    lb = network(d, "Load Balancer\n(L4 / L7)", 640, 160, 140, 70)
    gw = network(d, "API Gateway\nAuth · RL · Routing", 830, 160, 160, 70)
    svc = compute(d, "App Services\n(stateless)", 1040, 160, 140, 70)
    proxy = network(d, "Reverse Proxy\n(NGINX / Envoy)", 640, 300, 160, 60)
    cb = compute(d, "Circuit breaker\n+ bulkheads", 860, 300, 150, 60)
    d.edge(c, dns, "resolve")
    d.edge(dns, cdn)
    d.edge(cdn, lb, "miss / API")
    d.edge(lb, gw)
    d.edge(gw, svc)
    d.edge(lb, proxy, "alt", dashed=True)
    d.edge(gw, cb, dashed=True)
    d.note("Draw left→right: clients → DNS → CDN → LB → gateway → services.\nLeave data stores blank until capacity/API steps.", 40, 420, 560, 50)
    d.legend()
    d.write()


def foundations_data():
    d = Diagram("foundations-data-tier", "Data Tier Patterns", 1400, 860)
    app = compute(d, "App / Service", 60, 220, 130, 64)
    cch = cache(d, "Cache\n(Redis)", 260, 120, 120, 64)
    primary = db(d, "Primary DB", 260, 240, 120, 70)
    replica = db(d, "Read replicas", 450, 240, 130, 70)
    shard = db(d, "Shard N\n(hash / range)", 260, 370, 130, 70)
    q = queue(d, "Queue / Stream", 450, 120, 130, 56)
    obj = storage(d, "Object store\n(blobs)", 640, 220, 130, 56)
    search = cache(d, "Search index", 640, 340, 130, 56)
    d.edge(app, cch, "read")
    d.edge(app, primary, "write")
    d.edge(primary, replica, "async repl", dashed=True)
    d.edge(app, shard, "partition")
    d.edge(app, q, "async")
    d.edge(app, obj)
    d.edge(app, search, "index", dashed=True)
    d.note("Label consistency: sync vs async replication; cache TTLs; shard key.", 60, 500, 520, 40)
    d.legend(items=[("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Storage", STORAGE), ("Queue", QUEUE)])
    d.write()


def whiteboard_template():
    d = Diagram("whiteboard-starter-template", "Whiteboard Starter Template", 1300, 820)
    c = client(d, "Clients", 50, 200, 110, 56)
    lb = network(d, "LB", 210, 200, 100, 56)
    svc = compute(d, "Service(s)\n________", 360, 200, 130, 56)
    cch = cache(d, "Cache\n________", 540, 120, 120, 56)
    database = db(d, "DB\n________", 540, 240, 120, 70)
    q = queue(d, "Queue\n________", 720, 200, 120, 50)
    w = compute(d, "Workers\n________", 890, 200, 120, 56)
    d.edge(c, lb)
    d.edge(lb, svc)
    d.edge(svc, cch)
    d.edge(svc, database)
    d.edge(svc, q)
    d.edge(q, w)
    d.group("NFRs:\nLatency:\nConsistency:\nAvailability:", 1000, 100, 200, 120)
    d.note("1. Clarify (5 min) — write NFRs top-right\n2. Capacity — QPS / storage numbers under title\n3. Boxes: clients → LB → services → data → async\n4. Leave CDN / shards / multi-region blank until asked", 50, 380, 620, 90)
    d.legend()
    d.write()


# ═══════════════════════════════════════════════════════════════════════════
# NEW DIAGRAMS
# ═══════════════════════════════════════════════════════════════════════════

def dns_resolution():
    d = Diagram("dns-resolution", "DNS Resolution Flow", 1300, 820)
    browser = client(d, "Browser", 50, 220, 110, 56)
    stub = network(d, "Stub resolver\n(OS / ISP)", 210, 220, 140, 64)
    root = network(d, "Root NS", 410, 100, 110, 50)
    tld = network(d, "TLD NS\n(.com)", 410, 180, 110, 50)
    auth = network(d, "Authoritative\nNS", 410, 260, 120, 56)
    cdn = network(d, "CDN / Anycast\nedge", 600, 220, 140, 64)
    origin = compute(d, "Origin\nservers", 800, 220, 120, 56)
    d.edge(browser, stub, "1. lookup")
    d.edge(stub, root, "2. where .com?")
    d.edge(stub, tld, "3. where example?")
    d.edge(stub, auth, "4. A / CNAME")
    d.edge(stub, browser, "5. IP", dashed=True)
    d.edge(browser, cdn, "6. HTTPS")
    d.edge(cdn, origin, "miss", dashed=True)
    d.note("TTL caching at each hop · CNAME often points to CDN · GeoDNS returns nearest POP", 50, 400, 580, 40)
    d.legend(items=[("Client", CLIENT), ("Network", NETWORK), ("Compute", COMPUTE)])
    d.write()


def load_balancing_patterns():
    d = Diagram("load-balancing-patterns", "Load Balancing Patterns", 1400, 900)
    c = client(d, "Clients", 50, 280, 100, 56)
    # L4 vs L7
    d.group("Layer 4 (TCP/UDP)", 200, 100, 280, 160)
    l4 = network(d, "L4 LB\n5-tuple", 230, 140, 120, 56)
    d.group("Layer 7 (HTTP)", 200, 300, 280, 160)
    l7 = network(d, "L7 LB\npath / host / header", 220, 340, 160, 56)
    # algorithms
    d.group("Algorithms", 540, 100, 520, 420)
    rr = compute(d, "Round robin", 570, 140, 140, 50)
    lc = compute(d, "Least\nconnections", 740, 140, 140, 56)
    ch = compute(d, "Consistent\nhash", 910, 140, 130, 56)
    s1 = compute(d, "Server A", 570, 280, 110, 50)
    s2 = compute(d, "Server B", 720, 280, 110, 50)
    s3 = compute(d, "Server C", 870, 280, 110, 50)
    sticky = cache(d, "Sticky session\n(cookie / IP hash)", 570, 380, 180, 56)
    d.edge(c, l4)
    d.edge(c, l7)
    d.edge(l7, rr)
    d.edge(l7, lc)
    d.edge(l7, ch)
    d.edge(rr, s1)
    d.edge(lc, s2)
    d.edge(ch, s3)
    d.edge(l7, sticky, dashed=True)
    d.note("L4: fast, opaque bytes · L7: content routing, TLS terminate, WAF\nConsistent hash: minimize remaps on scale-out · sticky for stateful (prefer sticky elsewhere)", 50, 520, 700, 55)
    d.legend()
    d.write()


def caching_strategies():
    d = Diagram("caching-strategies", "Caching Strategies", 1400, 920)
    # Cache-aside
    d.group("1. Cache-aside (lazy)", 40, 90, 320, 280)
    a_app = compute(d, "App", 60, 140, 90, 46)
    a_c = cache(d, "Cache", 180, 120, 90, 46)
    a_db = db(d, "DB", 180, 220, 90, 56)
    d.edge(a_app, a_c, "1 get")
    d.edge(a_app, a_db, "2 miss→read")
    d.edge(a_app, a_c, "3 set", dashed=True)
    # Read-through
    d.group("2. Read-through", 380, 90, 300, 280)
    b_app = compute(d, "App", 400, 160, 90, 46)
    b_c = cache(d, "Cache", 530, 120, 100, 46)
    b_db = db(d, "DB", 530, 220, 90, 56)
    d.edge(b_app, b_c, "get")
    d.edge(b_c, b_db, "load", dashed=True)
    # Write-through
    d.group("3. Write-through", 700, 90, 300, 280)
    c_app = compute(d, "App", 720, 160, 90, 46)
    c_c = cache(d, "Cache", 850, 120, 100, 46)
    c_db = db(d, "DB", 850, 220, 90, 56)
    d.edge(c_app, c_c, "write")
    d.edge(c_c, c_db, "sync")
    # Write-behind
    d.group("4. Write-behind (async)", 1020, 90, 320, 280)
    e_app = compute(d, "App", 1040, 140, 90, 46)
    e_c = cache(d, "Cache", 1160, 120, 100, 46)
    e_q = queue(d, "Flush Q", 1160, 200, 100, 40)
    e_db = db(d, "DB", 1160, 280, 90, 56)
    d.edge(e_app, e_c, "write")
    d.edge(e_c, e_q, "async")
    d.edge(e_q, e_db)
    d.note("Cache-aside: app owns logic (most common) · Read-through: library loads · Write-through: strong freshness, slower writes\nWrite-behind: fast writes, risk of loss — flush carefully · Always name TTL + invalidation", 40, 420, 900, 55)
    d.legend()
    d.write()


def sharding_consistent_hash():
    d = Diagram("sharding-consistent-hash", "Consistent Hashing + Virtual Nodes", 1300, 900)
    d.note("Hash ring (clockwise)", 500, 80, 200, 24)
    # Ring nodes as boxes arranged roughly in a circle
    n1 = compute(d, "Node A\nv1,v2,v3", 560, 140, 120, 56)
    n2 = compute(d, "Node B\nv1,v2,v3", 760, 260, 120, 56)
    n3 = compute(d, "Node C\nv1,v2,v3", 560, 400, 120, 56)
    n4 = compute(d, "Node D\nv1,v2,v3", 360, 260, 120, 56)
    # visual ring edges
    d.edge(n1, n2)
    d.edge(n2, n3)
    d.edge(n3, n4)
    d.edge(n4, n1)
    key = client(d, "key = user_42\nhash → position", 80, 200, 150, 64)
    d.edge(key, n1, "maps to\nnext clockwise")
    hot = external(d, "Hotspot\n(celebrity key)", 80, 360, 150, 56)
    d.edge(hot, n2, "skew!", dashed=True)
    d.group("Why virtual nodes?", 80, 480, 400, 120)
    d.note("• Many vnodes per physical node → even load\n• Add/remove node remaps only neighbors\n• Mitigate hotspots with more vnodes or cache", 100, 510, 360, 70)
    d.legend(items=[("Client / Key", CLIENT), ("Compute / Node", COMPUTE), ("External / Hotspot", EXTERNAL)])
    d.write()


def replication_failover():
    d = Diagram("replication-failover", "Primary–Replica Replication & Failover", 1300, 860)
    app = compute(d, "App / Proxy\n(PgBouncer)", 60, 240, 140, 64)
    primary = db(d, "PRIMARY\n(writes)", 300, 160, 140, 80)
    r1 = db(d, "Replica 1\n(reads)", 520, 100, 130, 70)
    r2 = db(d, "Replica 2\n(reads)", 520, 220, 130, 70)
    r3 = db(d, "Replica 3\n(standby)", 520, 340, 130, 70)
    mon = network(d, "Health monitor\n/ consensus", 300, 360, 150, 56)
    newp = db(d, "NEW PRIMARY\n(promoted R1)", 760, 100, 150, 80)
    d.edge(app, primary, "writes")
    d.edge(app, r1, "reads")
    d.edge(app, r2, "reads")
    d.edge(primary, r1, "async / sync WAL", dashed=True)
    d.edge(primary, r2, "repl", dashed=True)
    d.edge(primary, r3, "repl", dashed=True)
    d.edge(mon, primary, "heartbeat")
    d.edge(mon, newp, "failover\npromote", dashed=True)
    d.note("Detect failure → elect / promote replica → reconfigure clients (DNS / proxy)\nTradeoff: sync = durability, async = lag · fencing to avoid split-brain", 60, 480, 700, 55)
    d.legend(items=[("Compute", COMPUTE), ("Network", NETWORK), ("Database", DB)])
    d.write()


def cap_pacelc():
    d = Diagram("cap-pacelc", "CAP & PACELC Tradeoffs", 1200, 860)
    d.group("CAP (during partition)", 60, 100, 500, 280)
    cp = compute(d, "CP\nConsistency +\nPartition tolerance\n(refuse some requests)", 90, 160, 200, 100)
    ap = cache(d, "AP\nAvailability +\nPartition tolerance\n(serve possibly stale)", 320, 160, 200, 100)
    d.group("PACELC (else, no partition)", 600, 100, 520, 280)
    pa_el = network(d, "PA/EL\nPrefer Availability &\nlow Latency\n(eventual)", 630, 160, 220, 100)
    pc_ec = db(d, "PC/EC\nPrefer Consistency\neven if higher latency", 880, 160, 210, 100)
    d.note("Axes (not a meme):\n• Partition? → choose C vs A\n• Else → choose Latency vs Consistency\nExamples: Dynamo-style → PA/EL · Spanner-ish → PC/EC · ZooKeeper → CP", 60, 440, 700, 100)
    d.legend(items=[("CP / Compute", COMPUTE), ("AP / Cache-like", CACHE), ("PA/EL Network", NETWORK), ("PC/EC Database", DB)])
    d.write()


def messaging_pubsub_vs_queue():
    d = Diagram("messaging-pubsub-vs-queue", "Pub/Sub vs Queue", 1300, 860)
    d.group("Queue (competing consumers)", 50, 100, 560, 320)
    prod1 = compute(d, "Producer", 80, 160, 110, 50)
    q = queue(d, "Work queue", 240, 160, 120, 50)
    w1 = compute(d, "Worker 1", 420, 120, 110, 50)
    w2 = compute(d, "Worker 2", 420, 200, 110, 50)
    w3 = compute(d, "Worker 3", 420, 280, 110, 50)
    d.edge(prod1, q)
    d.edge(q, w1, "msg A")
    d.edge(q, w2, "msg B")
    d.edge(q, w3, "msg C")
    d.group("Pub/Sub (fan-out)", 660, 100, 560, 320)
    prod2 = compute(d, "Publisher", 690, 200, 110, 50)
    topic = queue(d, "Topic", 850, 200, 110, 50)
    s1 = compute(d, "Sub A\n(email)", 1010, 120, 120, 50)
    s2 = compute(d, "Sub B\n(analytics)", 1010, 200, 120, 50)
    s3 = compute(d, "Sub C\n(push)", 1010, 280, 120, 50)
    d.edge(prod2, topic)
    d.edge(topic, s1, "copy")
    d.edge(topic, s2, "copy")
    d.edge(topic, s3, "copy")
    d.note("Queue: each message processed once (load distribute) · Pub/Sub: each subscriber gets a copy\nKafka: log + consumer groups = both patterns · ack / retry / DLQ still apply", 50, 480, 800, 55)
    d.legend(items=[("Compute", COMPUTE), ("Queue / Topic", QUEUE)])
    d.write()


def rate_limiting_algorithms():
    d = Diagram("rate-limiting-algorithms", "Rate Limiting Algorithms", 1400, 900)
    d.group("Token Bucket", 50, 100, 400, 300)
    tb = cache(d, "Bucket\ntokens=N\nrefill rate R", 100, 160, 140, 80)
    req = client(d, "Request", 280, 140, 110, 50)
    allow = compute(d, "allow if\ntoken ≥ 1", 280, 240, 120, 56)
    d.edge(req, tb, "take 1")
    d.edge(tb, allow)
    d.group("Sliding Window Log", 490, 100, 400, 300)
    sw = cache(d, "Sorted set\nof timestamps", 540, 160, 150, 70)
    swr = client(d, "Request @ t", 730, 140, 110, 50)
    swa = compute(d, "count in\n[t−W, t] ≤ limit", 720, 240, 140, 56)
    d.edge(swr, sw)
    d.edge(sw, swa)
    d.group("Fixed Window", 930, 100, 400, 300)
    fw = cache(d, "Counter\nper window", 980, 160, 140, 70)
    fwr = client(d, "Request", 1160, 140, 110, 50)
    fwa = compute(d, "INCR ≤ limit\nelse 429", 1160, 240, 130, 56)
    d.edge(fwr, fw)
    d.edge(fw, fwa)
    d.note("Token bucket: allows bursts · Sliding window: smoother, more memory · Fixed window: simple, boundary burst\nDistributed: Redis + Lua for atomicity · return Retry-After", 50, 460, 850, 55)
    d.legend()
    d.write()


def websocket_vs_sse_vs_polling():
    d = Diagram("websocket-vs-sse-vs-polling", "WebSocket vs SSE vs Polling", 1400, 900)
    # Polling
    d.group("Short / Long Polling", 50, 100, 400, 320)
    pc = client(d, "Client", 80, 160, 100, 50)
    ps = compute(d, "Server", 280, 160, 100, 50)
    d.edge(pc, ps, "GET … wait", bidi=True)
    d.note("Repeated HTTP\nLong poll holds until event\nSimple, higher overhead", 80, 260, 300, 70)
    # SSE
    d.group("Server-Sent Events", 490, 100, 400, 320)
    sc = client(d, "Client", 520, 160, 100, 50)
    ss = compute(d, "Server", 720, 160, 100, 50)
    d.edge(sc, ss, "GET /events")
    d.edge(ss, sc, "stream text/event-stream", dashed=True)
    d.note("Server → client only\nAuto-reconnect\nGreat for feeds / ticks", 520, 260, 300, 70)
    # WS
    d.group("WebSocket", 930, 100, 400, 320)
    wc = client(d, "Client", 960, 160, 100, 50)
    ws = network(d, "WS Gateway", 1160, 160, 120, 50)
    d.edge(wc, ws, "upgrade", bidi=True)
    d.note("Full duplex\nChat, collab, games\nNeed sticky / conn map", 960, 260, 300, 70)
    d.note("Choose by directionality + scale of connections · Always plan reconnect + backlog catch-up", 50, 480, 700, 40)
    d.legend(items=[("Client", CLIENT), ("Network", NETWORK), ("Compute", COMPUTE)])
    d.write()


def bloom_filter():
    d = Diagram("bloom-filter", "Bloom Filter — Set Membership", 1200, 860)
    item = client(d, "item x", 50, 200, 100, 50)
    h1 = compute(d, "h1(x)", 200, 120, 90, 46)
    h2 = compute(d, "h2(x)", 200, 200, 90, 46)
    h3 = compute(d, "h3(x)", 200, 280, 90, 46)
    d.group("Bit array (m bits)", 360, 120, 420, 220)
    bits = cache(d, "0 1 0 1 1 0 1 0  …  1 0", 390, 180, 360, 60)
    d.edge(item, h1)
    d.edge(item, h2)
    d.edge(item, h3)
    d.edge(h1, bits, "set / test")
    d.edge(h2, bits)
    d.edge(h3, bits)
    yes = compute(d, "Maybe in set\n(false positive OK)", 840, 140, 180, 64)
    no = db(d, "Definitely NOT\nin set", 840, 260, 180, 70)
    d.edge(bits, yes, "all 1s")
    d.edge(bits, no, "any 0")
    d.note("Use: cache miss shield, URL seen?, spell-check · Never for authoritative \"yes\"\nTune m & k for target false-positive rate · no deletes (unless counting bloom)", 50, 420, 700, 60)
    d.legend(items=[("Client / Item", CLIENT), ("Compute / Hash", COMPUTE), ("Cache / Bits", CACHE), ("Database / Negative", DB)])
    d.write()


def circuit_breaker_states():
    d = Diagram("circuit-breaker-states", "Circuit Breaker States", 1200, 860)
    closed = cache(d, "CLOSED\nCalls flow\nCount failures", 80, 220, 180, 100)
    open_ = external(d, "OPEN\nFail fast\n(no calls)", 480, 80, 180, 100)
    half = compute(d, "HALF-OPEN\nTrial requests", 480, 360, 180, 100)
    dep = network(d, "Downstream\nservice", 820, 220, 150, 70)
    d.edge(closed, open_, "failures ≥ threshold")
    d.edge(open_, half, "timeout elapsed")
    d.edge(half, closed, "trials succeed")
    d.edge(half, open_, "trial fails", dashed=True)
    d.edge(closed, dep, "normal")
    d.edge(half, dep, "probe", dashed=True)
    d.note("Pair with bulkheads (isolate pools) · fallback / cached response when OPEN\nMetrics: open rate, fallback rate, latency of half-open probes", 80, 540, 700, 55)
    d.legend(items=[("Closed / Healthy", CACHE), ("Open / Fast-fail", EXTERNAL), ("Half-open / Probe", COMPUTE), ("Downstream", NETWORK)])
    d.write()


def sla_slo_error_budget():
    d = Diagram("sla-slo-error-budget", "SLA · SLO · Error Budget", 1200, 860)
    sla = external(d, "SLA\nCustomer contract\n(credits / legal)", 80, 180, 200, 90)
    slo = compute(d, "SLO\nInternal target\ne.g. 99.9% avail", 360, 180, 200, 90)
    sli = cache(d, "SLI\nMeasured signal\nsuccess / total", 640, 180, 200, 90)
    budget = db(d, "Error budget\n= 1 − SLO\n(e.g. 43 min/mo)", 360, 360, 220, 100)
    d.edge(sli, slo, "evaluate")
    d.edge(slo, sla, "stricter than", dashed=True)
    d.edge(slo, budget, "derives")
    d.note("Burn rate: how fast budget is consumed · Policy: freeze risky deploys when budget low\nInterview: name one SLI, one SLO, and what you do when budget is exhausted", 80, 520, 750, 55)
    d.legend(items=[("SLA / External", EXTERNAL), ("SLO / Compute", COMPUTE), ("SLI / Cache-like", CACHE), ("Budget / DB", DB)])
    d.write()


def observability_three_pillars():
    d = Diagram("observability-three-pillars", "Observability — Three Pillars", 1300, 860)
    app = compute(d, "Services", 80, 240, 120, 64)
    metrics = cache(d, "Metrics\ncounters / histograms\n(Prometheus)", 300, 120, 200, 90)
    logs = compute(d, "Logs\nstructured events\n(ELK / Loki)", 300, 250, 200, 90)
    traces = network(d, "Traces\nspans + context\n(Jaeger / OTel)", 300, 390, 200, 90)
    dash = client(d, "Dashboards\n& alerts", 600, 180, 150, 64)
    oncall = external(d, "On-call\nrunbooks", 600, 320, 150, 64)
    d.edge(app, metrics)
    d.edge(app, logs)
    d.edge(app, traces)
    d.edge(metrics, dash)
    d.edge(logs, dash)
    d.edge(traces, dash)
    d.edge(dash, oncall, "page")
    d.note("RED/USE methods · correlate: alert on metric → trace → logs\nPropagate trace IDs across services · cardinality discipline on labels", 80, 540, 700, 55)
    d.legend(items=[("Client / UI", CLIENT), ("Network / Traces", NETWORK), ("Compute / Logs", COMPUTE), ("Cache / Metrics", CACHE), ("External", EXTERNAL)])
    d.write()


def microservices_vs_monolith():
    d = Diagram("microservices-vs-monolith", "Monolith vs Microservices", 1400, 880)
    d.group("Monolith", 50, 100, 520, 360)
    mc = client(d, "Clients", 80, 160, 100, 50)
    mlb = network(d, "LB", 220, 160, 90, 50)
    mono = compute(d, "Single deployable\nmodules in-process", 350, 140, 180, 80)
    mdb = db(d, "One DB\n(often)", 350, 280, 140, 70)
    d.edge(mc, mlb)
    d.edge(mlb, mono)
    d.edge(mono, mdb)
    d.group("Microservices", 620, 100, 700, 360)
    sc = client(d, "Clients", 650, 160, 100, 50)
    sgw = network(d, "API Gateway", 790, 160, 120, 50)
    s1 = compute(d, "Orders", 960, 120, 100, 50)
    s2 = compute(d, "Inventory", 1080, 120, 110, 50)
    s3 = compute(d, "Payments", 960, 200, 100, 50)
    s4 = compute(d, "Users", 1080, 200, 100, 50)
    sd1 = db(d, "DB", 960, 300, 80, 56)
    sd2 = db(d, "DB", 1080, 300, 80, 56)
    bus = queue(d, "Events", 790, 280, 100, 46)
    d.edge(sc, sgw)
    d.edge(sgw, s1)
    d.edge(sgw, s2)
    d.edge(sgw, s3)
    d.edge(sgw, s4)
    d.edge(s1, sd1)
    d.edge(s2, sd2)
    d.edge(s1, bus)
    d.edge(bus, s3, dashed=True)
    d.note("Monolith: simpler ops, transactional integrity · Microservices: independent scale & deploy, distributed complexity\nSenior move: start modular monolith; extract when team/scale demands", 50, 520, 850, 55)
    d.legend()
    d.write()


def payment_idempotency():
    d = Diagram("payment-idempotency", "Payment Idempotency", 1300, 860)
    client_ = client(d, "Client\nIdempotency-Key", 50, 200, 150, 70)
    api = compute(d, "Payments API", 260, 210, 130, 56)
    store = cache(d, "Idempotency\nstore (Redis/DB)\nkey → response", 450, 120, 170, 80)
    ledger = db(d, "Ledger /\nintents", 450, 260, 140, 70)
    psp = external(d, "PSP\n(Stripe etc.)", 680, 210, 130, 56)
    webhooks = queue(d, "Webhook Q", 860, 210, 120, 50)
    d.edge(client_, api, "POST /charge")
    d.edge(api, store, "lookup / save")
    d.edge(api, ledger, "record intent")
    d.edge(api, psp, "create charge")
    d.edge(psp, webhooks, "async events")
    d.edge(webhooks, api, "reconcile", dashed=True)
    d.note("Same key → same response (no double charge) · store request hash + result\nRetries safe; webhooks may reorder — state machine on payment intent", 50, 420, 700, 55)
    d.legend(items=[("Client", CLIENT), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Queue", QUEUE), ("External", EXTERNAL)])
    d.write()


def ticket_booking_concurrency():
    d = Diagram("ticket-booking-concurrency", "Ticket Booking Concurrency", 1300, 860)
    user = client(d, "User", 50, 220, 100, 56)
    api = compute(d, "Booking API", 200, 220, 120, 56)
    seat = cache(d, "Seat locks\n(Redis TTL)", 380, 140, 140, 64)
    inv = db(d, "Inventory\nrows / versions", 380, 260, 150, 70)
    pay = external(d, "Payments", 580, 220, 120, 50)
    conf = compute(d, "Confirm /\nissue ticket", 760, 220, 140, 56)
    q = queue(d, "Timeout /\nrelease", 580, 340, 130, 50)
    d.edge(user, api, "hold seat")
    d.edge(api, seat, "SET NX + TTL")
    d.edge(api, inv, "optimistic\nversion check")
    d.edge(api, pay, "charge")
    d.edge(pay, conf, "success")
    d.edge(q, seat, "expire → free", dashed=True)
    d.note("Avoid oversell: lock or conditional UPDATE · TTL holds · payment then confirm\nCompensating release on pay fail · hot seats = contention hotspot", 50, 450, 700, 55)
    d.legend(items=[("Client", CLIENT), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Queue", QUEUE), ("External", EXTERNAL)])
    d.write()


def search_inverted_index():
    d = Diagram("search-inverted-index", "Search — Inverted Index", 1300, 860)
    docs = storage(d, "Documents", 50, 200, 120, 56)
    analyze = compute(d, "Analyzer\ntokenize · stem", 230, 200, 140, 64)
    idx = cache(d, "Inverted index\nterm → postings\n(docId, tf, pos)", 430, 180, 200, 90)
    q = client(d, "Query:\n\"system design\"", 50, 380, 150, 64)
    search = compute(d, "Query engine\nboolean + rank", 280, 380, 160, 64)
    rank = compute(d, "Ranking\nBM25 / learning-to-rank", 500, 380, 180, 64)
    hits = client(d, "Top-K results", 740, 380, 130, 56)
    d.edge(docs, analyze, "index path")
    d.edge(analyze, idx)
    d.edge(q, search)
    d.edge(search, idx, "lookup")
    d.edge(search, rank)
    d.edge(rank, hits)
    d.note("Postings lists intersect / union · positional for phrases · shard by term or doc\nNear-real-time: refresh interval vs durability", 50, 520, 700, 55)
    d.legend(items=[("Client / Query", CLIENT), ("Compute", COMPUTE), ("Cache / Index", CACHE), ("Storage / Docs", STORAGE)])
    d.write()


def typeahead():
    d = Diagram("typeahead", "Typeahead / Autocomplete", 1200, 820)
    user = client(d, "User types\n\"sys…\"", 50, 200, 120, 64)
    edge = network(d, "Edge / CDN\nprefix cache", 220, 200, 140, 64)
    api = compute(d, "Suggest API", 420, 200, 120, 56)
    trie = cache(d, "Trie / prefix\nindex (Redis)", 600, 140, 150, 64)
    rank = compute(d, "Ranker\npopularity · personal", 600, 260, 160, 64)
    store = db(d, "Query logs /\nfreq table", 820, 200, 140, 70)
    d.edge(user, edge)
    d.edge(edge, api, "miss")
    d.edge(api, trie, "prefix")
    d.edge(api, rank)
    d.edge(rank, store, "offline scores", dashed=True)
    d.note("Debounce client · cache top prefixes at edge · limit fan-out · personalization light at low latency", 50, 400, 650, 45)
    d.legend()
    d.write()


def web_crawler():
    d = Diagram("web-crawler", "Web Crawler", 1300, 860)
    seed = client(d, "Seed URLs", 50, 200, 110, 56)
    fq = queue(d, "Frontier\nqueue", 210, 200, 120, 56)
    fetcher = compute(d, "Fetchers\n(politeness)", 380, 200, 140, 64)
    dns = network(d, "DNS cache", 380, 320, 120, 50)
    store = storage(d, "Content store", 580, 140, 130, 56)
    parse = compute(d, "Parser /\nlink extractor", 580, 240, 140, 56)
    seen = cache(d, "URL seen?\n(Bloom + DB)", 780, 240, 140, 64)
    idx = db(d, "Index /\nmetadata", 780, 140, 130, 64)
    d.edge(seed, fq)
    d.edge(fq, fetcher)
    d.edge(fetcher, dns, dashed=True)
    d.edge(fetcher, store, "raw")
    d.edge(fetcher, parse)
    d.edge(parse, seen, "new links?")
    d.edge(seen, fq, "enqueue", dashed=True)
    d.edge(parse, idx)
    d.note("Politeness per host · robots.txt · Bloom for seen URLs · prioritize frontier · handle redirects & canonicals", 50, 440, 700, 45)
    d.legend(items=[("Client", CLIENT), ("Network", NETWORK), ("Compute", COMPUTE), ("Cache", CACHE), ("Database", DB), ("Queue", QUEUE), ("Storage", STORAGE)])
    d.write()


def interview_clarify_to_hld():
    d = Diagram("interview-clarify-to-hld", "Interview Flow: Clarify → HLD", 1400, 820)
    s1 = client(d, "1. Clarify\n5–8 min\nusers · scale · NFRs", 60, 220, 200, 100)
    s2 = compute(d, "2. Capacity\n5 min\nQPS · storage · BW", 320, 220, 200, 100)
    s3 = network(d, "3. High-level\ndesign 10–15 min\nboxes + APIs", 580, 220, 220, 100)
    s4 = cache(d, "4. Deep dive\n+ failures 10 min\ntradeoffs · SLO", 860, 220, 220, 100)
    d.edge(s1, s2)
    d.edge(s2, s3)
    d.edge(s3, s4)
    d.note("Speak while drawing · check in after each step · leave room for interviewer steer\nNFRs top-right · numbers under title · never invent requirements — ask", 60, 400, 700, 60)
    d.group("Board layout reminder", 60, 500, 500, 100)
    d.note("Left→right data flow · clients | edge | services | data | async", 80, 540, 450, 40)
    d.legend(items=[("Clarify", CLIENT), ("Capacity", COMPUTE), ("HLD", NETWORK), ("Deep dive", CACHE)])
    d.write()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    # Upgrades
    url_shortener()
    rate_limiter()
    notification_system()
    news_feed()
    chat_messaging()
    uber_dispatch()
    video_streaming()
    dropbox()
    nearby_places()
    group_chat()
    collab_doc()
    ecommerce_checkout()
    recommendation_feed()
    foundations_traffic()
    foundations_data()
    whiteboard_template()
    # New
    dns_resolution()
    load_balancing_patterns()
    caching_strategies()
    sharding_consistent_hash()
    replication_failover()
    cap_pacelc()
    messaging_pubsub_vs_queue()
    rate_limiting_algorithms()
    websocket_vs_sse_vs_polling()
    bloom_filter()
    circuit_breaker_states()
    sla_slo_error_budget()
    observability_three_pillars()
    microservices_vs_monolith()
    payment_idempotency()
    ticket_booking_concurrency()
    search_inverted_index()
    typeahead()
    web_crawler()
    interview_clarify_to_hld()
    files = sorted(OUT.glob("*.drawio"))
    print(f"\nTotal diagrams: {len(files)}")
    for f in files:
        print(f"  {f.name}")


if __name__ == "__main__":
    main()
