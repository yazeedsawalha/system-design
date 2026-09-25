> [← Back to README](../../README.md)

# Caching and CDNs

Caching stores expensive-to-compute or slow-to-fetch data closer to the consumer. A CDN is a geographically distributed cache for static (and sometimes dynamic) content.

## Cache placements

1. **Client / browser** — HTTP cache headers.
2. **CDN / edge** — images, JS, videos, cacheable API GETs.
3. **Application memory** — per-instance; fast, not shared.
4. **Distributed cache** (Redis/Memcached) — shared across app nodes.
5. **Database buffer pool** — mostly automatic.

## Strategies

| Strategy | Behavior | Use when |
|----------|----------|----------|
| Cache-aside | App reads cache; on miss load DB and fill | General reads |
| Read-through | Cache library loads on miss | Homogeneous access |
| Write-through | Write cache + DB together | Read-heavy after writes |
| Write-back | Write cache; flush DB async | High write throughput; durability risk |
| TTL expiry | Time-based staleness bound | Most web content |
| Explicit invalidation | Delete/update on write | Stronger freshness |

## Key design

Keys must encode the variant: `user:42:profile:v3`. Include version or hash when schema changes. Avoid gigantic values; prefer smaller entries and batching.

## Stampede & thundering herd

Many misses on one key hammer the DB. Mitigate with single-flight locks, probabilistic early expiration, or serving stale while refreshing.

## CDN specifics

Origin shield, cache-control (`max-age`, `s-maxage`), signed URLs for private content, purge APIs for emergencies. Geo reduces RTT; origin still needs protection (rate limits, caching).

## When to use

Read-heavy paths, identical responses for many users, expensive joins or remote calls, static assets.

## Tradeoffs

Stale data vs load; memory cost vs hit rate; invalidation complexity vs TTL simplicity; write-back speed vs crash loss.

## Failure modes

Cache stampedes, stamped hot keys, poisoned cache entries, forgetting auth in cache keys (user A sees user B), CDN purge lag.

## Interview tip

Always specify **key, TTL, and invalidation**. “Add Redis” without those three is incomplete.

## Self-check

1. Compare cache-aside vs write-through for a profile service.
2. How do you prevent a viral key from melting the DB on expiry?
3. When should private user data *not* sit on a shared CDN edge?


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

---

[← Back to README](../../README.md)
