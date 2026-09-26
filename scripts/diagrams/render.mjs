#!/usr/bin/env node
/**
 * Render every diagram spec to diagrams/img/<name>.png (2x).
 * Usage: node scripts/diagrams/render.mjs [name ...]
 * Needs Google Chrome installed (uses puppeteer-core) — set CHROME_PATH to override.
 */
import { writeFileSync, mkdirSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const IMG = join(ROOT, "diagrams", "img");
mkdirSync(IMG, { recursive: true });

const FONT = (pkg, file) => pathToFileURL(join(ROOT, "node_modules", "@fontsource", pkg, "files", file)).href;
const fontCss = [400, 500, 600, 700, 800]
  .map((w) => `@font-face{font-family:Inter;font-weight:${w};src:url(${FONT("inter", `inter-latin-${w}-normal.woff2`)})}`)
  .join("") + `@font-face{font-family:"JetBrains Mono";font-weight:400 700;src:url(${FONT("jetbrains-mono", "jetbrains-mono-latin-400-normal.woff2")})}`;

const specDir = join(__dirname, "specs");
const all = [];
for (const f of readdirSync(specDir).filter((f) => f.endsWith(".mjs")).sort()) {
  const mod = await import(pathToFileURL(join(specDir, f)).href);
  for (const [name, build] of Object.entries(mod.default)) all.push({ name, build });
}
const want = process.argv.slice(2);
const todo = want.length ? all.filter((d) => want.includes(d.name)) : all;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--allow-file-access-from-files", "--font-render-hinting=none"],
});
const page = await browser.newPage();
let ok = 0;
for (const { name, build } of todo) {
  try {
    const svg = build().svg();
    const html = `<!doctype html><html><head><style>${fontCss}html,body{margin:0;padding:0;background:#fff}svg{display:block}</style></head><body>${svg}</body></html>`;
    const tmp = join(tmpdir(), `sd-diagram-${process.pid}.html`);
    writeFileSync(tmp, html);
    const w = +svg.match(/width="(\d+)"/)[1], h = +svg.match(/height="(\d+)"/)[1];
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    // re-fit pill backgrounds to the real rendered text width
    await page.evaluate(() => {
      for (const g of document.querySelectorAll("g.pill")) {
        const rect = g.querySelector("rect");
        const bb = g.getBBox();
        const kids = [...g.children].filter((c) => c !== rect);
        let minX = Infinity, maxX = -Infinity;
        for (const k of kids) { const b = k.getBBox(); minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x + b.width); }
        if (!isFinite(minX)) continue;
        const cx = +rect.getAttribute("x") + +rect.getAttribute("width") / 2;
        const pad = 10, need = maxX - minX + pad * 2;
        const shift = cx - (minX + maxX) / 2;
        for (const k of kids) {
          if (k.tagName === "circle") k.setAttribute("cx", +k.getAttribute("cx") + shift);
          else k.setAttribute("x", +k.getAttribute("x") + shift);
        }
        rect.setAttribute("x", cx - need / 2);
        rect.setAttribute("width", need);
      }
    });
    // shrink section boxes to their content, then crop the picture to what is drawn
    const box = await page.evaluate(() => {
      const svg = document.querySelector("svg");
      const content = svg.querySelector("#content");
      const leaves = [...content.querySelectorAll("text, rect, circle, ellipse, path, line")];
      const frames = [...content.querySelectorAll("rect.frame")];
      const need = new Map();
      for (const f of frames) {
        const fx = +f.getAttribute("x"), fy = +f.getAttribute("y"), fw = +f.getAttribute("width"), fh = +f.getAttribute("height");
        let bottom = fy + 40;
        for (const el of leaves) {
          if (el === f || el.classList.contains("frame")) continue;
          const b = el.getBBox();
          if (b.width === 0 && b.height === 0) continue;
          if (b.x >= fx - 1 && b.x + b.width <= fx + fw + 1 && b.y >= fy - 1 && b.y + b.height <= fy + fh + 1) bottom = Math.max(bottom, b.y + b.height);
        }
        need.set(f, Math.min(fh, bottom - fy + 26));
      }
      // boxes that share a top edge and height stay equal
      const groups = {};
      for (const f of frames) (groups[f.getAttribute("y") + ":" + f.getAttribute("height")] ||= []).push(f);
      for (const g of Object.values(groups)) {
        const h = Math.max(...g.map((f) => need.get(f)));
        g.forEach((f) => f.setAttribute("height", h));
      }
      const b = content.getBBox();
      const pad = 28;
      const x = Math.floor(b.x - pad), y = Math.floor(b.y - pad), w = Math.ceil(b.width + pad * 2), h = Math.ceil(b.height + pad * 2);
      svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      return { w, h };
    });
    await page.setViewport({ width: box.w, height: box.h, deviceScaleFactor: 2 });
    await page.screenshot({ path: join(IMG, `${name}.png`), clip: { x: 0, y: 0, width: box.w, height: box.h } });
    ok++;
    process.stdout.write(`✓ ${name}\n`);
  } catch (e) {
    process.stdout.write(`✗ ${name}: ${e.message}\n`);
  }
}
await browser.close();
console.log(`${ok}/${todo.length} rendered → diagrams/img`);
