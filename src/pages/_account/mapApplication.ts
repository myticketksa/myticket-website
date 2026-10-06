type ApplicationStatus = 'pending' | 'rejected' | 'accepted'

export interface ApplicationView {
  status: ApplicationStatus
  reference: string
  submittedAt: string
  note: string
}

export type UserRequestKind = 'talent_apply' | 'vendor_apply' | 'hire_talent'

export interface UserRequestCard {
  id: string
  kind: UserRequestKind
  /** Role label key for apply requests; unused for hire. */
  role?: 'vendor' | 'talent' | 'organizer'
  status: ApplicationStatus
  reference: string
  submittedAt: string
  note: string
  title: string
  href: string
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

function hrefForRole(role: 'vendor' | 'talent' | 'organizer'): string {
  if (role === 'talent') return '/my-talent-application'
  return '/my-facilities-application'
}

function roleFromType(type: string): 'vendor' | 'talent' | 'organizer' | null {
  const value = type.toLowerCase()
  if (value.includes('talent')) return 'talent'
  if (value.includes('vendor') || value.includes('facilit')) return 'vendor'
  if (value.includes('organizer')) return 'organizer'
  return null
}

function cardFromApplicationEntry(
  type: string,
  application: Record<string, unknown>,
): UserRequestCard | null {
  const role = roleFromType(type)
  if (!role) return null

  const status = normalizeStatus(application.status ?? application.state)
  const reference = String(
    application.reference ?? application.ref ?? application.id ?? '',
  )
  if (!reference) return null

  const kind: UserRequestKind =
    role === 'talent' ? 'talent_apply' : 'vendor_apply'

  return {
    id: `app-${role}-${reference}`,
    kind,
    role,
    status,
    reference,
    submittedAt: String(
      application.submitted_at ??
        application.submittedAt ??
        application.created_at ??
        application.createdAt ??
        '',
    ),
    note: String(
      application.note ?? application.message ?? application.reason ?? '',
    ),
    title: '',
    href: hrefForRole(role),
  }
}

/**
 * Talent / vendor / organizer apply requests from `GET /applications`.
 * Supports both the new `applications[]` list and the legacy single shape.
 */
export function listApplyRequests(
  data: Record<string, unknown> | undefined,
): UserRequestCard[] {
  if (!data || Object.keys(data).length === 0) return []

  const bundled = data.applications
  if (Array.isArray(bundled) && bundled.length > 0) {
    return bundled.flatMap((entry) => {
      if (!entry || typeof entry !== 'object') return []
      const row = entry as Record<string, unknown>
      const application =
        row.application && typeof row.application === 'object'
          ? (row.application as Record<string, unknown>)
          : row
      const card = cardFromApplicationEntry(
        String(row.type ?? row.role ?? ''),
        application,
      )
      return card ? [card] : []
    })
  }

  const type = String(data.type ?? data.role ?? '')
  const nested =
    data.application && typeof data.application === 'object'
      ? (data.application as Record<string, unknown>)
      : data
  const card = cardFromApplicationEntry(type, nested)
  return card ? [card] : []
}

/** Hire-a-talent rows from `GET /talents/my-requests`. */
export function listHireTalentRequests(
  rows: Record<string, unknown>[] | undefined,
): UserRequestCard[] {
  if (!rows?.length) return []

  return rows.flatMap((row) => {
    const id = String(row.id ?? '')
    if (!id) return []
    const talent =
      row.talent && typeof row.talent === 'object'
        ? (row.talent as Record<string, unknown>)
        : undefined
    const talentName = String(
      talent?.stageName ?? talent?.stage_name ?? talent?.name ?? '',
    )
    const status = normalizeStatus(row.status)
    return [
      {
        id: `hire-${id}`,
        kind: 'hire_talent' as const,
        status,
        reference: id,
        submittedAt: String(row.created_at ?? row.createdAt ?? ''),
        note: String(row.requestReason ?? row.request_reason ?? row.location ?? ''),
        title: talentName,
        href: talent?.id ? `/talents/${talent.id}` : '/talents',
      },
    ]
  })
}

/** @deprecated use listApplyRequests */
export function listUserRequests(
  data: Record<string, unknown> | undefined,
): UserRequestCard[] {
  return listApplyRequests(data)
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
