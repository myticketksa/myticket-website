# Guest API Integration Guide

Guest-website only. Maps the **current** Postman file [`MyTicket API.postman_collection.json`](../../MyTicket%20API.postman_collection.json) to React guest routes in [`src/routes/router.tsx`](../../src/routes/router.tsx), filtered by [`BIG_CHANGES.md`](../../BIG_CHANGES.md).

**Status:** RTK Query endpoints are injected for guest-IN domains; priority pages are wired (auth, events list, my tickets, checkout pay, seats hold, vendor/talent apply). Catalog pages still fall back to fixtures when the API is empty/unreachable. More Postman collections will be added later — see **§0 Pending collections** for reserved slots.

| Source | Role |
|--------|------|
| Current Postman collection | Endpoint contracts documented in §4 |
| Future collections (TBD) | Fill §0 placeholders; do not invent paths |
| Guest router + pages | What the UI actually needs |
| BIG_CHANGES | Exclude marketplace, hire, Organizer/Admin/Cashier surfaces |

---

## 0. Pending collections / undone endpoints (reserved)

Additional Postman collections will be added later. Leave these rows empty until a new collection lands, then append a subsection under §4 (or a new §4.x) and move the row to Guest-IN / Gap / OUT.

| Area (UI need) | Guest routes | Status | Collection when ready | Notes |
|----------------|--------------|--------|----------------------|-------|
| Seat **hold** / release (UI) | `/events/:slug/seats` | **Mock in UI** | Current Postman has paths; UI not wired | Map prefeches `GET /seats/event/{id}`; continue still writes `sessionStorage` mock hold |
| Auctions list/detail | `/auctions`, `/auctions/:slug` | **Undone** | _paste collection name_ | Keep fixtures |
| Auction activity / bids | `/my-auction-activity` | **Undone** | | |
| Ticket resale | `/my-tickets/:id/resell` | **Undone** | | Ties to auctions |
| Refunds | `/my-tickets/:id/refund` | **Undone** | | |
| Profile GET/PATCH | `/profile`, `/settings` | **Partial** | | Login `user` + logout + delete account; **no profile PATCH** |
| Support cases CRUD | `/support`, `/support/new` | **Partial** | | Chat list substitutes for cases |
| Unified search | `/search` | **Done (compose)** | | Client-compose events + talents + experiences |
| Event slug resolution | `/events/:slug`, seats | **Done** | | Resolve numeric id from events list |
| Catalog categories | `/`, `/events`, `/talents`, `/experiences` | **Done** | | API categories with fixture fallback |
| Favorites on detail | event/experience detail | **Done** | | |
| Promo apply | `/checkout` | **Done** | | |
| _(next collection)_ | | **Undone** | | Add rows as needed |

**Probe script:** `node scripts/probe-guest-api.mjs` (requires API up). Writes `docs/api/RESPONSE-SCHEMAS.md` + `probe-results.json`.

**Rule:** if an endpoint is not in the current collection file, it stays in this table — do not stub fake RTK endpoints for it.

---

## 0.1 Integration stack (installed)

| Package | Version (approx) | Role |
|---------|------------------|------|
| `@reduxjs/toolkit` | ^2.12 | Store + RTK Query (`baseApi`) |
| `react-redux` | ^9.3 | Provider / hooks |
| `yup` | ^1.7 | Form / request validation schemas |
| `react-hook-form` | ^7.85 | Forms |
| `@hookform/resolvers` | ^5.7 | `yupResolver` bridge |

Already present in the repo: RTK + React Redux + RHF + resolvers. **Yup was installed** for this integration. Zod remains in `package.json` for any legacy use; **prefer Yup** for new API-bound forms.

Shell today: [`src/app/api/baseApi.ts`](../../src/app/api/baseApi.ts) — Bearer via `prepareHeaders`; guest-IN endpoints injected under `src/app/api/*`.

---

