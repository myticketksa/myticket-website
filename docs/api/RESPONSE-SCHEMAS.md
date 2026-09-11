# Guest API response schemas (probed)

Base URL: `https://api.myticket.sa/api/v1`
Probed at: 2026-09-10T15:46:07.513Z

Soft seat hold is wired when seat ids are pure numeric and `ticketId` is known; fixture seat maps still use a local mock hold.

| Endpoint | Status | Shape |
|----------|--------|-------|
| POST `/auth/login` (Login) | 200 | `{ success: boolean; message: string; data: { user: { id: number; name: string; email: string; phone: string; role: string; emailVerified: boolean; walletBalance: number; created_at` |
| GET `/tickets/categories` (List Categories) | 200 | `{ success: boolean; message: string; data: array<{ id: number; name: { en: string; ar: string }; slug: string; icon: null; created_at: string }> }` |
| GET `/tickets/events` (List Events) | 200 | `{ success: boolean; message: string; data: array<{ id: number; title: { en: string; ar: string }; short_description: { en: string; ar: string }; slug: string; startTime: string; ra` |
| GET `/tickets/events/23` (Get Event Details) | 200 | `{ success: boolean; message: string; data: { id: number; title: { en: string; ar: string }; short_description: { en: string; ar: string }; slug: string; startTime: string; raters: ` |
| GET `/tickets/orders` (List Orders) | 200 | `{ success: boolean; message: string; data: array(empty); pagination: { total: number; count: number; perPage: number; currentPage: number; totalPages: number } }` |
| GET `/tickets/orders/{orderId}` (Get Order Details) | skipped | No orderId discovered yet |
| GET `/favorites` (Get Favorites) | 200 | `{ success: boolean; message: string; data: array(empty) }` |
| GET `/talents/categories` (Talent Categories) | 200 | `{ success: boolean; message: string; data: array<{ id: number; name_en: string; name_ar: string }> }` |
| GET `/talents` (List Talents) | 200 | `{ success: boolean; message: string; data: array<{ id: number; performer: { stageName: string; profilePhoto: string; biography: null; homeCity: { id: number; slug: string; name: ob` |
| GET `/talents/11` (Talent Details) | 200 | `{ success: boolean; message: string; data: { id: number; performer: { stageName: string; profilePhoto: string; biography: string; homeCity: { id: number; slug: string; name: { en: ` |
| GET `/talents/11/previous-works` (Talent Previous Works) | 200 | `{ success: boolean; message: string; data: array<string> }` |
| GET `/wallet` (Wallet) | 200 | `{ success: boolean; message: string; data: array<{ transaction_type: string; amount: string; created_at: string }>; pagination: { total: number; count: number; perPage: number; cur` |
| GET `/seats/event/23` (Get Event Seats) | 200 | `{ success: boolean; message: string; data: array(empty) }` |
| POST `/seats/event/{eventId}/hold` (Hold Seat) | skipped | SKIPPED in probe — UI soft-holds when seat ids are pure numeric |
| GET `/generals/cities` (Cities) | 200 | `{ success: boolean; message: string; data: array<{ id: number; slug: string; name: { en: string; ar: string } }> }` |
| GET `/generals/offered-services` (Offered Services) | 200 | `{ success: boolean; message: string; data: array<{ id: number; name_en: string; name_ar: null }> }` |
| GET `/generals/performance-categories` (Performance Categories) | 200 | `{ success: boolean; message: string; data: array<{ id: number; name_en: string; name_ar: string }> }` |
| GET `/notifications/categories` (Notification Categories) | 200 | `{ success: boolean; message: string; data: array<{ id: number; name_en: string; name_ar: null; notifications_count: number }> }` |
| GET `/notifications` (Notifications) | 200 | `{ success: boolean; message: string; data: array<{ id: number; type: string; title: string; message: string; is_read: boolean; created_at: string }>; pagination: { total: number; c` |
| GET `/experiences/categories` (Experience Categories) | 200 | `{ success: boolean; message: string; data: array<{ id: number; name: { en: string; ar: string }; slug: string; icon: string; created_at: string }> }` |
| GET `/experiences` (List Experiences) | 200 | `{ success: boolean; message: string; data: array<{ id: number; title: { en: string; ar: string }; about: { en: null; ar: null }; includes: { en: null; ar: null }; slug: null; type:` |
| GET `/experiences/1` (Experience Details) | 200 | `{ success: boolean; message: string; data: { id: number; title: { en: string; ar: string }; about: { en: string; ar: string }; includes: { en: string; ar: string }; slug: string; t` |
| GET `/experiences/my-submissions` (My Submissions) | 200 | `{ success: boolean; message: string; data: array(empty); pagination: { total: number; count: number; perPage: number; currentPage: number; totalPages: number } }` |
| GET `/applications` (My Application) | 200 | `{ success: boolean; message: string; data: { type: string; application: { id: number; publicPresence: { publicName: string; logo: string; biography: string; website: string; instag` |
| GET `/reviews` (My Reviews) | 200 | `{ data: array(empty); links: { first: string; last: string; prev: null; next: null }; meta: { current_page: number; from: null; last_page: number; links: array<{ url: null; label: ` |
| GET `/gift-tickets` (Gift Tickets) | 200 | `{ success: boolean; message: string; data: array(empty) }` |
| GET `/chats` (Chats) | 200 | `{ success: boolean; message: string; data: array(empty); pagination: { total: number; count: number; perPage: number; currentPage: number; totalPages: number } }` |
| GET `/advertisements` (Advertisements) | 200 | `{ success: boolean; message: string; data: array<{ id: number; title: string; description: string; image: string; video: null }>; pagination: { total: number; count: number; perPag` |

Full samples: [`probe-results.json`](./probe-results.json)
