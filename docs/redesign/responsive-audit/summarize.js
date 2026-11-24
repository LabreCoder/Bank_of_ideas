const fs = require("fs");
const file = process.argv[2] || "results.json";
const filterCfg = process.argv[3] ? process.argv[3].split(",") : null;
const filterPage = process.argv[4] ? process.argv[4].split(",") : null;
const r = JSON.parse(fs.readFileSync(file, "utf8"));
for (const x of r) {
  if (filterCfg && !filterCfg.includes(x.cfg)) continue;
  if (filterPage && !filterPage.includes(x.page)) continue;
  if (x.fail) { console.log("FAIL", x.page, x.cfg, x.fail.split("\n")[0]); continue; }
  console.log(`== ${x.page} ${x.cfg} sw=${x.scrollWidth} overflow=${x.overflow} small=${x.smallCount}/${x.interactiveCount}${x.errors && x.errors.length ? " ERR " + x.errors[0] : ""}`);
  for (const o of x.offenders || []) console.log(`  OFF ${o.tag} L${o.left} R${o.right} w${o.w} "${o.txt}" [${o.cls}]`);
  for (const o of x.scrollers || []) console.log(`  SCR ${o.tag} ${o.scrollW}/${o.clientW} "${o.txt}" [${o.cls.slice(0, 100)}]`);
  for (const o of x.small || []) console.log(`  SMALL ${o.tag} ${o.w}x${o.h} "${o.txt.slice(0, 40)}" [${o.cls.slice(0, 90)}]`);
  for (const o of x.clipped || []) console.log(`  CLIP ${o.tag} w${o.w} lc=${o.lineClamp} "${o.full.slice(0, 70)}" [${o.cls.slice(0, 70)}]`);
}
