// Chapter 04 — "before / after" story pictures (red = the problem, green = the fix)
import { Diagram, sequence, TONES, T } from "../engine.mjs";
const W = 1100;
const F = (d, title, tone, h) => d.frame({ x: 20, y: 20, w: 1060, h, title, tone });

export default {
  "queue-without": () => {
    const d = new Diagram({ w: W, h: 420, bare: true }); F(d, "No queue — the customer waits for every job", "bad", 380);
    d.node({ id: "u", x: 40, y: 170, w: 230, h: 76, kind: "user", title: "Customer", sub: "clicks Buy, waits 8 s" });
    d.node({ id: "a", x: 320, y: 160, w: 220, h: 96, kind: "service", tone: "bad", title: "Order API", sub: "does everything, one by one", emphasis: true });
    [["Charge card", "0.5 s", ""], ["Make PDF invoice", "2 s", ""], ["Send email", "provider down ✗", "bad"], ["Update analytics", "1 s", ""], ["Notify warehouse", "1.5 s", ""]].forEach(([t, s, tone], i) => {
      d.node({ id: "j" + i, x: 700, y: 72 + i * 62, w: 350, h: 50, kind: tone ? "x" : "service", tone: tone || undefined, title: t, sub: s });
      d.edge("a", "j" + i, { sides: "rl", mid: 620, tone: "bad" });
    });
    d.edge("u", "a", { sides: "rl", tone: "bad" });
    return d;
  },
  "queue-with": () => {
    const d = new Diagram({ w: W, h: 440, bare: true }); F(d, "With a queue — answer now, workers do the rest", "good", 400);
    d.node({ id: "u", x: 40, y: 110, w: 230, h: 76, kind: "user", title: "Customer", sub: "confirmed in 0.3 s" });
    d.node({ id: "a", x: 320, y: 100, w: 220, h: 96, kind: "service", title: "Order API", sub: "save order + charge card" });
    d.node({ id: "q", x: 320, y: 280, w: 220, h: 76, kind: "queue", title: "Queue", sub: "“order 42 placed”", emphasis: true });
    d.edge("u", "a", { sides: "rl", hot: true, both: true });
    d.edge("a", "q", { sides: "bt", tone: "good", label: "drop a message" });
    [["PDF worker", ""], ["Email worker", "retries until the provider is back"], ["Analytics worker", ""], ["Warehouse worker", ""]].forEach(([t, s], i) => {
      d.node({ id: "w" + i, x: 700, y: 80 + i * 76, w: 350, h: 60, kind: "worker", title: t, sub: s || "works at its own pace" });
      d.edge("q", "w" + i, { sides: "rl", mid: 620, tone: "good" });
    });
    return d;
  },
  "dup-without": () => {
    const d = new Diagram({ w: W, h: 460, bare: true }); F(d, "A lost reply → a retry → the customer pays twice", "bad", 420);
    sequence(d, { x: 60, y: 80, w: 980, actorW: 190, rowH: 44, actors: [{ kind: "queue", title: "Queue" }, { kind: "worker", title: "Worker" }, { kind: "money", title: "Card provider" }], messages: [
      { from: 0, to: 1, label: "charge order 42 · $50", step: 1 },
      { from: 1, to: 2, label: "charge $50 ✔" },
      { from: 1, to: 0, label: "“done” — lost on the network ✗", dashed: true, tone: "bad" },
      { from: 0, to: 1, label: "no reply… retry order 42", step: 2, tone: "warn" },
      { from: 1, to: 2, label: "charge $50 again ✔", tone: "bad" },
      { note: "customer charged $100 for a $50 order", from: 0, to: 2, tone: "bad" }] });
    return d;
  },
  "dup-with": () => {
    const d = new Diagram({ w: W, h: 460, bare: true }); F(d, "Idempotent — the repeat is recognised and skipped", "good", 420);
    sequence(d, { x: 60, y: 80, w: 980, actorW: 190, rowH: 44, actors: [{ kind: "queue", title: "Queue" }, { kind: "worker", title: "Worker" }, { kind: "db", title: "Processed IDs" }], messages: [
      { from: 0, to: 1, label: "charge order 42 · id e-81", step: 1 },
      { from: 1, to: 2, label: "e-81 new → charge + save e-81" },
      { from: 1, to: 0, label: "“done” — lost ✗", dashed: true, tone: "bad" },
      { from: 0, to: 1, label: "retry · id e-81", step: 2, tone: "warn" },
      { from: 1, to: 2, label: "e-81 already done → skip", tone: "good" },
      { note: "charged exactly once, however many retries", from: 0, to: 2, tone: "good" }] });
    return d;
  },
  "lock-without": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Two copies, no agreement — the job runs twice", "bad", 340);
    d.node({ id: "a", x: 50, y: 90, w: 260, h: 76, kind: "worker", title: "Scheduler copy A", sub: "midnight: “my job!”" });
    d.node({ id: "b", x: 50, y: 230, w: 260, h: 76, kind: "worker", title: "Scheduler copy B", sub: "midnight: “my job!”" });
    d.node({ id: "j", x: 450, y: 150, w: 260, h: 90, kind: "mail", tone: "bad", title: "Send invoices", sub: "runs twice", emphasis: true });
    d.edge("a", "j", { sides: "rl", tone: "bad", mid: 390 }); d.edge("b", "j", { sides: "rl", tone: "bad", mid: 390 });
    d.node({ x: 810, y: 160, w: 240, h: 70, kind: "x", title: "Every customer", sub: "billed twice" });
    d.edge([714, 195], [806, 195], { route: "straight", tone: "bad" });
    return d;
  },
  "lock-with": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Leader election — only the leader runs the job", "good", 340);
    d.node({ id: "c", x: 420, y: 80, w: 260, h: 76, kind: "coord", title: "Coordination service", sub: "etcd / ZooKeeper", emphasis: true });
    d.node({ id: "a", x: 50, y: 220, w: 280, h: 76, kind: "worker", tone: "good", title: "Copy A · leader 👑", sub: "holds the lease → runs the job" });
    d.node({ id: "b", x: 770, y: 220, w: 280, h: 76, kind: "worker", title: "Copy B · standby", sub: "waits; takes over if A dies" });
    d.edge("a", "c", { sides: "tl", via: [[190, 118]], tone: "good", label: "lease granted" });
    d.edge("b", "c", { sides: "tr", via: [[910, 118]], dashed: true, label: "lease taken — wait" });
    d.box({ x: 400, y: 230, w: 300, h: 56, text: "Invoices sent exactly once", tone: "good", size: 15 });
    return d;
  },
  "bloom-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Every “seen it?” check goes to a huge database on disk", "bad", 320);
    d.node({ id: "c", x: 50, y: 140, w: 250, h: 76, kind: "worker", title: "Crawler", sub: "millions of new links / hour" });
    d.node({ id: "db", x: 600, y: 130, w: 450, h: 96, kind: "db", tone: "bad", title: "Seen-URLs database · 10 billion rows", sub: "~5–10 ms per lookup (disk)", emphasis: true });
    d.edge("c", "db", { sides: "rl", tone: "bad", hot: true, label: "seen?  seen?  seen?  seen?" });
    d.text(550, 290, "The crawler spends most of its time waiting — and most links are new anyway", { size: 15, weight: 700, color: TONES.bad[0], anchor: "middle" });
    return d;
  },
  "bloom-with": () => {
    const d = new Diagram({ w: W, h: 400, bare: true }); F(d, "A Bloom filter in memory answers “definitely new” instantly", "good", 360);
    d.node({ id: "c", x: 50, y: 150, w: 230, h: 76, kind: "worker", title: "Crawler" });
    d.node({ id: "bf", x: 380, y: 140, w: 250, h: 96, kind: "cache", title: "Bloom filter", sub: "in memory · ~1 µs", emphasis: true });
    d.node({ id: "n", x: 760, y: 80, w: 290, h: 70, kind: "check", title: "“Definitely new” (most links)", sub: "crawl it — no DB lookup" });
    d.node({ id: "db", x: 760, y: 240, w: 290, h: 70, kind: "db", title: "“Maybe seen” (few)", sub: "confirm in the database" });
    d.edge("c", "bf", { sides: "rl", hot: true });
    d.edge("bf", "n", { sides: "rl", tone: "good", mid: 700 });
    d.edge("bf", "db", { sides: "rl", dashed: true, mid: 700 });
    return d;
  },
  "checksum-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Silent corruption — damaged data served as if it were fine", "bad", 320);
    d.box({ id: "a", x: 50, y: 120, w: 260, h: 90, text: "photo.jpg saved", sub: "01101001 11010110 …", tone: "info", size: 17 });
    d.box({ id: "b", x: 420, y: 120, w: 260, h: 90, text: "1 bit flips on disk", sub: "01101001 11010**0**10 …", tone: "bad", size: 17 });
    d.box({ id: "c", x: 790, y: 120, w: 260, h: 90, text: "User downloads it", sub: "broken image — no error raised", tone: "bad", size: 17 });
    d.edge("a", "b", { sides: "rl", tone: "bad", label: "months later" }); d.edge("b", "c", { sides: "rl", tone: "bad" });
    return d;
  },
  "checksum-with": () => {
    const d = new Diagram({ w: W, h: 380, bare: true }); F(d, "Checksums — compare fingerprints, catch and repair damage", "good", 340);
    d.box({ id: "a", x: 50, y: 110, w: 260, h: 90, text: "Save + fingerprint", sub: "sha256 = 9f2c…", tone: "info", size: 16 });
    d.box({ id: "b", x: 420, y: 110, w: 260, h: 90, text: "Read: fingerprint again", sub: "7a01… ≠ 9f2c… → damaged!", tone: "warn", size: 16 });
    d.box({ id: "c", x: 790, y: 110, w: 260, h: 90, text: "Serve a healthy copy", sub: "and repair the bad one", tone: "good", size: 16 });
    d.edge("a", "b", { sides: "rl" }); d.edge("b", "c", { sides: "rl", tone: "good" });
    d.text(550, 270, "The user always gets a correct file", { size: 16, weight: 700, color: TONES.good[0], anchor: "middle" });
    return d;
  },
  "dfs-without": () => {
    const d = new Diagram({ w: W, h: 360, bare: true }); F(d, "Some data is bigger than any one machine", "bad", 320);
    d.box({ id: "f", x: 50, y: 100, w: 420, h: 150, text: "5 PB of logs", sub: "single files of several TB", tone: "info", size: 22 });
    d.node({ id: "s", x: 620, y: 120, w: 430, h: 110, kind: "service", tone: "bad", title: "One big server · 100 TB disk", sub: "doesn't fit · reading it all would take months", emphasis: true });
    d.edge([474, 175], "s", { sides: "rl", tone: "bad", label: "✗ won't fit" });
    return d;
  },
};
