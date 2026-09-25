# Indexes

Indexes trade write cost and storage for faster reads. Without the right index, your “scalable” service dies on table scans.

## Primary intuition

An index is a data structure (often B-tree or hash) mapping key → row location (or covering fields). Lookups become logarithmic or O(1) instead of scanning millions of rows.

## Types you should name

- **Primary / clustered** — determines physical order in some engines.
- **Secondary** — alternate lookup paths (email → user).
- **Composite** — multi-column; leftmost prefix matters (`(user_id, created_at)` helps `user_id` queries).
- **Covering** — index contains all columns needed; skips heap fetches.
- **Unique** — enforces uniqueness and speeds equality checks.
- **Partial / filtered** — index subset (`WHERE deleted = false`).
- **Full-text** — tokens/inverted lists (often external search).

## Write amplification

Every secondary index updates on insert/update/delete. Wide rows with many indexes slow writes and inflate storage. Index with intent.

## Selectivity

Indexing a boolean `is_active` alone rarely helps. High-cardinality keys (UUID, email) do. Combine low-cardinality columns with higher ones in composites.

## Query planning awareness

In interviews, say: “We’ll add a composite index matching the `WHERE` + `ORDER BY`.” Mention `EXPLAIN` in production culture without pretending to memorize planner quirks.

## Distributed indexes

In sharded DBs, secondary indexes are **local** (per shard) or **global** (expensive). Global secondary indexes need their own partitioning story.

## When to use

Any OLTP read by non-primary attributes; sort/limit patterns; join keys; uniqueness constraints.

## Tradeoffs

Faster reads vs slower writes; storage; index maintenance during migrations; risk of over-indexing.

## Failure modes

Missing index → CPU spike. Too many indexes → write latency. Index on changing columns causes churn. Skewed keys create hot index pages.

## Interview tip

After drawing tables, verbally add indexes for the top three queries. Interviewers listen for that habit.

## Self-check

1. Why does composite index column order matter?
2. Cost of adding five secondary indexes to a write-heavy table?
3. Local vs global secondary index in a sharded store?


## Worked interview moment

Interviewer: “Where does this sit in the stack, and what breaks first at 10× load?”

Answer with: (1) placement on the diagram, (2) the saturation signal you’d page on, (3) the scale-out step, (4) the tradeoff you accept. Example pattern: “This cache sits between API and DB; at 10× we’d see hit-rate drop and DB CPU rise; we’d add replicas and tighten TTLs; tradeoff is more stale reads unless we invalidate on write.”

## Comparison table (quick)

When two technologies seem interchangeable, draw a 3-row table: consistency, latency, ops cost. Fill it for *this* prompt’s NFRs—not generically. Interviewers remember the table tied to requirements.

## Common follow-ups

- “Sync or async replication?”
- “What is the blast radius if this node dies?”
- “How do you test this failure in staging?”

Keep a one-sentence answer ready for each foundations topic you study.
