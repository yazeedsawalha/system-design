> [← Back to README](../../README.md)

# Tradeoffs cheatsheet

Quick contrasts you can deploy in interviews. Always pair with *context*—tradeoffs are not absolute winners.

## SQL vs NoSQL

- SQL: relations, transactions, ad-hoc queries; sharding harder.
- NoSQL: scale/flexible models; app-level joins/transactions.

## Sync vs async

- Sync: simple, immediate errors; couples availability.
- Async: resilient to spikes; eventual completion UX.

## Monolith vs services

- Monolith: easy consistency & deploy early.
- Services: independent scale/deploy; distributed failure modes.

## Consistency vs latency

- Sync quorum / primary reads: fresher, slower.
- Local/cached reads: fast, stale possible.

## Fan-out on write vs read

- Write: fast timeline reads; write amplification; celebrity problem.
- Read: cheap writes; slow/expensive merges at read.

## Cache-aside vs write-through

- Aside: simple, risk stampedes; stale until TTL/invalidate.
- Through: fresher cache; write latency ↑.

## Vertical vs horizontal scale

- Vertical: simple; ceiling + bigger blast radius.
- Horizontal: capacity; needs state externalization.

## Object store vs DB for blobs

- Objects: cheap large bytes, CDN-friendly.
- DB: transactional metadata only—keep blobs out.

## Push vs pull notifications

- Push: low latency; connection cost.
- Pull/poll: simpler; higher latency/waste.

## Consistent hashing vs range partition

- Hash: balanced; poor range scans.
- Range: scans; hotspot at edge.

## At-least-once vs at-most-once

- Alo: no loss, need idempotency.
- Amo: may lose, simpler.

## Multi-region active-passive vs active-active

- Passive: simpler failover; idle capacity / higher RTO.
- Active: lower latency globally; conflict resolution.

## Interview tip

Speak tradeoffs as: “Option A optimizes X at cost of Y; given NFR Z we pick A.”

## Self-check

1. Pick fan-out strategy for 100 followers avg vs 10M celebrity.
2. When is a monolith the *senior* choice?
3. State a PACELC tradeoff for multi-region reads.


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
