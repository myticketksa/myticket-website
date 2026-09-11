#!/usr/bin/env node
/**
 * Probe guest-IN Postman endpoints and dump response schemas.
 *
 * Usage:
 *   node scripts/probe-guest-api.mjs
 *   VITE_API_BASE_URL=https://staging.example.com node scripts/probe-guest-api.mjs
 *
 * Loads `.env` from the repo root when present (VITE_API_BASE_URL).
 *
 * Credentials (override with env):
 *   API_IDENTIFIER / API_PASSWORD
 *
 * Writes:
 *   docs/api/probe-results.json
 *   docs/api/RESPONSE-SCHEMAS.md  (summary)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

/** Minimal `.env` loader — only sets keys that are not already in process.env. */
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  const text = readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvFile(join(root, '.env'))

const baseUrl = (
  process.env.VITE_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:8000'
).replace(/\/$/, '')
const identifier = process.env.API_IDENTIFIER || 'mohamedelhaj.career@gmail.com'
const password = process.env.API_PASSWORD || 'password123'

/** @type {{ name: string, method: string, path: string, auth?: boolean, body?: unknown, skip?: boolean, note?: string }[]} */
const ENDPOINTS = [
  { name: 'List Categories', method: 'GET', path: '/tickets/categories' },
  { name: 'List Events', method: 'GET', path: '/tickets/events' },
  { name: 'Get Event Details', method: 'GET', path: '/tickets/events/{eventId}', auth: false },
  { name: 'List Orders', method: 'GET', path: '/tickets/orders', auth: true },
  { name: 'Get Order Details', method: 'GET', path: '/tickets/orders/{orderId}', auth: true },
  { name: 'Get Favorites', method: 'GET', path: '/favorites', auth: true },
  { name: 'Talent Categories', method: 'GET', path: '/talents/categories' },
  { name: 'List Talents', method: 'GET', path: '/talents' },
  { name: 'Talent Details', method: 'GET', path: '/talents/{talentId}' },
  { name: 'Talent Previous Works', method: 'GET', path: '/talents/{talentId}/previous-works' },
  { name: 'Wallet', method: 'GET', path: '/wallet', auth: true },
  {
    name: 'Get Event Seats',
    method: 'GET',
    path: '/seats/event/{eventId}',
    auth: true,
    note: 'Prefetch in UI; map still fixture until overlay is mapped',
  },
  {
    name: 'Hold Seat',
    method: 'POST',
    path: '/seats/event/{eventId}/hold',
    auth: true,
    skip: true,
    note: 'SKIPPED in probe — UI soft-holds when seat ids are pure numeric',
  },
  { name: 'Cities', method: 'GET', path: '/generals/cities', auth: true },
  { name: 'Offered Services', method: 'GET', path: '/generals/offered-services', auth: true },
  { name: 'Performance Categories', method: 'GET', path: '/generals/performance-categories', auth: true },
  { name: 'Notification Categories', method: 'GET', path: '/notifications/categories', auth: true },
  { name: 'Notifications', method: 'GET', path: '/notifications', auth: true },
  { name: 'Experience Categories', method: 'GET', path: '/experiences/categories' },
  { name: 'List Experiences', method: 'GET', path: '/experiences' },
  { name: 'Experience Details', method: 'GET', path: '/experiences/{experienceId}' },
  { name: 'My Submissions', method: 'GET', path: '/experiences/my-submissions', auth: true },
  { name: 'My Application', method: 'GET', path: '/applications', auth: true },
  { name: 'My Reviews', method: 'GET', path: '/reviews', auth: true },
  { name: 'Gift Tickets', method: 'GET', path: '/gift-tickets', auth: true },
  { name: 'Chats', method: 'GET', path: '/chats', auth: true },
  { name: 'Advertisements', method: 'GET', path: '/advertisements' },
]

function shapeOf(value, depth = 0) {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'array(empty)'
    return `array<${shapeOf(value[0], depth + 1)}>`
  }
  if (typeof value !== 'object') return typeof value
  if (depth > 4) return 'object'
  const entries = Object.entries(value).map(([k, v]) => `${k}: ${shapeOf(v, depth + 1)}`)
  return `{ ${entries.join('; ')} }`
}

function pickId(list, keys = ['id']) {
  if (!Array.isArray(list) || list.length === 0) return null
  const row = list[0]
  for (const key of keys) {
    if (row && row[key] != null) return row[key]
  }
  return null
}

function unwrapData(json) {
  if (json && typeof json === 'object' && 'data' in json) return json.data
  return json
}

async function request(method, path, { token, body } = {}) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { _raw: text.slice(0, 500) }
  }
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 4000) }
}