## 1. Purpose and scope

### In scope (this repo)

- Guest browse: Home, Events, Talents (limited), Experiences, Search (composed)
- Purchase: Seats → Checkout → Order confirmation → My tickets
- Guest account: Auth, Saved, Notifications, Wallet, Reviews, Submissions, Gift
- Vendor / Talent **submit forms** + **status** pages (guest login unchanged)
- Customer **support chat** (`channel: "support"`)
- Public advertisements (read)
- Account deletion

### Out of scope (do not integrate here)

- Organizer dashboard, venues, Cashier scan, Admin approve/reject
- Public Vendor / Organizer directories and follow/favorite for those roles
- Hire / `POST /talents/request` / role-to-role marketplace chat
- Self-serve Organizer apply (UI is office partnership CTA only)

### Current app state

- Base URL env: `VITE_API_BASE_URL` (fallback `/api` in `baseApi`)
- Postman local example: `http://localhost:8000`
- Envelope pattern from samples: `{ success, message, data }`
- Auth tokens: Sanctum-style `access_token` + `token_type: "Bearer"` on login / verify
- Data today: fixtures (`home-data`, `_guest/fixtures`, `_account/fixtures`) until wiring pass

### Collection covered by this document

Only folders present in **MyTicket API.postman_collection.json** (filtered to guest-IN in §4). When you add another `.postman_collection.json`, list it here and extend §0 / §4.

| File | Documented |
|------|------------|
| `MyTicket API.postman_collection.json` | Yes (§4 Guest-IN, §5 OUT) |
| _(future)_ | Not yet |

---

## 2. Auth model (for a future code pass)

1. **Register** → OTP **Verify Email** → receives `access_token` + `user`.
2. Or **Login** (password) / **Request Login Code** → **Verify Login Code** → same payload.
3. Persist `access_token` (e.g. memory + `localStorage` / httpOnly cookie strategy — decide in code pass).
4. Attach `Authorization: Bearer <access_token>` on authenticated calls via `fetchBaseQuery` `prepareHeaders`.
5. **Logout** invalidates the token server-side; clear client store.

**Auth required (assume Bearer)** for: logout, orders list/detail/pay/cancel/promo, favorites, wallet, applications get/submit, notifications, gift tickets, my submissions, reviews list, chat, account deletion, seat hold/release, create order, experience create.

**Typically public:** event/talent/experience catalogs and details, categories, generals (cities/services), public ads list, register/login/forgot flows.

> Postman does not mark every request with Bearer auth. Treat “guest-owned” mutations and account reads as authenticated even when the collection omits the header.

**Login / verify response shape (from Postman examples):**

```json
{
  "success": true,
  "message": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "966555555555",
      "role": "guest",
      "emailVerified": true,
      "created_at": "2026-08-18T14:19:01.000000Z"
    },
    "access_token": "3|…",
    "token_type": "Bearer"
  }
}
```

Guest product expects `role: "guest"` only. Vendor/Talent acceptance does **not** change login role.

---

## 3. Route → API needs matrix

