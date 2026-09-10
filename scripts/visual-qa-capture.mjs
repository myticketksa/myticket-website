/**
 * Phase 8 — capture browser screenshots at 1440 for every FIGMA_SCREENS route.
 * Usage: node scripts/visual-qa-capture.mjs [baseUrl]
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'qa', 'browser')
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:5173'

/** Mirrors src/lib/figma-nodes.ts FIGMA_SCREENS with concrete sample paths. */
const ROUTES = [
  ['home', '/'],
  ['events', '/events'],
  ['event-detail', '/events/winter-nights'],
  ['search', '/search'],
  ['talents', '/talents'],
  ['talent-detail', '/talents/layla-hassan'],
  ['experiences', '/experiences'],
  ['experience-detail', '/experiences/desert-stargazing'],
  ['auctions', '/auctions'],
  ['auction-detail', '/auctions/vip-table'],
  ['seats', '/events/winter-nights/seats'],
  ['checkout', '/checkout'],
  ['order-confirmation', '/order-confirmation'],
  ['sign-in', '/sign-in'],
  ['register', '/register'],
  ['reset-password', '/reset-password'],
  ['profile', '/profile'],
  ['settings', '/settings'],
  ['my-tickets', '/my-tickets'],
  ['ticket-detail', '/my-tickets/winter-nights'],
  ['saved', '/saved'],
  ['notifications', '/notifications'],
  ['wallet', '/wallet'],
  ['my-reviews', '/my-reviews'],
  ['my-submissions', '/my-submissions'],
  ['my-vendor-application', '/my-vendor-application'],
  ['my-talent-application', '/my-talent-application'],
  ['my-auction-activity', '/my-auction-activity'],
  ['resell', '/my-tickets/winter-nights/resell'],
  ['gift', '/my-tickets/winter-nights/gift'],
  ['refund', '/my-tickets/winter-nights/refund'],
  ['submit-experience', '/submit-experience'],
  ['become-business', '/become-business'],
  ['apply-vendor', '/apply/vendor'],
  ['apply-organizer', '/apply/organizer'],
  ['apply-talent', '/apply/talent'],
  ['application-submitted', '/application-submitted'],
  ['support', '/support'],
  ['support-new', '/support/new'],
  ['support-chat', '/support/chat'],
  ['about', '/about'],
  ['help', '/help'],
  ['legal', '/legal'],
  ['for-vendors', '/for-vendors'],
  ['for-organizers', '/for-organizers'],
  ['for-talents', '/for-talents'],
  ['maintenance', '/maintenance'],
  ['not-found', '/this-route-does-not-exist-404'],
]

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})

const results = []

for (const [slug, route] of ROUTES) {
  const url = `${baseUrl}${route}`
  const file = path.join(outDir, `${slug}.png`)
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 })
    await page.waitForTimeout(700)
    await page.screenshot({ path: file, fullPage: true })
    results.push({
      slug,
      route,
      status: response?.status() ?? null,
      ok: true,
      file: path.relative(root, file),
    })
    console.log(`ok  ${route} → ${slug}.png`)
  } catch (err) {
    results.push({
      slug,
      route,
      ok: false,
      error: String(err?.message ?? err),
    })
    console.error(`fail ${route}: ${err?.message ?? err}`)
  }
}

await browser.close()

const report = {
  capturedAt: new Date().toISOString(),
  baseUrl,
  viewport: { width: 1440, height: 900 },
  count: results.filter((r) => r.ok).length,
  failed: results.filter((r) => !r.ok).length,
  results,
  p2Notes: [
    'Seat map density still below full Figma hall capacity — acceptable stub expansion.',
    'FilterSidebar interactive=false leaves muted chrome vs Figma active look — intentional honesty.',
    'Apply wizards show inactive step chrome labels 2–5 without form bodies — SOT per plan.',
    'Settings sidebar lists disabled invent panes — intentional until Figma exists.',
    'Home hero height / long-page screenshot compression may hide mid-page rhythm vs Figma.',
    'Some catalog slug fixtures may 404 if seed slugs differ — check failed rows.',
  ],
}

await writeFile(
  path.join(root, 'qa', 'visual-qa-report.json'),
  JSON.stringify(report, null, 2),
)
console.log(`\nWrote qa/visual-qa-report.json (${report.count} ok / ${report.failed} fail)`)
