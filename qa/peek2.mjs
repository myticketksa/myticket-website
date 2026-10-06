import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage();
const url = process.env.PAY_URL;
await p.goto(url, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(8000);
const brands = await p.locator('[class*="brand"], .wpwl-brand, label, button').evaluateAll((els) =>
  els.slice(0, 25).map((e) => `${e.tagName}.${e.className}`.slice(0, 70) + " :: " + (e.textContent || "").trim().slice(0, 24)),
);
console.log(brands.join("\n"));
console.log("--- forms ---");
console.log((await p.locator("form").evaluateAll((els) => els.map((e) => e.className))).join(" | "));
await b.close();
