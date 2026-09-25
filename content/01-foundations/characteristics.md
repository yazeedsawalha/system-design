> [← Back to README](../../README.md)

# System characteristics

Interview designs live or die on non-functional characteristics. Name them early, pick targets, and let those targets drive architecture.

## Scalability

Ability to handle growth in traffic or data by adding resources.

- **Vertical** — bigger machine; simple, limited, failover harder.
- **Horizontal** — more machines; needs stateless app tier and partitionable data.

**When to use which:** vertical for early MVP databases; horizontal for web tiers and shardable workloads.

**Tradeoffs:** horizontal adds distributed complexity (partial failure). Vertical hits a ceiling and a bigger blast radius.

**Failure modes:** hot partitions, coordination bottlenecks, shared resources (single Redis) that do not scale with app replicas.

## Availability

Fraction of time the system successfully serves requests. Often expressed as “nines” (99.9% ≈ 43 min downtime/month).

High availability uses redundancy, health checks, failover, and multi-AZ deployment. Availability is not the same as correctness.

**Tradeoffs:** more replicas raise cost and replication lag risk. Active-active multi-region is expensive operationally.

**Failure modes:** failover flapping, split brain, cascading retries that amplify outages.

## Latency & throughput

- **Latency** — time for one request (p50/p95/p99 matter more than averages).
- **Throughput** — successful work per second (QPS, messages/sec).

Optimize the path users wait on. Batching raises throughput but can hurt latency.

**Tradeoffs:** synchronous fan-out vs async; consistency checks add latency.

**Failure modes:** head-of-line blocking, GC pauses, lock contention, cold caches.

## Consistency

Agreement on data values across replicas and readers. Models include strong, read-your-writes, causal, eventual.

**When:** money and inventory lean strong; social feeds often tolerate eventual.

**Tradeoffs:** strong consistency limits availability or latency under partition (see CAP/PACELC).

**Failure modes:** stale reads after failover, lost updates without concurrency control.

## Durability

Once acknowledged, data survives crashes. Achieved via fsynced WAL, multi-disk/AZ replication, backups.

**Tradeoffs:** sync replication increases write latency; async risks data loss on primary failure.

**Failure modes:** acknowledging before fsync; backups never tested; correlated disk failures.

## Resilience

Graceful behavior under stress: timeouts, retries with jitter, circuit breakers, bulkheads, load shedding, poison-pill isolation.

**Tradeoffs:** aggressive retries can DDoS yourself; long timeouts hold resources.

## Observability

Ability to understand system state from metrics, logs, traces. Without it, you cannot operate SLOs.

**Tradeoffs:** high-cardinality metrics explode cost; sampling traces may miss rare bugs.

## Interview tip

Write NFRs as numbers: “p99 read < 200 ms, 99.9% availability, RPO < 1 min.” Vague “highly available” earns shrugs.

## Self-check

1. Contrast availability vs durability with an example.
2. Why can higher throughput increase p99 latency?
3. Give a product feature that needs strong consistency and one that does not.


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
