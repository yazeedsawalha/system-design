> [← Back to README](../../README.md)

# Common pitfalls

Avoiding these mistakes raises interview performance as much as learning new tech.

## 1. Jumping to the whiteboard

Diving into Kafka and Cassandra before asking who the users are wastes the room’s trust. **Clarify for 5 minutes.** Scope cuts are features, not failures.

## 2. Boiling the ocean

Designing global multi-region active-active for a campus MVP signals poor judgment. Match architecture to stated scale. Offer an evolution path: “Start single region; add read replicas; later geo-partition.”

## 3. Buzzword bingo

“We’ll use event sourcing, CQRS, service mesh, and blockchain.” If you cannot explain the problem each solves *in this design*, drop it. Prefer boring technology that fits.

## 4. Ignoring the data model

Boxes without schemas hide the real hard parts (query patterns, cardinality, hot keys). Always show primary entities, keys, and the top 3 queries.

## 5. Single point of failure blindness

One primary DB, one queue broker, one region—all fine for MVP if you **name** the risk and mitigation. Pretending it is HA when it is not is worse.

## 6. Consistency hand-waving

“Eventually consistent” is not a design. State *what* can be stale, for how long, and whether users notice (feed ranking vs bank balance).

## 7. Forgetting the write path or the read path

Many candidates design only reads (CDN, cache) or only writes (ingestion). Walk both. Asymmetry is normal; silence is not.

## 8. No backpressure story

At 10× load something sheds load: queue, rate limit, degrade reads, reject writes. Interviews love hearing graceful degradation.

## 9. Overprecise estimates

Arguing about 37 vs 42 bytes per row burns time. Use 50 bytes and move on. Show the formula; round aggressively.

## 10. Not checking in

Monologues lose interviewers. Every 5–7 minutes: “Does this direction work?” Incorporate hints immediately—flexibility is a scored signal.

## 11. Security as an afterthought

AuthN/AuthZ, PII, secrets, and abuse (scraping, spam) belong in NFRs early for user-facing systems. One slide of threat awareness beats zero.

## 12. Chatty microservices

Twenty services for a URL shortener is satire. Start with a modular monolith or few services; split when ownership or scaling axes demand it.

## 13. Cache as magic

Caches need keys, TTLs, stampede control, and invalidation. “Put Redis in front” without key design fails deep dives.

## 14. Exactly-once mythology

End-to-end exactly-once is rare. Prefer “at-least-once + idempotent consumers” and say so confidently.

## 15. Ignoring time and clocks

Booking, payments, and leadership election care about time. Mention NTP skew, server timestamps vs device time, and fencing tokens where relevant.

## Recovery phrases

When you catch yourself in a pitfall:

- “Let me step back and clarify success metrics.”
- “I’ll simplify to a single region first.”
- “The risk with this choice is X; mitigation is Y.”

## Interview tip

Keep a mental checklist on the corner of the board: **Clarify · Estimate · API · Data · HLD · Deep · Fail**. Crossing each off prevents silent omissions.

## Self-check

1. Pick three pitfalls you personally hit; write a prevention habit for each.
2. Critique this statement: “Redis makes it strongly consistent.”
3. How would you politely cut scope when an interviewer says “design Twitter”?


## Pitfall patterns by candidate background

**Backend specialists** often skip product clarification and jump to infra. Force yourself to ask user-facing questions first.

**Frontend specialists** may under-specify data stores. Practice primary keys and query patterns until comfortable.

**Academics** may over-index on CAP proofs. Translate to user-visible staleness and concrete configs.

**Staff-at-current-job interviewing mid elsewhere** may overbuild. Ask for target scale every time.

## Language habits that hurt

- “Basically just…” (hides complexity you should own)
- “We’ll figure it out later” without a risk note
- “Everyone uses X” as justification

Replace with: “Tradeoff is…; given NFR… we choose…”

## Recovering mid-interview

If you realize you skipped clarify: “I’d like to rewind for two requirements questions—it will change the storage choice.” Interviewers almost always allow it; it shows maturity.

## Postmortem template after a failed mock

1. Which pitfall numbers applied?
2. What trigger made you fall in?
3. What phrase or checklist item prevents it next time?

Put the prevention phrase on your miss list.

## Final reminder

Pitfalls are normal. The difference between candidates is how quickly they notice and correct. Build notice-and-correct as a skill equal to knowing Redis.

## Checklist before an onsite loop

- [ ] Redrew one core design from memory today
- [ ] Reviewed personal miss list (idempotency, fan-out, etc.)
- [ ] Slept; scheduled buffer between interviews
- [ ] Prepared questions for them about real scale pain (shows curiosity)

You cannot cram foundations the morning of—rely on the template muscle.

---

[← Back to README](../../README.md)
