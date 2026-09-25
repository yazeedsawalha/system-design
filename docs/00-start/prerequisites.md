# Prerequisites

You do not need to have built Netflix to pass system design interviews. You do need fluency with a shared vocabulary and comfort reasoning about distributed systems at a whiteboard.

## Must-have concepts

### Networking & HTTP

- Request/response, status codes, headers, cookies vs tokens.
- TCP vs UDP at a high level; why HTTP/2 multiplexing helps.
- DNS resolution and TLS termination (where certs live).
- Sticky sessions vs stateless servers.

### Data & storage

- Primary key, secondary index, B-tree vs hash index intuition.
- Transactions (ACID) vs eventual consistency.
- Normalization vs denormalization for read-heavy paths.
- Blob/object storage vs block vs file (when videos land in S3-like stores).

### Concurrency

- Locks, optimistic concurrency (version columns), idempotency keys.
- Race conditions on inventory / double spend style problems.

### Distributed systems intuition

- Replication lag, failover, split brain (awareness, not PhD).
- Queues absorb spikes; consumers must be idempotent for at-least-once.
- Caching can serve stale data; define TTL and invalidation.

### Observability

- Metrics (RED/USE), structured logs, distributed traces.
- SLIs/SLOs vs raw uptime marketing numbers.

## Helpful but learn-as-you-go

- Raft/Paxos mechanics (know *why* consensus exists; details optional until senior).
- Column families, LSM trees, bloom filters (nice in storage deep dives).
- Kubernetes internals (usually out of scope unless platform role).
- Specific cloud product names—prefer capability (“object store”) unless asked.

## Coding prerequisites

System design is not leetcode, but you should be able to:

- Sketch API handlers and SQL/NoSQL schemas.
- Reason about time/space for fan-out algorithms.
- Write pseudocode for rate limiters, consistent hashing, or feed merge.

## Math comfort

Order-of-magnitude arithmetic:

- 1 day ≈ 10^5 seconds.
- 1 KB × 1M users = 1 GB.
- 1 Gbps ≈ 125 MB/s.
- Powers of two for IDs and shards.

Bring a calculator if allowed; precision beyond ~2 significant figures rarely matters.

## Soft prerequisites

- Comfort saying “I don’t know; here’s how I’d find out.”
- Willingness to draw imperfect diagrams and revise them.
- English (or interview language) clear enough to narrate tradeoffs.

## How to fill gaps quickly

| Gap | Fast path |
|-----|-----------|
| HTTP / REST | Build a tiny CRUD API; inspect with curl |
| SQL | Design 3NF then denormalize for a feed query |
| Redis | Run locally; try GET/SET, TTL, INCR, sorted sets |
| Queues | Produce/consume one Kafka or RabbitMQ tutorial |
| CAP | Read the CAP & PACELC page in this guide |

## Interview tip

If a prerequisite is weak, say so and stay at the right abstraction: “I’m less deep on Raft—I’d use a managed consensus store for leader election and focus on the application’s fencing tokens.”

## Self-check

1. Explain cache-aside in three sentences with a failure mode.
2. Compute rough storage for 100M users × 1 KB profile.
3. Name two reasons sticky sessions hurt horizontal scaling.


## Mini-labs (half-day each)

1. **Postgres:** create `users`/`orders`, add indexes, run `EXPLAIN ANALYZE` on a slow query, fix it.
2. **Redis:** implement a token-bucket with a Lua script; test concurrent clients.
3. **Queue:** produce 10k messages; crash a consumer mid-batch; prove idempotent processing with a dedupe table.
4. **HTTP load:** `hey` or `k6` against a local API; watch p99 rise when you add a sync sleep.

These labs turn vocabulary into instinct.

## Reading vs building

If you only read, you will freeze when asked “how does the cache fill on miss?” Building tiny versions creates motor memory for sequence diagrams.

## Glossary you should own (one-liners)

- **SLO:** target on an SLI (e.g. 99.9% success).
- **RPO/RTO:** data loss window / restore time.
- **Idempotent:** same request twice → same effect.
- **Hot partition:** one shard receives disproportionate load.
- **Backpressure:** slowing accept rate when downstream saturates.

Write your own one-liners; do not memorize a vendor glossary.

## When prerequisites feel endless

Stop expanding the list. If you can explain and sketch the must-haves above, start designs. Fill micro-gaps just-in-time when a prompt demands them (geo indexes for Uber, ABR for video).

## Checklist before an onsite loop

- [ ] Redrew one core design from memory today
- [ ] Reviewed personal miss list (idempotency, fan-out, etc.)
- [ ] Slept; scheduled buffer between interviews
- [ ] Prepared questions for them about real scale pain (shows curiosity)

You cannot cram foundations the morning of—rely on the template muscle.
