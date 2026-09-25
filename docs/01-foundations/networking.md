# Networking basics for interviews

You rarely configure BGP in a design interview, but you must place TLS, DNS, load balancers, and protocols correctly on the diagram.

## DNS

Clients resolve hostnames to IPs. TTL controls cache duration. Geo-DNS can steer users to regions. DNS is not a perfect load balancer—TTLs and client caches lag.

**Failure modes:** low TTL increases DNS QPS; high TTL slows failover. Single DNS provider outages happen—know the dependency.

## TLS & termination

Encrypt in transit. Terminate TLS at the load balancer or gateway for efficiency, or end-to-end to the app for higher assurance. Certificates need rotation automation.

## HTTP APIs

REST/JSON is the interview default. gRPC helps internal service meshes (protobuf, streaming, strict schemas). GraphQL centralizes aggregation but shifts complexity to the BFF and caching.

Idempotent methods (GET, PUT) behave differently under retry than POST—design write APIs with idempotency keys when needed.

## TCP vs UDP

TCP: reliable ordered streams (HTTP, most DBs). UDP: lower overhead, app handles loss (gaming, some WebRTC media). QUIC/HTTP3 blurs lines with reliability over UDP.

## WebSockets & long polling

For server push (chat, collab cursors), WebSockets keep a bidirectional channel. They stress connection-count limits and need sticky routing or a pub/sub fan-out layer. Long polling is a simpler fallback.

## Service communication

- **Sync** (HTTP/gRPC): simple mental model; couples availability.
- **Async** (queues/events): decouples; eventual processing.

Prefer sync for user-waiting reads; async for side effects (email, analytics).

## Latency budget

A mobile user → CDN → LB → gateway → service → cache → DB can burn tens of milliseconds per hop. Count hops in deep dives.

## When to emphasize networking

Chat, streaming, multiplayer, IoT, and anything cross-region. Less so for a CRUD admin tool.

## Tradeoffs

Edge termination vs origin TLS; HTTP/1.1 connection limits vs HTTP/2; sticky WebSockets vs redis pub/sub broadcast.

## Failure modes

SYN floods, slowloris, DNS cache poisoning (rare in interview), asymmetric routes, MTU black holes (ops deep dive), connection exhaustion.

## Interview tip

Label protocol on arrows: `HTTPS`, `gRPC`, `Kafka`, `Redis PUB/SUB`. It signals precision.

## Self-check

1. Where would you terminate TLS for a public API and why?
2. When are WebSockets justified over polling?
3. How does DNS TTL interact with blue/green cutover?


## Worked interview moment

Interviewer: “Where does this sit in the stack, and what breaks first at 10× load?”

Answer with: (1) placement on the diagram, (2) the saturation signal you’d page on, (3) the scale-out step, (4) the tradeoff you accept. Example pattern: “This cache sits between API and DB; at 10× we’d see hit-rate drop and DB CPU rise; we’d add replicas and tighten TTLs; tradeoff is more stale reads unless we invalidate on write.”

## Comparison table (quick)

When two technologies seem interchangeable, draw a 3-row table: consistency, latency, ops cost. Fill it for *this* prompt’s NFRs—not generically. Interviewers remember the table tied to requirements.

## Common follow-ups

- “Sync or async replication?”
- “What is the blast radius if this node dies?”
- “How do you test this failure in staging?”

Keep a one-sentence answer ready for each foundations topic you study.
