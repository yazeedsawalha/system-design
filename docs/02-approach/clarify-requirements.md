# Clarify requirements

The first five minutes decide whether your design solves the right problem. Clarifying is not stalling—it is product thinking under pressure.

## Goals of clarification

1. Bound **scope** (MVP vs full product).
2. Surface **scale** (users, QPS, data size).
3. Lock **critical NFRs** (latency, consistency, availability).
4. Identify **clients** (mobile, web, third-party APIs).
5. Agree what is **out of scope**.

## Functional questions (examples)

- Who are the actors? (user, admin, system jobs)
- Core actions? (create, read, update, search, share)
- Sync vs async UX? (“accepted” vs “fully processed”)
- Multi-device? Offline?
- Admin / moderation / analytics needed in-scope?

## Non-functional questions

- Read/write ratio?
- Peak vs average QPS? Daily active users?
- Latency targets (p99)?
- Consistency: can users see stale data?
- Durability / RPO-RTO?
- Multi-region or single region?
- Compliance / PII constraints?
- Budget sensitivity?

## Scope-cutting phrases

- “For v1, can we skip X and note it as phase 2?”
- “Is celebrity-scale fan-out in scope or only average users?”
- “Should we design the payment provider integration or just our ledger?”

Interviewers usually welcome cuts that show prioritization.

## Capture on the board

Write a short list:

```
Functional: …
NFR: p99 < …; consistency = …; scale = …
Out of scope: …
Assumptions: …
```

Revisit if the deep dive reveals a conflict.

## Bad clarification

- Only asking “how many users?” then ignoring the answer.
- Twenty questions with no synthesis.
- Assuming Google scale by default.

## Good clarification

Three to seven high-leverage questions, then a one-sentence problem restatement: “We’ll design a single-region URL shortener for 100M redirects/day, strong uniqueness, eventually consistent analytics.”

## Interview tip

Restate the problem in your own words and wait for a nod before drawing boxes.

## Self-check

1. Write five clarification questions for “Design Dropbox.”
2. What NFR question matters most for payments vs news feed?
3. How do you handle an interviewer who says “you decide the scale”?


## Practice drill

Set a 10-minute timer. Apply only the ideas from this page to the prompt **“Design a ride-sharing matcher for one city.”** Then compare against the Uber-like design in this guide—gap-analyze without copying its structure blindly. Repeat weekly with a different prompt from the practice list.

## Phrases that score well

- “Given the NFR of X, I’ll prefer Y and accept Z.”
- “Two options: A vs B; I pick A because…”
- “User impact if this fails: …; mitigation: …”
- “Evolution path: MVP → … → …”

Say them deliberately in mocks until natural.
