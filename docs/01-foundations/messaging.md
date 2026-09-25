# Messaging and asynchronous communication

Message queues and event streams decouple producers from consumers so spikes buffer and work continues when downstream is slow.

## Queues vs streams vs pub/sub

- **Work queue** — each message processed by one consumer (task distribution).
- **Pub/sub** — broadcast to many subscriptions.
- **Log/stream** (Kafka-style) — durable ordered log; consumers track offsets; replay possible.

## Why async

- Absorb traffic spikes
- Retry independently
- Fan out one write to many downstreams (email, analytics, search index)
- Long-running work without blocking HTTP

## Ordering

Total global order is expensive. Prefer **per-key ordering** (partition by `user_id`) when sequence matters. Do not assume cross-partition order.

## Poison messages

Bad payloads can block a consumer forever. Use max retries → dead-letter queue (DLQ) → alert and inspect.

## Schema evolution

Version payloads (or use compatible schemas). Consumers must tolerate new fields; producers must not break required old fields without coordination.

## When to use

Email/push side effects, stream processing, ingestion pipelines, workflow steps between services. Avoid for the critical synchronous read path the user is waiting on—unless you have a plan for “accepted” vs “done.”

## Tradeoffs

Decoupling vs end-to-end latency; ops complexity; exactly-once difficulty; debugging distributed flows.

## Failure modes

Unbounded queues hiding outages, consumer lag, duplicate processing, hot partitions, lost messages if durability misconfigured, chatty tiny messages overwhelming brokers.

## Interview tip

Draw the queue on the **write path** for side effects, and state consumer idempotency. Tie partition key to ordering needs.

## Self-check

1. Queue vs log: which supports replay better and why?
2. How do you preserve per-user message order at scale?
3. What is a DLQ for?


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
