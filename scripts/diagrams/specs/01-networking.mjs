import { Diagram, table, sequence, TONES, T, textWidth } from "../engine.mjs";

export default {
  "ip-nat": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Networking · IP addresses",
      title: "Public vs private IPs, and why NAT matters",
      subtitle: "Only the edge of a network has a **public** address. Everything behind it uses **private** addresses the internet cannot reach.",
      takeaway: "Thousands of phones can share one carrier IP — so rate-limit by user or API key first, IP second.",
    });
    d.group({ x: 40, y: 160, w: 400, h: 400, label: "Home / mobile carrier · private", tone: "client" });
    d.node({ id: "p1", x: 70, y: 210, w: 250, h: 58, kind: "mobile", title: "Phone", sub: "192.168.1.20" });
    d.node({ id: "p2", x: 70, y: 290, w: 250, h: 58, kind: "browser", title: "Laptop", sub: "192.168.1.21" });
    d.node({ id: "p3", x: 70, y: 370, w: 250, h: 58, kind: "user", title: "Smart TV", sub: "192.168.1.22" });
    d.node({ id: "nat", x: 70, y: 470, w: 340, h: 64, kind: "firewall", tone: "edge", title: "Router with NAT", sub: "public IP 198.51.100.7" });
    ["p1", "p2", "p3"].forEach((p) => d.edge(p, [360, 470], { sides: "rt", via: [[360, d.nodes[p].cy]] }));

    d.node({ id: "net", x: 540, y: 330, w: 200, h: 70, kind: "external", title: "Internet", sub: "routes public IPs" });
    d.edge("nat", "net", { sides: "rb", via: [[640, 502]], label: "all look like 198.51.100.7", at: [520, 502] });

    d.group({ x: 820, y: 160, w: 640, h: 400, label: "Your cloud network (VPC)", tone: "compute" });
    d.node({ id: "lb", x: 850, y: 330, w: 230, h: 70, kind: "lb", title: "Load balancer", sub: "public VIP 203.0.113.10", emphasis: true });
    d.group({ x: 1110, y: 200, w: 330, h: 330, label: "Private subnet", tone: "neutral", dashed: true });
    d.node({ id: "a1", x: 1140, y: 250, w: 270, h: 58, kind: "service", title: "App server", sub: "10.0.1.11" });
    d.node({ id: "a2", x: 1140, y: 336, w: 270, h: 58, kind: "service", title: "App server", sub: "10.0.1.12" });
    d.node({ id: "db", x: 1140, y: 440, w: 270, h: 58, kind: "db", title: "Database", sub: "10.0.2.5 · never public" });
    d.edge("net", "lb", { sides: "rl", hot: true, label: "HTTPS" });
    d.edge("lb", "a1", { sides: "rl", mid: 1100 });
    d.edge("lb", "a2", { sides: "rl", mid: 1100 });
    d.edge("a2", "db", { sides: "bt" });
    return d;
  },

  "osi-model": () => {
    const d = new Diagram({
      w: 1500, h: 760,
      eyebrow: "Networking · layers",
      title: "The OSI model — only two layers matter in interviews",
      subtitle: "It is a teaching model of how data travels. You will mostly say **L4** (TCP/UDP) and **L7** (HTTP).",
      takeaway: "L4 load balancers see IPs and ports (fast, blind). L7 load balancers read HTTP (smart routing, a bit more CPU).",
    });
    const layers = [
      ["7", "Application", "HTTP, gRPC, DNS, SMTP", "What your app speaks", "compute", true],
      ["6", "Presentation", "TLS encryption, JSON, gzip", "How bytes are encoded", "neutral"],
      ["5", "Session", "Sessions, reconnects", "Rarely drawn", "neutral"],
      ["4", "Transport", "TCP, UDP, QUIC · ports", "Reliable or fast delivery", "edge", true],
      ["3", "Network", "IP addresses, routing", "VPCs, subnets", "neutral"],
      ["2", "Data link", "Ethernet, Wi-Fi frames", "Rarely drawn", "neutral"],
      ["1", "Physical", "Cables, radio, light", "Rarely drawn", "neutral"],
    ];
    const x = 48, y0 = 168, w = 760, h = 64, g = 8;
    layers.forEach(([n, name, ex, note, tone, hl], i) => {
      const y = y0 + i * (h + g);
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${hl ? bg : "#fff"}" stroke="${hl ? a : br}" stroke-width="${hl ? 2 : 1.5}"/>`, "back");
      d.raw(`<rect x="${x + 14}" y="${y + 14}" width="36" height="36" rx="9" fill="${hl ? a : "#F1F5F9"}"/>`, "back");
      d.text(x + 32, y + 38, "L" + n, { size: 14, weight: 800, color: hl ? "#fff" : T.muted, anchor: "middle" });
      d.text(x + 68, y + 30, name, { size: 16, weight: 700, color: T.ink });
      d.text(x + 68, y + 50, ex, { size: 13, color: T.muted });
      d.text(x + w - 18, y + 38, note, { size: 13, weight: 600, color: hl ? a : T.faint, anchor: "end" });
    });
    const Y = (i) => y0 + i * (h + g) + h / 2;
    d.node({ id: "l7", x: 880, y: Y(0) - 36, w: 330, h: 72, kind: "gateway", title: "L7 load balancer / API gateway", sub: "routes by path, header, cookie", emphasis: true });
    d.node({ id: "l4", x: 880, y: Y(3) - 36, w: 330, h: 72, kind: "lb", title: "L4 load balancer", sub: "routes by IP + port only" });
    d.edge([x + w + 4, Y(0)], "l7", { sides: "rl", route: "straight", hot: true });
    d.edge([x + w + 4, Y(3)], "l4", { sides: "rl", route: "straight" });
    d.note({ x: 880, y: Y(4) - 20, w: 572, title: "The internet really uses TCP/IP (4 layers)", icon: "globe", tone: "info", lines: ["Application (L5–7) · Transport (L4) · Internet (L3) · Link (L1–2).", "Same ideas, fewer boxes. OSI numbers survive because “L4 vs L7” is handy shorthand."] });
    d.text(1236, Y(0) + 6, "can see  /api/payments", { size: 13, weight: 600, color: TONES.compute[0] });
    d.text(1236, Y(3) + 6, "sees only  :443", { size: 13, weight: 600, color: TONES.edge[0] });
    return d;
  },

  "tcp-vs-udp": () => {
    const d = new Diagram({
      w: 1500, h: 760,
      eyebrow: "Networking · transport",
      title: "TCP vs UDP",
      subtitle: "**TCP** is a courier who gets a signature for every parcel. **UDP** throws postcards and never checks.",
      takeaway: "Default to TCP for APIs and databases. Pick UDP (or QUIC) when a late packet is worse than a lost one — calls, games, live video.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 560, title: "TCP — reliable, ordered", tone: "info", tag: "APIs · DBs · files" });
    sequence(d, {
      x: 70, y: 230, w: 640, actorW: 170, rowH: 40,
      actors: [{ kind: "user", title: "Client" }, { kind: "service", title: "Server" }],
      messages: [
        { from: 0, to: 1, label: "SYN", step: 1 },
        { from: 1, to: 0, label: "SYN-ACK", step: 2 },
        { from: 0, to: 1, label: "ACK — connection open", step: 3 },
        { from: 0, to: 1, label: "data #1" },
        { from: 1, to: 0, label: "ACK #1", dashed: true },
        { from: 0, to: 1, label: "data #2  ✗ lost", tone: "bad" },
        { note: "no ACK within timeout → resend", from: 0, to: 1, tone: "warn" },
        { from: 0, to: 1, label: "data #2 (retransmit)", tone: "good" },
        { from: 1, to: 0, label: "ACK #2", dashed: true },
      ],
    });
    d.panel({ x: 760, y: 158, w: 700, h: 560, title: "UDP — fast, best-effort", tone: "warn", tag: "Video · games · DNS" });
    sequence(d, {
      x: 790, y: 230, w: 640, actorW: 170, rowH: 40,
      actors: [{ kind: "user", title: "Client" }, { kind: "service", title: "Server" }],
      messages: [
        { note: "no handshake — just send", from: 0, to: 1, tone: "info" },
        { from: 0, to: 1, label: "frame 1" },
        { from: 0, to: 1, label: "frame 2  ✗ lost", tone: "bad" },
        { from: 0, to: 1, label: "frame 3" },
        { from: 0, to: 1, label: "frame 4" },
        { note: "frame 2 is simply skipped", from: 0, to: 1, tone: "warn" },
      ],
    });
    d.text(810, 590, "✓  No setup cost, no waiting on a lost packet", { size: 13.5, color: T.body });
    d.text(810, 616, "✓  Perfect when newer data replaces older data", { size: 13.5, color: T.body });
    d.text(810, 642, "✗  App must handle loss, order and congestion itself", { size: 13.5, color: "#B91C1C" });
    d.text(810, 684, "HTTP/3 = QUIC over UDP: reliability rebuilt in user space.", { size: 13, weight: 600, color: TONES.edge[0] });
    return d;
  },

  "dns-without": () => {
    const d = new Diagram({ w: 1100, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "Without DNS — a number for every website", tone: "bad" });
    d.node({ x: 50, y: 170, w: 190, h: 70, kind: "user", title: "You", sub: "want 5 sites" });
    const sites = [["Google", "142.250.80.46"], ["YouTube", "142.250.72.206"], ["Your bank", "23.45.67.89"], ["Wikipedia", "208.80.154.224"], ["… 350 million+ more", "?.?.?.?"]];
    sites.forEach(([n, ip], i) => {
      const y = 84 + i * 56;
      d.raw(`<rect x="290" y="${y}" width="760" height="44" rx="10" fill="${TONES.bad[1]}" stroke="${TONES.bad[2]}"/>`, "back");
      d.text(312, y + 28, n, { size: 15, weight: 700, color: T.ink });
      d.text(1028, y + 28, "type  " + ip, { size: 14.5, mono: true, color: TONES.bad[0], anchor: "end" });
      d.edge([244, 205], [286, y + 22], { route: "straight", tone: "bad", dashed: true });
    });
    return d;
  },

  "dns-with": () => {
    const d = new Diagram({ w: 1100, h: 370, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 330, title: "With DNS — type a name, DNS finds the number", tone: "good" });
    d.node({ id: "you", x: 50, y: 110, w: 220, h: 70, kind: "browser", title: "You type", sub: "shop.com" });
    d.node({ id: "dns", x: 440, y: 110, w: 240, h: 70, kind: "dns", title: "DNS", sub: "the internet's phone book", emphasis: true });
    d.node({ id: "srv", x: 820, y: 250, w: 230, h: 70, kind: "service", title: "shop.com server", sub: "IP 203.0.113.10" });
    d.edge("you", "dns", { sides: "rl", step: 1, label: "where is shop.com?", hot: true });
    d.edge("dns", "you", { sides: "bb", via: [[560, 222], [160, 222]], dashed: true, step: 2, label: "it's 203.0.113.10", at: [360, 222], tone: "good" });
    d.edge("you", "srv", { sides: "br", via: [[160, 285]], step: 3, label: "connect to 203.0.113.10", at: [520, 285], hot: true });
    return d;
  },

  "dns-resolution": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Networking · DNS",
      title: "How DNS turns a name into an IP address",
      subtitle: "The internet's phone book is **distributed and cached**. A cold lookup walks a tree; a warm one is answered instantly.",
      takeaway: "Every answer carries a TTL. Caches keep old answers until it expires — which is why DNS is a slow failover tool.",
    });
    sequence(d, {
      x: 48, y: 166, w: 1404, actorW: 210, rowH: 44,
      actors: [
        { kind: "browser", title: "Your device", sub: "OS + browser cache" },
        { kind: "dns", title: "Recursive resolver", sub: "ISP, 1.1.1.1, 8.8.8.8" },
        { kind: "dns", title: "Root server", sub: "knows TLDs" },
        { kind: "dns", title: ".com TLD server", sub: "knows domains" },
        { kind: "dns", title: "Authoritative NS", sub: "your DNS provider" },
      ],
      messages: [
        { from: 0, to: 1, label: "api.shop.com ?", step: 1 },
        { note: "cache hit? → answer immediately (most lookups end here)", from: 1, to: 1, tone: "good" },
        { from: 1, to: 2, label: "who handles .com?", step: 2 },
        { from: 2, to: 1, label: "ask the .com servers", dashed: true },
        { from: 1, to: 3, label: "who handles shop.com?", step: 3 },
        { from: 3, to: 1, label: "ask ns1.dnsprovider.net", dashed: true },
        { from: 1, to: 4, label: "api.shop.com ?", step: 4 },
        { from: 4, to: 1, label: "A 203.0.113.10 · TTL 300 s", dashed: true, tone: "good" },
        { from: 1, to: 0, label: "203.0.113.10 (now cached for 5 min)", dashed: true, step: 5, tone: "good" },
      ],
    });
    return d;
  },

  "tls-handshake": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Networking · security",
      title: "TLS: how HTTPS gets its padlock",
      subtitle: "Before any data flows, client and server **prove identity** (certificate) and **agree on a secret key** nobody else can see.",
      takeaway: "Terminate TLS at the edge (LB / CDN). Inside the cluster, mTLS makes services prove who they are to each other.",
    });
    sequence(d, {
      x: 48, y: 166, w: 900, actorW: 200, rowH: 46,
      actors: [{ kind: "browser", title: "Browser" }, { kind: "lb", title: "Server (LB)", sub: "has cert + key" }],
      messages: [
        { from: 0, to: 1, label: "ClientHello · supported ciphers · random", step: 1 },
        { from: 1, to: 0, label: "ServerHello · certificate · key share", step: 2 },
        { note: "browser checks cert: trusted CA? right name? not expired?", from: 0, to: 0, tone: "warn" },
        { from: 0, to: 1, label: "key share → both derive the same session key", step: 3 },
        { from: 1, to: 0, label: "Finished (encrypted)", dashed: true, step: 4 },
        { note: "🔒  everything after this is encrypted", from: 0, to: 1, tone: "good" },
        { from: 0, to: 1, label: "GET /account  (encrypted)", tone: "good" },
        { from: 1, to: 0, label: "200 OK  (encrypted)", dashed: true, tone: "good" },
      ],
    });
    d.note({ x: 990, y: 166, w: 462, title: "What TLS gives you", icon: "shield", tone: "good", lines: ["Confidentiality — eavesdroppers see noise.", "Integrity — tampering is detected.", "Authentication — you really reached shop.com."] });
    d.note({ x: 990, y: 356, w: 462, title: "mTLS (mutual TLS)", icon: "key", tone: "edge", lines: ["The client also presents a certificate.", "Used service-to-service: “only checkout may call payments”.", "Meshes (Istio, Linkerd) issue and rotate certs automatically."] });
    d.note({ x: 990, y: 560, w: 462, title: "Classic outage", icon: "alert", tone: "bad", lines: ["Expired certificate. Automate renewal (ACME / Let's Encrypt)."] });
    return d;
  },

  "proxies": () => {
    const d = new Diagram({
      w: 1500, h: 600,
      eyebrow: "Networking · proxies",
      title: "Forward proxy vs reverse proxy",
      subtitle: "Same idea — a middlebox that forwards traffic — but it protects **different sides**.",
      takeaway: "In system design you almost always draw a reverse proxy (L7 LB / gateway) at the edge of YOUR servers.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 400, title: "Forward proxy — protects the clients", tone: "neutral", tag: "Egress" });
    d.node({ id: "c1", x: 70, y: 240, w: 170, h: 52, kind: "user", title: "Employee" });
    d.node({ id: "c2", x: 70, y: 310, w: 170, h: 52, kind: "user", title: "Employee" });
    d.node({ id: "c3", x: 70, y: 380, w: 170, h: 52, kind: "worker", title: "Crawler" });
    d.node({ id: "fp", x: 300, y: 300, w: 170, h: 72, kind: "proxy", title: "Forward proxy", sub: "company egress", emphasis: true });
    d.node({ id: "w1", x: 540, y: 240, w: 170, h: 52, kind: "external", title: "google.com" });
    d.node({ id: "w2", x: 540, y: 310, w: 170, h: 52, kind: "external", title: "github.com" });
    d.node({ id: "w3", x: 540, y: 380, w: 170, h: 52, kind: "external", title: "any site" });
    ["c1", "c2", "c3"].forEach((c) => d.edge(c, "fp", { sides: "rl", mid: 270 }));
    ["w1", "w2", "w3"].forEach((w) => d.edge("fp", w, { sides: "rl", mid: 505 }));
    d.text(70, 480, "Sites see the proxy's IP, not yours.", { size: 13.5, weight: 600, color: T.ink });
    d.text(70, 506, "Used for: content filtering, anonymity, caching, egress allowlists.", { size: 13.5, color: T.body });

    d.panel({ x: 760, y: 158, w: 700, h: 400, title: "Reverse proxy — protects the servers", tone: "edge", tag: "What you design" });
    d.node({ id: "u1", x: 790, y: 250, w: 150, h: 52, kind: "mobile", title: "App" });
    d.node({ id: "u2", x: 790, y: 360, w: 150, h: 52, kind: "browser", title: "Web" });
    d.node({ id: "rp", x: 990, y: 290, w: 230, h: 80, kind: "gateway", title: "Reverse proxy", sub: "NGINX · Envoy · ALB", emphasis: true });
    d.node({ id: "s1", x: 1260, y: 230, w: 170, h: 52, kind: "service", title: "/api" });
    d.node({ id: "s2", x: 1260, y: 305, w: 170, h: 52, kind: "service", title: "/auth" });
    d.node({ id: "s3", x: 1260, y: 380, w: 170, h: 52, kind: "storage", title: "/static" });
    d.edge("u1", "rp", { sides: "rl", mid: 970 });
    d.edge("u2", "rp", { sides: "rl", mid: 970 });
    ["s1", "s2", "s3"].forEach((s) => d.edge("rp", s, { sides: "rl", mid: 1230 }));
    d.text(790, 480, "Clients think they talk to one server.", { size: 13.5, weight: 600, color: T.ink });
    d.text(790, 506, "Does: TLS termination, routing, load balancing, WAF, compression.", { size: 13.5, color: T.body });
    return d;
  },

  "realtime-options": () => {
    const d = new Diagram({
      w: 1500, h: 820,
      eyebrow: "Networking · real-time",
      title: "Polling, long polling, SSE and WebSockets",
      subtitle: "Four ways for a server to tell a client **“something changed”**. Time flows left → right; ● = a new event on the server.",
      takeaway: "Pick by direction and frequency: rare updates → poll; server-push only → SSE; two-way chatty → WebSocket.",
    });
    const lanes = [
      ["Short polling", "Client asks every N seconds, even if nothing changed.", "Simple · wasteful · lag = interval", "neutral"],
      ["Long polling", "Server holds the request open until an event (or timeout).", "Works everywhere · reconnect churn", "warn"],
      ["Server-Sent Events", "One long HTTP response; server streams events down.", "One-way · auto-reconnect · plain HTTP", "info"],
      ["WebSocket", "Upgrade once, then both sides send any time.", "Two-way · lowest latency · stateful", "good"],
    ];
    const x0 = 420, x1 = 1440, laneH = 150, y0 = 170;
    const evs = [0.3, 0.55, 0.8];
    lanes.forEach(([t, s, v, tone], i) => {
      const y = y0 + i * (laneH + 10);
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="40" y="${y}" width="1420" height="${laneH}" rx="16" fill="#fff" stroke="${br}" stroke-width="1.5"/>`, "back");
      d.text(64, y + 38, t, { size: 18, weight: 700, color: T.ink });
      d.text(64, y + 66, s, { size: 13.5, color: T.body, maxW: 290 });
      d.text(64, y + 128, v, { size: 12.5, weight: 700, color: a });
      const cy = y + 40, sy = y + 112;
      d.raw(`<line x1="${x0}" y1="${cy}" x2="${x1}" y2="${cy}" stroke="#CBD5E1" stroke-width="2"/><line x1="${x0}" y1="${sy}" x2="${x1}" y2="${sy}" stroke="#CBD5E1" stroke-width="2"/>`, "back");
      d.text(x0 - 10, cy + 5, "client", { size: 12, weight: 600, color: T.muted, anchor: "end" });
      d.text(x0 - 10, sy + 5, "server", { size: 12, weight: 600, color: T.muted, anchor: "end" });
      const X = (f) => x0 + 20 + f * (x1 - x0 - 40);
      evs.forEach((f) => d.raw(`<circle cx="${X(f)}" cy="${sy}" r="7" fill="${TONES.bad[0]}"/>`, "front"));
      const up = (f) => d.edge([X(f), cy + 2], [X(f) + 18, sy - 4], { route: "straight" });
      const down = (f, c) => d.edge([X(f), sy - 2], [X(f) + 18, cy + 4], { route: "straight", tone: c });
      if (i === 0) {
        for (let k = 0; k < 8; k++) {
          const f = k / 8 + 0.02;
          up(f);
          const hit = evs.some((e) => e > f - 0.125 && e <= f);
          down(f + 0.03, hit ? "good" : undefined);
        }
      } else if (i === 1) {
        let s = 0.02;
        for (const e of evs) {
          up(s);
          d.raw(`<line x1="${X(s) + 18}" y1="${sy - 10}" x2="${X(e)}" y2="${sy - 10}" stroke="${a}" stroke-width="2" stroke-dasharray="3 4"/>`, "back");
          down(e, "good");
          s = e + 0.04;
        }
        up(s);
      } else if (i === 2) {
        up(0.02);
        d.raw(`<line x1="${X(0.02) + 18}" y1="${sy - 10}" x2="${X(1)}" y2="${sy - 10}" stroke="${a}" stroke-width="2" stroke-dasharray="3 4"/>`, "back");
        evs.forEach((e) => down(e, "good"));
      } else {
        d.edge([X(0.02), cy + 2], [X(0.02) + 18, sy - 4], { route: "straight", label: "upgrade", at: [X(0.02) - 8, (cy + sy) / 2] });
        d.raw(`<rect x="${X(0.06)}" y="${cy + 14}" width="${X(1) - X(0.06)}" height="${sy - cy - 28}" rx="8" fill="${bg}"/>`, "back");
        evs.forEach((e) => down(e, "good"));
        [0.42, 0.67, 0.9].forEach((f) => up(f));
      }
    });
    return d;
  },

  "websocket-scale": () => {
    const d = new Diagram({
      w: 1500, h: 660,
      eyebrow: "Networking · real-time at scale",
      title: "Scaling WebSockets beyond one server",
      subtitle: "Alice is connected to gateway 1, Bob to gateway 3. A **pub/sub** layer lets any gateway deliver to any user.",
      takeaway: "The scaling metric for real-time is concurrent connections, not requests per second — plan gateway memory accordingly.",
    });
    d.node({ id: "alice", x: 40, y: 200, w: 180, kind: "mobile", title: "Alice" });
    d.node({ id: "bob", x: 40, y: 470, w: 180, kind: "browser", title: "Bob" });
    d.node({ id: "lb", x: 290, y: 330, w: 190, h: 76, kind: "lb", title: "L7 load balancer", sub: "WebSocket upgrade" });
    d.group({ x: 540, y: 160, w: 300, h: 440, label: "WS gateway fleet", tone: "compute" });
    d.node({ id: "g1", x: 570, y: 200, w: 240, kind: "ws", title: "Gateway 1", sub: "50K connections" });
    d.node({ id: "g2", x: 570, y: 336, w: 240, kind: "ws", title: "Gateway 2", sub: "50K connections" });
    d.node({ id: "g3", x: 570, y: 470, w: 240, kind: "ws", title: "Gateway 3", sub: "50K connections" });
    d.edge("alice", "lb", { sides: "rl", mid: 255 });
    d.edge("bob", "lb", { sides: "rl", mid: 255 });
    d.edge("lb", "g1", { sides: "rl", mid: 515 });
    d.edge("lb", "g3", { sides: "rl", mid: 515 });
    d.node({ id: "ps", x: 920, y: 330, w: 230, h: 76, kind: "stream", title: "Pub/Sub", sub: "Redis · Kafka · NATS", emphasis: true });
    d.node({ id: "reg", x: 920, y: 490, w: 230, kind: "cache", title: "Connection registry", sub: "user → gateway" });
    d.node({ id: "chat", x: 1220, y: 330, w: 230, h: 76, kind: "service", title: "Chat service", sub: "persist, then publish" });
    d.node({ id: "db", x: 1220, y: 490, w: 230, kind: "db", title: "Message store", sub: "history + offline" });
    d.edge("g1", "chat", { sides: "rt", off1: [0, -12], via: [[1335, 222]], hot: true, step: 1, label: "Alice sends “hi Bob”", at: [1080, 222] });
    d.edge("chat", "db", { sides: "bt", step: 2, label: "save" });
    d.edge("chat", "ps", { sides: "lr", step: 3, label: "publish to Bob", hot: true, dy: -26 });
    d.edge("ps", "g3", { sides: "lr", mid: 865, step: 4, label: "to gateway 3", hot: true });
    d.edge("g3", "bob", { sides: "lr", step: 5, label: "push frame", hot: true, mid: 500 });
    d.edge("chat", "reg", { sides: "lr", off1: [0, 24], dashed: true, label: "where is Bob?", mid: 1185 });
    return d;
  },
};
