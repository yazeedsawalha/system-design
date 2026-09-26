import { Diagram, table, sequence, icon, TONES, T } from "../engine.mjs";

export default {
  "storage-types": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Data · storage",
      title: "Block, file and object storage",
      subtitle: "Three ways to store bytes. Match the **access pattern** to the storage type.",
      takeaway: "Databases on block volumes, shared folders on file storage, everything big and immutable (photos, video, backups) in object storage.",
    });
    const cols = [
      ["Block storage", "data", "db", "Raw disk volumes attached to one machine", "AWS EBS · local NVMe · SAN", ["Lowest latency, highest IOPS", "One server at a time (usually)", "You manage capacity"], "Database data files, VM boot disks"],
      ["File storage", "cache", "file", "Folders and paths shared over the network", "NFS · SMB · AWS EFS", ["Familiar POSIX paths", "Many servers can mount it", "Locking and scale limits"], "Shared uploads, legacy apps, home dirs"],
      ["Object storage", "storage", "bucket", "Bucket + key, accessed over HTTP", "S3 · GCS · Azure Blob", ["Virtually unlimited, very cheap", "11 nines durability", "No in-place edits; higher latency"], "Images, video, backups, logs, data lakes"],
    ];
    const cw = 452;
    cols.forEach(([t, tone, ic, what, ex, pts, fit], i) => {
      const x = 40 + i * (cw + 22), y = 158;
      d.panel({ x, y, w: cw, h: 430, title: t, tone });
      const [a, bg] = TONES[tone];
      d.raw(`<rect x="${x + 24}" y="${y + 76}" width="64" height="64" rx="16" fill="${bg}"/>`, "back");
      d.raw(icon(ic, x + 38, y + 90, 36, a, 2));
      d.text(x + 104, y + 102, what, { size: 14.5, weight: 600, color: T.ink, maxW: cw - 130 });
      d.text(x + 104, y + 146, ex, { size: 13, color: T.muted, maxW: cw - 130 });
      pts.forEach((p, j) => d.text(x + 24, y + 200 + j * 28, (j < 2 ? "✓  " : "✗  ") + p, { size: 13.5, color: j < 2 ? T.body : "#B91C1C" }));
      d.raw(`<rect x="${x + 20}" y="${y + 320}" width="${cw - 40}" height="84" rx="12" fill="${bg}"/>`, "back");
      d.text(x + 36, y + 348, "BEST FOR", { size: 11.5, weight: 700, color: a });
      d.text(x + 36, y + 374, fit, { size: 14, weight: 600, color: T.ink, maxW: cw - 70 });
    });
    return d;
  },

  "db-decision": () => {
    const d = new Diagram({
      w: 1500, h: 720,
      eyebrow: "Data · choosing a database",
      title: "Which database? A decision tree",
      subtitle: "Start from **how you read and write** the data — never from what is fashionable.",
      takeaway: "When in doubt, start with PostgreSQL. Add a specialised store only when a clear access pattern demands it.",
    });
    d.diamond({ id: "q1", cx: 250, cy: 240, w: 300, h: 110, text: "Relationships, joins,\nmulti-row transactions?" });
    d.box({ id: "sql", x: 100, y: 390, w: 300, h: 90, text: "Relational (SQL)", sub: "PostgreSQL · MySQL", tone: "data", solid: true });
    d.diamond({ id: "q2", cx: 750, cy: 240, w: 300, h: 110, text: "Simple lookups by key\nat massive scale?" });
    d.box({ id: "kv", x: 600, y: 390, w: 300, h: 90, text: "Key-value / wide-column", sub: "DynamoDB · Cassandra · Redis", tone: "search", solid: true });
    d.diamond({ id: "q3", cx: 1250, cy: 240, w: 300, h: 110, text: "Specialised\nquery pattern?" });
    d.edge("q1", "sql", { sides: "bt", label: "yes", tone: "good" });
    d.edge("q1", "q2", { sides: "rl", label: "no" });
    d.edge("q2", "kv", { sides: "bt", label: "yes", tone: "good" });
    d.edge("q2", "q3", { sides: "rl", label: "no" });
    const spec = [
      ["Flexible JSON documents", "MongoDB · Firestore", "doc"],
      ["Full-text / fuzzy search", "Elasticsearch · OpenSearch", "search"],
      ["Graph: friends-of-friends", "Neo4j · Neptune", "ml"],
      ["Time-series metrics", "TimescaleDB · InfluxDB", "monitor"],
      ["Analytics over billions of rows", "BigQuery · Snowflake · ClickHouse", "chart"],
      ["Files, images, video", "S3 · GCS (object storage)", "storage"],
    ];
    spec.forEach(([t, s, k], i) => {
      const x = 1000 + (i % 2) * 235, y = 360 + Math.floor(i / 2) * 106;
      d.node({ id: "s" + i, x, y, w: 225, h: 92, kind: k === "chart" ? "monitor" : k, title: t, sub: s });
    });
    d.edge("q3", [1250, 350], { sides: "bt", label: "yes", tone: "good", route: "straight" });
    d.note({ x: 100, y: 540, w: 800, title: "Rules of thumb", icon: "idea", tone: "warn", lines: [
      "Money, bookings, inventory → SQL with transactions.",
      "Sessions, carts, feature flags, leaderboards → key-value (Redis / DynamoDB).",
      "Huge write-heavy time-ordered data (events, messages, IoT) → wide-column (Cassandra).",
      "Most products use 2–3 stores: SQL for truth, Redis for speed, S3 for files, a search index for text.",
    ] });
    return d;
  },

  "nosql-families": () => {
    const d = new Diagram({
      w: 1500, h: 620,
      eyebrow: "Data · NoSQL",
      title: "The NoSQL families at a glance",
      subtitle: "“NoSQL” is not one thing — it is four different shapes, each great at one access pattern.",
      takeaway: "Pick the family whose shape matches your most important query; design the key around that query.",
    });
    const fams = [
      ["Key-value", "search", "user:42 → { … }", ["Get / put by key", "Sub-millisecond"], "Sessions, carts, caches", "Redis · DynamoDB"],
      ["Document", "cache", "{ id, name, tags: […] }", ["Whole object in one read", "Flexible fields"], "Catalogs, profiles, CMS", "MongoDB · Firestore"],
      ["Wide-column", "data", "partition → sorted rows", ["Massive write throughput", "Query by partition key"], "Messages, events, IoT, time-series", "Cassandra · ScyllaDB · Bigtable"],
      ["Graph", "edge", "(Ann)-[FOLLOWS]->(Bob)", ["Multi-hop relationships", "Traversals are cheap"], "Social graphs, fraud rings, recommendations", "Neo4j · Neptune"],
    ];
    const cw = 336;
    fams.forEach(([t, tone, shape, pts, fit, ex], i) => {
      const x = 40 + i * (cw + 20), y = 158;
      d.panel({ x, y, w: cw, h: 410, title: t, tone });
      const [a, bg] = TONES[tone];
      d.raw(`<rect x="${x + 20}" y="${y + 72}" width="${cw - 40}" height="96" rx="12" fill="${bg}"/>`, "back");
      if (i === 0) { ["user:1", "user:2", "cart:9"].forEach((k, j) => { d.text(x + 36, y + 102 + j * 24, k, { size: 13, mono: true, color: a, weight: 700 }); d.text(x + 140, y + 102 + j * 24, "→  value", { size: 13, mono: true, color: T.body }); }); }
      if (i === 1) { d.text(x + 36, y + 100, "{ \"id\": 42,", { size: 13, mono: true, color: T.body }); d.text(x + 36, y + 124, "  \"name\": \"Ann\",", { size: 13, mono: true, color: T.body }); d.text(x + 36, y + 148, "  \"tags\": [\"vip\"] }", { size: 13, mono: true, color: T.body }); }
      if (i === 2) { for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) d.raw(`<rect x="${x + 36 + c * 68}" y="${y + 84 + r * 26}" width="60" height="20" rx="4" fill="${c === 0 ? a : "#fff"}" stroke="${a}" stroke-opacity=".4"/>`, "mid"); }
      if (i === 3) {
        const pts2 = [[x + 70, y + 120], [x + 160, y + 92], [x + 250, y + 128], [x + 170, y + 150]];
        [[0, 1], [1, 2], [1, 3], [3, 2], [0, 3]].forEach(([p, q]) => d.raw(`<line x1="${pts2[p][0]}" y1="${pts2[p][1]}" x2="${pts2[q][0]}" y2="${pts2[q][1]}" stroke="${a}" stroke-width="2"/>`, "mid"));
        pts2.forEach(([px, py]) => d.raw(`<circle cx="${px}" cy="${py}" r="11" fill="#fff" stroke="${a}" stroke-width="2.5"/>`, "front"));
      }
      d.text(x + 24, y + 200, shape, { size: 13, mono: true, weight: 600, color: T.ink });
      pts.forEach((p, j) => d.text(x + 24, y + 236 + j * 26, "✓  " + p, { size: 13.5, color: T.body }));
      d.text(x + 24, y + 310, "BEST FOR", { size: 11.5, weight: 700, color: a });
      d.text(x + 24, y + 332, fit, { size: 13.5, weight: 600, color: T.ink, maxW: cw - 48 });
      d.text(x + 24, y + 386, ex, { size: 12.5, color: T.muted, maxW: cw - 48 });
    });
    return d;
  },

  "normalization": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Data · modeling",
      title: "Normalize for writes, denormalize for reads",
      subtitle: "Normalized: each fact lives in **one** place. Denormalized: facts are **copied** so a screen loads with one read.",
      takeaway: "Keep the source of truth normalized; build denormalized read models (caches, views, feeds) and document how they stay fresh.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 430, title: "Normalized (source of truth)", tone: "data", tag: "Safe writes" });
    table(d, { x: 70, y: 230, rowH: 36, headH: 36, size: 13, cols: [{ title: "users", w: 90 }, { title: "name", w: 130 }], rows: [["42", "Ann Lee"], ["7", "Bo Chen"]] });
    table(d, { x: 330, y: 230, rowH: 36, headH: 36, size: 13, cols: [{ title: "posts", w: 90 }, { title: "author_id", w: 110 }, { title: "text", w: 150 }], rows: [["901", "42", "Hello!"], ["902", "42", "Day 2"], ["903", "7", "Hi all"]] });
    d.text(330, 400, "↑ posts.author_id → users.id  (JOIN on every read)", { size: 12.5, weight: 600, color: TONES.data[0] });
    d.text(70, 440, "✓  Rename Ann once → correct everywhere", { size: 13.5, color: T.body });
    d.text(70, 468, "✓  No update anomalies, less storage", { size: 13.5, color: T.body });
    d.text(70, 496, "✗  Every feed read needs joins → slower at scale", { size: 13.5, color: "#B91C1C" });
    d.text(70, 540, "Use for: money, inventory, permissions, anything that must never disagree", { size: 13, weight: 600, color: TONES.data[0] });

    d.panel({ x: 760, y: 158, w: 700, h: 430, title: "Denormalized (read model)", tone: "cache", tag: "Fast reads" });
    table(d, { x: 790, y: 230, rowH: 36, headH: 36, size: 13, cols: [{ title: "feed_items", w: 110 }, { title: "author_name", w: 140 }, { title: "text", w: 150 }, { title: "likes", w: 90 }], rows: [["901", "Ann Lee", "Hello!", "1,204"], ["902", "Ann Lee", "Day 2", "88"], ["903", "Bo Chen", "Hi all", "7"]] });
    d.text(790, 440, "✓  One read renders the whole screen", { size: 13.5, color: T.body });
    d.text(790, 468, "✓  Scales reads horizontally, cache-friendly", { size: 13.5, color: T.body });
    d.text(790, 496, "✗  Ann renames → every copy must be updated (async job)", { size: 13.5, color: "#B91C1C" });
    d.text(790, 540, "Use for: feeds, product cards, search results, dashboards", { size: 13, weight: 600, color: TONES.cache[0] });
    return d;
  },

  "acid-base": () => {
    const d = new Diagram({
      w: 1500, h: 600,
      eyebrow: "Data · guarantees",
      title: "ACID vs BASE",
      subtitle: "ACID promises **correctness per transaction**. BASE promises **availability and scale**, with data that converges later.",
      takeaway: "ACID for money, bookings and inventory. BASE for likes, views and activity feeds. Most real systems use both.",
    });
    const acid = [["A", "Atomicity", "All steps happen, or none do.", "Debit + credit both apply"], ["C", "Consistency", "Rules and constraints always hold.", "No negative stock"], ["I", "Isolation", "Concurrent transactions don't collide.", "Two buyers can't take the last seat"], ["D", "Durability", "Committed means saved, even after a crash.", "Power loss keeps the order"]];
    const base = [["BA", "Basically available", "The system answers, even during failures.", "Always shows a like count"], ["S", "Soft state", "Replicas may differ for a while.", "EU sees 1,204 likes, US sees 1,199"], ["E", "Eventually consistent", "Replicas converge when writes stop.", "Seconds later, both show 1,204"]];
    d.panel({ x: 40, y: 158, w: 700, h: 400, title: "ACID — relational databases", tone: "data" });
    acid.forEach(([l, t, s, ex], i) => {
      const y = 232 + i * 78;
      d.raw(`<rect x="66" y="${y}" width="52" height="52" rx="12" fill="${TONES.data[0]}"/>`, "mid");
      d.text(92, y + 34, l, { size: 22, weight: 800, color: "#fff", anchor: "middle" });
      d.text(136, y + 22, t, { size: 15, weight: 700, color: T.ink });
      d.text(136, y + 44, s, { size: 13.5, color: T.body });
      d.text(712, y + 34, ex, { size: 12.5, weight: 600, color: TONES.data[0], anchor: "end" });
    });
    d.panel({ x: 760, y: 158, w: 700, h: 400, title: "BASE — many distributed NoSQL stores", tone: "cache" });
    base.forEach(([l, t, s, ex], i) => {
      const y = 232 + i * 96;
      d.raw(`<rect x="786" y="${y}" width="52" height="52" rx="12" fill="${TONES.cache[0]}"/>`, "mid");
      d.text(812, y + 34, l, { size: l.length > 1 ? 18 : 22, weight: 800, color: "#fff", anchor: "middle" });
      d.text(856, y + 22, t, { size: 15, weight: 700, color: T.ink });
      d.text(856, y + 44, s, { size: 13.5, color: T.body });
      d.text(856, y + 68, ex, { size: 12.5, weight: 600, color: TONES.cache[0] });
    });
    return d;
  },



  "saga-vs-2pc": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Data · distributed transactions",
      title: "Two-phase commit vs saga",
      subtitle: "One business action touches **several services**. How do you keep them consistent without one shared database?",
      takeaway: "Microservices use sagas: a chain of local transactions with a compensating “undo” for each step. 2PC blocks and couples availability.",
    });
    d.panel({ x: 40, y: 158, w: 560, h: 490, title: "2PC — coordinator locks everyone", tone: "warn", tag: "Rare" });
    d.node({ id: "co", x: 200, y: 230, w: 240, kind: "coord", title: "Coordinator" });
    ["Orders DB", "Payments DB", "Inventory DB"].forEach((t, i) => d.node({ id: "p" + i, x: 70 + i * 175, y: 420, w: 160, h: 56, kind: "db", title: t }));
    [0, 1, 2].forEach((i) => d.edge("co", "p" + i, { sides: "bt", label: i === 1 ? "1 prepare? · 2 commit!" : undefined, both: true }));
    d.text(70, 540, "✓  All-or-nothing across databases", { size: 13.5, color: T.body });
    d.text(70, 568, "✗  Locks held while waiting; coordinator crash = stuck", { size: 13.5, color: "#B91C1C" });
    d.text(70, 596, "✗  Slowest participant slows everyone", { size: 13.5, color: "#B91C1C" });

    d.panel({ x: 620, y: 158, w: 840, h: 490, title: "Saga — local steps + compensations", tone: "good", tag: "Microservices default" });
    const steps = [["Create order", "PENDING"], ["Reserve stock", "−1 item"], ["Charge card", "$42"], ["Confirm order", "CONFIRMED"]];
    const comps = ["Cancel order", "Release stock", "Refund card"];
    steps.forEach(([t, s], i) => d.node({ id: "s" + i, x: 650 + i * 200, y: 250, w: 180, h: 64, kind: i === 3 ? "check" : "service", title: t, sub: s }));
    comps.forEach((t, i) => d.node({ id: "c" + i, x: 650 + i * 200, y: 430, w: 180, h: 56, kind: "x", title: t }));
    [0, 1, 2].forEach((i) => d.edge("s" + i, "s" + (i + 1), { sides: "rl", tone: "good" }));
    d.edge("s2", "c1", { sides: "bt", tone: "bad", label: "card declined", dashed: true, via: [[1130, 380], [950, 380]], at: [1040, 380] });
    d.edge("c1", "c0", { sides: "lr", tone: "bad", dashed: true });
    d.text(650, 540, "Each step is a local ACID transaction that emits an event.", { size: 13.5, color: T.body });
    d.text(650, 568, "On failure, run the compensations for completed steps, in reverse.", { size: 13.5, color: T.body });
    d.text(650, 604, "Orchestrated (a workflow engine directs) or choreographed (services react to events).", { size: 13, weight: 600, color: TONES.good[0] });
    return d;
  },

  "btree-index": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Data · indexes",
      title: "How an index turns a scan into a jump",
      subtitle: "Without an index the database reads **every row**. A B-tree index finds one row in ~4 hops among a billion.",
      takeaway: "Index the columns your hot queries filter, join and sort on — every extra index slows writes, so index with intent.",
    });
    d.panel({ x: 40, y: 158, w: 460, h: 430, title: "No index: full table scan", tone: "bad", tag: "O(n)" });
    for (let i = 0; i < 9; i++) {
      const y = 232 + i * 36, hit = i === 6;
      d.raw(`<rect x="70" y="${y}" width="400" height="28" rx="6" fill="${hit ? TONES.good[1] : "#F8FAFC"}" stroke="${hit ? TONES.good[0] : "#E2E8F0"}"/>`, "mid");
      d.text(86, y + 19, `row ${[18, 3, 77, 41, 9, 60, 42, 15, 88][i]}  ·  ${hit ? "ann@mail.com ✓" : "checked…"}`, { size: 12.5, mono: true, color: hit ? TONES.good[0] : T.muted });
    }
    d.text(70, 570, "1 billion rows → minutes", { size: 13.5, weight: 700, color: "#B91C1C" });

    d.panel({ x: 520, y: 158, w: 940, h: 430, title: "B-tree index on email", tone: "good", tag: "O(log n)" });
    d.box({ id: "root", x: 890, y: 230, w: 200, h: 52, text: "d  ·  m  ·  t", tone: "good", solid: true, size: 15 });
    [["a–c", 580], ["e–l", 800], ["n–s", 1020], ["u–z", 1240]].forEach(([t, x], i) => d.box({ id: "n" + i, x, y: 350, w: 180, h: 48, text: t, tone: i === 0 ? "good" : "neutral", size: 14 }));
    [0, 1, 2, 3].forEach((i) => d.edge("root", "n" + i, { sides: "bt", tone: i === 0 ? "good" : undefined }));
    ["aaron@", "adam@", "ann@ → row 42"].forEach((t, i) => d.box({ id: "l" + i, x: 560 + i * 150, y: 460, w: 140, h: 44, text: t, tone: i === 2 ? "good" : "neutral", size: 12.5, weight: i === 2 ? 700 : 500 }));
    d.edge("n0", "l2", { sides: "bt", tone: "good" });
    d.note({ x: 1060, y: 440, w: 380, tone: "info", title: "Types to name", icon: "idea", lines: ["Composite (user_id, created_at) — order matters", "Covering — includes all needed columns", "Unique, partial, full-text"] });
    return d;
  },

  "replication": () => {
    const d = new Diagram({
      w: 1500, h: 680,
      eyebrow: "Data · replication",
      title: "Replication: copies for safety and read scale",
      subtitle: "One **primary** takes writes and streams its log to **replicas**. Sync or async decides how much you can lose.",
      takeaway: "Sync replicas protect data but slow writes; async replicas are fast but can lose the last seconds and serve stale reads.",
    });
    d.node({ id: "app", x: 40, y: 330, w: 190, h: 70, kind: "service", title: "App servers" });
    d.node({ id: "p", x: 400, y: 330, w: 240, h: 76, kind: "db", title: "Primary", sub: "all writes", emphasis: true });
    d.node({ id: "r1", x: 820, y: 200, w: 260, h: 70, kind: "replica", title: "Sync standby", sub: "zone B · 0 data loss" });
    d.node({ id: "r2", x: 820, y: 360, w: 260, h: 70, kind: "replica", title: "Async replica", sub: "zone C · lag ~100 ms" });
    d.node({ id: "r3", x: 820, y: 520, w: 260, h: 70, kind: "replica", title: "Async replica", sub: "other region · lag ~1 s" });
    d.edge("app", "p", { sides: "rl", hot: true, label: "writes", step: 1 });
    d.edge("p", "r1", { sides: "rl", tone: "good", label: "wait for ack", step: 2 });
    d.edge("p", "r2", { sides: "rl", dashed: true, label: "stream log" });
    d.edge("p", "r3", { sides: "rl", dashed: true });
    d.edge("app", "r2", { sides: "bb", via: [[135, 475], [950, 475]], tone: "info", label: "reads (may be slightly stale)", at: [540, 475] });
    d.note({ x: 1130, y: 200, w: 330, title: "Synchronous", icon: "lock", tone: "good", lines: ["Commit waits for the replica.", "RPO = 0. Higher write latency."] });
    d.note({ x: 1130, y: 380, w: 330, title: "Asynchronous", icon: "bolt", tone: "warn", lines: ["Commit returns immediately.", "Primary dies → last writes lost."] });
    return d;
  },

  "replication-lag": () => {
    const d = new Diagram({
      w: 1500, h: 620,
      eyebrow: "Data · replication",
      title: "Replication lag and read-your-writes",
      subtitle: "Ann updates her bio, refreshes, and sees the **old** bio — her read went to a replica that hasn't caught up.",
      takeaway: "Route a user's reads to the primary for a short window after they write (or track their last-write position).",
    });
    sequence(d, {
      x: 48, y: 166, w: 900, actorW: 190, rowH: 46,
      actors: [{ kind: "user", title: "Ann" }, { kind: "db", title: "Primary" }, { kind: "replica", title: "Replica" }],
      messages: [
        { from: 0, to: 1, label: "UPDATE bio = 'Chef'", step: 1 },
        { from: 1, to: 0, label: "OK", dashed: true },
        { from: 0, to: 2, label: "GET profile (refresh)", step: 2 },
        { from: 2, to: 0, label: "bio = 'Student'  ← stale!", dashed: true, tone: "bad" },
        { from: 1, to: 2, label: "replication arrives (300 ms later)", dashed: true },
        { from: 0, to: 2, label: "GET profile", step: 3 },
        { from: 2, to: 0, label: "bio = 'Chef'", dashed: true, tone: "good" },
      ],
    });
    d.note({ x: 990, y: 166, w: 470, title: "Fixes", icon: "check", tone: "good", lines: [
      "Read from the primary for ~1 minute after the user writes.",
      "Always read the user's own profile from the primary.",
      "Pass the write's log position; only read from replicas that have reached it.",
      "Monitor replica lag; remove lagging replicas from the read pool.",
    ] });
    return d;
  },

  "sharding": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Data · sharding",
      title: "Sharding: splitting one database into many",
      subtitle: "When one primary can't hold all the data or take all the writes, split rows across shards by a **shard key**.",
      takeaway: "Choose a shard key that spreads load evenly AND keeps each common query on a single shard. Changing it later is painful.",
    });
    d.node({ id: "app", x: 40, y: 190, w: 220, h: 70, kind: "service", title: "App servers" });
    d.node({ id: "router", x: 340, y: 190, w: 260, h: 70, kind: "gateway", title: "Shard router", sub: "shard = hash(user_id) % 4" });
    d.edge("app", "router", { sides: "rl", hot: true });
    ["users 0–25%", "users 25–50%", "users 50–75%", "users 75–100%"].forEach((t, i) => {
      d.node({ id: "s" + i, x: 690 + i * 195, y: 190, w: 180, h: 70, kind: "db", title: `Shard ${i + 1}`, sub: t });
    });
    d.edge("router", "s0", { sides: "rl", hot: true });
    [1, 2, 3].forEach((i) => d.edge("router", "s" + i, { sides: "tt", via: [[470, 170], [780 + i * 195, 170]], dashed: true }));
    table(d, {
      x: 40, y: 320, rowH: 50, headH: 44, size: 13.5,
      cols: [{ title: "Strategy", w: 240 }, { title: "How rows are placed", w: 360 }, { title: "Great at", w: 350 }, { title: "Weakness", w: 470 }],
      rows: [
        [{ t: "Hash", tone: "good" }, "hash(key) → shard", "Even spread of load", "Range queries hit every shard"],
        [{ t: "Range", tone: "info" }, "A–F, G–M, … or by date", "Range scans, time windows", "Hot shard (latest dates, popular letters)"],
        [{ t: "Directory", tone: "edge" }, "Lookup table: key → shard", "Moving tenants freely", "Lookup service is a dependency"],
        [{ t: "Geo", tone: "cache" }, "EU users → EU shard", "Data residency, latency", "Uneven regions"],
        [{ t: "Consistent hash", tone: "search" }, "Ring of virtual nodes", "Adding shards moves little data", "More complex"],
      ],
    });
    return d;
  },

  "consistent-hashing": () => {
    const d = new Diagram({
      w: 1500, h: 720,
      eyebrow: "Data · consistent hashing",
      title: "Consistent hashing: add a node, move only a slice",
      subtitle: "Nodes and keys are hashed onto a ring. A key belongs to the **first node clockwise**. Adding a node steals keys from one neighbour only.",
      takeaway: "hash % N reshuffles almost every key when N changes; a ring moves only ~1/N. Virtual nodes smooth out the balance.",
    });
    const ring = (cx, cy, r, nodes, keys, title, newNode) => {
      d.raw(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#CBD5E1" stroke-width="10"/>`, "back");
      const P = (deg, rr = r) => [cx + rr * Math.sin((deg * Math.PI) / 180), cy - rr * Math.cos((deg * Math.PI) / 180)];
      keys.forEach(([deg, owner, moved]) => {
        const [x, y] = P(deg);
        const col = TONES[owner][0];
        d.raw(`<circle cx="${x}" cy="${y}" r="9" fill="${moved ? "#fff" : col}" stroke="${col}" stroke-width="3"/>`, "front");
      });
      nodes.forEach(([deg, name, tone, isNew]) => {
        const [x, y] = P(deg);
        const [lx, ly] = P(deg, r + 58);
        d.raw(`<rect x="${x - 22}" y="${y - 22}" width="44" height="44" rx="12" fill="${TONES[tone][0]}" stroke="#fff" stroke-width="3"/>`, "front");
        d.raw(icon("server", x - 12, y - 12, 24, "#fff", 2), "front");
        d.text(lx, ly + 5, name, { size: 14, weight: 700, color: TONES[tone][0], anchor: "middle" });
        if (isNew) d.text(lx, ly + 24, "NEW", { size: 11, weight: 800, color: TONES.bad[0], anchor: "middle" });
      });
      d.text(cx, cy - 8, title, { size: 16, weight: 700, color: T.ink, anchor: "middle" });
      d.text(cx, cy + 16, "clockwise →", { size: 13, color: T.muted, anchor: "middle" });
    };
    const keysA = [[20, "info"], [55, "info"], [100, "good"], [150, "good"], [200, "warn"], [240, "warn"], [290, "info"], [330, "info"]];
    ring(360, 420, 190, [[80, "Node A", "good"], [170, "Node B", "warn"], [0, "Node C", "info"]], [[20, "good"], [55, "good"], [100, "warn"], [150, "warn"], [200, "info"], [240, "info"], [290, "info"], [330, "info"]], "3 nodes");
    ring(1000, 420, 190, [[80, "Node A", "good"], [170, "Node B", "warn"], [0, "Node C", "info"], [265, "Node D", "bad", true]], [[20, "good"], [55, "good"], [100, "warn"], [150, "warn"], [200, "bad", true], [240, "bad", true], [290, "info"], [330, "info"]], "add Node D");
    d.edge([600, 250], [770, 250], { route: "straight", hot: true, label: "add a node" });
    d.note({ x: 1240, y: 190, w: 220, title: "Result", icon: "check", tone: "good", lines: ["Only the 2 hollow keys moved (C → D).", "A and B untouched."] });
    d.note({ x: 1240, y: 420, w: 220, title: "Virtual nodes", icon: "idea", tone: "info", lines: ["Each server takes 100–200 ring positions → even load."] });
    return d;
  },

  "federation-vs-sharding": () => {
    const d = new Diagram({
      w: 1500, h: 560,
      eyebrow: "Data · scaling out",
      title: "Federation vs sharding",
      subtitle: "Federation splits by **what the data is** (users, orders, catalog). Sharding splits **one table by key**.",
      takeaway: "Federate along team and domain boundaries first; shard only the one table that outgrows a single database.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 360, title: "Federation — split by domain", tone: "edge" });
    ["Users DB", "Orders DB", "Catalog DB"].forEach((t, i) => d.node({ x: 70 + i * 222, y: 250, w: 200, h: 70, kind: "db", title: t, sub: ["identity team", "checkout team", "catalog team"][i] }));
    d.text(70, 390, "✓  Each team owns its schema and scaling", { size: 13.5, color: T.body });
    d.text(70, 418, "✓  A bad migration can't lock another domain", { size: 13.5, color: T.body });
    d.text(70, 446, "✗  No SQL JOINs across domains — join in the app or via events", { size: 13.5, color: "#B91C1C" });
    d.panel({ x: 760, y: 158, w: 700, h: 360, title: "Sharding — split one table by key", tone: "data" });
    ["messages 1", "messages 2", "messages 3"].forEach((t, i) => d.node({ x: 790 + i * 222, y: 250, w: 200, h: 70, kind: "db", title: t, sub: "same schema" }));
    d.text(790, 390, "✓  Unlimited scale for one giant table", { size: 13.5, color: T.body });
    d.text(790, 418, "✓  Writes spread across many primaries", { size: 13.5, color: T.body });
    d.text(790, 446, "✗  Cross-shard queries and transactions are hard", { size: 13.5, color: "#B91C1C" });
    return d;
  },

  "cap-pacelc": () => {
    const d = new Diagram({
      w: 1500, h: 680,
      eyebrow: "Data · distributed trade-offs",
      title: "CAP and PACELC in plain English",
      subtitle: "When the network splits, a replicated system must choose: **refuse** some requests (consistent) or **answer** with possibly stale data (available).",
      takeaway: "Don't recite letters. Say what users see: “during a region outage we serve stale feeds” or “we reject the payment”.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 470, title: "CAP — during a network partition", tone: "warn" });
    d.node({ id: "e", x: 80, y: 250, w: 200, kind: "db", title: "Replica EU" });
    d.node({ id: "u", x: 500, y: 250, w: 200, kind: "db", title: "Replica US" });
    d.edge("e", "u", { sides: "rl", tone: "bad", dashed: true, label: "✗ link down", noArrow: true });
    d.box({ x: 80, y: 360, w: 300, h: 120, text: "Choose C (CP)", sub: "Refuse writes that can't reach a majority. Correct, but some users see errors.", tone: "info" });
    d.box({ x: 400, y: 360, w: 300, h: 120, text: "Choose A (AP)", sub: "Both sides keep accepting. Always answers, but data diverges and must be merged.", tone: "good" });
    d.text(80, 530, "CP examples: bank ledger, inventory, leader election (etcd, ZooKeeper)", { size: 13, color: T.body });
    d.text(80, 558, "AP examples: shopping cart, likes, DNS, Cassandra/Dynamo-style stores", { size: 13, color: T.body });
    d.text(80, 596, "P is not optional — networks do fail. The real choice is C or A.", { size: 13, weight: 700, color: TONES.warn[0] });

    d.panel({ x: 760, y: 158, w: 700, h: 470, title: "PACELC — and when everything is fine", tone: "info" });
    d.diamond({ id: "pp", cx: 1110, cy: 260, w: 260, h: 90, text: "Partition?", tone: "warn" });
    d.box({ id: "pa", x: 800, y: 350, w: 280, h: 70, text: "Availability or Consistency", tone: "warn", size: 14 });
    d.box({ id: "el", x: 1140, y: 350, w: 280, h: 70, text: "Latency or Consistency", tone: "info", size: 14 });
    d.edge("pp", "pa", { sides: "lt", label: "yes" });
    d.edge("pp", "el", { sides: "rt", label: "no (else)" });
    table(d, {
      x: 800, y: 450, rowH: 38, headH: 36, size: 13,
      cols: [{ title: "System", w: 200 }, { title: "Partition", w: 200 }, { title: "Normal", w: 220 }],
      rows: [["DynamoDB / Cassandra", "A", "Latency"], ["Spanner / CockroachDB", "C", "Consistency"], ["Postgres + async replica", "C (primary)", "Latency (reads)"]],
    });
    return d;
  },

  "geohash-quadtree": () => {
    const d = new Diagram({
      w: 1500, h: 680,
      eyebrow: "Data · geospatial",
      title: "Finding “places near me”: geohash vs quadtree",
      subtitle: "Scanning every restaurant on Earth is too slow. Divide the map into **cells**, then search only your cell and its neighbours.",
      takeaway: "Look up the user's cell plus the 8 neighbours, then compute exact distances on that small candidate set.",
    });
    d.panel({ x: 40, y: 158, w: 700, h: 470, title: "Geohash — fixed grid, string prefixes", tone: "data" });
    const gx = 90, gy = 220, cs = 90;
    const labels = ["9q8y", "9q8z", "9q9n", "9q8v", "9q8y7", "9q9j", "9q8u", "9q8s", "9q9h"];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const center = r === 1 && c === 1;
      d.raw(`<rect x="${gx + c * cs}" y="${gy + r * cs}" width="${cs}" height="${cs}" fill="${center ? TONES.data[1] : TONES.info[1]}" stroke="${center ? TONES.data[0] : TONES.info[2]}" stroke-width="${center ? 2.5 : 1.5}"/>`, "mid");
      d.text(gx + c * cs + 8, gy + r * cs + 20, labels[r * 3 + c], { size: 11.5, mono: true, weight: 600, color: center ? TONES.data[0] : TONES.info[0] });
    }
    d.raw(`<circle cx="${gx + 135}" cy="${gy + 140}" r="9" fill="${TONES.bad[0]}" stroke="#fff" stroke-width="3"/>`, "front");
    [[40, 60], [180, 90], [230, 200], [70, 230], [150, 170], [110, 110], [250, 40]].forEach(([x, y]) => d.raw(`<circle cx="${gx + x}" cy="${gy + y}" r="5" fill="${TONES.cache[0]}"/>`, "front"));
    d.text(400, 250, "Encode (lat, lng) → string", { size: 14, weight: 700, color: T.ink });
    d.text(400, 276, "Shared prefix = nearby", { size: 13.5, color: T.body });
    d.text(400, 312, "Longer string = smaller cell", { size: 13.5, color: T.body });
    d.text(400, 348, "Search your cell + 8 neighbours", { size: 13.5, color: T.body });
    d.text(400, 384, "(a point near an edge has", { size: 13.5, color: T.body });
    d.text(400, 406, " neighbours in other cells)", { size: 13.5, color: T.body });
    d.text(90, 540, "✓  Simple; works as a DB index or shard key", { size: 13.5, color: T.body });
    d.text(90, 568, "✗  Dense cities overload one cell; empty oceans waste cells", { size: 13.5, color: "#B91C1C" });

    d.panel({ x: 760, y: 158, w: 700, h: 470, title: "Quadtree — split busy squares into four", tone: "edge" });
    const qx = 800, qy = 220, qs = 280;
    const sq = (x, y, s, depth) => {
      d.raw(`<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="none" stroke="${TONES.edge[0]}" stroke-opacity="${0.35 + depth * 0.2}" stroke-width="1.5"/>`, "mid");
    };
    sq(qx, qy, qs, 0);
    sq(qx, qy, qs / 2, 1); sq(qx + qs / 2, qy, qs / 2, 1); sq(qx, qy + qs / 2, qs / 2, 1); sq(qx + qs / 2, qy + qs / 2, qs / 2, 1);
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => sq(qx + qs / 2 + a * qs / 4, qy + b * qs / 4, qs / 4, 2));
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => sq(qx + qs / 2 + qs / 4 + a * qs / 8, qy + qs / 4 + b * qs / 8, qs / 8, 3));
    [[190, 20], [205, 35], [230, 25], [250, 50], [245, 90], [220, 95], [200, 110], [260, 100], [175, 60], [60, 200], [230, 230]].forEach(([x, y]) => d.raw(`<circle cx="${qx + x}" cy="${qy + y}" r="4.5" fill="${TONES.cache[0]}"/>`, "front"));
    d.text(1110, 250, "Start with one square", { size: 14, weight: 700, color: T.ink });
    d.text(1110, 276, "Too many points? Split in 4", { size: 13.5, color: T.body });
    d.text(1110, 312, "Downtown → tiny cells", { size: 13.5, color: T.body });
    d.text(1110, 348, "Ocean → one big cell", { size: 13.5, color: T.body });
    d.text(800, 540, "✓  Adapts to density automatically", { size: 13.5, color: T.body });
    d.text(800, 568, "✗  Usually held in memory; harder to shard", { size: 13.5, color: "#B91C1C" });
    return d;
  },
};
