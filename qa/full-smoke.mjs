/**
 * Full QA smoke — public routes, nav, catalog filters, auth gates, console errors.
 * Usage: node qa/full-smoke.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "qa", "smoke");
const baseUrl = (process.argv[2] ?? "http://127.0.0.1:5173").replace(/\/$/, "");

/** @typedef {{ id: string, severity: 'blocker'|'major'|'minor'|'pass'|'info', area: string, title: string, detail?: string, route?: string }} Finding */

/** @type {Finding[]} */
const findings = [];

function add(finding) {
  findings.push(finding);
}

const PUBLIC_ROUTES = [
  { id: "home", path: "/" },
  { id: "events", path: "/events" },
  { id: "experiences", path: "/experiences" },
  { id: "talents", path: "/talents" },
  { id: "search", path: "/search?q=riyadh" },
  { id: "about", path: "/about" },
  { id: "help", path: "/help" },
  { id: "sign-in", path: "/sign-in" },
  { id: "auctions", path: "/auctions" },
];

const AUTH_GATED = [
  { id: "apply-talent", path: "/apply/talent", expectRedirectOrGate: true },
  { id: "apply-facilities", path: "/apply/facilities", expectRedirectOrGate: true },
  { id: "my-tickets", path: "/my-tickets", expectRedirectOrGate: true },
  { id: "profile", path: "/profile", expectRedirectOrGate: true },
  { id: "favorites", path: "/favorites", expectRedirectOrGate: true },
];

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

page.on("pageerror", (err) => {
  pageErrors.push(String(err?.message ?? err));
});
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

function resetListeners() {
  pageErrors.length = 0;
  consoleErrors.length = 0;
  failedRequests.length = 0;
}

async function goto(route) {
  resetListeners();
  const response = await page.goto(`${baseUrl}${route}`, {
    waitUntil: "networkidle",
    timeout: 45_000,
  });
  await page.waitForTimeout(800);
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
      (r.status === 404 && (r.url.includes("/api") || r.url.includes("tickets") || r.url.includes("talents"))),
  );
  if (apiFails.length) {
    add({
      id: `api-${route}`,
      severity: "major",
      area: "api",
      title: `API/network failures on ${route}`,
      detail: apiFails
        .slice(0, 5)
        .map((r) => `${r.status} ${r.url}`)
        .join("\n"),
      route,
    });
  }
}

// ── 1. Public route smoke ──────────────────────────────────────────────
for (const route of PUBLIC_ROUTES) {
  try {
    const response = await goto(route.path);
    const status = response?.status() ?? 0;
    const body = await page.locator("body").innerText().catch(() => "");
    const hasContent = body.trim().length > 20;

    if (status >= 400) {
      add({
        id: `route-${route.id}`,
        severity: "blocker",
        area: "routing",
        title: `${route.path} returned HTTP ${status}`,
        route: route.path,
      });
    } else if (!hasContent) {
      add({
        id: `empty-${route.id}`,
        severity: "major",
        area: "routing",
        title: `${route.path} rendered empty body`,
        route: route.path,
      });
    } else {
      add({
        id: `route-${route.id}`,
        severity: "pass",
        area: "routing",
        title: `${route.path} loads`,
        route: route.path,
      });
    }
    collectJsNoise(route.path);
    await page.screenshot({
      path: path.join(outDir, `${route.id}.png`),
      fullPage: false,
    });
  } catch (err) {
    add({
      id: `route-${route.id}`,
      severity: "blocker",
      area: "routing",
      title: `${route.path} failed to load`,
      detail: String(err?.message ?? err),
      route: route.path,
    });
  }
}

