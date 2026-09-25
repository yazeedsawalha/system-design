# Replication

Replication copies data to multiple nodes for durability, availability, and read scale. The consistency you get depends on *when* replicas acknowledge writes.

## Primary-secondary (leader-follower)

One primary accepts writes; secondaries replicate the log. Reads can go to secondaries (stale possible) or primary (fresher).

**Failover:** promote a secondary if primary dies. Automated failover needs fencing to avoid two primaries.

## Multi-primary

Multiple writers—higher write availability, conflict resolution required (last-write-wins, CRDTs, app merges). Harder; use when geo write locality demands it.

## Sync vs async

- **Synchronous** — wait for N replicas; lower loss risk (RPO), higher write latency.
- **Asynchronous** — fast ack; risk losing recent writes on crash.

Quorum systems (Dynamo-style) use W/R/N to tune: if W+R>N, overlapping reads see latest acknowledged write (simplified).

## Read replicas

Scale read QPS; replication lag is the tax. Route lag-sensitive reads to primary.

## Geographic replication

Keep data near users; survive regional loss. Cross-region sync latency is tens to hundreds of ms—design accordingly.

## When to use

Always for production durability (at least another AZ). Read replicas when read-heavy. Multi-primary only with clear conflict story.

## Tradeoffs

Freshness vs latency; simplicity of single writer vs multi-writer; cost of idle replicas.

## Failure modes

Failover split-brain, replica lag causing user-visible “missing” data, cascading replica crashes under load after promotion, schema change ordering.

## Interview tip

Draw primary + at least one replica and say whether replication is sync or async and what RPO that implies.

## Self-check

1. User writes then immediately reads a replica—what can go wrong?
2. Why is fencing important during failover?
3. Interpret W=3, R=2, N=5 at a high level.


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
