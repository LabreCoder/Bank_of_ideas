const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const fx = require("./fixtures");

const BASE = process.env.BASE || "http://172.19.0.4:5173";
const OUT = path.join(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });

function apiResponse(url, method, body) {
  const p = new URL(url).pathname.replace(/^\/api/, "");
  if (method === "GET") {
    if (p === "/category/") return fx.categories;
    if (p === "/owner/") return fx.owners;
    if (p === "/ideas/") return fx.ideas;
    if (p === "/planning/") return fx.plannings;
    if (p === "/cycle/") return fx.cycles;
    let m;
    if ((m = p.match(/^\/ideas\/(\d+)$/))) return fx.ideas.find((x) => x.id == m[1]);
    if ((m = p.match(/^\/planning\/(\d+)$/))) return fx.plannings.find((x) => x.id == m[1]);
    if ((m = p.match(/^\/cycle\/(\d+)$/))) return fx.cycles.find((x) => x.id == m[1]);
    return [];
  }
  try { return JSON.parse(body || "{}"); } catch { return {}; }
}

const PAGES = [
  { name: "dashboard", url: "/dashboard", after: async (pg) => { await pg.getByRole("button", { name: /Full calendar/ }).click(); } },
  { name: "dashboard-week", url: "/dashboard", calView: "week", after: async (pg) => { await pg.getByRole("button", { name: /Full calendar/ }).click(); } },
  { name: "dashboard-day", url: "/dashboard", calView: "day", after: async (pg) => { await pg.getByRole("button", { name: /Full calendar/ }).click(); } },
  { name: "ideas", url: "/ideas" },
  { name: "ideas-new", url: "/ideas/new" },
  { name: "ideas-2", url: "/ideas/2" },
  { name: "planning", url: "/planning" },
  { name: "planning-new", url: "/planning/new" },
  { name: "planning-2", url: "/planning/2" },
  { name: "cycle", url: "/cycle" },
  { name: "cycle-detail", url: "/cycle", after: async (pg) => { await pg.locator('[role="button"]').filter({ hasText: "Q4 Sprint" }).first().click(); } },
  { name: "settings-categories", url: "/settings" },
  { name: "settings-owners", url: "/settings", after: async (pg) => pg.getByRole("tab", { name: "Owners" }).click() },
  { name: "settings-theme", url: "/settings", after: async (pg) => pg.getByRole("tab", { name: "Theme" }).click() },
  { name: "settings-sound", url: "/settings", after: async (pg) => pg.getByRole("tab", { name: "Sound" }).click() },
];

const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440, 1920];
const CONFIGS = [
  ...WIDTHS.map((w) => ({ w, mode: "dark", size: "default" })),
  { w: 375, mode: "light", size: "default" },
  { w: 1280, mode: "light", size: "default" },
  { w: 375, mode: "dark", size: "xlarge" },
  { w: 320, mode: "light", size: "xlarge" },
];

