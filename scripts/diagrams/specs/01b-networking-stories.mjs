// Chapter 01 — "before / after" story pictures (red = the problem, green = the fix)
import { Diagram, TONES, T } from "../engine.mjs";

const W = 1100;

export default {
  "ip-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "No addresses — the router can't deliver the message", tone: "bad" });
    d.node({ id: "p", x: 50, y: 170, w: 180, h: 70, kind: "mobile", title: "Your phone", sub: "“hello server”" });
    d.node({ id: "r", x: 330, y: 170, w: 190, h: 70, kind: "split", tone: "bad", title: "Router", sub: "“to whom??”", icon: "split" });
    ["Laptop", "TV", "Server ?", "Car", "Fridge"].forEach((t, i) => {
      d.node({ id: "d" + i, x: 690, y: 82 + i * 58, w: 200, h: 46, kind: "external", title: t });
      d.edge("r", "d" + i, { sides: "rl", mid: 610, dashed: true, tone: "bad" });
    });
    d.edge("p", "r", { sides: "rl", tone: "bad" });
    d.text(910, 212, "…billions", { size: 15, weight: 700, color: TONES.bad[0] });
    d.text(910, 234, "of devices", { size: 15, weight: 700, color: TONES.bad[0] });
    return d;
  },

  "ip-with": () => {
    const d = new Diagram({ w: W, h: 380, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 340, title: "Every packet carries a “to” and a “from” address", tone: "good" });
    d.node({ id: "p", x: 50, y: 170, w: 200, h: 76, kind: "mobile", title: "Your phone", sub: "from 198.51.100.7" });
    d.node({ id: "r1", x: 330, y: 170, w: 150, h: 76, kind: "lb", title: "Router", icon: "split" });
    d.node({ id: "r2", x: 560, y: 170, w: 150, h: 76, kind: "lb", title: "Router", icon: "split" });
    d.node({ id: "s", x: 810, y: 170, w: 240, h: 76, kind: "service", title: "shop.com server", sub: "IP 203.0.113.10" });
    d.edge("p", "r1", { sides: "rl", hot: true });
    d.edge("r1", "r2", { sides: "rl", hot: true });
    d.edge("r2", "s", { sides: "rl", hot: true });
    d.raw(`<rect x="300" y="84" width="440" height="52" rx="10" fill="${TONES.good[1]}" stroke="${TONES.good[2]}"/>`, "back");
    d.text(520, 116, "packet:  to 203.0.113.10  ·  from 198.51.100.7", { size: 14, mono: true, weight: 600, color: TONES.good[0], anchor: "middle" });
    d.edge("s", "p", { sides: "bb", via: [[930, 300], [150, 300]], dashed: true, tone: "good", label: "reply goes back to 198.51.100.7", at: [540, 300] });
    return d;
  },

  "osi-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 340, title: "Without layers — every app does every job", tone: "bad" });
    d.box({ x: 60, y: 90, w: 460, h: 170, text: "Your app", sub: "business logic + encryption + splitting into packets + resending lost packets + routing + talking to the Wi-Fi chip", tone: "bad", size: 18 });
    d.box({ x: 580, y: 90, w: 460, h: 170, text: "Another company's app", sub: "its own, different way of doing all the same jobs", tone: "bad", size: 18 });
    d.edge([524, 175], [576, 175], { route: "straight", tone: "bad", both: true, label: "can't talk ✗", at: [550, 145] });
    return d;
  },

  "osi-with": () => {
    const d = new Diagram({ w: W, h: 470, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 430, title: "With layers — like the postal system, each layer does one job", tone: "good" });
    const rows = [
      ["You write the letter", "Application (L7)", "HTTP request: GET /products", "compute"],
      ["Put it in an addressed envelope", "Transport + Network (L4, L3)", "TCP packets with IP addresses", "edge"],
      ["A truck carries it on roads", "Link + Physical (L2, L1)", "Wi-Fi, fiber, cables", "neutral"],
    ];
    d.text(60, 90, "POSTAL SYSTEM", { size: 12, weight: 800, color: T.muted });
    d.text(440, 90, "NETWORK LAYER", { size: 12, weight: 800, color: T.muted });
    d.text(760, 90, "EXAMPLE", { size: 12, weight: 800, color: T.muted });
    rows.forEach(([a, b, c, tone], i) => {
      const y = 110 + i * 105;
      d.box({ x: 60, y, w: 340, h: 84, text: a, tone: "neutral", size: 15 });
      d.box({ x: 440, y, w: 290, h: 84, text: b, tone, solid: true, size: 15 });
      d.box({ x: 770, y, w: 280, h: 84, text: c, tone, size: 14, weight: 500 });
      d.edge([402, y + 42], [436, y + 42], { route: "straight" });
      d.edge([732, y + 42], [766, y + 42], { route: "straight" });
    });
    return d;
  },

  "tcp-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 320, title: "Raw internet — packets get lost and shuffled", tone: "bad" });
    d.text(60, 100, "SENT", { size: 12, weight: 800, color: T.muted });
    d.text(660, 100, "RECEIVED", { size: 12, weight: 800, color: T.muted });
    [1, 2, 3, 4, 5].forEach((n, i) => d.box({ x: 60 + i * 90, y: 120, w: 76, h: 60, text: String(n), tone: "info", solid: true, size: 20 }));
    const got = [["1", "info"], ["3", "info"], ["5", "info"], ["4", "info"]];
    got.forEach(([n, t], i) => d.box({ x: 660 + i * 90, y: 120, w: 76, h: 60, text: n, tone: t, solid: true, size: 20 }));
    d.edge([520, 150], [650, 150], { route: "straight", tone: "bad", label: "the internet" });
    d.box({ x: 660, y: 220, w: 390, h: 90, text: "Broken file", sub: "packet 2 is missing, 3 · 5 · 4 arrived out of order", tone: "bad", size: 17 });
    d.box({ x: 60, y: 220, w: 440, h: 90, text: "A photo, cut into 5 packets", sub: "each packet travels its own route", tone: "neutral", size: 16 });
    return d;
  },

  "tcp-with": () => {
    const d = new Diagram({ w: W, h: 380, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 340, title: "TCP — number, confirm, resend, reorder", tone: "good" });
    [1, 2, 3, 4, 5].forEach((n, i) => d.box({ x: 60 + i * 90, y: 110, w: 76, h: 60, text: "#" + n, tone: "info", solid: true, size: 18 }));
    [1, 2, 3, 4, 5].forEach((n, i) => d.box({ x: 640 + i * 84, y: 110, w: 72, h: 60, text: "#" + n, tone: "good", solid: true, size: 18 }));
    d.edge([516, 140], [634, 140], { route: "straight", tone: "good", label: "TCP" });
    const steps = [["1", "Number every packet"], ["2", "Receiver confirms (ACK)"], ["3", "#2 not confirmed → resend"], ["4", "Put back in order → perfect file"]];
    steps.forEach(([n, t], i) => {
      const x = 60 + i * 250;
      d.stepCircle(x + 16, 236, n, "good", 15);
      d.text(x + 42, 242, t, { size: 14.5, weight: 600, color: T.ink });
    });
    d.raw(`<rect x="50" y="280" width="1000" height="50" rx="10" fill="${TONES.good[1]}"/>`, "back");
    d.text(550, 311, "Your app just sees a clean, complete stream of bytes", { size: 15, weight: 700, color: TONES.good[0], anchor: "middle" });
    return d;
  },

  "tls-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "Plain HTTP — everyone on the path can read it", tone: "bad" });
    d.node({ id: "u", x: 50, y: 130, w: 170, h: 70, kind: "user", title: "You", sub: "at a café" });
    d.node({ id: "w", x: 300, y: 130, w: 170, h: 70, kind: "external", title: "Café Wi-Fi" });
    d.node({ id: "i", x: 550, y: 130, w: 170, h: 70, kind: "external", title: "Internet provider" });
    d.node({ id: "b", x: 820, y: 130, w: 230, h: 70, kind: "service", title: "mybank.com" });
    d.edge("u", "w", { sides: "rl", tone: "bad" }); d.edge("w", "i", { sides: "rl", tone: "bad" }); d.edge("i", "b", { sides: "rl", tone: "bad" });
    d.raw(`<rect x="470" y="235" width="580" height="46" rx="10" fill="${TONES.bad[1]}" stroke="${TONES.bad[2]}"/>`, "back");
    d.text(760, 264, "user=alice  password=Summer2026!", { size: 16, mono: true, weight: 700, color: TONES.bad[0], anchor: "middle" });
    d.node({ id: "h", x: 300, y: 300, w: 240, h: 60, kind: "warn", tone: "bad", title: "Attacker on the Wi-Fi", sub: "reads and can change it" });
    d.edge("h", [385, 204], { sides: "tb", dashed: true, tone: "bad" });
    return d;
  },

  "tls-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 360, title: "HTTPS (TLS) — an encrypted tunnel with an ID check", tone: "good" });
    d.node({ id: "u", x: 50, y: 130, w: 170, h: 70, kind: "browser", title: "You", sub: "🔒 https://" });
    d.node({ id: "b", x: 820, y: 130, w: 230, h: 70, kind: "service", title: "mybank.com", sub: "shows its certificate" });
    d.raw(`<rect x="240" y="138" width="560" height="54" rx="27" fill="${TONES.good[1]}" stroke="${TONES.good[0]}" stroke-width="2"/>`, "back");
    d.text(520, 171, "encrypted tunnel", { size: 15, weight: 700, color: TONES.good[0], anchor: "middle" });
    d.raw(`<rect x="200" y="235" width="700" height="46" rx="10" fill="${TONES.good[1]}" stroke="${TONES.good[2]}"/>`, "back");
    d.text(550, 264, "what the café sees:  8f3a c91e 77d0 b24f …", { size: 16, mono: true, weight: 700, color: TONES.good[0], anchor: "middle" });
    d.node({ x: 300, y: 300, w: 240, h: 60, kind: "proxy", tone: "good", title: "Certificate checked", sub: "it really is mybank.com" });
    d.node({ x: 580, y: 300, w: 240, h: 60, kind: "lock", tone: "good", title: "Secret key agreed", sub: "only you and the bank" });
    return d;
  },

  "proxy-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 380, title: "No reverse proxy — every server faces the internet", tone: "bad" });
    d.node({ id: "c", x: 50, y: 170, w: 180, h: 70, kind: "users", title: "Clients", sub: "must know 3 addresses" });
    d.node({ id: "a", x: 50, y: 300, w: 180, h: 60, kind: "warn", tone: "bad", title: "Attacker" });
    ["Server 1", "Server 2", "Server 3"].forEach((t, i) => {
      d.node({ id: "s" + i, x: 700, y: 80 + i * 105, w: 340, h: 76, kind: "service", tone: "bad", title: `${t} · public IP`, sub: "does its own TLS, security, compression" });
      d.edge("c", "s" + i, { sides: "rl", mid: 460, tone: "bad" });
      d.edge("a", "s" + i, { sides: "rl", mid: 520, dashed: true, tone: "bad" });
    });
    return d;
  },

  "proxy-with": () => {
    const d = new Diagram({ w: W, h: 420, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 380, title: "With a reverse proxy — one front door", tone: "good" });
    d.node({ id: "c", x: 50, y: 170, w: 180, h: 70, kind: "users", title: "Clients", sub: "know 1 address" });
    d.node({ id: "p", x: 330, y: 150, w: 240, h: 110, kind: "gateway", title: "Reverse proxy", sub: "TLS · routing · security · compression", emphasis: true });
    d.group({ x: 670, y: 70, w: 390, h: 310, label: "Private network", tone: "good" });
    [["/api", "API server"], ["/api", "API server"], ["/static", "File server"]].forEach(([r, t], i) => {
      d.node({ id: "s" + i, x: 700, y: 108 + i * 88, w: 330, h: 64, kind: i === 2 ? "storage" : "service", title: t, sub: "private IP · handles " + r });
      d.edge("p", "s" + i, { sides: "rl", mid: 630, tone: "good" });
    });
    d.edge("c", "p", { sides: "rl", hot: true });
    return d;
  },

  "realtime-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 340, title: "Polling — asking “anything new?” again and again", tone: "bad" });
    d.node({ id: "b", x: 50, y: 150, w: 180, h: 70, kind: "mobile", title: "Bob's phone" });
    d.node({ id: "s", x: 850, y: 150, w: 200, h: 70, kind: "service", title: "Chat server" });
    const ys = [100, 140, 180, 220, 260];
    ys.forEach((y, i) => {
      d.edge([240, y], [840, y], { route: "straight", tone: i === 4 ? "good" : "bad", dashed: i !== 4, label: i === 4 ? "“yes! Alice: hi”" : "“anything new?” → “no”", at: [540, y] });
    });
    d.text(540, 318, "1 million users × 1 check per second = 1 million mostly useless requests per second", { size: 14.5, weight: 700, color: TONES.bad[0], anchor: "middle" });
    return d;
  },

  "realtime-with": () => {
    const d = new Diagram({ w: W, h: 360, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 320, title: "WebSocket / SSE — one open connection, the server pushes", tone: "good" });
    d.node({ id: "b", x: 50, y: 150, w: 180, h: 70, kind: "mobile", title: "Bob's phone" });
    d.node({ id: "s", x: 850, y: 150, w: 200, h: 70, kind: "service", title: "Chat server" });
    d.raw(`<rect x="240" y="160" width="600" height="50" rx="25" fill="${TONES.good[1]}" stroke="${TONES.good[0]}" stroke-width="2"/>`, "back");
    d.text(540, 191, "connection stays open", { size: 14.5, weight: 700, color: TONES.good[0], anchor: "middle" });
    d.node({ id: "a", x: 850, y: 250, w: 200, h: 60, kind: "user", title: "Alice sends “hi”" });
    d.edge("a", "s", { sides: "tb", tone: "good" });
    d.edge([840, 120], [240, 120], { route: "straight", tone: "good", label: "server pushes “Alice: hi” in ~50 ms", at: [540, 120] });
    return d;
  },
};
