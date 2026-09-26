// Chapter 09 — practice diagrams
import { Diagram, table, TONES, T } from "../engine.mjs";

export default {
  "practice-loop": () => {
    const d = new Diagram({ w: 1300, h: 420, bare: true });
    d.frame({ x: 20, y: 20, w: 400, h: 380, title: "Reading only", tone: "bad" });
    d.box({ x: 50, y: 90, w: 340, h: 70, text: "Read a case study", sub: "“makes sense!”", tone: "neutral", size: 15 });
    d.box({ x: 50, y: 190, w: 340, h: 70, text: "Read another", sub: "recognition, not recall", tone: "neutral", size: 15 });
    d.box({ x: 50, y: 290, w: 340, h: 80, text: "Freeze in the interview", sub: "blank whiteboard", tone: "bad", solid: true, size: 15 });
    d.frame({ x: 450, y: 20, w: 830, h: 380, title: "The practice loop", tone: "good" });
    const st = [["1 · Attempt", "timed, out loud", "info"], ["2 · Compare", "case study / partner", "edge"], ["3 · Score", "rubric /10", "warn"], ["4 · Fix", "1–2 biggest gaps", "good"]];
    const pos = [[500, 100], [900, 100], [900, 280], [500, 280]];
    st.forEach(([t, s2, tone], i) => d.box({ id: "p" + i, x: pos[i][0], y: pos[i][1], w: 320, h: 80, text: t, sub: s2, tone, size: 16 }));
    d.edge("p0", "p1", { sides: "rl", tone: "good" }); d.edge("p1", "p2", { sides: "bt", tone: "good" });
    d.edge("p2", "p3", { sides: "lr", tone: "good" }); d.edge("p3", "p0", { sides: "tb", tone: "good", label: "repeat in a few days" });
    return d;
  },
  "rubric": () => {
    const d = new Diagram({ w: 1300, h: 340, bare: true });
    const a = [["Clarification", "info"], ["Estimation", "cache"], ["API & data", "edge"], ["High-level design", "compute"], ["Depth & trade-offs", "search"]];
    a.forEach(([t, tone], i) => {
      const x = 30 + i * 250;
      d.box({ x, y: 40, w: 230, h: 90, text: t, sub: "0 · 1 · 2 points", tone, solid: true, size: 16 });
    });
    d.box({ x: 30, y: 180, w: 1230, h: 110, text: "Total /10 — aim for 7+ across 5 different prompts", sub: "0–3 foundations · 4–6 approaching mid · 7–8 solid mid · 9–10 senior-ready on that prompt", tone: "good", size: 19 });
    return d;
  },
};