// Runs in page
function measure() {
  const vw = window.innerWidth;
  const de = document.documentElement;
  const desc = (el) => {
    const cls = typeof el.className === "string" ? el.className : (el.getAttribute("class") || "");
    const txt = (el.innerText || el.getAttribute("aria-label") || el.value || "").replace(/\s+/g, " ").trim().slice(0, 60);
    const r = el.getBoundingClientRect();
    return { tag: el.tagName.toLowerCase(), cls: cls.slice(0, 200), txt, w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right) };
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const clipsX = (el) => ["hidden", "auto", "scroll", "clip"].includes(getComputedStyle(el).overflowX);
  const all = [...document.body.querySelectorAll("*")];
  const overflow = de.scrollWidth > vw;
  const offenders = [];
  for (const el of all) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right <= vw + 1) continue;
    // skip if any ancestor clips X
    let a = el.parentElement, clipped = false;
    while (a && a !== document.body) { if (clipsX(a)) { clipped = true; break; } a = a.parentElement; }
    if (clipped) continue;
    const pr = el.parentElement.getBoundingClientRect();
    if (el.parentElement === document.body || pr.right <= vw + 1) offenders.push(desc(el));
  }
  // internal horizontal scrollers
  const scrollers = [];
  for (const el of all) {
    if (!visible(el)) continue;
    const ox = getComputedStyle(el).overflowX;
    if ((ox === "auto" || ox === "scroll") && el.scrollWidth > el.clientWidth + 1) {
      const d = desc(el); d.scrollW = el.scrollWidth; d.clientW = el.clientWidth; d.txt = d.txt.slice(0, 30); scrollers.push(d);
    }
  }
  // small targets
  const small = [];
  let interactiveCount = 0;
  for (const el of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=tab], [role=button]')) {
    if (!visible(el)) continue;
    interactiveCount++;
    const r = el.getBoundingClientRect();
    let w = r.width, h = r.height;
    // checkbox/radio inside label: use label size
    if ((el.type === "checkbox" || el.type === "radio") && el.closest("label")) {
      const lr = el.closest("label").getBoundingClientRect(); w = Math.max(w, lr.width); h = Math.max(h, lr.height);
    }
    if (w < 24 || h < 24) small.push(desc(el));
  }
  // clipped text: overflow hidden/ellipsis where content is cut
  const clipped = [];
  for (const el of all) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.overflowX !== "hidden" && cs.overflowX !== "clip" && cs.textOverflow !== "ellipsis") continue;
    if (!el.innerText || !el.innerText.trim()) continue;
    if (el.scrollWidth > el.clientWidth + 1 || (cs.webkitLineClamp && cs.webkitLineClamp !== "none" && el.scrollHeight > el.clientHeight + 1)) {
      const d = desc(el); d.full = el.innerText.replace(/\s+/g, " ").trim().slice(0, 100); d.lineClamp = cs.webkitLineClamp; clipped.push(d);
    }
  }
  return { vw, scrollWidth: de.scrollWidth, overflow, offenders: offenders.slice(0, 15), scrollers: scrollers.slice(0, 10), smallCount: small.length, interactiveCount, small, clipped: clipped.slice(0, 25) };
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
  for (const cfg of CONFIGS) {
    const tag = `${cfg.w}-${cfg.mode}${cfg.size !== "default" ? "-" + cfg.size : ""}`;
    for (const pg of PAGES) {
      if (only && !only.includes(pg.name)) continue;
      const ctx = await browser.newContext({ viewport: { width: cfg.w, height: 900 } });
      await ctx.addInitScript(({ mode, size, calView }) => {
        try {
          localStorage.setItem("content-planner-mode", mode);
          localStorage.setItem("content-planner-text-size", size);
          localStorage.setItem("content-planner-dashboard-calendar-view", calView || "month");
        } catch {}
      }, { mode: cfg.mode, size: cfg.size, calView: pg.calView });
      const page = await ctx.newPage();
      await page.clock.setFixedTime(new Date("2026-11-22T10:00:00"));
      await page.route("**/api/**", async (route) => {
        const req = route.request();
        const body = apiResponse(req.url(), req.method(), req.postData());
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body ?? {}) });
      });
      // block audio
      await page.route("**/audio/**", (r) => r.abort());
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      try {
        await page.goto(BASE + pg.url, { waitUntil: "networkidle" });
        await page.waitForTimeout(400);
        if (pg.after) { await pg.after(page); await page.waitForTimeout(400); }
        const m = await page.evaluate(measure);
        const file = path.join(OUT, `${pg.name}__${tag}.png`);
        await page.screenshot({ path: file, fullPage: true });
        results.push({ page: pg.name, cfg: tag, ...m, errors, shot: file });
        console.log(tag, pg.name, "overflow:", m.overflow, m.scrollWidth, "small:", m.smallCount, "clipped:", m.clipped.length, errors.length ? "ERR " + errors[0] : "");
      } catch (e) {
        console.log("FAIL", tag, pg.name, e.message.split("\n")[0]);
        results.push({ page: pg.name, cfg: tag, fail: e.message });
      }
      // extras at 375 dark default
      if (cfg.w === 375 && cfg.mode === "dark" && cfg.size === "default") {
        try {
          if (pg.name === "dashboard") {
            await page.getByRole("button", { name: "Toggle navigation menu" }).click();
            await page.waitForTimeout(300);
            await page.screenshot({ path: path.join(OUT, `extra__mobile-menu__375.png`) });
            await page.getByRole("button", { name: "Toggle navigation menu" }).click();
            // open a day modal from Next days card
            const dayBtn = page.locator("button").filter({ hasText: /plann|idea|due/i }).first();
            await page.evaluate(() => window.scrollTo(0, 0));
            const btns = page.locator('section button, div button');
            // find a calendar day with plannings: month cell with 22
            const cell = page.locator("button").filter({ hasText: /^22/ }).first();
            await cell.scrollIntoViewIfNeeded();
            await cell.click();
            await page.waitForTimeout(400);
            const mm = await page.evaluate(measure);
            await page.screenshot({ path: path.join(OUT, `extra__day-modal__375.png`) });
            results.push({ page: "dashboard-day-modal", cfg: tag, ...mm, shot: path.join(OUT, `extra__day-modal__375.png`) });
          }
          if (pg.name === "cycle") {
            await page.getByRole("button", { name: /New Cycle/ }).click();
            await page.waitForTimeout(400);
            const mm = await page.evaluate(measure);
            await page.screenshot({ path: path.join(OUT, `extra__new-cycle-modal__375.png`) });
            results.push({ page: "cycle-new-modal", cfg: tag, ...mm, shot: path.join(OUT, `extra__new-cycle-modal__375.png`) });
          }
        } catch (e) { console.log("EXTRA FAIL", pg.name, e.message.split("\n")[0]); }
      }
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(__dirname, "results.json"), JSON.stringify(results, null, 1));
  await browser.close();
})();
