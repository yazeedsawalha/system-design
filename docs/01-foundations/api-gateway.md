# API gateway

An API gateway is the front door for external clients: routing, auth, rate limits, request shaping, and often protocol translation. It is not a place to hide all business logic.

## Common responsibilities

- TLS termination and HTTP routing
- Authentication (JWT validation, API keys) and coarse authorization
- Rate limiting and quotas per key/tenant
- Request/response transformation and aggregation (BFF-style, carefully)
- Canary / blue-green traffic splitting
- Observability: edge metrics, access logs, WAF integration

## Gateway vs service mesh vs BFF

- **Gateway** — north-south (client → cluster).
- **Mesh** — east-west (service → service) with mTLS and retries.
- **BFF** — per-client-experience aggregation (mobile BFF vs web BFF).

Do not implement core domain workflows only in the gateway; keep it a perimeter and policy layer.

## When to use

Public or partner APIs, multiple backend services, need for centralized cross-cutting policy. Skip for a single small service if a load balancer + middleware suffices.

## Tradeoffs

Centralization eases policy but can become a bottleneck and a deploy chokepoint. Over-aggregation creates a monolith in disguise. Extra hop adds latency.

## Failure modes

Gateway outage blocks everything—multi-AZ and capacity headroom matter. Auth outages cascade; cache JWKS and fail with clear 401/503 policy. Giant payloads / slow backends exhaust gateway workers.

## Design sketch

Clients → Gateway (auth, RL) → Service A/B/C. Internal calls bypass the public gateway.

## Interview tip

When drawing microservices, put **one** gateway at the edge and keep internal arrows direct. Mention rate limits and auth as gateway duties unless you dedicate services.

## Self-check

1. Name three concerns that belong at the gateway and one that does not.
2. How does a mobile BFF differ from a generic API gateway?
3. What happens to availability if the gateway depends synchronously on a flaky auth service?


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
