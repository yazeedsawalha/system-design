# Sharding

Sharding (horizontal partitioning) splits data across multiple database nodes so each holds a subset of rows. It is how single-cluster storage ceilings get broken—at the cost of complexity.

## Shard key selection

The shard key determines where a row lives. Goals:

- **Even distribution** — avoid hotspots.
- **Query locality** — common queries should hit one shard.
- **Minimal cross-shard transactions**.

Examples: `user_id` for user-centric apps; `tenant_id` for multi-tenant SaaS; time-based for immutable logs (watch end-of-time hot shards).

## Strategies

| Strategy | Pros | Cons |
|----------|------|------|
| Range | Range scans easy | Hot latest range |
| Hash | Even load | Range queries scatter |
| Directory / lookup | Flexible | Lookup service SPOF |
| Geo | Data residency | Uneven regions |
| Consistent hashing | Online rebalance | Complexity |

## Resharding

Plan for growth: leave headroom, use consistent hashing or virtual nodes, or migrate with dual-write / change streams. Resharding is operationally hard—mention a plan even if you do not detail every step.

## Cross-shard operations

Joins, global sorts, and multi-row transactions become application-level problems (scatter-gather, sagas, two-phase commit). Avoid when possible by aligning shard key to transaction boundaries.

## Hot keys

Celebrity users or viral entities overload one shard. Mitigate with key salting, dedicated shards, caching, or separating extreme entities.

## When to use

Dataset or QPS exceeds comfortable single-primary capacity; clear partition key exists. Not day-one for small apps.

## Tradeoffs

Scale vs operational complexity; locality vs balance; autonomy vs cross-shard features.

## Failure modes

Wrong shard key forever; hot partitions; scattered queries timing out; unique constraints across shards; analytics needing fan-out.

## Interview tip

State the shard key and the query that remains single-shard. Then name one cross-shard operation and how you avoid or afford it.

## Self-check

1. Why is `created_at` alone a risky shard key for a social app?
2. How does salting help celebrity hot keys?
3. What breaks about `UNIQUE(email)` after hash sharding by `user_id`?


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
