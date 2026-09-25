# Mock interview rubric

Score each category **0–2**. Total **/10**. Target ≥7 before real loops; ≥8 consistently for senior aims.

## Categories

### 1. Clarification & scope (0–2)

- **0:** Jumps into tech; wrong problem risk
- **1:** Some questions; fuzzy NFRs
- **2:** Crisp functional/NFR/out-of-scope; restates problem

### 2. Capacity sense (0–2)

- **0:** None or nonsensical
- **1:** Partial; no implications
- **2:** Order-of-magnitude with design implications (“so single DB OK” / “need shard”)

### 3. API & data model (0–2)

- **0:** Missing
- **1:** Vague entities
- **2:** Concrete endpoints + keys/indexes/shard key aligned to queries

### 4. High-level design (0–2)

- **0:** Incoherent boxes
- **1:** Plausible but missing path
- **2:** Clear write/read paths; appropriate building blocks; readable diagram

### 5. Depth & tradeoffs (0–2)

- **0:** Buzzwords only
- **1:** One shallow dive
- **2:** Real alternative comparison; justified pick; failure/scale included

## Intermediate half-points

Use 0.5 steps if needed; avoid all 2s without evidence.

## Mapping to levels (rough)

| Total | Signal |
|-------|--------|
| 0–3 | Needs foundations |
| 4–6 | Junior approaching mid |
| 7–8 | Solid mid |
| 9–10 | Senior-ready *on that prompt* |

One prompt is not a level—look at median across 5 diverse prompts.

## Feedback script for partners

1. Start with one strength.
2. Name top two rubric gaps with examples from the board.
3. Ask candidate to re-explain the weak part in 3 minutes.
4. Do not redesign for them—coach with questions.

## Score sheet template

```
Prompt:
Date:
Clarification: /2
Capacity: /2
API/Data: /2
HLD: /2
Depth: /2
Total: /10
Notes:
Next drill:
```

## Interview tip

When practicing alone, narrate the rubric category you are satisfying (“this is my tradeoff sentence”)—it trains explicit signals interviewers listen for.
