// Extra interactive states: mobile menu, day modal, new cycle modal, cycle filter popover.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const fx = require("./fixtures");
const BASE = process.env.BASE || "http://172.19.0.4:5173";
const OUT = path.join(__dirname, "shots");

function api(url, method, body) {
  const p = new URL(url).pathname.replace(/^\/api/, "");
  if (method !== "GET") { try { return JSON.parse(body || "{}"); } catch { return {}; } }
  const map = { "/category/": fx.categories, "/owner/": fx.owners, "/ideas/": fx.ideas, "/planning/": fx.plannings, "/cycle/": fx.cycles };
  return map[p] ?? [];
}

async function open(browser, w, url) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date("2026-11-22T10:00:00"));
  await page.route("**/api/**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(api(r.request().url(), r.request().method(), r.request().postData())) }));
  await page.route("**/audio/**", (r) => r.abort());
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  return { ctx, page };
}

const metrics = () => {
  const vw = innerWidth;
  const small = [];
  for (const el of document.querySelectorAll("button, a[href], input:not([type=hidden]), select, textarea, [role=tab]")) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.width < 24 || r.height < 24) small.push(`${el.tagName} ${Math.round(r.width)}x${Math.round(r.height)} ${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 30)}`);
  }
  const dlg = document.querySelector('[role="dialog"]');
  const dr = dlg && dlg.getBoundingClientRect();
  return { sw: document.documentElement.scrollWidth, vw, dialog: dr ? { l: Math.round(dr.left), r: Math.round(dr.right), t: Math.round(dr.top), b: Math.round(dr.bottom), h: Math.round(dr.height), sh: dlg.scrollHeight, ch: dlg.clientHeight } : null, small };
};

(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const w of [320, 375, 768]) {
    let { ctx, page } = await open(b, w, "/dashboard");
    if (w < 768) {
      await page.getByRole("button", { name: "Toggle navigation menu" }).click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(OUT, `extra__mobile-menu__${w}.png`) });
      out[`menu-${w}`] = await page.evaluate(metrics);
      await page.getByRole("button", { name: "Toggle navigation menu" }).click();
    }
    await page.locator('button[aria-label*="planning(s) due"]:not([disabled])').first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `extra__day-modal__${w}.png`) });
    out[`daymodal-${w}`] = await page.evaluate(metrics);
    await ctx.close();

    ({ ctx, page } = await open(b, w, "/cycle"));
    await page.getByRole("button", { name: /New Cycle/ }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `extra__new-cycle-modal__${w}.png`) });
    out[`newcycle-${w}`] = await page.evaluate(metrics);
    await ctx.close();

    ({ ctx, page } = await open(b, w, "/cycle"));
    const fbtn = page.locator("button[aria-haspopup], button").filter({ hasText: /Filter/i }).first();
    if (await fbtn.count()) {
      await fbtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, `extra__cycle-filter-popover__${w}.png`), fullPage: true });
      out[`cyclefilter-${w}`] = await page.evaluate(metrics);
    }
    await ctx.close();

    ({ ctx, page } = await open(b, w, "/cycle"));
    await page.locator('[role="button"]').filter({ hasText: "Q4 Sprint" }).first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `extra__cycle-detail-viewport__${w}.png`) });
    out[`cycledetail-${w}`] = await page.evaluate(metrics);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(b, 1280, "/planning");
    out.planningCardProbe = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("main button")].find((x) => x.innerText.includes("Quick tips"));
      const cs = getComputedStyle(btn);
      const footer = btn.lastElementChild;
      return { display: cs.display, alignItems: cs.alignItems, flexDir: cs.flexDirection, btnW: btn.getBoundingClientRect().width, footerW: footer.getBoundingClientRect().width, footerCls: footer.className, footerAlignSelf: getComputedStyle(footer).alignSelf };
    });
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, "extras.json"), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