| Route | Page | Needs API? | Primary endpoints | Priority |
|-------|------|------------|-------------------|----------|
| `/` | Home | Yes (fixtures today) | Events list, talents list, experiences list, ads | P1 |
| `/events`, `/events/:slug` | Events catalog/detail | Yes | `/tickets/categories`, `/tickets/events`, `/tickets/events/{id}` | P0 |
| `/events/:slug/seats` | Seat map | Yes | `/seats/event/{id}`, hold, release | P0 |
| `/checkout` | Checkout | Yes | Create order, promo, pay | P0 |
| `/order-confirmation` | Confirmation | Yes | Get order details | P0 |
| `/search` | Search | Partial | Compose events + talents + experiences (no dedicated search) | P2 |
| `/talents`, `/talents/:slug` | Limited talent | Yes | `/talents`, `/talents/{id}`, categories, previous-works, follow | P1 |
| `/experiences`, `/experiences/:slug` | Experiences | Yes | experiences CRUD reads + reviews + favorite | P1 |
| `/auctions`, `/auctions/:slug` | Auctions | **Gap** | None in Postman | Blocked |
| `/sign-in`, `/register`, `/reset-password` | Auth | Yes | Auth folder | P0 |
| `/profile`, `/settings` | Account | Partial | Login `user` only; delete account; **no profile PATCH** | P2 / Gap |
| `/my-tickets`, `/my-tickets/:id` | Tickets | Yes | List/get orders | P0 |
| `/my-tickets/:id/gift` | Gift | Yes | Gift tickets | P1 |
| `/my-tickets/:id/resell` | Resell | **Gap** | None | Blocked |
| `/my-tickets/:id/refund` | Refund | **Gap** | None | Blocked |
| `/saved` | Favorites | Yes | Event + experience favorites | P1 |
| `/notifications` | Notifications | Yes | Notifications folder | P1 |
| `/wallet` | Wallet | Yes | `/wallet`, topup | P1 |
| `/my-reviews` | Reviews | Yes | `/reviews` | P1 |
| `/my-submissions` | Experience submissions | Yes | `/experiences/my-submissions` | P1 |
| `/my-vendor-application`, `/my-talent-application` | Application status | Yes | `GET /applications` | P1 |
| `/my-auction-activity` | Auction activity | **Gap** | None | Blocked |
| `/apply/vendor`, `/apply/talent` | Apply wizards | Yes | `POST /applications/vendor\|talent` + generals | P1 |
| `/apply/organizer` | Office CTA | **No** | Do not call Organizer Apply | — |
| `/submit-experience` | Submit place | Yes | `POST /experiences` + categories/cities | P1 |
| `/application-submitted` | Confirmation | No | Static | — |
| `/become-business`, `/for-*`, `/about`, `/help`, `/legal` | Marketing | No | Static | — |
| `/support` | Cases list | **Gap** | No case list API | Blocked |
| `/support/new` | New case | **Gap** | No case create; chat may substitute | Blocked / P2 |
| `/support/chat` | Support chat | Yes | `/chats*` with `channel: "support"` | P2 |
| `/maintenance`, `*` | System | No | Static | — |

---

## 4. Guest-IN endpoints (detail)

Paths are relative to `{baseUrl}`. Prefer parameterized paths (`{eventId}`) over hardcoded Postman sample IDs (`9`, `11`, etc.).

### 4.1 Auth — Postman folder `Auth`

| Method | Path | Auth | Body | Guest routes | Notes |
|--------|------|------|------|--------------|-------|
| `POST` | `/auth/register` | Public | JSON: `name`, `email`, `phone`, `password` | `/register` | Sample: `{ success, data: [] }` then verify |
| `POST` | `/auth/register/verify-email` | Public | JSON: `email`, `code` | `/register` | Returns `user` + `access_token` |
| `POST` | `/auth/login` | Public | JSON: `identifier`, `password` | `/sign-in` | Email or phone in `identifier` |
| `POST` | `/auth/login/password/forgot` | Public | JSON: `email` | `/reset-password` | |
| `POST` | `/auth/login/password/reset` | Public | JSON: `code`, `email`, `password`, `password_confirmation` | `/reset-password` | |
| `POST` | `/auth/login/code/request` | Public | JSON: `identifier` | `/sign-in` (OTP path) | |
| `POST` | `/auth/login/code/verify` | Public | JSON: `identifier`, `code` | `/sign-in` | Returns `user` + `access_token` |
| `POST` | `/auth/logout` | Bearer | — | Settings / header | |

### 4.2 Ticketing — `Ticketing flow (Used by the default user)`

