/**
 * Full live QA against https://myticket.sa (or BASE_URL).
 *
 * Covers: public pages, marketing, auth validation, auth gates, catalog
 * detail deep-links, i18n/RTL, footer, search, checkout gate, account shell.
 *
 * Optional signed-in pass:
 *   API_IDENTIFIER=… API_PASSWORD=… node qa/live-website-qa.mjs
 *
 * Usage:
 *   node qa/live-website-qa.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "qa", "live");
const baseUrl = (process.argv[2] ?? process.env.BASE_URL ?? "https://myticket.sa").replace(
  /\/$/,
  "",
);
const EMAIL = process.env.API_IDENTIFIER ?? "";
const PASSWORD = process.env.API_PASSWORD ?? "";

/** @typedef {{ id: string, severity: 'blocker'|'major'|'minor'|'pass'|'info'|'fail', area: string, title: string, detail?: string, route?: string }} Finding */
/** @type {Finding[]} */
const findings = [];
const notes = [];

function add(f) {
  findings.push(f);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: "en-US",
});
const page = await context.newPage();

/** @type {string[]} */
const pageErrors = [];
/** @type {string[]} */
const consoleErrors = [];
/** @type {{ url: string, status: number }[]} */
const failedRequests = [];

page.on("pageerror", (err) => pageErrors.push(String(err?.message ?? err)));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("response", (res) => {
  const status = res.status();
  const url = res.url();
  if (status >= 400 && !url.includes("favicon") && !url.includes("chrome-extension")) {
    failedRequests.push({ url, status });
  }
});

function resetNoise() {
  pageErrors.length = 0;
  consoleErrors.length = 0;
  failedRequests.length = 0;
}

async function goto(route, wait = "domcontentloaded") {
  resetNoise();
  const response = await page.goto(`${baseUrl}${route}`, {
    waitUntil: wait,
    timeout: 60_000,
  });
  await page.waitForTimeout(900);
  return response;
}

function collectJsNoise(route) {
  const meaningful = pageErrors.filter(
    (e) => !e.includes("ResizeObserver") && !e.includes("Non-Error promise rejection"),
  );
  if (meaningful.length) {
    add({
      id: `js-${route}`,
      severity: "major",
      area: "runtime",
      title: `Page JS error on ${route}`,
      detail: meaningful.slice(0, 3).join(" | "),
      route,
    });
  }
  const apiFails = failedRequests.filter(
    (r) =>
      r.status >= 500 ||
      (r.status === 404 &&
        (r.url.includes("/api/") || r.url.includes("tickets") || r.url.includes("talents"))),
  );
  if (apiFails.length) {
    add({
      id: `api-${route}`,
      severity: "major",
      area: "api",
      title: `API/network failures on ${route}`,
      detail: apiFails
        .slice(0, 6)
        .map((r) => `${r.status} ${r.url}`)
        .join("\n"),
      route,
    });
  }
}

const PUBLIC = [
  "/",
  "/events",
  "/experiences",
  "/talents",
  "/search?q=riyadh",
  "/about",
  "/help",
  "/legal",
  "/Privacy_Policy_My_Ticket",
  "/Delete_Account",
  "/sign-in",
  "/register",
  "/reset-password",
  "/for-vendors",
  "/auctions",
  "/does-not-exist-404-check",
];

console.log(`Live website QA → ${baseUrl}`);

