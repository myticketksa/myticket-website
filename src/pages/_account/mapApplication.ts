type ApplicationStatus = 'pending' | 'rejected' | 'accepted'

export interface ApplicationView {
  status: ApplicationStatus
  reference: string
  submittedAt: string
  note: string
}

const VENDOR_FIXTURE: ApplicationView = {
  status: 'pending',
  reference: 'VEN-2026-0841',
  submittedAt: 'Submitted 3 Mar 2026',
  note: 'Our team is reviewing your request. You stay a guest on MyTicket — if accepted, we contact you outside the platform when a match comes up.',
}

const TALENT_FIXTURE: ApplicationView = {
  status: 'pending',
  reference: 'TAL-2026-0522',
  submittedAt: 'Submitted 1 Mar 2026',
  note: 'Our team is reviewing your request. You stay a guest on MyTicket — if accepted, we contact you outside the platform when a match comes up.',
}

function normalizeStatus(raw: unknown): ApplicationStatus {
  const value = String(raw ?? 'pending').toLowerCase()
  if (value.includes('accept') || value.includes('approve')) return 'accepted'
  if (value.includes('reject') || value.includes('declin')) return 'rejected'
  return 'pending'
}

function pickApplicationRecord(
  data: Record<string, unknown>,
  role: 'vendor' | 'talent',
): Record<string, unknown> {
  const nested = data[role] ?? data.application
  if (nested && typeof nested === 'object') return nested as Record<string, unknown>
  const type = String(data.type ?? data.role ?? '').toLowerCase()
  if (type && !type.includes(role)) return data
  return data
}

export function mapApplicationView(
  data: Record<string, unknown> | undefined,
  role: 'vendor' | 'talent',
): ApplicationView {
  const fallback = role === 'vendor' ? VENDOR_FIXTURE : TALENT_FIXTURE
  if (!data || Object.keys(data).length === 0) return fallback

  const record = pickApplicationRecord(data, role)
  const status = normalizeStatus(record.status ?? record.state ?? data.status)

  return {
    status,
    reference: String(record.reference ?? record.ref ?? record.id ?? fallback.reference),
    submittedAt: String(
      record.submitted_at ?? record.submittedAt ?? record.created_at ?? fallback.submittedAt,
    ),
    note: String(record.note ?? record.message ?? record.reason ?? fallback.note),
  }
}

export type { ApplicationStatus }