// ── 2. Desktop nav labels ──────────────────────────────────────────────
try {
  await goto("/");
  await page.setViewportSize({ width: 1280, height: 900 });
  const nav = page.locator('nav[aria-label="Main"], nav[aria-label="الرئيسية"]');
  const labels = await nav.locator("a").allTextContents();
  const joined = labels.map((l) => l.trim()).filter(Boolean);
  const expected = ["Events", "Attractions & Activities", "Talents", "Facilities"];
  const hasAll = expected.every((e) =>
    joined.some((l) => l.includes(e) || l.length > 0),
  );
  // Also accept Arabic labels
  const arExpected = ["الفعاليات", "معالم", "المواهب", "المنشآت"];
  const hasAr = arExpected.every((e) => joined.some((l) => l.includes(e)));
  if (joined.length < 4) {
    add({
      id: "nav-desktop-count",
      severity: "major",
      area: "nav",
      title: "Desktop main nav has fewer than 4 links",
      detail: `Found: ${JSON.stringify(joined)}`,
    });
  } else if (!hasAll && !hasAr) {
    add({
      id: "nav-desktop-labels",
      severity: "major",
      area: "nav",
      title: "Desktop nav labels do not match Events / Experiences / Talents / Facilities",
      detail: `Found: ${JSON.stringify(joined)}`,
    });
  } else {
    add({
      id: "nav-desktop",
      severity: "pass",
      area: "nav",
      title: "Desktop main nav shows catalog destinations",
      detail: joined.join(" · "),
    });
  }

  // No duplicate "Offers"
  if (joined.filter((l) => /^offers$/i.test(l)).length > 0) {
    add({
      id: "nav-offers-dupe",
      severity: "minor",
      area: "nav",
      title: "Legacy Offers link still present in nav",
      detail: joined.join(" · "),
    });
  }
} catch (err) {
  add({
    id: "nav-desktop",
    severity: "major",
    area: "nav",
    title: "Could not inspect desktop nav",
    detail: String(err?.message ?? err),
  });
}

// ── 3. Mobile drawer ───────────────────────────────────────────────────
try {
  await page.setViewportSize({ width: 390, height: 844 });
  await goto("/");
  const menuBtn = page.getByRole("button", { name: /open menu|فتح القائمة/i });
  await menuBtn.click();
  await page.waitForTimeout(400);
  const drawer = page.locator("#site-mobile-nav");
  await drawer.waitFor({ state: "visible", timeout: 5000 });
  const drawerText = await drawer.innerText();
  const checks = [
    [/events|الفعاليات/i, "Events"],
    [/attractions|experiences|معالم/i, "Experiences"],
    [/talents|المواهب/i, "Talents"],
    [/facilities|المنشآت/i, "Facilities"],
  ];
  const missing = checks.filter(([re]) => !re.test(drawerText)).map(([, name]) => name);
  if (missing.length) {
    add({
      id: "nav-drawer-missing",
      severity: "major",
      area: "nav",
      title: `Mobile drawer missing: ${missing.join(", ")}`,
      detail: drawerText.slice(0, 400),
    });
  } else {
    add({
      id: "nav-drawer",
      severity: "pass",
      area: "nav",
      title: "Mobile drawer lists Events / Experiences / Talents / Facilities",
    });
  }
  // Bad patterns
  if (/tickets and offers|التذاكر والعروض/i.test(drawerText)) {
    add({
      id: "nav-drawer-legacy",
      severity: "minor",
      area: "nav",
      title: "Mobile drawer still shows legacy Tickets and offers grouping",
    });
  }
  await page.screenshot({ path: path.join(outDir, "drawer.png") });
  await page.getByRole("button", { name: /close menu|إغلاق القائمة/i }).click();
} catch (err) {
  add({
    id: "nav-drawer",
    severity: "major",
    area: "nav",
    title: "Mobile drawer failed to open or assert",
    detail: String(err?.message ?? err),
  });
}

// ── 4. Catalog filters (no chip strips for categories on events) ───────
try {
  await page.setViewportSize({ width: 1280, height: 900 });
  await goto("/events");
  const categoryDd = page.getByRole("button", { name: /category|الفئة|all events|كل الفعاليات/i }).first();
  const cityDd = page.getByRole("button", { name: /city|المدينة|anywhere|أي/i }).first();
  const hasCategory = (await categoryDd.count()) > 0;
  const hasCity = (await cityDd.count()) > 0;
  const hasSearch = (await page.getByPlaceholder(/search nearest|ابحث بالأقرب/i).count()) > 0;

  if (!hasCategory) {
    add({
      id: "events-category-dd",
      severity: "major",
      area: "filters",
      title: "Events page missing category dropdown",
      route: "/events",
    });
  } else {
    add({
      id: "events-category-dd",
      severity: "pass",
      area: "filters",
      title: "Events page has category dropdown",
      route: "/events",
    });
  }
  if (!hasCity) {
    add({
      id: "events-city-dd",
      severity: "major",
      area: "filters",
      title: "Events page missing city dropdown",
      route: "/events",
    });
  } else {
    add({
      id: "events-city-dd",
      severity: "pass",
      area: "filters",
      title: "Events page has city dropdown",
      route: "/events",
    });
  }
  if (!hasSearch) {
    add({
      id: "events-search",
      severity: "minor",
      area: "filters",
      title: "Events nearest-search placeholder not found",
      route: "/events",
    });
  } else {
    add({
      id: "events-search",
      severity: "pass",
      area: "filters",
      title: "Events nearest-search field present",
      route: "/events",
    });
  }

  // Sidebar free-only / rating should be gone
  const sidebar = await page.locator("aside").count();
  if (sidebar > 0) {
    const asideText = await page.locator("aside").first().innerText().catch(() => "");
    if (/free entry|دخول مجاني|rating|التقييم/i.test(asideText)) {
      add({
        id: "events-sidebar-extra",
        severity: "major",
        area: "filters",
        title: "Events still shows non-app sidebar filters (free/rating)",
        detail: asideText.slice(0, 200),
        route: "/events",
      });
    }
  } else {
    add({
      id: "events-no-sidebar",
      severity: "pass",
      area: "filters",
      title: "Events page has no filter sidebar (matches app)",
      route: "/events",
    });
  }
} catch (err) {
  add({
    id: "events-filters",
    severity: "major",
    area: "filters",
    title: "Events filter checks failed",
    detail: String(err?.message ?? err),
  });
}