| Method | Path | Auth | Body / notes | Guest routes |
|--------|------|------|--------------|--------------|
| `GET` | `/tickets/categories` | Public | — | `/events`, Home categories |
| `GET` | `/tickets/events` | Public | Filters TBD (collection shows bare list) | `/`, `/events`, `/search` |
| `GET` | `/tickets/events/{eventId}` | Public | App uses slug in URL — resolve id via list or slug field if API adds one | `/events/:slug` |
| `POST` | `/tickets/events/{eventId}/orders` | Auth | See create-order body below | `/checkout` |
| `PUT` | `/tickets/orders/{orderId}/cancel` | Auth | — | Checkout / tickets |
| `POST` | `/tickets/orders/pay` | Auth | `{ orderId, brand: "CREDIT" \| "WALLET" }` | `/checkout` |
| `GET` | `/tickets/orders` | Auth | — | `/my-tickets` |
| `GET` | `/tickets/orders/{orderId}` | Auth | — | `/my-tickets/:id`, `/order-confirmation` |
| `POST` | `/tickets/orders/promo/apply` | Auth | `{ orderId, promoCode }` | `/checkout` |

**Create order body (from Postman comments):**

```json
{
  "items": [{ "ticketId": 32, "quantity": 2 }],
  "beneficiaries": [
    { "quantity_id": 1, "name": "Mohamed" },
    { "quantity_id": 2, "name": "Ahmed" }
  ]
}
```

Optional / seated: `ticketId`, `quantity`, `seatIds`, `holdId` (required for assigned seating after hold).

### 4.3 Seat map — `Seat Map`

| Method | Path | Auth | Body | Guest routes |
|--------|------|------|------|--------------|
| `GET` | `/seats/event/{eventId}` | Auth* | — | `/events/:slug/seats` |
| `POST` | `/seats/event/{eventId}/hold` | Auth | `{ seatIds: number[], ticketId: number }` | Seat selection |
| `POST` | `/seats/event/{eventId}/release` | Auth | `{ holdId: string }` | Leaving seats / timeout |

\*Treat as authenticated; holding seats is guest-session sensitive.

### 4.4 Favorites (events) — `Favorites`

| Method | Path | Auth | Guest routes |
|--------|------|------|--------------|
| `POST` | `/favorites/{eventId}` | Auth | Heart on event cards; `/saved` |
| `GET` | `/favorites` | Auth | `/saved` |
| `DELETE` | `/favorites/{eventId}` | Auth | `/saved` |

### 4.5 Talents (limited public) — `Talents (Used by the default user)`

**IN for guest browse only.** UI must show limited fields (avatar, name, craft/type, rating) per BIG_CHANGES — even if the API returns more.

| Method | Path | Auth | Guest routes | Notes |
|--------|------|------|--------------|-------|
| `GET` | `/talents/categories` | Public | `/talents` filters | |
| `GET` | `/talents` | Public | `/talents`, Home | Collection sample query messy (`filters[in]=1` duplicated) — confirm filter contract with backend |
| `GET` | `/talents/{talentId}` | Public | `/talents/:slug` | Strip hire CTAs in UI |
| `GET` | `/talents/{talentId}/previous-works` | Public | Talent detail | Optional gallery |
| `GET` | `/talents/previous-works` | Public | Optional Home strip | |
| `POST` | `/talents/{talentId}/follow` | Auth | Talent detail | OK (not hire) |
| `POST` | `/talents/{talentId}/unfollow` | Auth | Talent detail | |

**OUT:** `POST /talents/request` (hire) — see §5.  
**OUT:** `POST /talents/{id}/events/{eventId}` (Admin assign) — see §5.

### 4.6 Wallet — `Wallet (Used by the default user)`

| Method | Path | Auth | Body | Guest routes |
|--------|------|------|------|--------------|
| `GET` | `/wallet` | Auth | — | `/wallet` |
| `POST` | `/wallet/topup` | Auth | `{ amount, paymentMethod: "CREDIT" }` | `/wallet` |

