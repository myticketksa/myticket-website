# MyTicket website live QA — 2026-10-08

**Target:** https://myticket.sa  
**Suites:**
- `node qa/full-smoke.mjs https://myticket.sa` → **27 pass / 0 defects**
- `API_IDENTIFIER=… API_PASSWORD=… node qa/live-website-qa.mjs https://myticket.sa` → **43 pass · 1 minor**
- Browser spot-check + `qa/booking-flow.spec.mjs` on `comedy-nights`
- Artifacts: `qa/smoke/`, `qa/live/`

## Verdict

Public catalog, nav, auth gates, i18n/RTL, search, marketing pages, and signed-in account shells are largely healthy. The main product defect still present is **blank main content on first paint** (event detail and catalog lists) until the user scrolls or waits for “Updating…” to finish — same class of bug as earlier manual QA.

## PASS (covered)

### Routing / marketing
- `/`, `/events`, `/experiences`, `/talents`, `/search`, `/about`, `/help`, `/legal`, privacy, delete-account, `/for-vendors`, `/auctions`, `/sign-in`, `/register`, `/reset-password`
- Unknown path shows 404 UI

### Nav
- Desktop: Events · Attractions & Activities · Talents · Facilities
- Mobile drawer lists the same destinations

### Catalog
- Events / talents / experiences filters present (smoke)
- Detail pages open from list cards
- Comedy Nights shows ticket prices (84 / 175), 30% off badge, Book now CTA
- Book now opens booking dialog (date/showtime step)

### Auth
- Empty sign-in shows validation
- Bad credentials rejected
- Account routes gated when signed out (`/my-tickets`, `/profile`, `/favorites`, `/wallet`, `/settings`, apply flows, `/checkout`)
- Signed-in: `/my-tickets`, `/profile`, `/favorites`, `/wallet`, `/settings` load

### i18n / footer
- Language toggle reaches Arabic/RTL
- Footer renders; Instagram → `myticketapp_official` (historical “Instagram 404” looks fixed)

## FAIL / defects

| Sev | Finding | Evidence |
|-----|---------|----------|
| **High** | **Blank content until scroll/load** on event detail (and catalog lists while “Updating…”). First viewport is header + empty white + footer; content appears after scroll or when fetch finishes. Same pattern as prior QA (#5/#7). | Browser: `/events/comedy-nights` blank on load → content after scroll; `/talents` & `/events` show “Updating…” then large white gap |
| **Minor** | Register empty submit — weak/no visible client validation | Live suite `register-empty` |
| **Minor / ops** | Production catalog polluted with disposable QA rows (`ZZ QA …`, many `PW Test Act`) | Events list + talents grid |
| **Info** | `qa/booking-flow.spec.mjs` still expects a native `<select>` for showtimes; UI uses `SessionPicker` buttons → script times out after dialog opens (product dialog works) | `booking-comedy.txt` 9/11 |
| **Info** | Parallel booking runs can flake on sign-in (stayed on `/sign-in`) while the dedicated live suite login passed | `booking-comedy.txt` vs live suite |

## Historical bug re-check (from `qa-tests`)

| Old # | Topic | Now |
|------|--------|-----|
| 2 | Wrong language flag | Flag control present (“Switch to Arabic”); not re-judged as US vs KSA artwork |
| 5/7 | Blank until scroll | **Still present** (High above) |
| 21 | Instagram 404 | **Appears fixed** → Instagram profile |
| 16 | Past events bookable | Not fully re-proven; today’s Comedy Nights is current |
| 14 | Checkout vs payment total | Not fully exercised (no card charge in this pass) |

## Reproduce

```bash
cd ~/Documents/myticket-website
node qa/full-smoke.mjs https://myticket.sa
API_IDENTIFIER='…' API_PASSWORD='…' node qa/live-website-qa.mjs https://myticket.sa
BASE_URL=https://myticket.sa EVENT_SLUG=comedy-nights \
  API_IDENTIFIER='…' API_PASSWORD='…' node qa/booking-flow.spec.mjs
```
