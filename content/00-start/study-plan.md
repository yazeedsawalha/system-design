> [← Back to README](../../README.md)

# Study plan

A focused plan beats endless article hopping. Below are tracks for **2 weeks**, **4 weeks**, and **8 weeks**. Adjust hours to your calendar; consistency matters more than heroic weekends.

## Principles

1. **Active recall** — close the page and redraw from memory.
2. **One template** — always clarify → estimate → API → data → HLD → deep dive → failures.
3. **Timer** — at least half your design practice is timed.
4. **Original notes** — rewrite concepts in your words; do not paste paid course text.
5. **Spaced repetition** — revisit weak foundations weekly.

## 2-week crash (already coding-strong)

| Day | Focus |
|-----|--------|
| 1 | How interviews work + pitfalls + characteristics |
| 2 | Networking, LB, API gateway, rate limiting |
| 3 | Caching/CDN, databases, indexes |
| 4 | Sharding, replication, CAP/PACELC |
| 5 | Messaging, delivery guarantees, coordination, security |
| 6 | Approach section end-to-end; one timed URL shortener |
| 7 | Rate limiter + notification system |
| 8 | News feed + chat |
| 9 | Pick 2 of: Instagram, Uber, video, Dropbox |
| 10 | Search or typeahead + web crawler |
| 11 | Ticket booking + payments |
| 12 | Timed drills (2 prompts) |
| 13 | Weak-topic remediation |
| 14 | Full mock with rubric; sleep |

Target: ~2–3 hours/day.

## 4-week standard

**Week 1 — Foundations**  
One or two foundation pages per day. Answer self-checks aloud. Build a one-page “building blocks” cheat sheet (your words).

**Week 2 — Approach + easy designs**  
Master capacity estimation. Timed: URL shortener, rate limiter, typeahead.

**Week 3 — Core social / realtime**  
News feed, chat, notifications, Instagram-like. Compare fan-out strategies across them.

**Week 4 — Harder domains + mocks**  
Uber, video, Dropbox, search, booking, payments. Three full mocks. Review rubric gaps.

## 8-week thorough

- Weeks 1–2: foundations + small labs (Redis, Postgres explain, a queue).
- Weeks 3–4: approach + all “easy/medium” designs twice (once untimed, once timed).
- Weeks 5–6: hard designs + failure drills.
- Week 7: 20 practice prompts at 25–40 min each (rotate).
- Week 8: mocks every other day; light review otherwise.

## Weekly rhythm (any track)

- **Mon–Thu:** learn + one short design (25 min).
- **Fri:** foundations self-check battery.
- **Sat:** full 45–60 min mock.
- **Sun:** light review or rest.

## Tracking progress

Maintain a simple table:

| Prompt | Date | Time | Score /10 | Weak spots |
|--------|------|------|-----------|------------|
| URL shortener | … | 40m | 7 | ID collision story |

Re-attempt any score under 7 after three days.

## Pairing & mocks

- Swap roles with a peer: 40 min design + 10 min feedback using the mock rubric.
- Record yourself (audio) once; filler words and skipped clarify steps become obvious.
- Prefer peers who will interrupt with “what’s the consistency model?” over silent listeners.

## Anti-patterns in studying

- Collecting 50 bookmarks unread.
- Only reading solutions without redrawing.
- Skipping estimation every time “because I’m slow at math.”
- Memorizing one company’s blog as *the* answer.

## Interview tip

The night before an interview, redraw **one** familiar design from blank paper in 20 minutes. Confidence compounds from muscle memory of the template, not from cramming a new domain.

## Self-check

1. Which track matches your timeline, and what is tomorrow’s single task?
2. Name the seven steps of the design template in order.
3. How will you measure that a foundation topic is “done”?


## Daily session template (90 minutes)

1. **10 min** — revisit yesterday’s miss list.
2. **30 min** — one foundation page + self-checks aloud.
3. **40 min** — timed design (or 25 min sprint + 15 min review).
4. **10 min** — score rubric; log tracker row.

## Spaced repetition queue

Keep a simple flash list in a text file: topics you missed. Each day process five cards. When you answer cleanly three sessions in a row, retire the card.

## Using this site without drowning

Do not read all designs front-to-back first. Alternate: foundation → apply in a design → practice prompt. The sidebar is a map, not a linear novel.

## Mock scheduling

Book mocks before you “feel ready.” Feelings lag skill. Early awkward mocks teach pacing faster than solitary perfectionism.

## Adjusting when work is busy

Minimum viable week: two 45-min drills + one foundation topic. Consistency across busy seasons beats binge-and-burnout cycles.

## Definition of done for the plan

You are ready to interview when: median mock ≥7/10 across five varied prompts, clarification is automatic, and you can discuss failures without blanking. Titles and companies vary; that bar travels.

## Checklist before an onsite loop

- [ ] Redrew one core design from memory today
- [ ] Reviewed personal miss list (idempotency, fan-out, etc.)
- [ ] Slept; scheduled buffer between interviews
- [ ] Prepared questions for them about real scale pain (shows curiosity)

You cannot cram foundations the morning of—rely on the template muscle.

---

[← Back to README](../../README.md)
