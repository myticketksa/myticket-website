/**
 * Drives the real booking flow against the local dev server and the live API.
 *
 * Run: node qa/booking-flow.spec.mjs
 *
 * Stops short of completing a card payment — it checks that the gateway page
 * actually loads in the overlay, then closes it. Nothing is charged.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:5180";
const EMAIL = process.env.API_IDENTIFIER ?? "mohamedelhaj.career@gmail.com";
const PASSWORD = process.env.API_PASSWORD ?? "password123";
const EVENT = process.env.EVENT_SLUG ?? "comedy-nights";

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", async (m) => {
  if (m.type() !== "error") return;
  const text = m.text();
  // Playwright injects its own `pw-test-act` marker and React complains about
  // the duplicate key it creates. Ours to ignore, not ours to fix.
  const args = await Promise.all(
    m.args().map((a) => a.jsonValue().catch(() => "")),
  ).catch(() => []);
  if (args.some((v) => String(v).includes("pw-test-act"))) return;
  errors.push(text);
});

try {
  // --- sign in ---------------------------------------------------------
  await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox").first().fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /sign in|login|دخول/i }).first().click();
  await page.waitForTimeout(3500);
  check("signed in", !page.url().includes("/sign-in"), page.url());

  // --- event page ------------------------------------------------------
  await page.goto(`${BASE}/events/${EVENT}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const bodyText = await page.locator("body").innerText();
  check("event title rendered", /comedy/i.test(bodyText));
  check(
    "no map on the page",
    (await page.locator(".leaflet-container").count()) === 0,
  );
  check(
    "price list shows the showtime's prices",
    /ticket prices|أسعار التذاكر/i.test(bodyText) &&
      /\b84\b/.test(bodyText) &&
      /\b175\b/.test(bodyText),
    "General 84 / VIP 175 — the discounted prices for this night",
  );
  check(
    "the night's offer is shown",
    /30% off|خصم 30/i.test(bodyText),
  );
  check(
    "does not claim the event is free",
    !/claim free|مجان/i.test(bodyText),
  );

  // --- open the booking dialog ----------------------------------------
  const bookButton = page.getByRole("button", { name: /book now|احجز/i }).first();
  check("book button present", (await bookButton.count()) > 0);
  await bookButton.click();
  await page.waitForTimeout(1200);

  const dialog = page.getByRole("dialog");
  check("dialog opened", (await dialog.count()) > 0);

  const step1 = await dialog.innerText();
  check("step 1 asks for the date", /booking date|يوم الحجز/i.test(step1));
  check(
    "step 1 does not ask for names yet",
    !/attendee name|اسم الحاضر/i.test(step1),
  );

  // --- step 1: pick type and date -------------------------------------
  const selects = dialog.locator("select");
  await selects.first().selectOption({ index: 1 });
  await page.waitForTimeout(400);

  await dialog.getByRole("button", { name: /next|التالي/i }).click();
  await page.waitForTimeout(600);

  // --- step 2: tickets and names ---------------------------------------
  const step2 = await dialog.innerText();
  check("step 2 is the tickets step", /number of tickets|عدد التذاكر/i.test(step2));

  // next with no tickets must be refused
  await dialog.getByRole("button", { name: /next|التالي/i }).click();
  await page.waitForTimeout(400);
  check(
    "refuses to continue with no tickets",
    /at least one|أضف تذكرة/i.test(await dialog.innerText()),
  );

  await dialog.getByRole("button", { name: /add a ticket|إضافة تذكرة/i }).click();
  await page.waitForTimeout(400);

  // next with a nameless ticket must be refused
  await dialog.getByRole("button", { name: /next|التالي/i }).click();
  await page.waitForTimeout(400);
  check(
    "refuses a ticket with no name",
    /every ticket a name|اكتب اسما/i.test(await dialog.innerText()),
  );

  await dialog
    .getByPlaceholder(/attendee name|اسم الحاضر/i)
    .first()
    .fill("QA Tester");
  await dialog.getByRole("button", { name: /next|التالي/i }).click();
  await page.waitForTimeout(600);

  // --- step 3: payment --------------------------------------------------
  const step3 = await dialog.innerText();
  check("step 3 is the payment step", /payment method|طريقة الدفع/i.test(step3));
  check("shows a total", /total|الإجمالي/i.test(step3));
  check(
    "no invented service fee",
    !/service fee|رسوم الخدمة/i.test(step3),
  );

  const payLabel = await dialog
    .getByRole("button", { name: /pay|ادفع/i })
    .first()
    .innerText();
  check("pay button quotes the amount", /\d/.test(payLabel), payLabel.trim());

  // The gateway opens in its own window — listen before the click.
  const popupPromise = page.context().waitForEvent("page", { timeout: 40000 });
  await dialog.getByRole("button", { name: /pay|ادفع/i }).first().click();
  const popup = await popupPromise.catch(() => null);

  check("payment window opened", popup != null);

  if (popup) {
    // It opens blank on the click, then goes to the gateway once the order
    // exists — wait for that second navigation rather than reading too early.
    await popup
      .waitForURL(/payment\.myticket\.sa/, { timeout: 40000 })
      .catch(() => {});
    await popup.waitForLoadState("domcontentloaded");
    check(
      "window points at the gateway",
      popup.url().includes("payment.myticket.sa"),
      popup.url().slice(0, 60),
    );
    check("the site stayed put", page.url().startsWith(BASE), page.url());
    const gatewayText = await popup.locator("body").innerText().catch(() => "");
    check(
      "gateway page rendered",
      gatewayText.trim().length > 0,
      `${gatewayText.trim().slice(0, 32)}…`,
    );
    check(
      "waiting state shown on the site",
      /payment|الدفع/i.test(await page.locator("body").innerText()),
    );
    await popup.close().catch(() => {});
  }

  check(
    "no uncaught page errors",
    errors.length === 0,
    errors.slice(0, 2).join(" | "),
  );
} catch (error) {
  check("run completed without throwing", false, String(error).slice(0, 160));
} finally {
  await page.screenshot({ path: "qa/booking-flow.png", fullPage: false });
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length === 0 ? 0 : 1);