async function main() {
  console.log(`Probing ${baseUrl}`)
  const health = await fetch(baseUrl, { method: 'GET' }).catch((err) => ({ error: err }))
  if (health?.error) {
    console.error(`API unreachable at ${baseUrl}`)
    console.error(String(health.error.message || health.error))
    console.error('\nStart the backend or set VITE_API_BASE_URL / API_BASE_URL, then re-run.')
    process.exit(1)
  }

  const login = await request('POST', '/auth/login', {
    body: { identifier, password },
  })
  if (!login.ok) {
    console.error('Login failed', login.status, login.text)
    process.exit(1)
  }
  const session = unwrapData(login.json)
  const token = session?.access_token
  if (!token) {
    console.error('No access_token in login response', login.json)
    process.exit(1)
  }
  console.log('Logged in as', session?.user?.email || session?.user?.name || 'user')

  const ids = { eventId: null, talentId: null, experienceId: null, orderId: null }

  const results = [
    {
      name: 'Login',
      method: 'POST',
      path: '/auth/login',
      status: login.status,
      shape: shapeOf(login.json),
      sample: login.json,
    },
  ]

  for (const ep of ENDPOINTS) {
    if (ep.skip) {
      results.push({
        name: ep.name,
        method: ep.method,
        path: ep.path,
        skipped: true,
        note: ep.note,
      })
      continue
    }

    let path = ep.path
    if (path.includes('{eventId}')) {
      if (!ids.eventId) {
        results.push({
          name: ep.name,
          method: ep.method,
          path: ep.path,
          skipped: true,
          note: 'No eventId discovered yet',
        })
        continue
      }
      path = path.replace('{eventId}', String(ids.eventId))
    }
    if (path.includes('{talentId}')) {
      if (!ids.talentId) {
        results.push({
          name: ep.name,
          method: ep.method,
          path: ep.path,
          skipped: true,
          note: 'No talentId discovered yet',
        })
        continue
      }
      path = path.replace('{talentId}', String(ids.talentId))
    }
    if (path.includes('{experienceId}')) {
      if (!ids.experienceId) {
        results.push({
          name: ep.name,
          method: ep.method,
          path: ep.path,
          skipped: true,
          note: 'No experienceId discovered yet',
        })
        continue
      }
      path = path.replace('{experienceId}', String(ids.experienceId))
    }
    if (path.includes('{orderId}')) {
      if (!ids.orderId) {
        results.push({
          name: ep.name,
          method: ep.method,
          path: ep.path,
          skipped: true,
          note: 'No orderId discovered yet',
        })
        continue
      }
      path = path.replace('{orderId}', String(ids.orderId))
    }

    const res = await request(ep.method, path, { token: ep.auth ? token : undefined })
    const data = unwrapData(res.json)

    if (ep.path === '/tickets/events' && Array.isArray(data)) ids.eventId = pickId(data)
    if (ep.path === '/tickets/events' && data && typeof data === 'object' && !Array.isArray(data)) {
      const list = data.items || data.events || data.data
      if (Array.isArray(list)) ids.eventId = pickId(list)
    }
    if (ep.path === '/talents') {
      const list = Array.isArray(data) ? data : data?.items || data?.talents
      if (Array.isArray(list)) ids.talentId = pickId(list)
    }
    if (ep.path === '/experiences') {
      const list = Array.isArray(data) ? data : data?.items || data?.experiences
      if (Array.isArray(list)) ids.experienceId = pickId(list)
    }
    if (ep.path === '/tickets/orders') {
      const list = Array.isArray(data) ? data : data?.items || data?.orders
      if (Array.isArray(list)) ids.orderId = pickId(list)
    }

    results.push({
      name: ep.name,
      method: ep.method,
      path,
      status: res.status,
      ok: res.ok,
      note: ep.note,
      shape: shapeOf(res.json),
      sample: res.json,
    })
    console.log(`${res.status} ${ep.method} ${path}`)
  }

  mkdirSync(join(root, 'docs/api'), { recursive: true })
  writeFileSync(join(root, 'docs/api/probe-results.json'), JSON.stringify({ baseUrl, ids, results }, null, 2))

  const md = [
    '# Guest API response schemas (probed)',
    '',
    `Base URL: \`${baseUrl}\``,
    `Probed at: ${new Date().toISOString()}`,
    '',
    'Soft seat hold is wired when seat ids are pure numeric and `ticketId` is known; fixture seat maps still use a local mock hold.',
    '',
    '| Endpoint | Status | Shape |',
    '|----------|--------|-------|',
    ...results.map((r) => {
      if (r.skipped) return `| ${r.method} \`${r.path}\` (${r.name}) | skipped | ${r.note || ''} |`
      return `| ${r.method} \`${r.path}\` (${r.name}) | ${r.status} | \`${String(r.shape).replace(/\|/g, '\\|').slice(0, 180)}\` |`
    }),
    '',
    'Full samples: [`probe-results.json`](./probe-results.json)',
    '',
  ].join('\n')

  writeFileSync(join(root, 'docs/api/RESPONSE-SCHEMAS.md'), md)
  console.log('\nWrote docs/api/probe-results.json and docs/api/RESPONSE-SCHEMAS.md')
  console.log('Discovered ids', ids)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
