# Guest API response schemas

> **Live probe status:** `http://localhost:8000` was unreachable when last attempted.
> Run `npm run probe:api` (or `VITE_API_BASE_URL=… npm run probe:api`) once the backend is up.
> That overwrites this file and writes `probe-results.json` with full samples.

## Auth (from Postman saved examples)

### `POST /auth/login` / verify-email / verify-login-code

```ts
{
  success: boolean
  message: string
  data: {
    user: {
      id: number
      name: string
      email: string
      phone: string
      role: 'guest' | string
      emailVerified: boolean
      created_at: string // ISO
    }
    access_token: string
    token_type: 'Bearer'
  }
}
```

### `POST /auth/register` | forgot | reset | request-code

```ts
{ success: boolean, message: string, data: [] | unknown }
```

### `POST /auth/logout`

```ts
{ success: boolean, message: string, data: string } // e.g. "Logged out successfully"
```

## Seat hold

**UI keeps mock hold** (`sessionStorage.myticket.mockHold`). Do not wire `POST /seats/event/{id}/hold` in SeatSelectionPage until this section is filled by a successful probe.

## Other guest-IN endpoints

_No saved Postman bodies._ After probe, rows appear here automatically.

| Endpoint | Status | Shape |
|----------|--------|-------|
| GET `/tickets/events` | awaiting probe | |
| GET `/tickets/events/{id}` | awaiting probe | |
| GET `/tickets/orders` | awaiting probe | |
| GET `/talents` | awaiting probe | |
| GET `/experiences` | awaiting probe | |
| GET `/favorites` | awaiting probe | |
| GET `/wallet` | awaiting probe | |
| GET `/notifications` | awaiting probe | |
| GET `/applications` | awaiting probe | |
| GET `/chats` | awaiting probe | |
| … | | |

## Integration rule

Pages use RTK hooks with **fixture fallback** until probe confirms shapes; mappers accept flexible `Record<string, unknown>` keys.