// ── 1. Public routes ───────────────────────────────────────────────────
for (const route of PUBLIC) {
  try {
    const response = await goto(route);
    const status = response?.status() ?? 0;
    const body = (await page.locator("body").innerText().catch(() => "")).trim();
    const is404Route = route.includes("does-not-exist");
    if (is404Route) {
      const looks404 =
        /not found|404|غير موجود|الصفحة غير/i.test(body) || status === 404;
      add({
        id: "route-404",
        severity: looks404 ? "pass" : "major",
        area: "routing",
        title: looks404 ? "Unknown route shows 404 UI" : "Unknown route did not show 404 UI",
        detail: `http=${status} body=${body.slice(0, 120)}`,
        route,
      });
    } else if (status >= 400) {
      add({
        id: `route-${route}`,
        severity: "blocker",
        area: "routing",
        title: `${route} HTTP ${status}`,
        route,
      });
    } else if (body.length < 20) {
      add({
        id: `empty-${route}`,
        severity: "major",
        area: "routing",
        title: `${route} empty body`,
        route,
      });
    } else {
      add({
        id: `route-${route}`,
        severity: "pass",
        area: "routing",
        title: `${route} loads`,
        route,
      });
    }
    collectJsNoise(route);
    const shot = route.replace(/[/?&=]/g, "_").replace(/^_/, "") || "home";
    await page.screenshot({ path: path.join(outDir, `${shot}.png`), fullPage: false });
  } catch (err) {
    add({
      id: `route-${route}`,
      severity: "blocker",
      area: "routing",
      title: `${route} failed`,
      detail: String(err?.message ?? err),
      route,
    });
  }
}

