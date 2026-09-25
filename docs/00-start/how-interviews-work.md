# How system design interviews work

System design interviews evaluate how you reason about large-scale software under ambiguity. Unlike coding rounds, there is rarely a single correct diagram. Interviewers watch *how* you clarify, estimate, structure a solution, and discuss tradeoffs when requirements shift.

## Typical format

Most companies schedule **45–60 minutes**. A common arc:

1. **Prompt** (1–2 min) — “Design a URL shortener” or “Design Uber.”
2. **Clarify** (5–8 min) — functional and non-functional requirements, scope cuts.
3. **Back-of-envelope** (5 min) — QPS, storage, bandwidth; order-of-magnitude only.
4. **High-level design** (10–15 min) — boxes and arrows: clients, APIs, services, data stores, queues.
5. **Deep dive** (15–20 min) — pick 1–2 hotspots (sharding key, feed fan-out, consistency).
6. **Failures & scale** (5–10 min) — what breaks at 10× traffic; single points of failure.
7. **Wrap-up** (2 min) — summarize tradeoffs you accepted.

Senior and staff candidates spend more time on failure modes, multi-region, and operational concerns. Junior candidates are judged more on structure and vocabulary of core building blocks.

## What interviewers actually score

| Signal | Strong | Weak |
|--------|--------|------|
| Clarification | Asks about scale, consistency, clients | Jumps to tech stack |
| Structure | Clear API + data model + HLD | Random components |
| Tradeoffs | Names both sides, picks with reason | “We’ll use Kafka because it’s popular” |
| Depth | Explains *why* a shard key or cache works | Buzzwords only |
| Collaboration | Checks in, adapts to hints | Monologues past the interviewer |

They are not grading whether you memorize a particular company’s architecture. They care that you can **drive a design conversation** like a tech lead.

## Spoken vs drawn

Talk while you draw. Narrate: “I’ll start with write path… then read path…” Use a whiteboard, Excalidraw, or shared doc. Label every arrow with protocol or data shape when it matters (HTTP, gRPC, Kafka topic, SQL).

Keep the diagram **readable**: 6–12 boxes at HLD. Nested detail belongs in the deep dive, not the first sketch.

## Functional vs non-functional

**Functional** — what the product does: shorten URL, return redirect, list feed.

**Non-functional** — how well: latency p99, availability (e.g. 99.9%), consistency model, cost, multi-region, privacy.

Interviewers often care *more* about non-functionals once the happy path exists. Always ask: “What’s more important if we must choose—latency or strong consistency?”

## Collaboration norms

- State assumptions out loud; invite correction.
- When stuck, propose two options and ask which to explore.
- Time-box: if deep dive eats the clock, surface the remaining risks verbally.
- Do not pretend certainty. “I’d validate this with load tests” is mature.

## Common company flavors

- **Product companies** — user-facing features, mobile clients, CDN, personalization.
- **Infrastructure / platform** — multi-tenant APIs, SLOs, quotas, control plane vs data plane.
- **Fintech / health** — correctness, auditability, compliance, idempotency.
- **Ads / marketplace** — auctions, consistency under contention, fraud.

Adapt vocabulary to the domain without inventing fake compliance theater.

## After the interview

Write down what you drew and where you hesitated. Those gaps become your study list. Re-run the same prompt a week later under a timer; improvement is usually obvious.

## Interview tip

Treat the interviewer as a partner, not a judge. Phrase decisions as proposals: “I’d put a write-through cache here—does that match the consistency you care about?”

## Self-check

1. Sketch a 45-minute agenda for “Design a notification system” with minute budgets.
2. List three non-functional questions you always ask before drawing.
3. Explain the difference between a high-level design and a deep dive in one paragraph.


## Sample dialogue (first 8 minutes)

**Interviewer:** Design a URL shortener.

**You:** Before drawing—who creates links, and do we need auth? Rough scale—startup or consumer viral? Is analytics in scope? Prefer low redirect latency or rich click tracking if they conflict?

**Interviewer:** Public create OK; 100M redirects/day; basic click counts; latency matters more than perfect counts.

**You:** Restating: public short links, ~100M redirects/day, eventual click stats OK, redirect p99 should be tight. Out of scope: custom marketing pages. I’ll estimate, then API + schema, then HLD with cache on the read path.

That dialogue shows collaboration, scope cuts, and NFR prioritization—the behaviors interviewers reward.

## Whiteboard hygiene

- Write big; leave a margin for deep-dive notes.
- Number arrows if order matters.
- Erase dead ends instead of cluttering.
- If virtual, duplicate the frame before a risky redraw.

## Signals that you are running out of time

At minute 35 with no failure talk, skip a second deep dive. Summarize remaining risks in bullets: “I didn’t detail multi-region; I’d start with async replica and DNS failover.” Explicit incompleteness beats silent omission.

## Mapping to other rounds

System design complements coding rounds: coding shows implementation detail; design shows decomposition. Behavioral rounds may ask you to recount a design decision—practice articulating tradeoffs from these drills as stories.

## Closing the loop after practice

Each practice interview should produce one artifact: a one-page redraw plus three bullets of what you would improve. Over a month those pages become your personal playbook—original notes beat rereading the same blog.

## Checklist before an onsite loop

- [ ] Redrew one core design from memory today
- [ ] Reviewed personal miss list (idempotency, fan-out, etc.)
- [ ] Slept; scheduled buffer between interviews
- [ ] Prepared questions for them about real scale pain (shows curiosity)

You cannot cram foundations the morning of—rely on the template muscle.