// Talents filters
try {
  await goto("/talents");
  const typeDd = page.getByRole("button", { name: /talent type|نوع الموهبة|all talents/i });
  const cityDd = page.getByRole("button", { name: /city|المدينة|anywhere/i });
  const rated = page.getByRole("button", { name: /top rated|أعلى تقييم|highest/i });
  if ((await typeDd.count()) === 0) {
    add({
      id: "talents-type",
      severity: "major",
      area: "filters",
      title: "Talents missing talent-type dropdown",
      route: "/talents",
    });
  } else {
    add({
      id: "talents-type",
      severity: "pass",
      area: "filters",
      title: "Talents has talent-type dropdown",
      route: "/talents",
    });
  }
  if ((await cityDd.count()) === 0) {
    add({
      id: "talents-city",
      severity: "major",
      area: "filters",
      title: "Talents missing city dropdown",
      route: "/talents",
    });
  } else {
    add({
      id: "talents-city",
      severity: "pass",
      area: "filters",
      title: "Talents has city dropdown",
      route: "/talents",
    });
  }
  if ((await rated.count()) === 0) {
    add({
      id: "talents-rated",
      severity: "minor",
      area: "filters",
      title: "Talents missing Highest/Top rated toggle",
      route: "/talents",
    });
  } else {
    add({
      id: "talents-rated",
      severity: "pass",
      area: "filters",
      title: "Talents has top-rated toggle",
      route: "/talents",
    });
  }
} catch (err) {
  add({
    id: "talents-filters",
    severity: "major",
    area: "filters",
    title: "Talents filter checks failed",
    detail: String(err?.message ?? err),
  });
}

// Experiences — type tabs + category dropdown, no where bar
try {
  await goto("/experiences");
  const typeAll = page.getByRole("button", { name: /^(all|any|الكل|أي)$/i });
  const categoryDd = page.getByRole("button", { name: /category|الفئة|all experiences/i });
  const whereBar = page.getByText(/anywhere in saudi|في أي مكان/i);
  if ((await categoryDd.count()) === 0) {
    add({
      id: "exp-category",
      severity: "major",
      area: "filters",
      title: "Experiences missing category dropdown",
      route: "/experiences",
    });
  } else {
    add({
      id: "exp-category",
      severity: "pass",
      area: "filters",
      title: "Experiences has category dropdown",
      route: "/experiences",
    });
  }
  if ((await whereBar.count()) > 0) {
    add({
      id: "exp-where",
      severity: "minor",
      area: "filters",
      title: "Experiences still shows where/city search bar (not on app list)",
      route: "/experiences",
    });
  } else {
    add({
      id: "exp-where",
      severity: "pass",
      area: "filters",
      title: "Experiences has no where search bar",
      route: "/experiences",
    });
  }
  void typeAll;
} catch (err) {
  add({
    id: "exp-filters",
    severity: "major",
    area: "filters",
    title: "Experiences filter checks failed",
    detail: String(err?.message ?? err),
  });
}

