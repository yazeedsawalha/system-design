# Capacity estimation

Back-of-envelope math shows you can size storage, QPS, and bandwidth. Aim for **order-of-magnitude** correctness, not spreadsheet precision.

## Core conversions

- 1 day ≈ 86,400 s ≈ **10^5** seconds
- 1 KB = 10^3 bytes (use 10^3 in interviews; note 1024 if asked)
- 1 Mbps ≈ 125 KB/s; 1 Gbps ≈ 125 MB/s
- Powers of 2 for IDs: 2^32 ≈ 4e9; 2^64 is plenty for most IDs

## Traffic

```
QPS ≈ daily_requests / 10^5
Peak QPS ≈ average × peak_factor (often 2–5×; ask)
```

Split **read QPS** and **write QPS**. They drive different components.

## Storage

```
storage ≈ entities × bytes_per_entity × replication_factor × growth_horizon
```

Separate **metadata DB** from **blob storage**. Blobs dominate for media products.

## Bandwidth

```
egress ≈ QPS × response_size
```

CDN may absorb most public asset bandwidth—say so.

## Memory for cache

Estimate working set: hot keys × entry size. Cache 10–20% of data is a common hand-wave if unknown; better: estimate daily active entities.

## Connections

WebSocket designs: concurrent connections ≈ DAU × online_fraction. Each connection has memory overhead on gateways—plan gateway fleets.

## Worked micro-example

100M shorten requests/month → ~40 write QPS average. 10× redirects → ~400 read QPS average. Peak 3× → ~1.2K read QPS. Trivial for a well-designed service—say that and move on; estimation still builds trust.

## What interviewers want

- Explicit assumptions
- Written formulas
- Sanity check (“does this fit on one DB?”)
- Implication (“so we need shards / we don’t”)

## Common mistakes

- Mixing monthly and daily
- Forgetting replication multiplier
- Designing Kafka clusters for 50 QPS
- Spending 15 minutes on arithmetic

## Interview tip

Cap estimation at **5 minutes**. If stuck, state assumption and proceed: “Assume 1K peak write QPS unless you want different.”

## Self-check

1. Estimate storage for 5 years of 1M events/day at 200 bytes each with 3× replication.
2. Convert 50M daily active reads to average QPS.
3. When is estimation allowed to conclude “single primary Postgres is enough”?


## Practice drill

Set a 10-minute timer. Apply only the ideas from this page to the prompt **“Design a ride-sharing matcher for one city.”** Then compare against the Uber-like design in this guide—gap-analyze without copying its structure blindly. Repeat weekly with a different prompt from the practice list.

## Phrases that score well

- “Given the NFR of X, I’ll prefer Y and accept Z.”
- “Two options: A vs B; I pick A because…”
- “User impact if this fails: …; mitigation: …”
- “Evolution path: MVP → … → …”

Say them deliberately in mocks until natural.
