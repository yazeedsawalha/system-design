> [← Back to README](../../README.md)

# Security in system design interviews

Security is a first-class non-functional requirement for user-facing systems. You need a practical checklist, not a full red-team report.

## Authentication (AuthN)

Prove identity: passwords + MFA, OAuth/OIDC, SSO, API keys for machines. Prefer short-lived tokens (JWT access + refresh) and rotating secrets. Store password hashes with modern KDFs—not plaintext.

## Authorization (AuthZ)

What an identity may do: RBAC, ABAC, ACLs on objects. Enforce **server-side** on every request; never trust client-only checks. For multi-tenant systems, tenant isolation is a hard boundary.

## Transport & data

TLS everywhere in transit. Encrypt sensitive fields at rest (KMS-managed keys). Minimize PII; tokenize payment data via providers (PCI scope reduction).

## Abuse & input

Rate limit auth endpoints. Validate/sanitize inputs. CSRF protections for cookie sessions. Prepare for scraping and spam on public reads/writes.

## Secrets management

No secrets in images or repos. Use a secret manager; rotate; least privilege IAM for services (instance roles).

## Dependency & supply chain

Pin versions; scan images; verify webhooks with signatures.

## Privacy & compliance awareness

Know that GDPR-style deletion, data residency, and audit logs may constrain design (soft-delete vs hard-delete, region pinning). Mention when the domain warrants it—payments, health, kids’ data.

## Logging safely

Do not log tokens, passwords, full card numbers. Redact PII in traces.

## When to deepen

Auth products, fintech, healthcare, marketplaces, anything with UGC abuse. For a pure internal cache design, a lighter mention suffices.

## Tradeoffs

Security controls add latency and complexity; overly chatty auth services become availability risks—cache policy decisions carefully with TTLs and revocation strategy.

## Failure modes

Confused deputy, IDOR (insecure direct object references), overly long-lived tokens, CORS misconfig, S3 buckets public by mistake, SSRF from URL-fetching features.

## Interview tip

Add a box for **Auth service / IdP** and say “all data plane requests carry a verified identity; object access checked server-side.” For uploads: **signed URLs**.

## Self-check

1. Difference between AuthN and AuthZ in one sentence each.
2. How do signed URLs protect direct-to-object uploads?
3. Name two log redaction examples you would enforce.


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
