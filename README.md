# System Design Interview Guide

A **free, original** curriculum for system design interview prep — foundations, a repeatable approach, 14 full design walkthroughs, and timed practice. Read it right here on GitHub as Markdown (Mermaid diagrams render natively).

> **Not affiliated** with DesignGurus, Educative, ByteByteGo, or any paid course. Industry-standard concepts in original wording for interview practice. Product names in design titles (e.g. “Instagram-like”) are familiar problem frames only.

## How to use this repo

1. Start with **[Start here](#0-start-here)** — especially pitfalls and level expectations.
2. Work through **[Foundations](#1-foundations)**; answer self-checks out loud.
3. Internalize the **[Approach](#2-interview-approach)** template; use it on every design.
4. Study **[Designs](#3-full-designs)** in order: URL shortener → rate limiter → news feed → chat → then domain-specific ones.
5. Run **[Practice](#4-practice)** under a timer; score yourself with the mock rubric.

Clone or browse online — no website, Docsify, or local server required.

### Study paths by level

| Path | Focus | Suggested order |
|------|--------|-----------------|
| **Junior** | Building blocks + simple HLD | Start here → Foundations (LB, cache, DB, queue, CDN) → Approach → URL shortener, rate limiter, typeahead → timed drills |
| **Mid** | Full loop + consistency & failures | All Foundations → Approach → core designs (feed, chat, notifications, Instagram) → Practice with rubric |
| **Senior** | SLOs, multi-region, ops, cost | Foundations deep dives (CAP, coordination, delivery) → Approach failures → hard designs (Uber, video, Dropbox, payments) → mocks every other day |

See [Study plan](content/00-start/study-plan.md) for 2 / 4 / 8 week schedules and [Level expectations](content/00-start/level-expectations.md) for self-calibration.

---

## Table of Contents

### 0. Start here

- [How interviews work](content/00-start/how-interviews-work.md)
- [Level expectations](content/00-start/level-expectations.md)
- [Prerequisites](content/00-start/prerequisites.md)
- [Study plan](content/00-start/study-plan.md)
- [Common pitfalls](content/00-start/common-pitfalls.md)

### 1. Foundations

- [System characteristics](content/01-foundations/characteristics.md)
- [Networking basics](content/01-foundations/networking.md)
- [Load balancing](content/01-foundations/load-balancing.md)
- [API gateway](content/01-foundations/api-gateway.md)
- [Rate limiting](content/01-foundations/rate-limiting.md)
- [Caching & CDN](content/01-foundations/caching-cdn.md)
- [Databases](content/01-foundations/databases.md)
- [Indexes](content/01-foundations/indexes.md)
- [Sharding](content/01-foundations/sharding.md)
- [Replication](content/01-foundations/replication.md)
- [CAP & PACELC](content/01-foundations/cap-pacelc.md)
- [Messaging](content/01-foundations/messaging.md)
- [Delivery guarantees](content/01-foundations/delivery-guarantees.md)
- [Coordination](content/01-foundations/coordination.md)
- [Security](content/01-foundations/security.md)

### 2. Interview approach

- [Clarify requirements](content/02-approach/clarify-requirements.md)
- [Capacity estimation](content/02-approach/capacity-estimation.md)
- [Design template](content/02-approach/design-template.md)
- [Deep dive & failures](content/02-approach/deep-dive-failures.md)
- [Tradeoffs cheatsheet](content/02-approach/tradeoffs-cheatsheet.md)

### 3. Full designs

- [URL shortener](content/03-designs/url-shortener.md)
- [Rate limiter](content/03-designs/rate-limiter.md)
- [Notification system](content/03-designs/notification-system.md)
- [News feed](content/03-designs/news-feed.md)
- [Chat & messaging](content/03-designs/chat-messaging.md)
- [Instagram-like](content/03-designs/instagram.md)
- [Uber-like](content/03-designs/uber.md)
- [Video streaming](content/03-designs/video-streaming.md)
- [Dropbox-like](content/03-designs/dropbox.md)
- [Web crawler](content/03-designs/web-crawler.md)
- [Typeahead](content/03-designs/typeahead.md)
- [Search](content/03-designs/search.md)
- [Ticket booking](content/03-designs/ticket-booking.md)
- [Payments](content/03-designs/payments.md)

### 4. Practice

- [Timed drill](content/04-practice/timed-drill.md)
- [Practice prompts](content/04-practice/practice-prompts.md)
- [Self-review](content/04-practice/self-review.md)
- [Mock rubric](content/04-practice/mock-rubric.md)

---

## What you get

| Section | Purpose |
|--------|---------|
| **Start here** | How interviews work, leveling, prerequisites, study plan, pitfalls |
| **Foundations** | Scalability, networking, LB, caching, DBs, CAP, messaging, security |
| **Approach** | Clarify → estimate → template → failures → tradeoffs |
| **Designs** | 14 full walkthroughs with APIs, data models, Mermaid HLDs |
| **Practice** | Timed drills, 20+ prompts, self-review, mock rubric |

## License

MIT — see [LICENSE](LICENSE). Contributions of original content welcome; do not paste copyrighted course material.

## Disclaimer

This guide teaches industry-standard concepts (load balancing, sharding, CAP, etc.) in original wording for interview practice. It is independent study material and is not affiliated with any commercial interview course.
