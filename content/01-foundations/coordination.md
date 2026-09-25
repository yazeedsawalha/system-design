> [← Back to README](../../README.md)

# Distributed coordination

When multiple nodes must agree on leadership, locks, or configuration, you need coordination primitives. Misusing them creates outages; avoiding them when possible is often wiser.

## Leader election

One primary performs a privileged role (job scheduler, partition owner). Implementations: ZooKeeper/etcd/Consul, DB leases, Kubernetes lease objects, Redis with care.

Leaders must use **fencing tokens** so an old leader cannot act after a new one is elected (split-brain write protection).

## Distributed locks

Serialize access to a shared resource. Prefer short critical sections. Locks need TTLs and safe extension (fencing). Many “Redis locks” are unsafe if misimplemented—mention caution.

Often better alternatives: queue workers (single consumer group), DB unique constraints, conditional updates.

## Leases

Time-bounded ownership. If holder dies, lease expires and another takes over. Clock skew matters—use consensus stores’ time or logical tokens.

## Cluster membership & service discovery

Who is alive? Health checks + registries. Clients need stale-membership tolerance (retry another instance).

## Configuration & feature flags

Central config with watch/notify. Version config; avoid blocking all traffic on config store (cache locally with TTL).

## When to use

Schedulers, shard primaries, singleton consumers, mutually exclusive batch jobs, barrier sync in rare algorithms.

## When *not* to use

Do not lock across high-QPS user requests if you can shard or use optimistic concurrency. Coordination systems are low-throughput relative to data planes.

## Tradeoffs

Correctness vs availability (consensus majority needed); operational dependency on ZooKeeper/etcd; latency of lock round-trips.

## Failure modes

Split brain without fencing; lock expiry too short under GC pause; thundering herd on lock release; coordination outage freezing the world (reduce hard dependencies).

## Interview tip

For “only one worker should process this,” prefer a **queue with single-consumer semantics** or a **DB lease** before inventing a custom Paxos.

## Self-check

1. What is a fencing token and why does it matter?
2. Why are distributed locks dangerous on the request path?
3. Give an alternative to a global lock for unique username creation.


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

---

[← Back to README](../../README.md)
