import { chromium } from "playwright";
const BASE = "http://localhost:5180";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
const log = (...a) => console.log(...a);

await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded" });
await page.getByRole("textbox").first().fill("mohamedelhaj.career@gmail.com");
await page.locator('input[type="password"]').fill("password123");
await page.getByRole("button", { name: /sign in|login/i }).first().click();
await page.waitForTimeout(3500);

await page.goto(`${BASE}/events/comedy-nights`, { waitUntil: "domcontentloaded" });
await page.getByRole("button", { name: /book now/i }).first().waitFor({ timeout: 60000 });
await page.getByRole("button", { name: /book now/i }).first().click();
await page.waitForTimeout(1200);
const d = page.getByRole("dialog");
await d.locator("select").first().selectOption({ index: 1 });
await d.getByRole("button", { name: /next/i }).click();
await page.waitForTimeout(600);
await d.getByRole("button", { name: /add a ticket/i }).click();
await page.waitForTimeout(400);
await d.getByPlaceholder(/attendee name/i).first().fill("Mustafa Osama");
await d.getByRole("button", { name: /next/i }).click();
await page.waitForTimeout(600);
log("paying:", (await d.getByRole("button", { name: /pay/i }).first().innerText()).trim());
// listen before clicking — the window opens during the click
const popupPromise = page.context().waitForEvent("page", { timeout: 40000 });
await d.getByRole("button", { name: /pay/i }).first().click();
const popup = await popupPromise;
await page.waitForTimeout(10000);
await popup.waitForLoadState("domcontentloaded");
log("popup opened:", popup.url().slice(0, 70));
const gw = popup.locator("body");
const gwFrame = popup;

// brand is a select, not a tab
await gwFrame.locator("select.wpwl-control-brand").selectOption("MASTER").catch(() => {});
await page.waitForTimeout(2000);

// card number and CVV sit in HyperPay's own frames — card data never touches our page
for (const f of gwFrame.frames().filter((x) => x.url().includes("pciIframe"))) {
  if (await f.locator('input[name="card.number"]').count()) {
    await f.locator('input[name="card.number"]').fill("5454545454545454");
    log("card number filled");
  }
  if (await f.locator('input[name="card.cvv"]').count()) {
    await f.locator('input[name="card.cvv"]').fill("123");
    log("cvv filled");
  }
}

await gwFrame.locator('input[name="card.holder"]').fill("Mustafa Osama");
log("holder filled");

// the visible expiry box is the unnamed tel input
const expiry = gwFrame.locator('.wpwl-form-card input[type="tel"]').first();
await expiry.click();
await expiry.type("1230", { delay: 90 });
log("expiry typed");
await page.waitForTimeout(1000);

await page.screenshot({ path: "qa/card-filled.png" });
await gwFrame.getByRole("button", { name: /pay now/i }).first().click();
log("submitted the card");
await page.waitForTimeout(9000);

// Test-mode 3-D Secure: the outcome is a select, `Y` meaning approve.
for (const f of gwFrame.frames()) {
  if (!(await f.locator('select[name="transStatus"]').count().catch(() => 0))) continue;
  log("3DS chooser found");
  await f.locator('select[name="transStatus"]').selectOption("Y");
  await page.waitForTimeout(400);
  await f.locator('button[type="submit"], input[type="submit"]').first().click();
  log("approved and submitted");
  break;
}

for (let i = 0; i < 24; i += 1) {
  await page.waitForTimeout(5000);
  if (page.url().includes("order-confirmation") || page.url().includes("payment-return")) break;
}
for (let i = 0; i < 10; i += 1) {
  await page.waitForTimeout(4000);
  const urls = [page.url(), popup.isClosed() ? "(popup closed)" : popup.url()];
  log(`t+${(i + 1) * 4}s frames:`, urls.map((u) => u.slice(0, 80)).join(" ;; "));
  if (page.url().includes("order-confirmation")) break;
}
log("landed on:", page.url());
log((await page.locator("body").innerText().catch(() => "(no body)")).slice(0, 400));
await page.screenshot({ path: "qa/card-done.png" });
await browser.close();
