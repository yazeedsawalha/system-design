# System Design Interview Guide

A **free, original** curriculum for preparing system design interviews. Independent study material — **not affiliated with DesignGurus, Educative, or any paid course**.

Use this site to learn foundations, practice a repeatable interview approach, walk through end-to-end designs, and drill with timed prompts.

## What you get

| Section | Purpose |
|--------|---------|
| **Start here** | How interviews work, leveling, prerequisites, study plan, pitfalls |
| **Foundations** | Scalability, networking, LB, caching, DBs, CAP, messaging, security |
| **Approach** | Clarify → estimate → template → failures → tradeoffs |
| **Designs** | 14 full walkthroughs with APIs, data models, Mermaid HLDs |
| **Practice** | Timed drills, 20+ prompts, self-review, mock rubric |

## How to use this site locally

```bash
# Option A: Docsify CLI
npx docsify-cli serve .

# Option B: any static server from repo root
python3 -m http.server 3000
```

Open `http://localhost:3000` and navigate via the sidebar. Search is built in.

## Enable GitHub Pages

1. Push this repository to GitHub.
2. **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch**.
4. Branch: **`main`** (or `master`), folder: **`/` (root)**.
5. Save. After a minute, open `https://<user>.github.io/<repo>/`.

Because Docsify is a client-side SPA, keep `.nojekyll` at the repo root so GitHub Pages does not run Jekyll. Serving from **root** is the intended setup (`index.html` + `_sidebar.md` + `docs/`).

If you prefer the **`/docs` folder** option instead: move `index.html`, `_sidebar.md`, `.nojekyll`, and the `docs/` content tree under a top-level `docs/` publish directory and adjust sidebar links accordingly.

## Suggested study path

1. Read **Start here** (especially pitfalls and level expectations).
2. Work through **Foundations** — do the self-check questions out loud.
3. Internalize the **Approach** template; use it on every design.
4. Study **Designs** in this order: URL shortener → rate limiter → news feed → chat → then pick domain-specific ones.
5. Run **Practice** under a timer; score yourself with the mock rubric.

## License

MIT — see [LICENSE](LICENSE). Contributions of original content welcome; do not paste copyrighted course material.

## Disclaimer

This guide teaches industry-standard concepts (load balancing, sharding, CAP, etc.) in original wording for interview practice. Product names in design titles (e.g. “Instagram-like”) are used only as familiar problem frames.
