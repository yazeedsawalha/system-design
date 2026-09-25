> [← Back to README](../../README.md)

# CAP and PACELC

CAP and PACELC are thinking tools for distributed tradeoffs—not rigid laws you recite to sound smart. Use them to frame *which* property you sacrifice under which condition.

## CAP (briefly)

In a partition (nodes cannot communicate), a system must choose:

- **C**onsistency — every read returns the latest write (linearizability-style).
- **A**vailability — every request gets a non-error response.
- **P**artition tolerance — partitions happen; you must handle them.

On a partition you cannot have both perfect C and perfect A. CP systems refuse or block conflicting sides; AP systems serve possibly stale or divergent data.

**Caveats:** CAP is about partitions, not normal operation. “Consistency” here is strong/linearizable—not the C in ACID. Real systems are nuanced (tunable consistency).

## PACELC

Extends CAP: **if Partition, choose A or C; Else (no partition), choose Latency or Consistency.**

Even healthy networks force a choice between waiting for sync replication (consistent, slower) vs responding from a local replica (faster, possibly stale).

## Applying in interviews

| Domain | Typical lean |
|--------|----------------|
| Bank ledger | CP / prefer C over L |
| Shopping cart (guest) | often AP + merge |
| Social like counts | AP / prefer L |
| Config/feature flags | often CP |
| DNS | classic AP flavor |

Always name the **user-visible** inconsistency: “like count may lag 5s” vs “balance must not.”

## When to invoke CAP/PACELC

Multi-region writes, replica reads, conflict-prone collaborative data. Skip the acronym monologue for a single-node Postgres MVP.

## Tradeoffs

Strong consistency raises latency and can reduce availability under partitions. Eventual consistency needs conflict rules and user messaging.

## Failure modes

Assuming “we use Cassandra so we’re AP” without configuring consistency levels; ignoring client retries that create duplicates; confusing backup restore with consistency models.

## Interview tip

Prefer concrete language: “On region failure we serve stale reads for 2 minutes rather than error.” Map that to AP-under-partition without lecturing.

## Self-check

1. Restate CAP without claiming “pick two of three” forever.
2. Give a PACELC example for a multi-region user profile store.
3. Why is ACID’s C different from CAP’s C?


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
