# Databases

Choosing storage is choosing your query patterns, consistency, and operational burden. Start from access patterns, not from brand names.

## Relational (SQL)

Strong schema, rich queries, joins, ACID transactions. Excellent for relational domains (billing, bookings) and when many ad-hoc queries matter.

**Scale path:** vertical → read replicas → sharding (harder) → NewSQL / distributed SQL.

## Document stores

JSON-like documents; flexible fields; good when an aggregate is read/written together (user profile + preferences). Beware unbounded document growth and poor cross-document transactions.

## Key-value

Simple Get/Put by key; extreme speed and scale (Redis, Dynamo-style). Push secondary query needs elsewhere (indexes, search).

## Wide-column

Row key + column families; time-series and huge sparse tables (Cassandra/HBase patterns). Design queries around partition keys first.

## Graph

Nodes/edges when multi-hop relationships dominate (social graph, fraud rings). Not a default OLTP store for everything.

## Search engines

Inverted indexes for full-text and facets (Elasticsearch/OpenSearch). Eventually consistent with source of truth; not your primary ledger.

## Blob / object storage

Images, videos, backups. Store metadata in a DB; bytes in object store. Direct client upload via signed URLs.

## OLTP vs OLAP

OLTP: point lookups, small writes. OLAP: scans, aggregates—use warehouses/columnar stores; ETL/stream into them. Do not run heavy analytics on the primary OLTP DB.

## Modeling tips for interviews

1. List top queries.
2. Choose primary key for those queries.
3. Denormalize deliberately for read paths; document duplication.
4. Separate hot metadata from cold blobs.

## When to use what (rules of thumb)

| Need | Lean toward |
|------|-------------|
| Transactions, joins | SQL |
| Simple session/cache | KV |
| Flexible product catalog | Document |
| Time-series metrics | Wide-column / TSDB |
| Text search | Search engine |
| Large media | Object store |

## Tradeoffs

Schema rigidity vs flexibility; join-time CPU vs denormalized write complexity; managed service cost vs ops ownership.

## Failure modes

Hot partitions, unbounded tables without TTLs, ORM N+1 queries, running reporting on primary, migrations locking large tables.

## Interview tip

Say “Postgres for source of truth; Redis for cache; S3 for media; OpenSearch for text.” That combo covers most product interviews without novelty for novelty’s sake.

## Self-check

1. Why is a search index usually not the system of record?
2. Give a query that screams for relational joins.
3. What breaks if a document store doc grows without bound?


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
