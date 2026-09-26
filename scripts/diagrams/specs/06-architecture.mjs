import { Diagram, table, sequence, icon, TONES, T } from "../engine.mjs";

export default {
  "api-styles": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Architecture · APIs",
      title: "REST vs GraphQL vs gRPC",
      subtitle: "Three API styles, three sweet spots. Most mature systems use **REST at the edge** and **gRPC inside**.",
      takeaway: "Choose by client and traffic shape, not fashion: public → REST, flexible mobile screens → GraphQL BFF, service-to-service → gRPC.",
    });
    const cols = [
      ["REST", "info", "GET /users/42/orders?limit=10\nAccept: application/json", ["Resources + HTTP verbs", "Cacheable GETs (CDN, browser)", "Every client understands it"], ["Over- or under-fetching", "Many round trips for rich screens"], "Public APIs, CRUD, webhooks"],
      ["GraphQL", "queue", "query { user(id: 42) {\n  name  orders(last: 10) { total } } }", ["Client asks for exactly the fields", "One round trip for a whole screen", "Strongly typed schema"], ["Hard to cache at the edge", "Expensive queries need limits"], "Mobile / web BFFs, many client shapes"],
      ["gRPC", "good", "rpc GetOrders(UserId)\n    returns (stream Order);", ["Binary Protobuf — small and fast", "Generated clients in every language", "Built-in streaming (HTTP/2)"], ["Browsers need a proxy", "Harder to debug by eye"], "Internal microservices, streaming"],
    ];
    const cw = 452;
    cols.forEach(([t, tone, ex, pros, cons, fit], i) => {
      const x = 40 + i * (cw + 22), y = 158;
      d.panel({ x, y, w: cw, h: 490, title: t, tone });
      const [a, bg] = TONES[tone];
      d.raw(`<rect x="${x + 20}" y="${y + 72}" width="${cw - 40}" height="70" rx="10" fill="#0F172A"/>`, "back");
      d.text(x + 36, y + 100, ex, { size: 12.5, mono: true, color: "#E2E8F0", lh: 1.6 });
      pros.forEach((p, j) => d.text(x + 24, y + 186 + j * 28, "✓  " + p, { size: 13.5, color: T.body }));
      cons.forEach((p, j) => d.text(x + 24, y + 290 + j * 28, "✗  " + p, { size: 13.5, color: "#B91C1C" }));
      d.raw(`<rect x="${x + 20}" y="${y + 370}" width="${cw - 40}" height="90" rx="12" fill="${bg}"/>`, "back");
      d.text(x + 36, y + 400, "BEST FOR", { size: 11.5, weight: 700, color: a });
      d.text(x + 36, y + 426, fit, { size: 14.5, weight: 600, color: T.ink, maxW: cw - 72 });
    });
    return d;
  },

  "n-tier": () => {
    const d = new Diagram({
      w: 1500, h: 600,
      eyebrow: "Architecture · layers",
      title: "N-tier architecture",
      subtitle: "Split the system into **presentation**, **application** and **data** tiers so each can scale, deploy and be secured separately.",
      takeaway: "Only the edge is public; each tier talks only to the tier below. Microservices subdivide the middle tier — they don't remove tiers.",
    });
    const tiers = [
      ["Presentation tier", "What users touch", [["browser", "Web app"], ["mobile", "Mobile app"], ["cdn", "CDN (static)"]], "client", "public"],
      ["Application tier", "Business rules", [["gateway", "API gateway"], ["service", "Order service"], ["service", "User service"], ["worker", "Workers"]], "compute", "private subnet"],
      ["Data tier", "Durable state", [["cache", "Redis"], ["db", "PostgreSQL"], ["storage", "S3"], ["search", "Search index"]], "data", "private subnet · no internet"],
    ];
    tiers.forEach(([t, s, items, tone, net], i) => {
      const y = 160 + i * 138;
      d.group({ x: 40, y, w: 1420, h: 118, tone, label: "" });
      d.text(64, y + 48, t, { size: 18, weight: 700, color: T.ink });
      d.text(64, y + 74, s, { size: 13.5, color: T.muted });
      d.text(64, y + 98, net, { size: 12, weight: 700, color: TONES[tone][0] });
      items.forEach(([k, n], j) => d.node({ id: `t${i}${j}`, x: 380 + j * 262, y: y + 26, w: 240, h: 66, kind: k, title: n }));
    });
    d.edge("t01", "t10", { sides: "bt", hot: true, label: "HTTPS" });
    d.edge("t10", "t11", { sides: "rl" });
    d.edge("t11", "t21", { sides: "bt", label: "SQL" });
    return d;
  },

  "monolith-vs-microservices": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Architecture · decomposition",
      title: "Monolith vs microservices",
      subtitle: "A monolith is one deployable app. Microservices are many small apps, each owning its data. **Both are valid** — at different stages.",
      takeaway: "Start with a well-structured modular monolith. Split out a service when a team, a scaling axis or a failure domain clearly demands it.",
    });
    d.panel({ x: 40, y: 158, w: 560, h: 490, title: "Modular monolith", tone: "info", tag: "Start here" });
    d.group({ x: 80, y: 230, w: 480, h: 250, label: "One deployable app", tone: "compute", dashed: false });
    ["Users", "Orders", "Payments", "Catalog", "Search", "Notify"].forEach((m, i) => d.box({ x: 104 + (i % 3) * 150, y: 270 + Math.floor(i / 3) * 90, w: 136, h: 70, text: m, sub: "module", tone: "info", size: 14 }));
    d.node({ id: "mdb", x: 205, y: 505, w: 230, h: 60, kind: "db", title: "One database" });
    d.edge([320, 480], "mdb", { sides: "bt", route: "straight" });
    d.text(80, 600, "✓ Simple deploys, local calls, ACID across modules", { size: 13, color: T.body });
    d.text(80, 624, "✗ One team's bug can take everything down", { size: 13, color: "#B91C1C" });

    d.panel({ x: 620, y: 158, w: 840, h: 490, title: "Microservices", tone: "good", tag: "Scale teams" });
    d.node({ id: "gw", x: 930, y: 220, w: 220, h: 56, kind: "gateway", title: "API gateway" });
    const svcs = ["Users", "Orders", "Payments", "Catalog"];
    svcs.forEach((s, i) => {
      d.node({ id: "s" + i, x: 650 + i * 200, y: 330, w: 180, h: 56, kind: "service", title: s });
      d.node({ id: "db" + i, x: 665 + i * 200, y: 440, w: 150, h: 52, kind: "db", title: "own DB" });
      d.edge("gw", "s" + i, { sides: "bt" });
      d.edge("s" + i, "db" + i, { sides: "bt" });
    });
    d.node({ id: "bus", x: 820, y: 525, w: 440, h: 52, kind: "stream", title: "Event bus — async messages between services" });
    d.text(650, 610, "✓ Independent deploys & scaling, fault isolation, team autonomy", { size: 13, color: T.body });
    d.text(650, 634, "✗ Network failures, eventual consistency, much more ops tooling", { size: 13, color: "#B91C1C" });
    return d;
  },



  "event-sourcing": () => {
    const d = new Diagram({
      w: 1500, h: 600,
      eyebrow: "Architecture · events",
      title: "Event sourcing: store the story, not just the ending",
      subtitle: "Instead of overwriting a balance, append **every change** as an immutable event. Current state = replay of the events.",
      takeaway: "Great for audit-heavy domains (ledgers, orders); overkill for simple CRUD. Pair it with snapshots and CQRS read models.",
    });
    const evs = [["AccountOpened", "$0"], ["Deposited", "+$100"], ["Withdrew", "−$30"], ["Deposited", "+$50"], ["FeeCharged", "−$2"]];
    evs.forEach(([t, v], i) => {
      const x = 60 + i * 200;
      d.raw(`<rect x="${x}" y="200" width="184" height="86" rx="14" fill="#fff" stroke="${TONES.edge[2]}" stroke-width="1.5" filter="url(#sh)"/>`, "back");
      d.text(x + 16, 228, `#${i + 1}`, { size: 12, weight: 700, color: TONES.edge[0] });
      d.text(x + 16, 252, t, { size: 14.5, weight: 700, color: T.ink });
      d.text(x + 16, 274, v, { size: 13.5, mono: true, color: T.body });
      if (i < evs.length - 1) d.edge([x + 186, 243], [x + 198, 243], { route: "straight" });
    });
    d.text(60, 320, "append-only event log  →  never updated, never deleted", { size: 13, weight: 600, color: TONES.edge[0] });
    d.node({ id: "st", x: 1100, y: 196, w: 360, h: 94, kind: "db", title: "Current state = replay", sub: "balance = 0 + 100 − 30 + 50 − 2 = $118", emphasis: true });
    d.edge([1060, 243], "st", { sides: "rl", route: "straight", hot: true });
    d.node({ id: "p1", x: 60, y: 420, w: 330, h: 70, kind: "search", title: "Projection: statement view", sub: "read model for the app" });
    d.node({ id: "p2", x: 420, y: 420, w: 330, h: 70, kind: "monitor", title: "Projection: fraud analytics", sub: "built later from the same events" });
    d.node({ id: "p3", x: 780, y: 420, w: 300, h: 70, kind: "clock", title: "Time travel", sub: "“balance on March 3rd?”" });
    d.edge([300, 290], "p1", { sides: "bt", dashed: true }); d.edge([560, 290], "p2", { sides: "bt", dashed: true }); d.edge([860, 290], "p3", { sides: "bt", dashed: true });
    d.note({ x: 1110, y: 400, w: 350, title: "Costs", icon: "alert", tone: "warn", lines: ["Events must be versioned forever", "GDPR erasure needs crypto-shredding", "Snapshots needed for long histories"] });
    return d;
  },

  "cqrs": () => {
    const d = new Diagram({
      w: 1500, h: 620,
      eyebrow: "Architecture · CQRS",
      title: "CQRS: separate models for writing and reading",
      subtitle: "Commands go to a model built for **rules and correctness**. Queries hit models built for **fast screens** — updated from events.",
      takeaway: "Use CQRS when read and write shapes differ wildly or scale very differently; accept that read models lag by a moment.",
    });
    d.node({ id: "cl", x: 40, y: 330, w: 170, h: 70, kind: "users", title: "Clients" });
    d.group({ x: 270, y: 160, w: 560, h: 180, label: "Write side (commands)", tone: "data" });
    d.node({ id: "cmd", x: 300, y: 210, w: 230, h: 70, kind: "service", title: "Command handler", sub: "validate, apply rules" });
    d.node({ id: "wdb", x: 570, y: 210, w: 230, h: 70, kind: "db", title: "Write DB", sub: "normalized, ACID" });
    d.edge("cl", "cmd", { sides: "tl", via: [[125, 245]], hot: true, label: "PlaceOrder", at: [125, 290] });
    d.edge("cmd", "wdb", { sides: "rl" });
    d.node({ id: "bus", x: 900, y: 210, w: 200, h: 70, kind: "stream", title: "Events", sub: "OrderPlaced" });
    d.edge("wdb", "bus", { sides: "rl", label: "outbox" });
    d.group({ x: 270, y: 390, w: 1190, h: 180, label: "Read side (queries)", tone: "cache" });
    d.node({ id: "q", x: 300, y: 440, w: 230, h: 70, kind: "service", title: "Query handler", sub: "no business rules" });
    d.node({ id: "r1", x: 900, y: 420, w: 250, h: 56, kind: "cache", title: "Order history view", sub: "Redis / table" });
    d.node({ id: "r2", x: 1180, y: 420, w: 250, h: 56, kind: "search", title: "Search index", sub: "OpenSearch" });
    d.node({ id: "r3", x: 900, y: 496, w: 250, h: 56, kind: "monitor", title: "Dashboard aggregates" });
    d.edge("cl", "q", { sides: "bl", via: [[125, 475]], tone: "info", label: "GetMyOrders", at: [125, 440] });
    d.edge("bus", "r1", { sides: "bt", dashed: true, label: "project" });
    d.edge("bus", "r2", { sides: "rt", via: [[1305, 245]], dashed: true });
    d.edge("q", "r1", { sides: "rl", tone: "info" });
    return d;
  },

  "service-discovery": () => {
    const d = new Diagram({
      w: 1500, h: 640,
      eyebrow: "Architecture · service discovery",
      title: "Service discovery: finding healthy instances",
      subtitle: "Instances come and go with every deploy and autoscale. Callers ask a **registry** instead of hard-coding IP addresses.",
      takeaway: "Callers use a stable name (payments.internal); the platform keeps the list of healthy instances behind it up to date.",
    });
    d.node({ id: "reg", x: 600, y: 180, w: 300, h: 80, kind: "coord", title: "Service registry", sub: "Kubernetes · Consul · Cloud Map", emphasis: true });
    ["10.0.1.11", "10.0.1.12", "10.0.1.13"].forEach((ip, i) => {
      d.node({ id: "p" + i, x: 1140, y: 170 + i * 110, w: 300, h: 64, kind: "container", title: "payments instance", sub: ip, ghost: i === 2 });
      d.edge("p" + i, "reg", { sides: "lr", dashed: true, label: i === 0 ? "register + heartbeat" : undefined, mid: 1010, at: i === 0 ? [1010, 250] : undefined, tone: i === 2 ? "bad" : undefined });
    });
    d.node({ id: "caller", x: 40, y: 330, w: 250, h: 76, kind: "service", title: "Checkout service", sub: "calls “payments”" });
    d.edge("caller", "reg", { sides: "tl", via: [[165, 220]], step: 1, label: "where is payments?", at: [400, 220] });
    d.edge("caller", "p1", { sides: "rl", step: 2, hot: true, label: "call a healthy instance", mid: 1080 });
    table(d, {
      x: 40, y: 484, rowH: 40, headH: 38, size: 13,
      cols: [{ title: "Approach", w: 260 }, { title: "How", w: 520 }, { title: "Trade-off", w: 540 }],
      rows: [["DNS-based", "Name resolves to healthy IPs", "Simple; TTL makes failover slow"], ["Client-side", "Client library queries the registry and load-balances", "Smart, but every language needs a library"]],
    });
    return d;
  },

  "vm-vs-container": () => {
    const d = new Diagram({
      w: 1500, h: 620,
      eyebrow: "Architecture · compute",
      title: "Virtual machines vs containers vs serverless",
      subtitle: "Each step up **shares more** of the machine — lighter and faster to start, with less isolation and less control.",
      takeaway: "Containers on an orchestrator are the default for services; VMs for strong isolation; serverless for spiky, event-driven glue.",
    });
    const stack = (x, title, tone, layers, tag) => {
      d.panel({ x, y: 158, w: 452, h: 420, title, tone, tag });
      layers.forEach(([t, c], i) => {
        const y = 490 - i * 56;
        const cells = Array.isArray(t) ? t : [t];
        const cw = (392 - (cells.length - 1) * 8) / cells.length;
        cells.forEach((cell, j) => {
          d.raw(`<rect x="${x + 30 + j * (cw + 8)}" y="${y}" width="${cw}" height="46" rx="10" fill="${TONES[c][1]}" stroke="${TONES[c][2]}" stroke-width="1.5"/>`, "mid");
          d.text(x + 30 + j * (cw + 8) + cw / 2, y + 28, cell, { size: 12.5, weight: 600, color: TONES[c][0], anchor: "middle" });
        });
      });
    };
    stack(40, "Virtual machines", "neutral", [["Hardware", "neutral"], ["Hypervisor", "neutral"], [["Guest OS", "Guest OS", "Guest OS"], "warn"], [["Libs", "Libs", "Libs"], "info"], [["App A", "App B", "App C"], "good"]], "Minutes to boot");
    stack(514, "Containers", "info", [["Hardware", "neutral"], ["Host OS + kernel", "neutral"], ["Container runtime", "info"], [["Libs", "Libs", "Libs", "Libs"], "info"], [["App A", "App B", "App C", "App D"], "good"]], "Seconds");
    stack(988, "Serverless functions", "good", [["Cloud provider runs everything below", "neutral"], ["Managed runtime (Lambda, Cloud Run)", "neutral"], [["fn", "fn", "fn", "fn", "fn"], "good"]], "Milliseconds*");
    d.text(1010, 240, "You ship only code. Pay per request.", { size: 13.5, weight: 600, color: T.ink });
    d.text(1010, 268, "✓  Scales to zero, no servers to patch", { size: 13, color: T.body });
    d.text(1010, 294, "✗  Cold starts, time limits, vendor lock-in", { size: 13, color: "#B91C1C" });
    return d;
  },

  "oauth-flow": () => {
    const d = new Diagram({
      w: 1500, h: 740,
      eyebrow: "Security · identity",
      title: "OAuth 2.0 + OIDC: “Sign in with Google”",
      subtitle: "The user types their password **only at the identity provider**. Your app receives short-lived tokens, never the password.",
      takeaway: "Access token → call APIs. ID token → know who logged in. Refresh token → get new access tokens. Use PKCE for mobile and SPAs.",
    });
    sequence(d, {
      x: 48, y: 166, w: 1000, actorW: 190, rowH: 44,
      actors: [{ kind: "user", title: "User + browser" }, { kind: "service", title: "Your app backend" }, { kind: "auth", title: "Identity provider", sub: "Google · Okta" }, { kind: "service", title: "Your API" }],
      messages: [
        { from: 0, to: 1, label: "click “Sign in with Google”", step: 1 },
        { from: 1, to: 0, label: "redirect to IdP (+ PKCE challenge)", dashed: true },
        { from: 0, to: 2, label: "log in + consent (password, MFA)", step: 2 },
        { from: 2, to: 0, label: "redirect back with one-time code", dashed: true },
        { from: 0, to: 1, label: "code", step: 3 },
        { from: 1, to: 2, label: "exchange code (+ secret / PKCE verifier)", step: 4 },
        { from: 2, to: 1, label: "ID token + access token + refresh token", dashed: true, tone: "good" },
        { from: 1, to: 0, label: "session cookie (HttpOnly, Secure)", dashed: true },
        { from: 1, to: 3, label: "Authorization: Bearer <access token>", step: 5, tone: "good" },
        { note: "API verifies signature (JWKS), expiry, audience, scopes", from: 3, to: 3, tone: "info" },
      ],
    });
    d.note({ x: 1080, y: 166, w: 380, title: "Three tokens", icon: "key", tone: "edge", lines: ["Access token — short-lived (5–60 min), sent to APIs", "ID token (OIDC) — who the user is", "Refresh token — long-lived, stored safely, gets new access tokens"] });
    d.note({ x: 1080, y: 400, w: 380, title: "SSO", icon: "users", tone: "info", lines: ["One login at the company IdP unlocks every internal app (OIDC or SAML).", "Central MFA and instant offboarding."] });
    return d;
  },

  "security-layers": () => {
    const d = new Diagram({
      w: 1500, h: 700,
      eyebrow: "Security · defense in depth",
      title: "Defense in depth: security at every layer",
      subtitle: "No single control is perfect. Stack layers so an attacker who gets past one still faces the next.",
      takeaway: "TLS everywhere, authenticate at the edge, authorize every object on the server, least-privilege everything, and log without secrets.",
    });
    const rings = [
      ["Edge", "edge", "WAF · DDoS protection · rate limits · bot detection · TLS"],
      ["Identity", "search", "AuthN: OAuth/OIDC, MFA, short-lived tokens · AuthZ: RBAC/ABAC, tenant checks"],
      ["Application", "compute", "Input validation · output encoding · CSRF · SSRF guards · dependency scanning"],
      ["Network", "info", "Private subnets · security groups · mTLS between services · no public DBs"],
      ["Data", "data", "Encryption at rest (KMS) · field-level encryption for PII · backups · data minimization"],
      ["Secrets & ops", "warn", "Secrets manager · key rotation · least-privilege IAM · audit logs · alerts"],
    ];
    rings.forEach(([t, tone, s], i) => {
      const inset = i * 34;
      const x = 40 + inset, y = 160 + i * 36, w = 820 - inset * 2, h = 480 - i * 72;
      const [a, bg, br] = TONES[tone];
      d.raw(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${22 - i * 2}" fill="${bg}" stroke="${br}" stroke-width="1.5"/>`, "back");
      d.text(x + 20, y + 28, t.toUpperCase(), { size: 12, weight: 800, color: a });
    });
    d.node({ x: 330, y: 382, w: 240, h: 56, kind: "db", title: "Your data", emphasis: true });
    rings.forEach(([t, tone, s], i) => {
      const y = 170 + i * 76;
      const [a] = TONES[tone];
      d.raw(`<circle cx="${912}" cy="${y + 16}" r="7" fill="${a}"/>`);
      d.text(932, y + 22, t, { size: 15, weight: 700, color: T.ink });
      d.text(932, y + 46, s, { size: 13, color: T.body, maxW: 520 });
    });
    return d;
  },
};
