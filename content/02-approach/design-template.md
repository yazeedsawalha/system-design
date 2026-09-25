> [← Back to README](../../README.md)

# Design template

Use this template on every practice prompt until it is muscle memory. Adapt depth to time and level—do not skip steps silently.

## 1. Clarify (5–8 min)

Actors, features, NFRs, out-of-scope, assumptions. Restate.

## 2. Estimate (3–5 min)

QPS read/write, storage, bandwidth, concurrent connections if relevant. Conclude sizing implications.

## 3. API sketch (3–5 min)

List 3–7 endpoints or RPCs with brief request/response fields and error cases. Include auth identity.

## 4. Data model (5 min)

Entities, keys, indexes, shard key. Note denormalization. Where do blobs live?

## 5. High-level design (8–12 min)

```
Clients → CDN/LB/Gateway → Services → Cache/DB/Queue/ObjectStore
```

Walk **write path** then **read path**. Keep ~6–12 boxes.

## 6. Deep dive (10–15 min)

Pick interviewer interest or the hardest part: hotspot, consistency, fan-out, search index pipeline, matching algorithm, etc. Offer alternatives with tradeoffs.

## 7. Failures & scale (5–8 min)

SPOF, replication, retries/idempotency, degradation, 10× traffic plan, multi-region if warranted. Observability hooks.

## 8. Summarize (1–2 min)

“We optimized for X; accepted Y; next evolution is Z.”

## Board layout suggestion

```
[Requirements]     [Estimates]
[API]              [Data model]
[        HLD diagram         ]
[Deep dive notes / tradeoffs ]
```

## Microservices discipline

Start coarse. Split services when scaling axes or ownership differ (e.g., upload service vs metadata service). Avoid 15 boxes of 50-line services.

## Evolution story

MVP → add cache → shard → async pipelines → multi-region. Saying the path shows senior judgment even if you design MVP detail.

## Interview tip

Ask which deep dive they prefer if time is short: “Consistency of booking holds, or payment webhook handling?”

## Self-check

1. Recite the eight steps without looking.
2. What belongs in HLD vs deep dive?
3. How do you recover if step 5 ate half the interview?


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
