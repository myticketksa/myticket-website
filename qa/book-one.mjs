import { chromium } from "playwright";

const BASE = "http://localhost:5180";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });

const log = (...a) => console.log(...a);

await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle" });
await page.getByRole("textbox").first().fill("mohamedelhaj.career@gmail.com");
await page.locator('input[type="password"]').fill("password123");
await page.getByRole("button", { name: /sign in|login/i }).first().click();
await page.waitForTimeout(3500);
log("signed in:", page.url());

await page.goto(`${BASE}/events/comedy-nights`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

await page.getByRole("button", { name: /book now/i }).first().click();
await page.waitForTimeout(1200);
const d = page.getByRole("dialog");

// step 1 — type + date
await d.locator("select").first().selectOption({ index: 1 });
await page.waitForTimeout(400);
log("date chosen:", (await d.locator("select").first().inputValue()));
await d.getByRole("button", { name: /next/i }).click();
await page.waitForTimeout(600);

// step 2 — one ticket, named
await d.getByRole("button", { name: /add a ticket/i }).click();
await page.waitForTimeout(400);
await d.getByPlaceholder(/attendee name/i).first().fill("Mustafa Osama");
await d.getByRole("button", { name: /next/i }).click();
await page.waitForTimeout(600);

// step 3 — pay from the wallet, which settles immediately
await d.getByText(/wallet/i).first().click();
await page.waitForTimeout(400);
const payLabel = await d.getByRole("button", { name: /pay/i }).first().innerText();
log("paying:", payLabel.trim());

await d.getByRole("button", { name: /pay/i }).first().click();
await page.waitForTimeout(12000);

log("landed on:", page.url());
const body = await page.locator("body").innerText();
log("--- page ---");
log(body.slice(0, 700));
await page.screenshot({ path: "qa/booked.png" });
await browser.close();
