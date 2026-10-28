# Website translation sweep — 2026-10-14

The locale files were already complete (every English key has an Arabic one).
What showed in English was text typed straight into code, plus leftover sample
data. Swept all `.tsx`/`.ts` under `src/` for hard-coded English, fixed every
hit on a page a visitor can reach. `tsc -b` + `vite build` pass; a key check
confirms all 326 translation keys used in the changed files exist in both
`en` and `ar`. Not run in a browser. Not committed or deployed.

## Fixed — hard-coded English

- **Data text built in code:** "Max N guests", "N reviews", "followers · shows",
  "Meeting point", "Closed", weekday names, "Gift from / pending / returned /
  claimed", "Row X · Seat Y", "Paid / Payment pending", "Ticket", "Card",
  "General", "Organizer", "IN N DAYS", "Order N", "General admission N",
  "Performer", "Unknown talent", "Untitled experience".
- **API values shown raw:** experience type ("attraction" / "activity");
  submission status codes ("pending" etc.) and the bilingual submission title
  (rendered as "[object Object]").
- **Wrong language picked from the API:** talent category read `name_en`
  first (English on the Arabic site); talent stage name read `stageName`
  (whichever language was typed — Arabic on the English site) instead of
  `stageNameLocalized`; same for biography.
- **Error screens:** both error pages were all English, and the route error
  page printed the raw JavaScript error to visitors ("Cannot read properties of
  undefined (reading 'isFollowing')"). Now a translated message; the error is
  still reported.
- **Error toasts:** default "Something went wrong" and the upload-too-large
  message.
- **Experience page:** "Save/Saved", "Rate this experience", "About",
  "Similar …", "Home" crumb, every toast, "Guest".
- **Search:** blurbs, "From" prices (now with the riyal mark), talent "next
  show" line, "verified", "Not applied yet".
- **Smaller:** organizer band "Follow" / "All events", sorting/view tooltips,
  claim-gift "then come back to this link", add-a-place region names, file
  count, description counter and review summary, screen-reader labels (save
  event, remove filter, loading, ticket QR, play/pause video, home logo).
- **Design-file captions on empty images** ("Event imagery 16:10", "Gallery
  thumb") removed — they showed on any card without a photo.

## Fixed — category names

Talent categories (`/talents/categories`, also the performance categories on
the talent application) come as flat `name_en` / `name_ar`. The three helpers
that turn category rows into options and labels (`mapCategoryOptions`,
`mapApiIdLabelOptions`, `mapCategoryLabel`) fell back to `name_en` only, so
the talent-type filter, the talent application form and the add-a-place form
showed English on the Arabic site. They now pick by page language
(`flatLocalizedName`). Event and experience categories send
`name: { en, ar }` and were already fine. Data check: all 22 talent, 8 event
and 17 experience categories have an Arabic name.

## Fixed — sample data that stood in for real data

- **Support:** every signed-in user with no chats saw two made-up English
  cases (a refund for "Sara", a QR problem). Now the empty state.
- **Gift a ticket:** the summary was fixed sample text for every ticket
  ("Thu 8 Oct · 20:00 · Riyadh", "Gold · Floor A · Row C · Seat 12",
  "MT-84193-2", "SAR 280.00"). Now the real order. Also: an order id not in the
  list fell back to the **first** order, so a gift could go out with the wrong
  ticket — removed; unknown id is a 404.
- **Gift deadline copy** said "until Wed 7 Oct, 20:00" (a fixed, past date).
  The API gives 30 days (`GiftTicketService`, `addDays(30)`); copy says so.
- **Add a place form** opened pre-filled with "Wadi Namar Waterfall Park",
  an English description, hours and a price — could be submitted as-is. Now
  empty. Its whole "Hours & services" step (hours, services, group size,
  price) was removed: the API stopped accepting those with the 29 Sep call
  (migration `drop_price_includes_hours_guests_from_experiences`), so the step
  only blocked submission. Category now has to be chosen.
- **Search:** while loading (or if every request failed) it showed four
  made-up English results; and three made-up "also looked for" chips. Both gone.
- **404 page:** three made-up "on tonight" events ("Oud Night with Omar
  Farouk"). Now real upcoming events, hidden when there are none; heading
  "Coming up instead".
- **Application submitted:** every applicant saw reference "APP-2026-1187".
  Removed.
- **Home featured row:** a real event with no venue/date borrowed the sample
  panel's English venue/date/rating line. Now left empty.

## Fixed — crash found on the way

- **Experience page crashed** on a fresh visit, same bug as the talent page
  fixed earlier today (read the experience before the list loaded). Now a
  loading block, then the page or a 404. Links carry the id ("12-name"), so
  places beyond the first list page open too.

## Not changed — noted

- **Experiences list shows 10 of 20.** `GET /experiences` pages at 10 and the
  website never asks for page 2; the other 10 places don't appear anywhere on
  the site. Needs paging on the list page.
- **Pages not linked from anywhere** still hold sample English: auctions,
  resell, refund request, the old seat-map checkout, maintenance.
- **Search page:** sidebar city counts and the When / Price / Good for groups
  are fake and inactive (dimmed, "not applied yet"); a search with no query
  shows "Results for riyadh season".
- **Home page** still falls back to sample events/experiences/talents when
  the API returns fewer than it needs (e.g. under 3 upcoming events).
- Fixed format hints (`you@example.com`, `+966 5X XXX XXXX`, `@handle`) and
  brand names (MyTicket, Apple Pay, OpenStreetMap) are left as-is on purpose.

## Follow-up — design-file content removed (uncommitted)

Owner: "remove every design related thing, stuff that doesn't come from api".

- **Event page:** the design file's stock photos were appended to every
  gallery and filled the thumbnails; a sample description stood in when the
  event had none. Now only the event's own photos; no description, no block.
- **Gallery (event + experience):** draws only real thumbnails; one photo
  fills the row; no empty placeholder boxes; "+N photos" only when some are
  hidden.
- **Experience page:** stock gallery photos, repeated-photo thumbnails and the
  stock "nearby" image removed.
- **Talent page:** stock avatar and stock "more talents" photos removed.
- **Home:** sample events, talents and places no longer stand in while the API
  loads or when it's empty (sections hide); stock photos removed from every
  rail; three unused sample-only sections deleted (categories, featured,
  call-to-action banner).
- **Search:** stock photos removed (neutral placeholder); fake city list with
  made-up counts replaced by real cities counted against real results; the
  fake, disabled When / Price / Good-for groups removed.
- **Events / experiences / talents lists:** category dropdown fallbacks with
  made-up ids removed.
- **Profile:** sample user stats (Riyadh, 14 attended, 3 upcoming, wallet)
  replaced by the user's real upcoming/attended counts and balance; sample
  tile badges ("3 saved", "2FA on", "2 confirmed", "Verified") removed.
- **Wallet:** sample transactions no longer stand in (empty state); unused
  sample pending/earned figures removed.
- **Settings:** the form no longer pre-fills a sample name, email and mobile
  (saving would have sent them).

Still sample-only, not linked from anywhere: auctions, resell, refund request,
old seat-map checkout, maintenance.