// ── 2. Nav desktop + mobile ────────────────────────────────────────────
try {
  await page.setViewportSize({ width: 1280, height: 900 });
  await goto("/");
  const nav = page.locator('nav[aria-label="Main"], nav[aria-label="الرئيسية"]');
  const labels = (await nav.locator("a").allTextContents()).map((l) => l.trim()).filter(Boolean);
  if (labels.length >= 3) {
    add({
      id: "nav-desktop",
      severity: "pass",
      area: "nav",
      title: "Desktop main nav has catalog links",
      detail: labels.join(" · "),
    });
  } else {
    add({
      id: "nav-desktop",
      severity: "major",
      area: "nav",
      title: "Desktop main nav sparse",
      detail: JSON.stringify(labels),
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await goto("/");
  const menuBtn = page.getByRole("button", { name: /open menu|فتح القائمة/i });
  await menuBtn.click();
  await page.waitForTimeout(400);
  const drawer = page.locator("#site-mobile-nav");
  await drawer.waitFor({ state: "visible", timeout: 8000 });
  const drawerText = await drawer.innerText();
  const missing = [
    [/events|الفعاليات/i, "Events"],
    [/attractions|experiences|معالم/i, "Experiences"],
    [/talents|المواهب/i, "Talents"],
  ].filter(([re]) => !re.test(drawerText));
  add({
    id: "nav-drawer",
    severity: missing.length ? "major" : "pass",
    area: "nav",
    title: missing.length
      ? `Mobile drawer missing ${missing.map(([, n]) => n).join(", ")}`
      : "Mobile drawer lists catalog destinations",
    detail: drawerText.slice(0, 300),
  });
  await page.getByRole("button", { name: /close menu|إغلاق القائمة/i }).click().catch(() => {});
  await page.setViewportSize({ width: 1280, height: 900 });
} catch (err) {
  add({
    id: "nav",
    severity: "major",
    area: "nav",
    title: "Nav checks failed",
    detail: String(err?.message ?? err),
  });
}

// ── 3. Auth empty validation + bad credentials ─────────────────────────
try {
  await goto("/sign-in");
  await page.getByRole("button", { name: /sign in|تسجيل الدخول|log in/i }).first().click();
  await page.waitForTimeout(400);
  const errs = await page.locator("body").innerText();
  const hasFieldErrors = /required|أدخل|required|email|password|كلمة/i.test(errs);
  add({
    id: "auth-empty",
    severity: hasFieldErrors ? "pass" : "major",
    area: "auth",
    title: hasFieldErrors
      ? "Sign-in empty submit shows validation"
      : "Sign-in empty submit showed no validation",
  });

  await page.getByRole("textbox").first().fill("nobody-qa-xyz@example.com");
  await page.locator('input[type="password"]').fill("WrongPass!999");
  await page.getByRole("button", { name: /sign in|تسجيل الدخول|log in/i }).first().click();
  await page.waitForTimeout(2500);
  const after = await page.locator("body").innerText();
  const rejected =
    /invalid|incorrect|wrong|خطأ|غير صحيح|failed|couldn't|تعذر/i.test(after) ||
    page.url().includes("/sign-in");
  add({
    id: "auth-bad-creds",
    severity: rejected ? "pass" : "major",
    area: "auth",
    title: rejected
      ? "Bad credentials stay on sign-in / show error"
      : "Bad credentials unexpectedly navigated away",
    detail: page.url(),
  });
} catch (err) {
  add({
    id: "auth-validation",
    severity: "major",
    area: "auth",
    title: "Auth validation checks failed",
    detail: String(err?.message ?? err),
  });
}

// ── 4. Register empty validation ───────────────────────────────────────
try {
  await goto("/register");
  await page.locator('form').getByRole("button", { name: /create account|إنشاء حساب/i }).click();
  await page.waitForTimeout(500);
  const body = await page.locator("body").innerText();
  const registerErrors =
    (await page.locator('[role="alert"]').count()) > 0 ||
    /required|أدخل|valid|صالح|accept|وافق/i.test(body);
  add({
    id: "register-empty",
    severity: registerErrors ? "pass" : "minor",
    area: "auth",
    title: registerErrors
      ? "Register empty submit shows validation"
      : "Register empty submit — weak/no client validation",
  });
} catch (err) {
  add({
    id: "register-empty",
    severity: "major",
    area: "auth",
    title: "Register validation check failed",
    detail: String(err?.message ?? err),
  });
}

// ── 5. Auth gates ──────────────────────────────────────────────────────
for (const route of [
  "/my-tickets",
  "/profile",
  "/favorites",
  "/wallet",
  "/settings",
  "/apply/talent",
  "/apply/facilities",
  "/checkout",
]) {
  try {
    await goto(route);
    const url = page.url();
    const body = await page.locator("body").innerText();
    const gated =
      /sign-?in|login|تسجيل|create an account|next=/i.test(body + url) ||
      /sign-in|login/.test(url);
    add({
      id: `gate-${route}`,
      severity: gated ? "pass" : "major",
      area: "auth",
      title: gated
        ? `${route} gated when signed out`
        : `${route} accessible without auth`,
      detail: `url=${url}`,
      route,
    });
  } catch (err) {
    add({
      id: `gate-${route}`,
      severity: "major",
      area: "auth",
      title: `${route} gate check failed`,
      detail: String(err?.message ?? err),
      route,
    });
  }
}

// ── 6. Catalog deep links ──────────────────────────────────────────────
async function openFirstCard(listPath, hrefPrefix, area) {
  try {
    await goto(listPath);
    const card = page.locator(`a[href^="${hrefPrefix}"]`).first();
    if ((await card.count()) === 0) {
      add({
        id: `${area}-empty`,
        severity: "major",
        area: "catalog",
        title: `No ${hrefPrefix} cards on ${listPath}`,
        route: listPath,
      });
      return null;
    }
    await card.click();
    await page.waitForTimeout(1200);
    const url = page.url();
    const ok = url.includes(hrefPrefix) && url !== `${baseUrl}${listPath}`;
    add({
      id: `${area}-detail`,
      severity: ok ? "pass" : "major",
      area: "catalog",
      title: ok ? `${area} detail opens from list` : `${area} card did not navigate`,
      detail: url,
      route: url.replace(baseUrl, ""),
    });
    collectJsNoise(url.replace(baseUrl, ""));
    await page.screenshot({
      path: path.join(outDir, `${area}-detail.png`),
      fullPage: false,
    });
    return ok ? url : null;
  } catch (err) {
    add({
      id: `${area}-detail`,
      severity: "major",
      area: "catalog",
      title: `${area} detail navigation failed`,
      detail: String(err?.message ?? err),
    });
    return null;
  }
}

const eventUrl = await openFirstCard("/events", "/events/", "event");
await openFirstCard("/talents", "/talents/", "talent");
await openFirstCard("/experiences", "/experiences/", "experience");

// Event book CTA presence (does not complete payment)
if (eventUrl) {
  try {
    await page.goto(eventUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(1000);
    const book = page.getByRole("button", { name: /book|احجز|buy|اشتر|get tickets/i });
    const count = await book.count();
    add({
      id: "event-book-cta",
      severity: count > 0 ? "pass" : "info",
      area: "checkout",
      title:
        count > 0
          ? "Event detail shows book/buy CTA"
          : "Event detail has no book CTA (may be past/sold out/free gate)",
      detail: eventUrl,
    });
    if (count > 0) {
      await book.first().click();
      await page.waitForTimeout(1500);
      const url = page.url();
      const dialog = await page.getByRole("dialog").count();
      const moved =
        dialog > 0 || /checkout|seats|sign-in|login/i.test(url);
      add({
        id: "event-book-click",
        severity: moved ? "pass" : "major",
        area: "checkout",
        title: moved
          ? "Book CTA opens dialog, seats, checkout, or sign-in"
          : "Book CTA click had no visible effect",
        detail: `url=${url} dialogs=${dialog}`,
      });
    }
  } catch (err) {
    add({
      id: "event-book",
      severity: "major",
      area: "checkout",
      title: "Event book CTA check failed",
      detail: String(err?.message ?? err),
    });
  }
}

// ── 7. Search ──────────────────────────────────────────────────────────
try {
  await goto("/search?q=riyadh");
  const body = await page.locator("body").innerText();
  const hasResultsOrEmpty =
    /result|نتيجة|event|فعالية|talent|موهبة|no results|لا توجد|nothing/i.test(body);
  add({
    id: "search",
    severity: hasResultsOrEmpty ? "pass" : "major",
    area: "search",
    title: hasResultsOrEmpty
      ? "Search page renders results or empty state"
      : "Search page unclear content",
    detail: body.slice(0, 200),
    route: "/search?q=riyadh",
  });
  collectJsNoise("/search");
} catch (err) {
  add({
    id: "search",
    severity: "major",
    area: "search",
    title: "Search check failed",
    detail: String(err?.message ?? err),
  });
}

// ── 8. Footer ──────────────────────────────────────────────────────────
try {
  await goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const footer = page.locator("footer");
  const text = (await footer.innerText().catch(() => "")).trim();
  add({
    id: "footer",
    severity: text.length > 20 ? "pass" : "major",
    area: "marketing",
    title: text.length > 20 ? "Footer renders on home" : "Footer missing/empty on home",
    detail: text.slice(0, 200),
  });
  const ig = footer.locator('a[href*="instagram"]');
  if ((await ig.count()) > 0) {
    const href = await ig.first().getAttribute("href");
    add({
      id: "footer-instagram",
      severity: href && href.includes("instagram.com") && !href.includes("myticket.sa")
        ? "pass"
        : "minor",
      area: "marketing",
      title: "Footer Instagram link",
      detail: href ?? "(none)",
    });
  }
} catch (err) {
  add({
    id: "footer",
    severity: "major",
    area: "marketing",
    title: "Footer check failed",
    detail: String(err?.message ?? err),
  });
}

// ── 9. i18n / RTL ──────────────────────────────────────────────────────
try {
  await goto("/");
  const langBtn = page.getByRole("button", { name: /arabic|english|العربية|الإنجليزية/i }).first();
  if ((await langBtn.count()) === 0) {
    // Sometimes it's a link or flag button
    const flag = page.locator('button[aria-label*="lang"], button[aria-label*="لغة"], a[href*="lang"]').first();
    if ((await flag.count()) > 0) await flag.click();
    else {
      add({
        id: "rtl",
        severity: "minor",
        area: "i18n",
        title: "Could not find language toggle",
      });
    }
  } else {
    await langBtn.click();
  }
  await page.waitForTimeout(700);
  const dir = await page.locator("html").getAttribute("dir");
  const lang = await page.locator("html").getAttribute("lang");
  add({
    id: "rtl",
    severity: dir === "rtl" || lang === "ar" ? "pass" : "major",
    area: "i18n",
    title:
      dir === "rtl" || lang === "ar"
        ? "Language toggle reaches Arabic/RTL"
        : "Language toggle did not set RTL/ar",
    detail: `dir=${dir} lang=${lang}`,
  });
  await page.screenshot({ path: path.join(outDir, "home-ar.png"), fullPage: false });
} catch (err) {
  add({
    id: "rtl",
    severity: "major",
    area: "i18n",
    title: "RTL check failed",
    detail: String(err?.message ?? err),
  });
}

// ── 10. Optional signed-in pass ────────────────────────────────────────
if (EMAIL && PASSWORD) {
  try {
    await goto("/sign-in");
    await page.getByRole("textbox").first().fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.getByRole("button", { name: /sign in|تسجيل الدخول|log in/i }).first().click();
    await page.waitForTimeout(4000);
    const signedIn = !page.url().includes("/sign-in");
    add({
      id: "auth-login",
      severity: signedIn ? "pass" : "fail",
      area: "auth",
      title: signedIn ? "Sign-in succeeded with provided credentials" : "Sign-in failed",
      detail: page.url(),
    });
    if (signedIn) {
      for (const route of ["/my-tickets", "/profile", "/favorites", "/wallet", "/settings"]) {
        await goto(route);
        const url = page.url();
        const bounced = /sign-in|login/.test(url);
        add({
          id: `authed-${route}`,
          severity: bounced ? "major" : "pass",
          area: "account",
          title: bounced
            ? `${route} bounced to sign-in while authenticated`
            : `${route} loads while authenticated`,
          detail: url,
          route,
        });
        collectJsNoise(route);
        await page.screenshot({
          path: path.join(outDir, `authed-${route.replace(/\//g, "_")}.png`),
          fullPage: false,
        });
      }
    }
  } catch (err) {
    add({
      id: "auth-login",
      severity: "fail",
      area: "auth",
      title: "Signed-in pass failed",
      detail: String(err?.message ?? err),
    });
  }
} else {
  notes.push("Skipped signed-in account pass (set API_IDENTIFIER + API_PASSWORD)");
}

await browser.close();

const summary = {
  capturedAt: new Date().toISOString(),
  baseUrl,
  signedInPass: Boolean(EMAIL && PASSWORD),
  notes,
  totals: {
    pass: findings.filter((f) => f.severity === "pass").length,
    blocker: findings.filter((f) => f.severity === "blocker").length,
    major: findings.filter((f) => f.severity === "major").length,
    minor: findings.filter((f) => f.severity === "minor").length,
    fail: findings.filter((f) => f.severity === "fail").length,
    info: findings.filter((f) => f.severity === "info").length,
  },
  findings,
};

await writeFile(path.join(outDir, "report.json"), JSON.stringify(summary, null, 2));

const md = [
  `# MyTicket website live QA — ${summary.capturedAt.slice(0, 10)}`,
  "",
  `**Target:** ${baseUrl}`,
  "",
  `## Totals: pass ${summary.totals.pass} · blocker ${summary.totals.blocker} · major ${summary.totals.major} · minor ${summary.totals.minor} · fail ${summary.totals.fail} · info ${summary.totals.info}`,
  "",
  notes.length ? `Notes: ${notes.join("; ")}\n` : "",
  "## Findings",
  "",
  "| Sev | Area | Title | Detail |",
  "|-----|------|-------|--------|",
  ...findings
    .filter((f) => f.severity !== "pass")
    .map(
      (f) =>
        `| **${f.severity}** | ${f.area} | ${f.title.replace(/\|/g, "/")} | ${(f.detail ?? f.route ?? "").toString().replace(/\|/g, "/").slice(0, 160)} |`,
    ),
  "",
  "## Pass",
  "",
  ...findings.filter((f) => f.severity === "pass").map((f) => `- ${f.title}`),
  "",
].join("\n");

await writeFile(path.join(outDir, "QA-FINDINGS-WEBSITE.md"), md);
await writeFile(path.join(root, "QA-FINDINGS-WEBSITE.md"), md);

console.log(JSON.stringify(summary.totals, null, 2));
for (const f of findings.filter((x) => x.severity !== "pass")) {
  console.log(`[${f.severity}] ${f.area}: ${f.title}`);
  if (f.detail) console.log(`  ${String(f.detail).split("\n")[0].slice(0, 200)}`);
}
console.log(`\nWrote qa/live/report.json and QA-FINDINGS-WEBSITE.md`);
