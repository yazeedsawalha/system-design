// Chapter 07 — story picture
import { Diagram, TONES, T } from "../engine.mjs";

export default {
  "rush-without": () => {
    const d = new Diagram({ w: 1100, h: 380, bare: true });
    d.frame({ x: 20, y: 20, w: 1060, h: 340, title: "No framework — jumping into boxes and running out of time", tone: "bad" });
    const steps = [["min 0", "“Design a chat app”"], ["min 1", "“Kafka + Cassandra + Kubernetes!”"], ["min 30", "still perfecting one detail"], ["min 40", "“Wait — it's for 200 employees?”"], ["min 45", "no data model, no failures, time's up"]];
    steps.forEach(([t, s], i) => {
      const x = 50 + i * 205;
      d.box({ id: "s" + i, x, y: 110, w: 185, h: 120, text: t, sub: s, tone: i < 1 ? "neutral" : "bad", size: 18 });
      if (i < steps.length - 1) d.edge([x + 187, 170], [x + 203, 170], { route: "straight", tone: "bad" });
    });
    d.text(550, 300, "The interviewer saw no clarification, no numbers, no trade-offs — the things they actually score", { size: 15, weight: 700, color: TONES.bad[0], anchor: "middle" });
    return d;
  },
};