### 4.7 Business applications (guest forms) — `Business Role Applications`

| Method | Path | Auth | Content-Type | Guest routes |
|--------|------|------|--------------|--------------|
| `POST` | `/applications/talent` | Auth | `multipart/form-data` | `/apply/talent` → `/application-submitted` |
| `POST` | `/applications/vendor` | Auth | `multipart/form-data` | `/apply/vendor` → `/application-submitted` |
| `GET` | `/applications` | Auth | — | `/my-talent-application`, `/my-vendor-application` |

**OUT:** `POST /applications/organizer` — guest UI is office contact only (`/apply/organizer`, `/for-organizers`).

#### Talent apply multipart keys

| Key | Type | Purpose |
|-----|------|---------|
| `performer[stageName]` | text | Stage name |
| `performer[profilePhoto]` | file | Photo |
| `performer[biography]` | text | Bio |
| `performer[homeCity]` | text | City id (from generals) |
| `portfolio[media][]` | file (repeat) | Portfolio |
| `categories[performanceCategories][]` | text (repeat) | Category ids |

#### Vendor apply multipart keys

| Key | Type | Purpose |
|-----|------|---------|
| `business[tradeName]` | text | Trading name |
| `business[CRnumber]` | text | CR number |
| `business[primaryCity]` | text | City id |
| `business[address]` | text | Address |
| `business[logo]` | file | Logo |
| `business[personalPhoto]` | file | Contact photo |
| `service[name]` | text | Service title |
| `service[description]` | text | Service story |

> Align wizard fields in `ApplyTalentPage` / `ApplyVendorPage` to these keys in the code pass (current UI fields are product-shaped stubs).

### 4.8 Generals — lookup lists

| Method | Path | Auth | Used by |
|--------|------|------|---------|
| `GET` | `/generals/cities` | Public | Apply wizards, experience submit, filters |
| `GET` | `/generals/offered-services` | Public | Vendor apply services |
| `GET` | `/generals/performance-categories` | Public | Talent apply categories |

### 4.9 Experiences — `Experiences`

| Method | Path | Auth | Body | Guest routes |
|--------|------|------|------|--------------|
| `GET` | `/experiences/categories` | Public | — | `/experiences` |
| `GET` | `/experiences` | Public | — | `/`, `/experiences`, `/search` |
| `GET` | `/experiences/{experienceId}` | Public | — | `/experiences/:slug` |
| `GET` | `/experiences/{experienceId}/reviews` | Public | — | Experience detail |
| `POST` | `/experiences` | Auth | multipart (below) | `/submit-experience` |
| `GET` | `/experiences/my-submissions` | Auth | — | `/my-submissions` |
| `POST` | `/experiences/{id}/favorite` | Auth | — | `/saved`, hearts |
| `DELETE` | `/experiences/{id}/favorite` | Auth | — | `/saved` |

#### Create experience multipart keys (Postman)

`category`, `type` (`activity`, …),  
`place[name_en]`, `place[name_ar]`, `place[latitude]`, `place[longitude]`, `place[region]`, `place[city]`, `place[about_en]`, `place[about_ar]`,  
`hours[0][dayOfWeek]`, `hours[0][open]`, `hours[0][close]`, `hours[0][isClosed]`,  
`services[]` (repeat),  
`contacts[email]`, `contacts[phone]`, `contacts[website]`, `contacts[instagram]`,  
`photos[cover]`, `photos[banner]`, `photos[gallery][]`,  
`maxGuests`, `price`.

### 4.10 Notifications

| Method | Path | Auth | Guest routes |
|--------|------|------|--------------|
| `GET` | `/notifications/categories` | Auth | `/notifications` filter chips |
| `GET` | `/notifications` | Auth | `/notifications` |
| `POST` | `/notifications/{id}/read` | Auth | Mark one |
| `POST` | `/notifications/read/all` | Auth | Mark all |

### 4.11 Gift tickets

