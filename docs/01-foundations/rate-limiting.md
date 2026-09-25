# Rate limiting

Rate limiting protects systems and tenants from abuse and accidental overload by capping request rates per key (IP, user, API token, tenant).

## Algorithms

### Token bucket

Tokens refill at rate *r*; burst size *b*. A request costs a token. Allows controlled bursts—good for APIs.

### Leaky bucket

Smooths outflow to constant rate; excess discarded or queued. Good for shaping to downstream limits.

### Fixed window

Count requests in 1-second or 1-minute buckets. Simple; allows 2× burst at window edges.

### Sliding window / sliding log

Smoother accuracy; higher memory (timestamps) or approximate counts.

## Where to enforce

- Edge / gateway (cheap rejection)
- Service (business quotas)
- Downstream (protect DB)

Defense in depth: edge coarse limits + service fine limits.

## Distributed limiters

Counters in Redis (`INCR` + `EXPIRE`) or similar. Use Lua/transactions for atomicity. For global accuracy under high QPS, accept approximation or shard counters.

## HTTP semantics

Return `429 Too Many Requests` with `Retry-After`. Include limit headers when helpful (`X-RateLimit-Remaining`).

## When to use

Public APIs, login endpoints (credential stuffing), expensive searches, multi-tenant platforms, webhook egress.

## Tradeoffs

Strict global limits vs latency (central Redis). Fairness vs simplicity (per-user vs per-IP). Blocking vs queuing excess.

## Failure modes

Redis outage—fail open (risk overload) vs fail closed (availability hit). Hot keys for popular tenants. Clock skew with window algorithms. Mis-tuned limits causing false positives in launches.

## Interview tip

Ask “per user or per IP?” and “burst allowed?” Then pick token bucket + Redis and discuss fail-open policy.

## Self-check

1. Why do fixed windows allow edge bursts?
2. Fail-open vs fail-closed when the limiter store is down?
3. How would you rate-limit a distributed fleet without a single Redis? (hint: local + periodic reconcile)


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
