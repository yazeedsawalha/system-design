import { Diagram, table, sequence, icon, TONES, T } from "../engine.mjs";

export default {
  "messaging": () => {
    const d = new Diagram({
      w: 1500, h: 660,
      eyebrow: "Async · messaging",
      title: "Queue vs pub/sub vs log",
      subtitle: "Three ways to hand off work. The difference is **who gets each message** and **whether it can be replayed**.",
      takeaway: "Queue = one worker per message. Pub/sub = every subscriber gets a copy. Log = durable, ordered, replayable history.",
    });
    const panels = [
      ["Work queue", "compute", "Each message → exactly one worker", "Resize images, send emails, jobs", "SQS · RabbitMQ"],
      ["Pub/sub", "queue", "Each message → every subscriber", "OrderPlaced → email, analytics, search", "SNS · Google Pub/Sub · Redis"],
      ["Log / stream", "edge", "Ordered, retained; consumers track offsets", "Event sourcing, analytics, replay", "Kafka · Kinesis · Pulsar"],
    ];
    const cw = 452;
    panels.forEach(([t, tone, rule, use, ex], i) => {
      const x = 40 + i * (cw + 22), y = 158;
      d.panel({ x, y, w: cw, h: 450, title: t, tone });
      const [a, bg] = TONES[tone];
      d.node({ id: `p${i}`, x: x + 20, y: y + 150, w: 130, h: 52, kind: "service", title: "Producer" });
      if (i === 0) {
        d.raw(`<rect x="${x + 180}" y="${y + 150}" width="90" height="52" rx="10" fill="${bg}" stroke="${a}" stroke-width="1.5"/>`, "mid");
        [0, 1, 2, 3].forEach((k) => d.raw(`<rect x="${x + 188 + k * 20}" y="${y + 162}" width="14" height="28" rx="3" fill="${a}" opacity="${1 - k * 0.18}"/>`, "mid"));
        [0, 1, 2].forEach((k) => d.node({ id: `w${i}${k}`, x: x + 296, y: y + 80 + k * 72, w: 140, h: 52, kind: "worker", title: `Worker ${k + 1}` }));
        d.edge(`p${i}`, [x + 176, y + 176], { route: "straight" });
        [0, 1, 2].forEach((k) => d.edge([x + 274, y + 176], `w${i}${k}`, { sides: "rl", mid: x + 287, label: k === 1 ? "msg 7" : undefined, at: k === 1 ? [x + 287, y + 190] : undefined }));
      }
      if (i === 1) {
        d.raw(`<rect x="${x + 170}" y="${y + 150}" width="100" height="52" rx="10" fill="${bg}" stroke="${a}" stroke-width="1.5"/>`, "mid");
        d.text(x + 220, y + 181, "topic", { size: 13, weight: 700, color: a, anchor: "middle" });
        ["Email", "Analytics", "Search"].forEach((s, k) => d.node({ id: `w${i}${k}`, x: x + 296, y: y + 80 + k * 72, w: 140, h: 52, kind: "worker", title: s }));
        d.edge(`p${i}`, [x + 166, y + 176], { route: "straight" });
        [0, 1, 2].forEach((k) => d.edge([x + 274, y + 176], `w${i}${k}`, { sides: "rl", mid: x + 287, tone: "queue" }));
        d.text(x + 300, y + 312, "each gets a copy", { size: 12.5, weight: 600, color: a });
      }
      if (i === 2) {
        for (let k = 0; k < 8; k++) {
          d.raw(`<rect x="${x + 20 + k * 50}" y="${y + 240}" width="44" height="40" rx="6" fill="${k < 6 ? a : bg}" stroke="${a}" stroke-width="1.5" opacity="${k < 6 ? 0.25 + k * 0.12 : 1}"/>`, "mid");
          d.text(x + 42 + k * 50, y + 265, String(k), { size: 13, weight: 700, color: k < 6 ? "#fff" : a, anchor: "middle" });
        }
        d.text(x + 20, y + 304, "offset →", { size: 12, color: T.muted });
        d.node({ id: "cA", x: x + 150, y: y + 80, w: 140, h: 48, kind: "worker", title: "Reader A" });
        d.node({ id: "cB", x: x + 300, y: y + 80, w: 140, h: 48, kind: "worker", title: "Reader B" });
        d.edge(`p${i}`, [x + 85, y + 236], { sides: "bt", label: "append", route: "straight" });
        d.edge("cA", [x + 192, y + 236], { sides: "bt", tone: "good", label: "at 3" });
        d.edge("cB", [x + 292, y + 236], { sides: "bt", tone: "info", label: "at 5" });
      }
      d.text(x + 24, y + 350, rule, { size: 14, weight: 700, color: T.ink, maxW: cw - 48 });
      d.text(x + 24, y + 384, use, { size: 13.5, color: T.body, maxW: cw - 48 });
      d.text(x + 24, y + 420, ex, { size: 12.5, weight: 600, color: a });
    });
    return d;
  },

  "kafka-partitions": () => {
    const d = new Diagram({
      w: 1500, h: 680,
      eyebrow: "Async · streams",
      title: "Partitions and consumer groups",
      subtitle: "A topic is split into **partitions** for parallelism. Messages with the same key always land in the same partition — **in order**.",
      takeaway: "Order is guaranteed per partition, not per topic. Partition by the entity whose order matters (user_id, order_id).",
    });
    d.node({ id: "prod", x: 40, y: 320, w: 200, h: 76, kind: "service", title: "Producers", sub: "key = user_id" });
    d.group({ x: 320, y: 170, w: 560, h: 390, label: "Topic: orders", tone: "edge" });
    const cols = [TONES.info[0], TONES.good[0], TONES.cache[0]];
    [0, 1, 2].forEach((p) => {
      const y = 220 + p * 110;
      d.text(346, y + 30, `P${p}`, { size: 15, weight: 800, color: cols[p] });
      for (let k = 0; k < 8; k++) {
        const on = k < 5 + p;
        d.raw(`<rect x="${390 + k * 58}" y="${y}" width="50" height="48" rx="8" fill="${on ? cols[p] : "#fff"}" fill-opacity="${on ? 0.18 + k * 0.08 : 1}" stroke="${cols[p]}" stroke-width="1.5"/>`, "mid");
        if (on) d.text(415 + k * 58, y + 30, String(k), { size: 13, weight: 700, color: cols[p], anchor: "middle" });
      }
      d.edge("prod", [386, y + 24], { sides: "rl", mid: 290 });
    });
    d.group({ x: 960, y: 170, w: 500, h: 180, label: "Consumer group: billing", tone: "compute" });
    d.node({ id: "b1", x: 990, y: 220, w: 210, h: 56, kind: "worker", title: "billing-1", sub: "reads P0, P1" });
    d.node({ id: "b2", x: 1220, y: 220, w: 210, h: 56, kind: "worker", title: "billing-2", sub: "reads P2" });
    d.group({ x: 960, y: 380, w: 500, h: 180, label: "Consumer group: analytics", tone: "queue" });
    d.node({ id: "a1", x: 990, y: 430, w: 440, h: 56, kind: "worker", title: "analytics-1", sub: "reads P0, P1, P2 — its own offsets" });
    d.edge([882, 244], "b1", { sides: "rl", mid: 930 });
    d.edge([882, 474], "a1", { sides: "rl", mid: 930 });
    d.note({ x: 40, y: 590, w: 1420, tone: "info", bullets: false, lines: ["Each partition is read by one consumer per group → max parallelism = number of partitions.   Different groups read the same data independently.   Messages are retained for days, so a new service can replay from offset 0."] });
    return d;
  },

  "delivery-guarantees": () => {
    const d = new Diagram({
      w: 1500, h: 600,
      eyebrow: "Async · delivery guarantees",
      title: "At-most-once, at-least-once, exactly-once",
      subtitle: "Networks drop acknowledgements. The question is: when unsure, do you **risk losing** a message or **risk duplicating** it?",
      takeaway: "Default to at-least-once delivery + idempotent consumers. That combination gives “effectively once” results.",
    });
    const cols = [
      ["At-most-once", "warn", "Send, never retry", "Message may be lost", "Metrics, logs, live location pings", "0 or 1"],
      ["At-least-once", "good", "Retry until acknowledged", "Duplicates possible", "Almost everything: orders, emails, events", "1 or more"],
      ["Exactly-once (effect)", "info", "At-least-once + dedupe", "More moving parts", "Payments, ledgers, counters", "exactly 1"],
    ];
    const cw = 452;
    cols.forEach(([t, tone, how, risk, use, n], i) => {
      const x = 40 + i * (cw + 22), y = 158;
      d.panel({ x, y, w: cw, h: 390, title: t, tone });
      const [a, bg] = TONES[tone];
      d.raw(`<rect x="${x + 24}" y="${y + 76}" width="${cw - 48}" height="90" rx="14" fill="${bg}"/>`, "back");
      d.text(x + cw / 2, y + 118, n, { size: 30, weight: 800, color: a, anchor: "middle" });
      d.text(x + cw / 2, y + 148, "times the effect happens", { size: 12.5, color: T.muted, anchor: "middle" });
      d.text(x + 24, y + 206, "How", { size: 11.5, weight: 700, color: a });
      d.text(x + 24, y + 228, how, { size: 14, weight: 600, color: T.ink });
      d.text(x + 24, y + 266, "Risk", { size: 11.5, weight: 700, color: a });
      d.text(x + 24, y + 288, risk, { size: 14, color: T.body });
      d.text(x + 24, y + 326, "Use for", { size: 11.5, weight: 700, color: a });
      d.text(x + 24, y + 348, use, { size: 14, color: T.body, maxW: cw - 48 });
    });
    return d;
  },

  "outbox-idempotency": () => {
    const d = new Diagram({
      w: 1500, h: 720,
      eyebrow: "Async · reliability patterns",
      title: "Transactional outbox + idempotent consumer",
      subtitle: "Two patterns that make at-least-once messaging **safe**: never lose an event, never apply one twice.",
      takeaway: "Write the event in the same DB transaction as the data; consumers record processed event IDs and skip repeats.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 510, title: "Outbox — the DB write and the event can't disagree", tone: "info" });
    d.node({ id: "api", x: 70, y: 240, w: 200, h: 64, kind: "service", title: "Order service" });
    d.group({ x: 320, y: 220, w: 390, h: 170, label: "One ACID transaction", tone: "data", dashed: true });
    d.box({ id: "t1", x: 345, y: 262, w: 160, h: 50, text: "orders", sub: "INSERT row", tone: "data", size: 14 });
    d.box({ id: "t2", x: 525, y: 262, w: 160, h: 50, text: "outbox", sub: "INSERT event", tone: "data", size: 14 });
    d.edge("api", "t1", { sides: "rl", step: 1, hot: true });
    d.node({ id: "relay", x: 380, y: 440, w: 260, h: 64, kind: "worker", title: "Outbox relay / CDC", sub: "polls or tails the log" });
    d.node({ id: "bus", x: 70, y: 560, w: 260, h: 64, kind: "stream", title: "Message broker" });
    d.edge("t2", "relay", { sides: "bt", step: 2, label: "read new rows" });
    d.edge("relay", "bus", { sides: "br", via: [[510, 592]], step: 3, label: "publish, mark sent", at: [440, 592] });
    d.text(70, 360, "✗ Without it: DB commit succeeds,", { size: 13, color: "#B91C1C" });
    d.text(70, 380, "   then the publish fails → event lost.", { size: 13, color: "#B91C1C" });

    d.panel({ x: 760, y: 158, w: 700, h: 510, title: "Idempotent consumer — duplicates are harmless", tone: "good" });
    sequence(d, {
      x: 780, y: 226, w: 660, actorW: 170, rowH: 44,
      actors: [{ kind: "stream", title: "Broker" }, { kind: "worker", title: "Consumer" }, { kind: "db", title: "DB" }],
      messages: [
        { from: 0, to: 1, label: "event e-81 (charge $42)", step: 1 },
        { from: 1, to: 2, label: "INSERT processed(e-81) + apply" },
        { from: 1, to: 0, label: "ack lost on network ✗", dashed: true, tone: "bad" },
        { from: 0, to: 1, label: "redeliver e-81", step: 2, tone: "warn" },
        { from: 1, to: 2, label: "e-81 already processed → skip" },
        { from: 1, to: 0, label: "ack", dashed: true, tone: "good" },
      ],
    });
    d.text(790, 598, "Other ways to be idempotent:", { size: 13.5, weight: 700, color: T.ink });
    d.text(790, 624, "UPSERT on a natural key · compare-and-set on a version", { size: 13, color: T.body });
    d.text(790, 648, "Idempotency-Key header on APIs (payments)", { size: 13, color: T.body });
    return d;
  },

  "leader-fencing": () => {
    const d = new Diagram({
      w: 1500, h: 660,
      eyebrow: "Async · coordination",
      title: "Leader election and fencing tokens",
      subtitle: "A paused old leader wakes up still thinking it's in charge. A **fencing token** lets storage reject its stale writes.",
      takeaway: "Leases give you a leader; fencing tokens make it safe. Every write carries the token; storage rejects anything older.",
    });
    sequence(d, {
      x: 48, y: 166, w: 960, actorW: 200, rowH: 44,
      actors: [{ kind: "worker", title: "Node A" }, { kind: "coord", title: "Lock service", sub: "etcd · ZooKeeper" }, { kind: "worker", title: "Node B" }, { kind: "db", title: "Storage" }],
      messages: [
        { from: 0, to: 1, label: "acquire lease", step: 1 },
        { from: 1, to: 0, label: "granted · token 33", dashed: true, tone: "good" },
        { note: "Node A freezes (GC pause 20 s) — lease expires", from: 0, to: 1, tone: "warn" },
        { from: 2, to: 1, label: "acquire lease", step: 2 },
        { from: 1, to: 2, label: "granted · token 34", dashed: true, tone: "good" },
        { from: 2, to: 3, label: "write x, token 34", step: 3, tone: "good" },
        { from: 0, to: 3, label: "wakes up: write y, token 33", step: 4, tone: "bad" },
        { from: 3, to: 0, label: "rejected: 33 < 34", dashed: true, tone: "bad" },
      ],
    });
    d.note({ x: 1040, y: 166, w: 420, title: "Use coordination for", icon: "crown", tone: "neutral", lines: ["Electing one scheduler / partition owner", "Short exclusive jobs (a nightly report)", "Cluster membership and config"] });
    d.note({ x: 1040, y: 360, w: 420, title: "Avoid it for", icon: "alert", tone: "warn", lines: ["Every user request (it's low-throughput)", "Things a DB unique constraint or a queue can do", "Home-made Paxos"] });
    return d;
  },

  "bloom-filter": () => {
    const d = new Diagram({
      w: 1500, h: 620,
      eyebrow: "Async · probabilistic structures",
      title: "Bloom filter: “definitely not” or “maybe”",
      subtitle: "A tiny bit array + a few hash functions answers **“have I seen this?”** using a fraction of the memory of a full set.",
      takeaway: "No false negatives, rare false positives. Use it to skip expensive lookups — always confirm a “maybe” with the real store.",
    });
    const bx = 330, by = 330, cell = 64, n = 14;
    const set = new Set([1, 4, 6, 9, 12]);
    for (let i = 0; i < n; i++) {
      const on = set.has(i);
      d.raw(`<rect x="${bx + i * cell}" y="${by}" width="${cell - 6}" height="${cell - 6}" rx="10" fill="${on ? TONES.search[0] : "#fff"}" stroke="${TONES.search[0]}" stroke-width="1.5"/>`, "mid");
      d.text(bx + i * cell + (cell - 6) / 2, by + 36, on ? "1" : "0", { size: 18, weight: 800, color: on ? "#fff" : TONES.search[2], anchor: "middle" });
      d.text(bx + i * cell + (cell - 6) / 2, by + cell + 16, String(i), { size: 11.5, color: T.muted, anchor: "middle" });
    }
    const X = (i) => bx + i * cell + (cell - 6) / 2;
    d.node({ id: "add", x: 40, y: 190, w: 250, h: 64, kind: "check", title: "add(\"cat.com\")", sub: "set bits 1, 6, 12" });
    [1, 6, 12].forEach((i) => d.edge("add", [X(i), by - 4], { sides: "rt", via: [[X(i), 222]], tone: "search" }));
    d.node({ id: "q1", x: 40, y: 470, w: 250, h: 64, kind: "x", title: "has(\"dog.com\")?", sub: "bits 4, 7, 9 → bit 7 is 0" });
    d.edge("q1", [X(7), by + cell - 2], { sides: "rb", via: [[X(7), 502]], tone: "bad", label: "definitely NOT seen", at: [720, 502] });
    d.node({ id: "q2", x: 1180, y: 470, w: 280, h: 64, kind: "warn", title: "has(\"fox.com\")?", sub: "bits 4, 9, 12 all 1 → maybe" });
    d.edge("q2", [X(12), by + cell - 2], { sides: "lb", via: [[X(12), 502]], tone: "warn" });
    d.note({ x: 1140, y: 176, w: 320, title: "Size rule of thumb", icon: "idea", tone: "info", lines: ["~10 bits per item → ~1% false positives", "1 billion URLs ≈ 1.2 GB"] });
    return d;
  },

  "merkle-checksum": () => {
    const d = new Diagram({
      w: 1500, h: 600,
      eyebrow: "Async · data integrity",
      title: "Checksums and Merkle trees",
      subtitle: "A checksum is a **fingerprint** of data. A Merkle tree fingerprints fingerprints, so two replicas can find the one different block fast.",
      takeaway: "Verify checksums at every trust boundary (upload, replication, restore). Compare Merkle roots to find drift without shipping all the data.",
    });
    d.box({ id: "root", x: 560, y: 180, w: 380, h: 60, text: "root = hash(H12 + H34)", tone: "search", solid: true, size: 15 });
    d.box({ id: "h12", x: 300, y: 300, w: 300, h: 56, text: "H12 = hash(H1 + H2)", tone: "search", size: 14 });
    d.box({ id: "h34", x: 900, y: 300, w: 300, h: 56, text: "H34 = hash(H3 + H4)", tone: "bad", size: 14 });
    ["H1", "H2", "H3", "H4"].forEach((t, i) => d.box({ id: "l" + i, x: 180 + i * 300, y: 420, w: 200, h: 50, text: `${t} = hash(block ${i + 1})`, tone: i === 3 ? "bad" : "neutral", size: 13 }));
    d.edge("root", "h12", { sides: "bt" }); d.edge("root", "h34", { sides: "bt", tone: "bad" });
    d.edge("h12", "l0", { sides: "bt" }); d.edge("h12", "l1", { sides: "bt" }); d.edge("h34", "l2", { sides: "bt" }); d.edge("h34", "l3", { sides: "bt", tone: "bad" });
    d.text(750, 520, "Replicas compare roots → differ → descend only the red branch → block 4 is the one to repair.", { size: 14, weight: 600, color: TONES.bad[0], anchor: "middle" });
    d.note({ x: 1200, y: 170, w: 260, title: "Used in", icon: "check", tone: "good", lines: ["Cassandra/Dynamo repair", "Git, IPFS, Bitcoin", "File sync (Dropbox)"] });
    return d;
  },

  "dfs": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Async · distributed file systems",
      title: "Distributed file system: metadata vs data",
      subtitle: "Huge files are split into big **chunks** stored 3× across machines. A **metadata service** remembers where every chunk lives.",
      takeaway: "Keep the metadata path small and highly available; move bulk bytes directly between clients and chunk servers.",
    });
    d.node({ id: "cl", x: 40, y: 330, w: 200, h: 76, kind: "service", title: "Client", sub: "reads video.mp4" });
    d.node({ id: "md", x: 420, y: 180, w: 300, h: 80, kind: "coord", title: "Metadata service", sub: "file → chunks → servers (HA pair)", emphasis: true });
    d.edge("cl", "md", { sides: "tl", via: [[140, 220]], both: true, step: 1, label: "lookup → chunk map", at: [285, 220] });
    const S = ["S1", "S2", "S3", "S4"];
    S.forEach((s, i) => {
      const x = 420 + i * 260, y = 420;
      d.node({ id: s, x, y, w: 230, h: 64, kind: "storage", title: `Chunk server ${s}`, sub: ["c1 · c3", "c2 · c4", "c1 · c4", "c2 · c3"][i] });
    });
    d.edge("cl", "S1", { sides: "rl", step: 2, hot: true, label: "read c1 directly", mid: 330 });
    d.edge("S1", "S3", { sides: "bb", via: [[535, 540], [1055, 540]], dashed: true, label: "replicate (3 copies across racks)", at: [795, 540] });
    d.note({ x: 1060, y: 170, w: 400, title: "Typical numbers", icon: "idea", tone: "info", lines: ["Chunks of 64–256 MB", "3 replicas across racks / zones", "Heartbeats; re-replicate on disk loss"] });
    return d;
  },
};