| Method | Path | Auth | Body / notes | Guest routes |
|--------|------|------|--------------|--------------|
| `POST` | `/gift-tickets` | Auth | `{ orderId, ticketIds, recipientIdentifier, note? }` | `/my-tickets/:id/gift` |
| `GET` | `/gift-tickets` | Auth | Sender vs recipient distinguished by token/session (two Postman requests, same path) | Account / gift inbox if added |
| `GET` | `/gift-tickets/{giftTicketId}` | Auth | Recipient detail | Claim flow |
| `POST` | `/gift-tickets/{giftTicketId}` | Auth | `{ claim_token }` | Claim |

### 4.12 Reviews

| Method | Path | Auth | Body | Guest routes |
|--------|------|------|------|--------------|
| `POST` | `/reviews` | Auth* | `{ type: "event"\|"experience"\|"vendor"\|"talent", id, rating, name, review?, comment? }` | `/my-reviews`, detail CTAs |
| `GET` | `/reviews` | Auth | My reviews | `/my-reviews` |

\*Collection marks Submit as `noauth`; prefer authenticated guest for product consistency.  
**Do not** use `type: "vendor"` for marketplace UX — vendor public reviews are out of guest product scope. Prefer `event` / `experience` / limited `talent`.

### 4.13 Support chat — `Chat`

BIG_CHANGES “exclude chat” = **role-to-role hire chat**. Customer support remains in-scope.

| Method | Path | Auth | Body | Guest routes |
|--------|------|------|------|--------------|
| `GET` | `/chats` | Auth | — | `/support/chat` |
| `POST` | `/chats/send` | Auth | `{ chatId?, channel: "support", message }` | `/support/chat` |
| `GET` | `/chats/{chatId}` | Auth | Messages | `/support/chat` |
| `PUT` | `/chats/read` | Auth | Mark read | `/support/chat` |

Postman note: **currently only `channel: "support"` is supported**.

### 4.14 Advertisements (public read)

| Method | Path | Auth | Guest routes |
|--------|------|------|--------------|
| `GET` | `/advertisements` | Public | Home / promo bands |

**OUT:** Admin CRUD under Advertisements → Admin folder (§5).

### 4.15 Account deletion

| Method | Path | Auth | Body | Guest routes |
|--------|------|------|------|--------------|
| `DELETE` | `/account-deletion` | Auth | `{ password }` (form/json per collection) | `/settings` |

---

## 5. Guest-OUT endpoints (do not wire in this repo)

| Postman area | Method / path | Reason |
|--------------|---------------|--------|
| Cashier | `POST /cashier/events/scan` | Cashier / Organizer ops app |
| Organizer | `/organizer/category`, `/organizer/venue`, `/organizer/event*` | Organizer dashboard; venues excluded |
| Admin | `/admin/applications*` | Admin only |
| Advertisements Admin | POST/PUT/DELETE `/advertisements*` | Admin only |
| Vendors directory | `GET /vendors*`, favorite | Marketplace removed |
| Organizers directory | `GET /organizers*`, follow | Marketplace / role visibility removed |
| Talents Admin | `POST /talents/{id}/events/{eventId}` | Admin assign |
| Hire | `POST /talents/request` | Hire marketplace excluded |
| Organizer Apply | `POST /applications/organizer` | Office contract; guest page is CTA only |

---

## 6. Gaps — UI exists, current Postman has no match

These stay in **§0 Pending** until a new collection documents them. Do not invent clients.

| UI | Gap | Suggested interim |
|----|-----|-------------------|
| `/auctions`, `/auctions/:slug`, `/my-auction-activity`, resell | No auction/resale APIs | Keep fixtures; block “live” wiring |
| `/my-tickets/:id/refund` | No refund endpoint | Fixtures / disable submit until API exists |
| `/profile`, `/settings` (edit profile, prefs) | No GET/PATCH profile beyond login `user` | Display login user; queue backend profile API |
| `/support`, `/support/new` | No support-case list/create | Point users to `/support/chat` or keep fixtures |
| `/search` | No unified search | Client-compose list endpoints with query params if backend adds them |
| Event URL slugs | API uses numeric `{eventId}` | Mapping layer: slug↔id once API exposes slug, or use id in routes temporarily |

