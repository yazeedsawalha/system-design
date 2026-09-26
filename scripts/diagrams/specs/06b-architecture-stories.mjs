// Chapter 06 — "before / after" story pictures (red = the problem, green = the fix)
import { Diagram, TONES, T } from "../engine.mjs";
const W = 1100;
const F = (d, title, tone, h) => d.frame({ x: 20, y: 20, w: 1060, h, title, tone });

export default {
  "api-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "No contract — one renamed field breaks every client", "bad", 360);
    d.node({ id: "b", x: 50, y: 150, w: 300, h: 90, kind: "service", title: "Backend", sub: "renamed  price → amount" });
    [["Mobile app (old version)", "expects “price” → crash"], ["Website", "shows $undefined"], ["Partner integration", "silently wrong totals"]].forEach(([t, s], i) => { d.node({ id: "c" + i, x: 690, y: 80 + i * 96, w: 360, h: 72, kind: "x", title: t, sub: s }); d.edge("b", "c" + i, { sides: "rl", mid: 520, tone: "bad" }); });
    return d;
  },
  "api-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "A versioned contract — old and new clients keep working", "good", 360);
    d.node({ id: "b", x: 50, y: 150, w: 280, h: 90, kind: "service", title: "Backend", sub: "serves /v1 and /v2" });
    d.box({ id: "v1", x: 420, y: 90, w: 250, h: 70, text: "/v1 contract", sub: "{ price } — unchanged", tone: "info", size: 16 });
    d.box({ id: "v2", x: 420, y: 230, w: 250, h: 70, text: "/v2 contract", sub: "{ amount, currency }", tone: "good", size: 16 });
    d.node({ id: "c1", x: 770, y: 90, w: 280, h: 70, kind: "mobile", title: "Old mobile app", sub: "still works" });
    d.node({ id: "c2", x: 770, y: 230, w: 280, h: 70, kind: "browser", title: "New website", sub: "uses v2" });
    d.edge("b", "v1", { sides: "rl", mid: 375 }); d.edge("b", "v2", { sides: "rl", mid: 375 });
    d.edge("v1", "c1", { sides: "rl", tone: "good" }); d.edge("v2", "c2", { sides: "rl", tone: "good" });
    return d;
  },
  "ntier-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "Two tiers — every client connects straight to the database", "bad", 360);
    ["Desktop app · has DB password 🔑", "Desktop app · has DB password 🔑", "Modified app · “price = $0”"].forEach((t, i) => { d.node({ id: "c" + i, x: 50, y: 80 + i * 96, w: 380, h: 72, kind: i === 2 ? "warn" : "browser", tone: i === 2 ? "bad" : undefined, title: t }); });
    d.node({ id: "db", x: 700, y: 150, w: 350, h: 100, kind: "db", tone: "bad", title: "Database", sub: "open to every client · out of connections", emphasis: true });
    [0, 1, 2].forEach((i) => d.edge("c" + i, "db", { sides: "rl", mid: 560, tone: "bad" }));
    return d;
  },
  "mono-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "One huge monolith — every team waits on every other team", "bad", 380);
    ["Search team", "Checkout team", "Payments team", "Reporting team (bug 🐞)", "Catalog team"].forEach((t, i) => d.node({ id: "t" + i, x: 50, y: 70 + i * 62, w: 290, h: 50, kind: "users", tone: i === 3 ? "bad" : undefined, title: t }));
    d.node({ id: "m", x: 500, y: 140, w: 300, h: 130, kind: "service", tone: "bad", title: "One big application", sub: "deploys once a month · one bug crashes everything", emphasis: true });
    [0, 1, 2, 3, 4].forEach((i) => d.edge("t" + i, "m", { sides: "rl", mid: 420, tone: "bad" }));
    d.node({ x: 870, y: 170, w: 180, h: 70, kind: "x", title: "Whole site down" });
    d.edge([804, 205], [866, 205], { route: "straight", tone: "bad" });
    return d;
  },
  "micro-with": () => {
    const d = new Diagram({ w: W, h: 460, bare: true }); F(d, "Microservices — each team owns, ships and scales its own service", "good", 420);
    d.node({ id: "g", x: 50, y: 200, w: 200, h: 76, kind: "gateway", title: "API gateway" });
    [["Search service", "scaled to 20 copies"], ["Checkout service", "deploys 5× a day"], ["Payments service", ""], ["Reporting service", "bug stays here 🐞"], ["Catalog service", ""]].forEach(([t, s], i) => {
      d.node({ id: "s" + i, x: 480, y: 96 + i * 62, w: 330, h: 50, kind: "service", tone: i === 3 ? "warn" : undefined, title: t, sub: s || "own team · own database" });
      d.edge("g", "s" + i, { sides: "rl", mid: 380, tone: "good" });
      d.node({ x: 870, y: 96 + i * 62, w: 180, h: 50, kind: "db", title: "own DB" });
      d.edge("s" + i, [866, 121 + i * 62], { route: "straight" });
    });
    return d;
  },
  "eda-without": () => {
    const d = new Diagram({ w: W, h: 460, bare: true }); F(d, "Direct calls — the order service must know and wait for everyone", "bad", 420);
    d.node({ id: "o", x: 50, y: 190, w: 260, h: 90, kind: "service", tone: "bad", title: "Order service", sub: "calls 5 services, one by one" });
    [["Payments", ""], ["Inventory", ""], ["Email", "slow → orders slow ✗"], ["Analytics", ""], ["NEW: coupons", "order team must change code"]].forEach(([t, s], i) => { d.node({ id: "x" + i, x: 700, y: 96 + i * 62, w: 350, h: 50, kind: i === 2 ? "x" : "service", tone: i === 4 ? "warn" : undefined, title: t, sub: s }); d.edge("o", "x" + i, { sides: "rl", mid: 500, tone: "bad" }); });
    return d;
  },
  "eda-with": () => {
    const d = new Diagram({ w: W, h: 460, bare: true }); F(d, "Events — publish once, anyone can react", "good", 420);
    d.node({ id: "o", x: 50, y: 190, w: 230, h: 90, kind: "service", title: "Order service", sub: "saves order, publishes event" });
    d.node({ id: "bus", x: 360, y: 180, w: 240, h: 110, kind: "stream", title: "“OrderPlaced #42”", sub: "event bus", emphasis: true });
    d.edge("o", "bus", { sides: "rl", hot: true });
    [["Payments", ""], ["Inventory", ""], ["Email", "slow? only email waits"], ["Analytics", ""], ["NEW: coupons", "just subscribes ✔"]].forEach(([t, s], i) => { d.node({ id: "y" + i, x: 720, y: 96 + i * 62, w: 330, h: 50, kind: "worker", tone: i === 4 ? "good" : undefined, title: t, sub: s }); d.edge("bus", "y" + i, { sides: "rl", mid: 660, tone: "good" }); });
    return d;
  },
  "es-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Only the latest value — the history is overwritten", "bad", 320);
    d.box({ x: 50, y: 100, w: 420, h: 170, text: "accounts", sub: "id 42 · balance = $118", tone: "info", size: 22 });
    ["Why is it $118?", "What was it on March 3rd?", "Who changed it, and when?"].forEach((q, i) => d.node({ x: 620, y: 90 + i * 66, w: 430, h: 52, kind: "x", title: q, sub: "unknown — overwritten" }));
    return d;
  },
  "cqrs-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "One model for everything — heavy reads and careful writes collide", "bad", 360);
    d.node({ id: "w", x: 50, y: 90, w: 300, h: 70, kind: "service", title: "Checkout (writes)", sub: "needs strict rules" });
    d.node({ id: "r", x: 50, y: 230, w: 300, h: 70, kind: "monitor", title: "Order history & dashboards", sub: "6-table joins per page" });
    d.node({ id: "db", x: 620, y: 150, w: 430, h: 100, kind: "db", tone: "bad", title: "Same tables for both", sub: "reads block writes · both slow", emphasis: true });
    d.edge("w", "db", { sides: "rl", mid: 500, tone: "bad" }); d.edge("r", "db", { sides: "rl", mid: 500, tone: "bad" });
    return d;
  },
  "disc-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "Hard-coded addresses — calls go to servers that no longer exist", "bad", 360);
    d.node({ id: "c", x: 50, y: 140, w: 300, h: 110, kind: "service", title: "Checkout", sub: "config: 10.0.1.11, 10.0.1.12" });
    d.node({ id: "o1", x: 690, y: 70, w: 360, h: 60, kind: "x", title: "10.0.1.11", sub: "deleted in last night's deploy" });
    d.node({ id: "o2", x: 690, y: 160, w: 360, h: 60, kind: "x", title: "10.0.1.12", sub: "replaced by autoscaling" });
    d.node({ id: "n1", x: 690, y: 250, w: 360, h: 60, kind: "service", ghost: true, title: "10.0.1.27 · new, healthy", sub: "never called" });
    d.edge("c", "o1", { sides: "rl", mid: 520, tone: "bad" }); d.edge("c", "o2", { sides: "rl", mid: 520, tone: "bad" });
    return d;
  },
  "cont-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "“Works on my machine” — different environments, different results", "bad", 340);
    d.box({ x: 50, y: 90, w: 440, h: 190, text: "Developer laptop ✔", sub: "Python 3.12 · libssl 3 · macOS · all tests pass", tone: "good", size: 19 });
    d.box({ x: 610, y: 90, w: 440, h: 190, text: "Production server ✗", sub: "Python 3.9 · libssl 1.1 · different OS → crash at startup", tone: "bad", size: 19 });
    d.edge([494, 185], [606, 185], { route: "straight", tone: "bad", label: "deploy" });
    return d;
  },
  "cont-with": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Containers — the same image runs the same everywhere", "good", 340);
    d.box({ id: "img", x: 50, y: 110, w: 330, h: 150, text: "Container image", sub: "your code + Python 3.12 + libssl 3 + settings", tone: "info", size: 19 });
    ["Laptop ✔", "Test server ✔", "Production ✔"].forEach((t, i) => { d.node({ id: "e" + i, x: 700, y: 80 + i * 86, w: 350, h: 64, kind: "container", tone: "good", title: t, sub: "identical image" }); d.edge([384, 185], "e" + i, { sides: "rl", mid: 560, tone: "good" }); });
    return d;
  },
  "auth-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Before OAuth — giving your password to other apps", "bad", 340);
    d.node({ id: "u", x: 50, y: 140, w: 200, h: 76, kind: "user", title: "You" });
    d.node({ id: "p", x: 360, y: 130, w: 280, h: 96, kind: "service", tone: "bad", title: "Photo-printing app", sub: "now knows your Google password", emphasis: true });
    d.node({ id: "g", x: 780, y: 130, w: 270, h: 96, kind: "external", tone: "bad", title: "Your Google account", sub: "email, contacts, docs — all exposed" });
    d.edge("u", "p", { sides: "rl", tone: "bad", label: "your password" });
    d.edge("p", "g", { sides: "rl", tone: "bad", label: "full access" });
    return d;
  },
  "auth-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "With OAuth — a limited token instead of your password", "good", 360);
    d.node({ id: "u", x: 50, y: 150, w: 200, h: 76, kind: "user", title: "You" });
    d.node({ id: "g", x: 410, y: 80, w: 280, h: 84, kind: "auth", title: "Google login page", sub: "you log in here, approve “photos only”" });
    d.node({ id: "p", x: 410, y: 240, w: 280, h: 84, kind: "service", title: "Photo-printing app", sub: "never sees your password" });
    d.node({ id: "ph", x: 800, y: 240, w: 250, h: 84, kind: "storage", title: "Your photos", sub: "the only thing it can read" });
    d.edge("u", "g", { sides: "rl", mid: 330, tone: "good", step: 1, label: "log in at Google", at: [330, 150] });
    d.edge("g", "p", { sides: "bt", tone: "good", step: 2, label: "token: photos, 1 hour" });
    d.edge("p", "ph", { sides: "rl", tone: "good", step: 3 });
    return d;
  },
  "sec-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "One wall — once inside, the attacker can reach everything", "bad", 360);
    d.node({ id: "a", x: 50, y: 160, w: 200, h: 76, kind: "warn", tone: "bad", title: "Attacker", sub: "stolen password" });
    d.raw(`<rect x="310" y="100" width="26" height="240" rx="6" fill="${TONES.bad[0]}" opacity=".85"/>`, "mid");
    d.text(323, 360, "firewall", { size: 12, weight: 700, color: TONES.bad[0], anchor: "middle" });
    d.group({ x: 390, y: 80, w: 660, h: 290, label: "Flat inside network — everything trusts everything", tone: "bad" });
    [["db", "Database · no password"], ["service", "Services · accept any request"], ["storage", "Files · not encrypted"], ["file", "Logs · full of secrets"]].forEach(([k, t], i) => d.node({ id: "i" + i, x: 420 + (i % 2) * 310, y: 130 + Math.floor(i / 2) * 110, w: 290, h: 70, kind: k, tone: "bad", title: t }));
    d.edge("a", "i0", { sides: "rl", tone: "bad", label: "gets in once", at: [300, 150], mid: 380 });
    return d;
  },
};
