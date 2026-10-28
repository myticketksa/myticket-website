# Audit of breezyx28's two commits — 2026-10-14

Commits: `a4d9271` "fixing test results problems", `f39d0e3` "fixed remaining issues"
(branch `rebuild/foundation`, pushed ~13 Oct). Compared against `e9a85e3`.

Live site check: myticket.sa main bundle is dated Mon 12 Oct 12:36 GMT, so these
commits are **not live** yet.

Method: read the full diff, cross-checked against the current API checkout
(`~/Documents/myticket-new-api`), ran `tsc -b` and `oxlint`. App not run.

## 1. Build is broken — HIGH

`src/components/cards/ExperienceCard.tsx` — the price block was commented out
(`{/* {price && ( ... )} */}`) instead of changed. That leaves `MoneyAmount`,
`price` and `priceLabel` unused, and the project has `noUnusedLocals` /
`noUnusedParameters` on:

```
ExperienceCard.tsx(1,42): error TS6133: 'MoneyAmount' is declared but its value is never read.
ExperienceCard.tsx(122,3): error TS6133: 'price' is declared but its value is never read.
ExperienceCard.tsx(123,3): error TS6133: 'priceLabel' is declared but its value is never read.
```

`npm run build` is `tsc -b && vite build`, and `npm run deploy` runs build first,
so this commit cannot be built or deployed as-is. He did not run the build
before pushing.

## 2. Prices gone from every experience card — HIGH (product)

Same change. The commented block was the only place the card shows a price, so
prices vanish on the home page experiences row, the experiences list, and the
"nearby" cards on the experience detail page — for every type, not just
activities.

His other edits in the same commit (`priceLabel=""` for activities on the list,
`priceLabel=""` on detail nearby cards, the `priceLabel ? … : <span />` branch
inside the block) are all dead now. It reads like he first tried to hide the
"Per person" label for activities, then commented the whole block out.

**Resolved 2026-10-14 (uncommitted):** owner confirmed experiences carry no
price at all. The API already dropped the column on 29 Sep
(`2026_09_29_070000_drop_price_includes_hours_guests_from_experiences`) and the
live `/experiences` response has no price field — the website was drawing
"Per person —" from a missing value. Removed price from the website instead:
card prop + footer, mapper, list/detail callers, favourites (`price: ''`) and
search results (price span only renders when set). `tsc -b` and `vite build`
pass.

## 3. Free-entry booking still fails — MEDIUM (his fix is cosmetic)

`BookingModal.tsx` + `EventDetailPage.tsx` — new `freeEntry` prop hides the
promo field and payment-method picker. But `confirmBooking` still runs the
same path: create order → `payOrder` with the default method (`card`).

Backend (`TicketService::createOrder`, ~line 188): when the event `is_free`,
the order is marked `payment_status = completed` at creation. Then
`payForOrder` (~line 345) returns 400 "Payment already made for this order".

Result for the buyer: ticket is issued, but they get an error toast with that
message, the modal stays open, and pressing again creates a second free order.

Second gap: the website treats an event as free when every ticket tier costs 0,
even if the event is not flagged `is_free` on the backend. Then the order is
created pending at 0 SAR and sent to the card gateway for a zero charge.

Pre-existing, not introduced by him — but this is exactly the flow he touched
and the real failure is untouched.

**Resolved 2026-10-14 (uncommitted):** `confirmBooking` now checks the created
order's `paymentStatus`; when the API says `completed` it clears the hold
session, closes the modal and goes to `/order-confirmation`, skipping promo and
pay. Same rule the mobile app's checkout follows. `tsc -b` passes.

Still open: the "every tier costs 0 but the event isn't flagged free" case.
The website shows "Claim free ticket" and hides the payment picker, but the API
creates a pending 0 SAR order that still needs paying, and the website sends it
to the card gateway. The mobile app only trusts the event's free flag. Not
changed — the real fix is the organizer flagging the event free.

## 4. Talents paging — works, but overbuilt and glitchy — LOW

Goal: show 9 cards (3×3) per page while the API returns 10.

- API ignores `perPage`: `TalentService.php:35` is hard-coded `paginate(10)`.
  So the new `perPage=12` param and the whole "server page fills rows" branch
  are dead code today.
- The client windowing math is correct (checked pages 1–3: no talent skipped
  or duplicated). Page count uses `total / 9`, fine.
- Glitch: RTK Query keeps the previous result while a new page loads. Going
  page 2 → 3 slices the *old* two pages with the *new* offset, so for a moment
  it shows the wrong talents. Going 1 → 2 the overflow request has no data yet,
  so the grid briefly goes empty (empty state flash).
- Search and "highest rated" still only filter/sort the 9 on screen
  (pre-existing).

Cleaner fix: have the API accept a page size (9) and drop the windowing.

## 5. Small stuff — OK / minor

- Favorites empty state: "Browse events" button removed. Requests (My tickets)
  empty state: "Browse talents" button removed via new `showCta` prop. Clean.
  `requestsEmptyCta` strings are now unused.
- Notifications empty body changed to "There are no notifications." /
  "لا توجد إشعارات." Fine.
- White logo PNG on the sign-in hero instead of a CSS invert filter. Fine.
- Support chat bubble now pulses forever. It ignores the phone/OS
  "reduce motion" setting (the CSS comment says he chose this on purpose).
  Minor accessibility issue; wrap in `@media (prefers-reduced-motion: no-preference)`.
- `.codegraph/.gitignore` rewritten to ignore everything. Harmless.

## Bottom line

Don't deploy this as-is: it doesn't build. Item 1+2 is one revert of the
commented block. Item 3 is the one that actually hurts buyers on free events.