Ask backend / wait for the next collection before a full “remove fixtures” milestone.

---

## 7. Static surfaces (no API)

`/about`, `/help`, `/legal`, `/for-vendors`, `/for-organizers`, `/for-talents`, `/become-business`, `/apply/organizer`, `/application-submitted`, `/maintenance`, `404`, marketing copy on Home below data sections.

---

## 8. Suggested future RTK layout (not implemented)

Keep a single [`baseApi`](../../src/app/api/baseApi.ts); inject domain slices. Validate request payloads with **Yup** (+ `yupResolver` on React Hook Form) before mutations.

| Module file (proposed) | Endpoints | Existing `tagTypes` |
|------------------------|-----------|---------------------|
| `authApi` | register, verify, login, OTP, logout, forgot/reset | `User` |
| `eventsApi` | categories, events, event detail | `Event` |
| `ordersApi` | create, pay, cancel, list, detail, promo | `Order`, `Ticket` |
| `seatsApi` | seats, hold, release | `Event` |
| `talentsApi` | list, detail, categories, works, follow | `Talent` |
| `experiencesApi` | catalog, detail, reviews, create, submissions, favorite | `Experience` |
| `favoritesApi` | event favorites | `Event` |
| `walletApi` | wallet, topup | `User` |
| `applicationsApi` | talent/vendor apply, get mine | `User` |
| `notificationsApi` | list, read | `Notification` |
| `giftTicketsApi` | send, list, claim | `Ticket` |
| `reviewsApi` | submit, mine | `Review` |
| `chatApi` | chats, send, messages | `SupportCase` |
| `generalsApi` | cities, services, performance categories | — |
| `adsApi` | get advertisements | — |
| `auctionsApi` _(placeholder)_ | _from future collection_ | `Auction` |

Remove unused tags when wiring: `Vendor`, `Organizer` (marketplace OUT). Keep `Auction` / `SupportCase` reserved for §0 rows.

---

## 9. Next code pass checklist (do not run until approved)

1. Confirm `VITE_API_BASE_URL` (e.g. `http://localhost:8000`) and CORS.
2. Implement token storage + `prepareHeaders` on `baseApi`.
3. Add Yup schemas for auth + checkout + apply forms; wire via `@hookform/resolvers/yup`.
4. Inject **Auth + Events + Orders + Seats** first (purchase path).
5. Then Favorites, Wallet, Notifications, Gift, Reviews.
6. Then Applications (multipart) + Generals + Experience submit.
7. Limited Talents + Experiences catalog.
8. Support chat last.
9. Leave §0 Gaps on fixtures; do not invent auction/refund clients.
10. When a new Postman collection arrives: update §0 → §4, then inject matching APIs only.
11. Replace fixtures page-by-page; keep loading/empty/error states in UI tokens.
12. Re-run `tsc` and smoke purchase + apply flows.

---

## 10. Source index

| Artifact | Path |
|----------|------|
| Postman collection (current) | `MyTicket API.postman_collection.json` |
| This guide | `docs/api/GUEST-API-INTEGRATION.md` |
| RTK shell | `src/app/api/baseApi.ts` |
| Routes | `src/routes/router.tsx` |
| Product rules | `BIG_CHANGES.md` |
| Fixtures (current data) | `src/pages/home/home-data.ts`, `src/pages/_guest/fixtures.ts`, `src/pages/_account/fixtures.ts` |

---

*Update this file when Postman collections or product scope change. Fill §0 first for new APIs. Page wiring requires explicit approval.*
