> [← Back to README](../../README.md)

# Practice prompts

Twenty-four prompts with hint checklists. Attempt **before** expanding hints. Use the [design template](../02-approach/design-template.md).

---

### 1. URL shortener for an enterprise with SSO
**Hints:** custom domains, authz on create, audit logs, no public enumeration, 301 vs 302.

### 2. Pastebin / snippet store
**Hints:** TTL expiry job, size limits, raw vs rendered, abuse scanning, CDN for public pastes.

### 3. Global rate limiter as a platform service
**Hints:** multi-tenant quotas, Redis cluster, fail-open policy, local approximation, 429 semantics.

### 4. Email + push notification center
**Hints:** preferences, quiet hours, template service, per-channel queues, OTP vs marketing split.

### 5. News feed with ads injection
**Hints:** hybrid fan-out, ranking candidates, ad service latency budget, privacy, degradation without ads.

### 6. Group chat for 10–10,000 members
**Hints:** connection gateways, fan-out strategy change by size, history shard by conv_id, reconnect backfill.

### 7. Collaborative document cursors (not full OT/CRDT)
**Hints:** WebSocket presence, pub/sub rooms, ephemeral state, scale by doc_id, privacy of cursor data.

### 8. Photo sharing MVP
**Hints:** signed uploads, async variants, feed vs profile grid, CDN, EXIF stripping.

### 9. Short-video product (TikTok-like For You)
**Hints:** upload/transcode, CDN, recommendation candidate generation (high level), scroll QPS, hot videos.

### 10. Ride matching in one city
**Hints:** location firehose, geo index, offer/accept locking, ETA vs distance, surge as NFR only.

### 11. Food delivery tracking
**Hints:** courier locations, order state machine, push updates, map provider dependency, restaurant prep time.

### 12. Dropbox-like selective sync
**Hints:** block dedupe, metadata revisions, conflict copies, change cursor, namespace sharding.

### 13. YouTube-like VOD
**Hints:** ABR manifests, transcode fleet, CDN egress cost, copyright ID async, progressive ready state.

### 14. Live streaming fan-out
**Hints:** ingest server, segmenter, edge relay, latency vs quality, chat sidecar, spike joins.

### 15. Web crawler for product prices
**Hints:** politeness, robots, frontier priority, anti-bot, change detection, legal constraints mention.

### 16. Autocomplete for marketplace products
**Hints:** prefix trie, inventory filters, personalization re-rank, edge cache, index freshness.

### 17. Site search for docs / help center
**Hints:** inverted index, CDC from CMS, BM25, synonyms, permission-filtered results.

### 18. Hotel booking
**Hints:** room inventory holds, date-range contention, payment webhook, overbooking policy, search vs book path.

### 19. Concert ticket on-sale
**Hints:** waiting room queue, seat locks, section sharding, bot mitigation, idempotent checkout.

### 20. Merchant payments + payouts
**Hints:** idempotency keys, ledger, PSP webhooks, payout batching, chargeback state machine.

### 21. URL fetching preview (link unfurl)
**Hints:** SSRF defenses, timeout budgets, cache previews, size limits, private network blocks.

### 22. Feature flag service
**Hints:** low-latency reads, sticky bucketing, CDN/edge eval, audit changes, fail behavior.

### 23. Metrics ingestion & dashboard
**Hints:** write-heavy TSDB, downsampling, cardinality explosion, query path vs ingest path.

### 24. Multi-tenant job scheduling SaaS
**Hints:** per-tenant fairness, exactly-once effects via ledger/outbox, worker fleets, poison jobs, cron semantics.

---

## How to use hints

1. Attempt 30–45 min with zero hints.
2. Reveal hints; gap-analyze.
3. Redraw once incorporating missed items.
4. Log score in your tracker.

## Stretch modifiers (apply to any prompt)

- “Single region only” vs “active-active two regions”
- “Strongly consistent reads”
- “Budget cut 50%—what do you drop?”
- “Compliance: data must stay in EU”

---

[← Back to README](../../README.md)
