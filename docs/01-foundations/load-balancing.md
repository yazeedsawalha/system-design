# Load balancing

Load balancers (LBs) distribute traffic across healthy backends so no single instance is overwhelmed and failures are hidden from clients.

## Layers

- **L4 (transport)** — TCP/UDP 5-tuple; fast, little app awareness.
- **L7 (application)** — HTTP routes, headers, paths, canary weights; more CPU, richer control.

CDN and DNS-based balancing sit even further out (geo / Anycast).

## Algorithms

| Algorithm | Idea | Watch-outs |
|-----------|------|------------|
| Round robin | Rotate | Uneven if backends differ |
| Least connections | Prefer quieter | Needs accurate counts |
| Weighted | Capacity-aware | Manual weights drift |
| Consistent hash | Stick by key | Rebalance on ring change |
| Random | Simple | Surprisingly robust |

Sticky sessions (cookie or IP affinity) keep a client on one backend—useful for local state, hostile to elasticity. Prefer externalizing session state.

## Health checks

Active probes + remove bad nodes. Tune intervals to avoid flapping. Fail closed vs open depends on whether empty pools should 503 or send traffic anyway (usually 503).

## Where LBs sit

```
Client → DNS → CDN → L7 LB / Gateway → services → internal L4 → data stores
```

Internal east-west traffic may use client-side LB (service discovery) instead of a central proxy.

## When to use

Always in front of stateless app tiers. Also for redistributing across read replicas or regions (with care).

## Tradeoffs

L7 flexibility vs latency/CPU; sticky sessions vs autoscale; hardware/NLB vs software proxies (Envoy, NGINX).

## Failure modes

LB as SPOF—run in pairs / multi-AZ. Misconfigured health checks draining all nodes. Connection pile-up on slow backends. Uneven hashing hot keys.

## Interview tip

Say “stateless app servers behind an L7 LB” early; it unlocks horizontal scale without debate.

## Self-check

1. Why does sticky session conflict with rolling deploys?
2. L4 vs L7 for path-based routing—which and why?
3. How can consistent hashing still create hotspots?


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