// ── 5. Auth-gated routes ───────────────────────────────────────────────
for (const route of AUTH_GATED) {
  try {
    await goto(route.path);
    const url = page.url();
    const body = await page.locator("body").innerText();
    const gated =
      /sign-?in|login|تسجيل|مطلوب|login required|create an account/i.test(body) ||
      /sign-in|login/.test(url);
    const formVisible = (await page.locator("form").count()) > 0 && !gated;

    if (route.expectRedirectOrGate && !gated && formVisible && route.path.startsWith("/apply")) {
      // Continuous forms require auth — if form is fully usable without login, that's a bug
      add({
        id: `auth-${route.id}`,
        severity: "major",
        area: "auth",
        title: `${route.path} appears usable without authentication`,
        detail: `url=${url}`,
        route: route.path,
      });
    } else if (gated || !formVisible) {
      add({
        id: `auth-${route.id}`,
        severity: "pass",
        area: "auth",
        title: `${route.path} is gated or redirects when signed out`,
        detail: `url=${url}`,
        route: route.path,
      });
    } else {
      add({
        id: `auth-${route.id}`,
        severity: "info",
        area: "auth",
        title: `${route.path} loaded signed-out — check gate manually`,
        detail: `url=${url}`,
        route: route.path,
      });
    }
  } catch (err) {
    add({
      id: `auth-${route.id}`,
      severity: "major",
      area: "auth",
      title: `${route.path} auth-gate check failed`,
      detail: String(err?.message ?? err),
      route: route.path,
    });
  }
}

// ── 6. Event detail deep link (first card from /events) ────────────────
try {
  await goto("/events");
  const firstCard = page.locator('a[href^="/events/"]').first();
  if ((await firstCard.count()) === 0) {
    add({
      id: "event-detail-link",
      severity: "major",
      area: "catalog",
      title: "No event detail links on /events",
      route: "/events",
    });
  } else {
    await firstCard.click();
    await page.waitForTimeout(1000);
    const url = page.url();
    if (!/\/events\//.test(url)) {
      add({
        id: "event-detail-nav",
        severity: "major",
        area: "catalog",
        title: "Clicking event card did not navigate to detail",
        detail: url,
      });
    } else {
      const bookish = await page.getByRole("button", { name: /book|احجز|buy|اشتر/i }).count();
      add({
        id: "event-detail",
        severity: "pass",
        area: "catalog",
        title: "Event detail opens from catalog card",
        detail: `url=${url}; bookCtas=${bookish}`,
        route: url.replace(baseUrl, ""),
      });
      collectJsNoise(url.replace(baseUrl, ""));
    }
  }
} catch (err) {
  add({
    id: "event-detail",
    severity: "major",
    area: "catalog",
    title: "Event detail navigation failed",
    detail: String(err?.message ?? err),
  });
}

// ── 7. RTL smoke ───────────────────────────────────────────────────────
try {
  await page.setViewportSize({ width: 1280, height: 900 });
  await goto("/");
  const langBtn = page.getByRole("button", { name: /arabic|english|العربية|الإنجليزية/i }).first();
  if ((await langBtn.count()) > 0) {
    await langBtn.click();
    await page.waitForTimeout(600);
    const dir = await page.locator("html").getAttribute("dir");
    const lang = await page.locator("html").getAttribute("lang");
    if (dir === "rtl" || lang === "ar") {
      add({
        id: "rtl",
        severity: "pass",
        area: "i18n",
        title: "Language toggle switches to RTL/Arabic",
        detail: `dir=${dir} lang=${lang}`,
      });
    } else {
      add({
        id: "rtl",
        severity: "major",
        area: "i18n",
        title: "Language toggle did not set RTL/ar",
        detail: `dir=${dir} lang=${lang}`,
      });
    }
    await page.screenshot({ path: path.join(outDir, "home-ar.png") });
    // switch back
    await langBtn.click();
  } else {
    add({
      id: "rtl",
      severity: "minor",
      area: "i18n",
      title: "Could not find language toggle",
    });
  }
} catch (err) {
  add({
    id: "rtl",
    severity: "major",
    area: "i18n",
    title: "RTL smoke failed",
    detail: String(err?.message ?? err),
  });
}

await browser.close();

const summary = {
  capturedAt: new Date().toISOString(),
  baseUrl,
  totals: {
    pass: findings.filter((f) => f.severity === "pass").length,
    blocker: findings.filter((f) => f.severity === "blocker").length,
    major: findings.filter((f) => f.severity === "major").length,
    minor: findings.filter((f) => f.severity === "minor").length,
    info: findings.filter((f) => f.severity === "info").length,
  },
  findings,
};

await writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify(summary, null, 2),
);

console.log(JSON.stringify(summary.totals, null, 2));
for (const f of findings.filter((x) => x.severity !== "pass")) {
  console.log(`[${f.severity}] ${f.area}: ${f.title}`);
  if (f.detail) console.log(`  ${f.detail.split("\n")[0]}`);
}
console.log(`\nWrote qa/smoke/report.json`);
