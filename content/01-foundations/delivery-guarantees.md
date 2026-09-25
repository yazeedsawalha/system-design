> [← Back to README](../../README.md)

# Delivery guarantees

Messaging systems advertise at-most-once, at-least-once, or exactly-once. Understanding what that means **end-to-end**—including your consumers—is an interview differentiator.

## At-most-once

Fire and forget; on failure, message may be lost. Lowest overhead. Acceptable for metrics where loss is OK.

## At-least-once

Retries until ack. Duplicates possible. **Default assumption** for reliable systems. Requires **idempotent** consumers or dedupe stores.

## Exactly-once (effects)

Broker features (idempotent producers, transactions) help, but *effectively-once* usually means: at-least-once delivery + idempotent processing + transactional side effects (or carefully ordered upserts). True end-to-end exactly-once across arbitrary side effects (email send + DB write + third party) is hard—prefer designing duplicates to be safe.

## Idempotency patterns

- Idempotency keys stored with TTL
- Natural keys upsert (`INSERT ... ON CONFLICT`)
- Version checks / compare-and-set
- Deduplicating caches for event IDs

## Ordering vs duplicates

Retries can reordering relative to other keys. Per-key partitions + idempotency cover most chat/notification needs.

## Acknowledgments

Ack after side effect succeeds (risk redelivery) vs before (risk loss). Prefer ack after durable success for at-least-once.

## When to use which

| Case | Guarantee |
|------|-----------|
| Debug logs | at-most-once |
| Charge card | effectively-once via ledger idempotency |
| Push notification | at-least-once; UX tolerates rare dupes or dedupe by notif id |
| Analytics counts | often at-least-once + additive approx or exactly with transactional outbox |

## Tradeoffs

Stronger guarantees cost latency, complexity, and throughput. Over-promising exactly-once without an idempotency story is a red flag.

## Failure modes

Non-idempotent consumers double-charge; ack-before-write loss; dual writes without transactional outbox causing inconsistency between DB and bus.

## Interview tip

Say: “Broker is at-least-once; consumers upsert by event_id.” That sentence beats “we use exactly-once Kafka” alone.

## Self-check

1. Why does at-least-once require idempotency?
2. Sketch a transactional outbox in three steps.
3. Can you exactly-once send a push notification to APNS? What’s practical?


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
