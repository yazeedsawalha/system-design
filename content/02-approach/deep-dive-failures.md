> [← Back to README](../../README.md)

# Deep dives and failure thinking

Deep dives prove you can go below boxes-and-arrows. Failure analysis proves you have operated (or can imagine operating) real systems.

## Choosing a deep dive

Pick a place where designs diverge:

- Feed fan-out on write vs read
- ID generation uniqueness
- Geo matching / geospatial indexes
- Cache invalidation for permissions
- Exactly-once payment effects
- Hot partition mitigation
- Search indexing lag

Ask the interviewer which they care about.

## Structure a deep dive

1. Restate the sub-problem and constraint.
2. Propose option A with pros/cons.
3. Propose option B.
4. Pick one for the stated scale; note revisit triggers.
5. Sketch sequence or data flow for the happy path.
6. Add one failure case.

## Failure checklist

- Process crash mid-write
- Replica lag / failover
- Network partition between services
- Dependency slow (thread pool exhaustion)
- Poison message / bad payload
- Clock skew
- Disk full
- Thundering herd on recovery
- Partial deploy (mixed versions)
- Abuse traffic

## Patterns to name

| Pattern | Use |
|---------|-----|
| Timeout + retry + jitter | Transient faults |
| Circuit breaker | Protect self from dying dependency |
| Bulkhead | Isolate thread/connection pools |
| Load shedding | Drop low-priority work |
| Idempotency keys | Safe retries |
| Outbox / inbox | Reliable messaging with DB |
| Backpressure | Slow consumers signal producers |
| Graceful degradation | Serve stale / disable non-critical |

## Chaos questions interviewers ask

- “Primary DB dies—what do users see?”
- “Queue lags by 1 hour—what breaks?”
- “One region goes dark?”
- “Cache stampedes after flush?”

Answer with **user impact** + **system behavior** + **mitigation**.

## Observability in deep dives

Name SLIs: success rate, latency, lag, error budget burn. Traces across gateway → service → DB. Alerts on saturation, not only crashes.

## Interview tip

Keep failure talk concrete: “If Redis is down we fail open on rate limits for 5 minutes and alert”—not “we’re resilient.”

## Self-check

1. Walk crash-mid-payment with idempotency.
2. List three degradations for a news feed under dependency failure.
3. Why jitter on retries?


## Practice drill

Set a 10-minute timer. Apply only the ideas from this page to the prompt **“Design a ride-sharing matcher for one city.”** Then compare against the Uber-like design in this guide—gap-analyze without copying its structure blindly. Repeat weekly with a different prompt from the practice list.

## Phrases that score well

- “Given the NFR of X, I’ll prefer Y and accept Z.”
- “Two options: A vs B; I pick A because…”
- “User impact if this fails: …; mitigation: …”
- “Evolution path: MVP → … → …”

Say them deliberately in mocks until natural.

---

[← Back to README](../../README.md)
