> [← Back to README](../../README.md)

# Level expectations

Companies map system design performance to levels differently, but patterns are stable. Use this as a **self-calibration**, not a guarantee of any employer’s rubric.

## Junior / L3–L4 (new grad to ~2 years)

**Expected**

- Know core building blocks: LB, cache, DB, queue, CDN.
- Produce a simple HLD for a mid-size service (single region, one primary DB).
- Discuss basic tradeoffs: SQL vs NoSQL, cache aside vs write-through.
- Estimate QPS and storage within an order of magnitude.

**Not yet required**

- Multi-region active-active, complex consensus, custom storage engines.
- Owning ambiguous product scope for a platform.

**How interviews feel:** interviewer scaffolds more; may suggest “add a cache here.” Success = clear structure + correct component purposes.

## Mid / L4–L5 (solid IC)

**Expected**

- Drive the full clarify → estimate → HLD → deep dive loop.
- Choose data model and partition key with justification.
- Discuss consistency, idempotency, retries, and backpressure.
- Identify SPOFs and sketch mitigation (replicas, queues, circuit breakers).
- Compare 2–3 designs for a hotspot (e.g. fan-out on write vs read).

**Stretch:** basic multi-region (primary + DR), rate limiting, search indexing pipeline.

## Senior / L5–L6

**Expected**

- Frame requirements as SLOs and error budgets.
- Design for failure first: partial outages, poison messages, clock skew.
- Multi-tenant concerns: noisy neighbors, quotas, isolation.
- Operational story: metrics, tracing, deploy strategy, rollback.
- Cost awareness (storage tiers, egress, hot partitions).
- Navigate “it depends” with explicit decision criteria.

**Deep dives:** leader election, exactly-once *effects*, secondary indexes at scale, geo-partitioning.

## Staff+ / L6–L7+

**Expected**

- System of systems: control plane, data plane, developer platforms.
- Cross-org constraints: compliance, data residency, vendor lock-in.
- Evolution: how the design migrates from MVP to global without rewrite.
- Influence: explain tradeoffs to execs and peer teams.
- Failure storytelling from real production experience (or rigorously reasoned fiction).

## What changes by level (same prompt)

Prompt: “Design a news feed.”

| Level | Focus |
|-------|--------|
| Junior | Timeline API, posts table, cache recent feeds |
| Mid | Fan-out strategy, ranking, celebrity problem |
| Senior | Multi-region, privacy, ads injection, degradation modes |
| Staff | Platform for feed products, experimentation, cost of fan-out fleet |

## Communicating your level

Do not claim a level; demonstrate it. Mid candidates who overreach into consensus protocols without grounding look worse than those who nail a clean single-region design with solid failure analysis.

If the interviewer pushes higher, follow them. If they stay concrete, stay concrete.

## Interview tip

Ask early: “Should we optimize for a mid-size launch or Facebook-scale day one?” That sets the depth bar and prevents underrating or overengineering.

## Self-check

1. For your target level, list five topics you must speak to fluently.
2. Rewrite a junior HLD for URL shortener into a senior version (add 3 concerns).
3. What signal separates “knows Kafka” from “knows when *not* to use Kafka”?


## Calibrating without an official ladder

If your company uses different names (E3/E5, ICT2/ICT4), map via responsibility: do you own a feature, a service, or a multi-service problem space? Design interview expectations track ownership scope more than years.

## Portfolio evidence (optional)

Side projects that include load testing notes, failure injection, or a written ADR (architecture decision record) give you concrete stories. You do not need production Netflix scale; you need credible reasoning tied to something you built or deeply studied.

## When the interviewer levels you up mid-session

They ask about multi-region conflict resolution after you finished a clean single-region design. Treat it as a compliment and a new scope: “For active-active I’d partition by user_id hash and avoid cross-region sync on the hot path; conflicts on profile edits would use last-write-wins with version vectors—acceptable for bios, not for balances.”

## When they level you down

They keep steering to basics. Do not force Raft. Nail clarity on cache, DB, and LB. Passing a mid-style interview solidly beats failing a staff-style digression.

## Self-study implications by target

- Targeting mid: finish all foundations self-checks; five designs timed.
- Targeting senior: add failure drills and two multi-region evolutions.
- Targeting staff: practice explaining cost and org boundaries; design a platform, not only an app.

## Anti-impostor note

Levels are noisy across companies. Use this page to choose study depth, not to spiral. Improvement shows up as cleaner boards and faster clarification—not as a title.

## Checklist before an onsite loop

- [ ] Redrew one core design from memory today
- [ ] Reviewed personal miss list (idempotency, fan-out, etc.)
- [ ] Slept; scheduled buffer between interviews
- [ ] Prepared questions for them about real scale pain (shows curiosity)

You cannot cram foundations the morning of—rely on the template muscle.

---

[← Back to README](../../README.md)
