// Chapter 03 — "before / after" story pictures (red = the problem, green = the fix)
import { Diagram, table, sequence, TONES, T } from "../engine.mjs";
const W = 1100;
const F = (d, title, tone, h) => d.frame({ x: 20, y: 20, w: 1060, h, title, tone });

export default {
  "storage-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "Files saved on each server's own disk", "bad", 360);
    d.node({ id: "u", x: 50, y: 160, w: 190, h: 70, kind: "user", title: "User", sub: "uploads photo.jpg" });
    d.node({ id: "s1", x: 400, y: 90, w: 300, h: 80, kind: "service", title: "Server 1", sub: "disk: photo.jpg ✔ · 95% full" });
    d.node({ id: "s2", x: 400, y: 230, w: 300, h: 80, kind: "service", tone: "bad", title: "Server 2", sub: "disk: photo.jpg — not here!" });
    d.edge("u", "s1", { sides: "rl", mid: 320, label: "1 · upload", tone: "bad", at: [320, 150] });
    d.edge("u", "s2", { sides: "rl", mid: 320, label: "2 · next request", tone: "bad", at: [320, 240] });
    d.node({ x: 800, y: 90, w: 250, h: 70, kind: "x", title: "Server dies", sub: "files gone forever" });
    d.node({ x: 800, y: 230, w: 250, h: 70, kind: "x", title: "“Image not found”" });
    return d;
  },
  "storage-with": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "Files in shared object storage, details in the database", "good", 380);
    d.node({ id: "u", x: 50, y: 170, w: 190, h: 70, kind: "user", title: "User" });
    d.node({ id: "s1", x: 330, y: 100, w: 220, h: 64, kind: "service", title: "Server 1" });
    d.node({ id: "s2", x: 330, y: 250, w: 220, h: 64, kind: "service", title: "Server 2" });
    d.node({ id: "o", x: 700, y: 80, w: 350, h: 84, kind: "storage", title: "Object storage (S3)", sub: "photo.jpg · unlimited · many copies", emphasis: true });
    d.node({ id: "db", x: 700, y: 250, w: 350, h: 84, kind: "db", title: "Database", sub: "photo_id, owner, size, path" });
    d.edge("u", "s1", { sides: "rl", mid: 290 }); d.edge("u", "s2", { sides: "rl", mid: 290 });
    ["s1", "s2"].forEach((s) => { d.edge(s, "o", { sides: "rl", mid: 630, tone: "good" }); d.edge(s, "db", { sides: "rl", mid: 640, tone: "good", dashed: true }); });
    return d;
  },
  "db-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "One database doing every job", "bad", 380);
    const jobs = [["Orders & accounts", "db"], ["Full-text search", "search"], ["Click logs (billions)", "stream"], ["Sessions (every request)", "cache"], ["Analytics reports", "monitor"], ["Photos & files", "storage"]];
    jobs.forEach(([t, k], i) => { d.node({ id: "j" + i, x: 50, y: 80 + i * 50, w: 300, h: 42, kind: k, title: t }); });
    d.node({ id: "db", x: 640, y: 160, w: 400, h: 110, kind: "db", tone: "bad", title: "One database · 100% busy 🔥", sub: "slow searches, reports block checkout, huge backups", emphasis: true });
    jobs.forEach((_, i) => d.edge("j" + i, "db", { sides: "rl", mid: 500, tone: "bad" }));
    return d;
  },
  "db-with": () => {
    const d = new Diagram({ w: W, h: 440, bare: true }); F(d, "The right store for each job", "good", 400);
    d.node({ id: "app", x: 50, y: 180, w: 220, h: 80, kind: "service", title: "App services" });
    const s = [["PostgreSQL", "orders, accounts — the truth", "db"], ["Redis", "sessions, hot data", "cache"], ["Search index", "full-text product search", "search"], ["Object storage", "photos & files", "storage"], ["Data warehouse", "analytics reports", "monitor"]];
    s.forEach(([t, sub, k], i) => { d.node({ id: "s" + i, x: 640, y: 70 + i * 68, w: 400, h: 56, kind: k, title: t, sub }); d.edge("app", "s" + i, { sides: "rl", mid: 480, tone: "good" }); });
    return d;
  },
  "norm-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "Copies of the same fact start to disagree", "bad", 360);
    table(d, { x: 50, y: 80, rowH: 46, headH: 44, size: 14, cols: [{ title: "order", w: 120 }, { title: "customer", w: 180 }, { title: "address", w: 420 }, { title: "item", w: 280 }], rows: [
      ["#101", "Alice", { t: "12 Oak St (old)", tone: "bad" }, "Headphones"],
      ["#102", "Alice", { t: "7 Pine Ave (new)", tone: "good" }, "Charger"],
      ["#103", "Alice", { t: "12 Oak St (old)", tone: "bad" }, "Phone case"],
    ] });
    d.text(50, 330, "Alice moved — only one row was updated. Which address is true?", { size: 15, weight: 700, color: TONES.bad[0] });
    return d;
  },
  "acid-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "No transaction — a crash halfway loses $100", "bad", 320);
    d.box({ id: "a", x: 50, y: 110, w: 260, h: 90, text: "Step 1 ✔", sub: "Alice: $500 → $400", tone: "info", size: 18 });
    d.box({ id: "c", x: 420, y: 110, w: 260, h: 90, text: "💥 Server crash", sub: "power cut", tone: "bad", solid: true, size: 18 });
    d.box({ id: "b", x: 790, y: 110, w: 260, h: 90, text: "Step 2 never ran", sub: "Bob: still $50", tone: "bad", size: 18 });
    d.edge("a", "c", { sides: "rl", tone: "bad" }); d.edge("c", "b", { sides: "rl", tone: "bad", dashed: true });
    d.text(550, 270, "Result: $100 has disappeared from the system", { size: 17, weight: 800, color: TONES.bad[0], anchor: "middle" });
    return d;
  },
  "acid-with": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "A transaction — both steps happen, or neither does", "good", 340);
    d.group({ x: 50, y: 80, w: 640, h: 150, label: "BEGIN … COMMIT (one transaction)", tone: "good" });
    d.box({ id: "a", x: 80, y: 125, w: 270, h: 80, text: "Alice −$100", tone: "info", size: 17 });
    d.box({ id: "b", x: 390, y: 125, w: 270, h: 80, text: "Bob +$100", tone: "info", size: 17 });
    d.edge("a", "b", { sides: "rl" });
    d.box({ id: "ok", x: 780, y: 80, w: 270, h: 66, text: "Commit ✔", sub: "both saved together", tone: "good", size: 16 });
    d.box({ id: "rb", x: 780, y: 164, w: 270, h: 66, text: "Crash? Roll back ↩", sub: "as if nothing happened", tone: "warn", size: 16 });
    d.edge([692, 150], "ok", { sides: "rl", tone: "good", mid: 740 }); d.edge([692, 160], "rb", { sides: "rl", tone: "warn", mid: 740 });
    d.text(550, 290, "Money is never lost or created — the totals always add up", { size: 16, weight: 700, color: TONES.good[0], anchor: "middle" });
    return d;
  },
  "iso-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "Race condition — one ticket, two buyers, both succeed", "bad", 380);
    sequence(d, { x: 60, y: 80, w: 980, actorW: 180, rowH: 44, actors: [{ kind: "user", title: "Alice" }, { kind: "db", title: "Database · stock = 1" }, { kind: "user", title: "Bob" }], messages: [
      { from: 0, to: 1, label: "read stock → 1 ✔" }, { from: 2, to: 1, label: "read stock → 1 ✔" },
      { from: 0, to: 1, label: "set stock = 0, create order", tone: "bad" }, { from: 2, to: 1, label: "set stock = 0, create order", tone: "bad" },
      { note: "2 orders for 1 ticket — oversold!", from: 0, to: 2, tone: "bad" }] });
    return d;
  },
  "iso-with": () => {
    const d = new Diagram({ w: W, h: 440, bare: true }); F(d, "Atomic conditional update — only one buyer can win", "good", 400);
    sequence(d, { x: 60, y: 80, w: 980, actorW: 180, rowH: 44, actors: [{ kind: "user", title: "Alice" }, { kind: "db", title: "Database · stock = 1" }, { kind: "user", title: "Bob" }], messages: [
      { from: 0, to: 1, label: "UPDATE … WHERE stock > 0" }, { from: 2, to: 1, label: "same UPDATE — waits its turn" },
      { from: 1, to: 0, label: "1 row changed → ticket is yours ✔", dashed: true, tone: "good" }, { from: 1, to: 2, label: "0 rows changed → sold out", dashed: true, tone: "bad" },
      { note: "stock can never go below 0", from: 0, to: 2, tone: "good" }] });
    d.text(550, 395, "UPDATE tickets SET stock = stock - 1 WHERE id = 7 AND stock > 0;", { size: 14, mono: true, weight: 600, color: TONES.good[0], anchor: "middle" });
    return d;
  },
  "dtx-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "No coordination — the customer pays for nothing", "bad", 320);
    d.node({ id: "p", x: 50, y: 120, w: 280, h: 84, kind: "money", title: "Payments service", sub: "card charged $42 ✔" });
    d.node({ id: "i", x: 410, y: 120, w: 280, h: 84, kind: "service", tone: "bad", title: "Inventory service", sub: "out of stock ✗" });
    d.node({ id: "o", x: 770, y: 120, w: 280, h: 84, kind: "service", tone: "bad", ghost: true, title: "Orders service", sub: "order never created" });
    d.edge("p", "i", { sides: "rl", tone: "bad" }); d.edge("i", "o", { sides: "rl", tone: "bad", dashed: true });
    d.text(550, 270, "Each service has its own database — no single COMMIT covers all three", { size: 15, weight: 700, color: TONES.bad[0], anchor: "middle" });
    return d;
  },
  "dtx-with": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "Saga — each step has an “undo” (compensation)", "good", 380);
    [["Charge card", "$42"], ["Reserve item", "fails ✗"], ["Create order", "—"]].forEach(([t, s], i) => d.node({ id: "s" + i, x: 50 + i * 350, y: 90, w: 300, h: 72, kind: i === 1 ? "x" : "service", tone: i === 2 ? undefined : undefined, ghost: i === 2, title: t, sub: s }));
    d.edge("s0", "s1", { sides: "rl", tone: "good" }); d.edge("s1", "s2", { sides: "rl", dashed: true });
    d.node({ id: "c0", x: 50, y: 250, w: 300, h: 72, kind: "check", title: "Refund card ↩", sub: "compensation for step 1" });
    d.edge("s1", "c0", { sides: "bt", via: [[550, 210], [200, 210]], tone: "warn", label: "step 2 failed → undo step 1", at: [375, 210] });
    d.box({ x: 420, y: 250, w: 630, h: 72, text: "Customer: “Sorry, out of stock — your card was refunded.”", tone: "good", size: 15 });
    return d;
  },
  "index-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "No index — check every row, one by one", "bad", 360);
    for (let i = 0; i < 6; i++) {
      const y = 80 + i * 44, hit = i === 5;
      d.raw(`<rect x="50" y="${y}" width="620" height="36" rx="8" fill="${hit ? TONES.good[1] : TONES.bad[1]}" stroke="${hit ? TONES.good[2] : TONES.bad[2]}"/>`, "back");
      d.text(70, y + 24, `row ${[1, 2, 3, 4, "…", 812_345_678][i]}   ${hit ? "ann@mail.com  ← found, after 812 million checks" : "not it, keep looking…"}`, { size: 14, mono: true, color: hit ? TONES.good[0] : TONES.bad[0] });
    }
    d.box({ x: 720, y: 110, w: 330, h: 180, text: "1 billion rows", sub: "full table scan · minutes per query · CPU and disk maxed out", tone: "bad", size: 20 });
    return d;
  },
  "index-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "With an index — a few jumps straight to the row", "good", 360);
    d.box({ id: "r", x: 400, y: 80, w: 300, h: 50, text: "a–m  |  n–z", tone: "good", solid: true, size: 15 });
    d.box({ id: "a", x: 180, y: 170, w: 260, h: 46, text: "a–f  |  g–m", tone: "good", size: 14 });
    d.box({ id: "b", x: 660, y: 170, w: 260, h: 46, text: "n–s  |  t–z", tone: "neutral", size: 14 });
    d.box({ id: "l", x: 180, y: 256, w: 260, h: 46, text: "ann@mail.com → row 812M", tone: "good", size: 14 });
    d.edge("r", "a", { sides: "bt", tone: "good", label: "“a” < “m”" }); d.edge("r", "b", { sides: "bt" }); d.edge("a", "l", { sides: "bt", tone: "good" });
    d.box({ x: 720, y: 256, w: 330, h: 70, text: "~4 jumps · ~1 ms", sub: "instead of 1 billion checks", tone: "good", size: 18 });
    return d;
  },
  "repl-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Only one copy — one failure loses data and uptime", "bad", 320);
    d.node({ id: "a", x: 50, y: 130, w: 240, h: 80, kind: "service", title: "App servers", sub: "all reads + writes" });
    d.node({ id: "db", x: 420, y: 120, w: 280, h: 100, kind: "db", tone: "bad", title: "The only database", sub: "disk failed 💥 · overloaded", emphasis: true });
    d.edge("a", "db", { sides: "rl", tone: "bad", hot: true });
    d.node({ x: 800, y: 80, w: 250, h: 64, kind: "x", title: "Last hours of orders lost" });
    d.node({ x: 800, y: 200, w: 250, h: 64, kind: "x", title: "Site down during repair" });
    return d;
  },
  "shard-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "One database for all the data — it hits its limits", "bad", 320);
    d.node({ id: "a", x: 50, y: 130, w: 250, h: 80, kind: "service", title: "App servers", sub: "50,000 writes/s" });
    d.node({ id: "db", x: 440, y: 110, w: 360, h: 120, kind: "db", tone: "bad", title: "One huge database", sub: "10 TB and growing · max ~10K writes/s · biggest machine money can buy", emphasis: true });
    d.edge("a", "db", { sides: "rl", tone: "bad", hot: true });
    d.node({ x: 850, y: 135, w: 200, h: 70, kind: "x", title: "Writes pile up" });
    return d;
  },
  "shard-with": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "Sharding — each database holds a slice", "good", 380);
    d.node({ id: "a", x: 50, y: 170, w: 210, h: 76, kind: "service", title: "App servers" });
    d.node({ id: "r", x: 330, y: 160, w: 240, h: 96, kind: "gateway", title: "Shard router", sub: "user_id → which shard?", emphasis: true });
    ["users A–F", "users G–M", "users N–S", "users T–Z"].forEach((t, i) => { d.node({ id: "s" + i, x: 700, y: 70 + i * 76, w: 350, h: 60, kind: "db", title: `Shard ${i + 1}`, sub: `${t} · ¼ of the data and writes` }); d.edge("r", "s" + i, { sides: "rl", mid: 640, tone: "good" }); });
    d.edge("a", "r", { sides: "rl", hot: true });
    return d;
  },
  "ch-without": () => {
    const d = new Diagram({ w: W, h: 440, bare: true }); F(d, "hash % N — add one server and most keys move", "bad", 400);
    table(d, { x: 50, y: 80, rowH: 44, headH: 44, size: 14, cols: [{ title: "key (hash)", w: 250 }, { title: "4 servers: hash % 4", w: 290 }, { title: "5 servers: hash % 5", w: 290 }, { title: "moved?", w: 170 }], rows: [
      ["user:17 (17)", "server 1", "server 2", { t: "moved", tone: "bad" }],
      ["user:22 (22)", "server 2", "server 2", { t: "stays", tone: "good" }],
      ["user:31 (31)", "server 3", "server 1", { t: "moved", tone: "bad" }],
      ["user:48 (48)", "server 0", "server 3", { t: "moved", tone: "bad" }],
      ["user:59 (59)", "server 3", "server 4", { t: "moved", tone: "bad" }],
    ] });
    d.text(50, 395, "≈ 80% of keys change server → cache misses flood the database", { size: 15, weight: 700, color: TONES.bad[0] });
    return d;
  },
  "fed-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "Every team shares one database", "bad", 360);
    ["Accounts team", "Checkout team", "Catalog team", "Analytics team"].forEach((t, i) => { d.node({ id: "t" + i, x: 50, y: 80 + i * 66, w: 260, h: 52, kind: "users", tone: i === 3 ? "bad" : undefined, title: t, sub: i === 3 ? "runs a table-locking migration" : undefined }); });
    d.node({ id: "db", x: 520, y: 150, w: 300, h: 100, kind: "db", tone: "bad", title: "Shared database", sub: "table locked 🔒", emphasis: true });
    [0, 1, 2, 3].forEach((i) => d.edge("t" + i, "db", { sides: "rl", mid: 420, tone: "bad" }));
    d.node({ id: "x", x: 870, y: 165, w: 180, h: 70, kind: "x", title: "Checkout down", sub: "20 minutes" });
    d.edge("db", "x", { sides: "rl", tone: "bad" });
    return d;
  },
  "cap-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "The link between data centers is cut — what now?", "bad", 360);
    d.group({ x: 50, y: 80, w: 400, h: 250, label: "Europe", tone: "client" });
    d.group({ x: 650, y: 80, w: 400, h: 250, label: "United States", tone: "neutral" });
    d.node({ id: "u", x: 80, y: 130, w: 340, h: 60, kind: "user", title: "User updates address", sub: "new: 7 Pine Ave" });
    d.node({ id: "e", x: 80, y: 230, w: 340, h: 70, kind: "db", title: "EU copy", sub: "7 Pine Ave (new)" });
    d.node({ id: "w", x: 680, y: 130, w: 340, h: 60, kind: "service", title: "Warehouse reads address" });
    d.node({ id: "s", x: 680, y: 230, w: 340, h: 70, kind: "db", tone: "bad", title: "US copy", sub: "12 Oak St (old!) — answer or refuse?" });
    d.edge("u", "e", { sides: "bt" }); d.edge("w", "s", { sides: "bt", tone: "bad" });
    d.edge("e", "s", { sides: "rl", tone: "bad", dashed: true, noArrow: true, label: "✗ link cut" });
    return d;
  },
  "geo-without": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "No geo index — measure the distance to every place", "bad", 360);
    d.raw(`<rect x="50" y="80" width="560" height="270" rx="14" fill="${TONES.info[1]}" stroke="${TONES.info[2]}"/>`, "back");
    const pts = [[90, 110], [140, 300], [210, 170], [260, 240], [330, 120], [390, 310], [450, 190], [520, 130], [560, 280], [120, 210], [480, 250], [300, 330], [230, 100], [580, 200], [170, 140], [360, 220]];
    pts.forEach(([x, y]) => { d.raw(`<line x1="330" y1="215" x2="${x}" y2="${y}" stroke="${TONES.bad[0]}" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="4 4"/>`, "mid"); d.raw(`<circle cx="${x}" cy="${y}" r="6" fill="${TONES.cache[0]}"/>`, "front"); });
    d.raw(`<circle cx="330" cy="215" r="11" fill="${TONES.bad[0]}" stroke="#fff" stroke-width="3"/>`, "front");
    d.box({ x: 660, y: 120, w: 390, h: 190, text: "10,000,000 distance checks", sub: "for every single search · thousands of searches per second", tone: "bad", size: 19 });
    return d;
  },
};
