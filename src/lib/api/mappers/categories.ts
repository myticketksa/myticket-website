import { localizedString } from '@/lib/api/locale'

type ApiRecord = Record<string, unknown>

/** Normalize category / taxonomy rows from guest list endpoints. */
export function mapCategoryLabel(record: ApiRecord, fallback = ''): string {
  return (
    localizedString(record.name) ||
    localizedString(record.title) ||
    localizedString(record.label) ||
    localizedString(record.category) ||
    localizedString(record.name_en) ||
    fallback
  )
}

export function mapCategoryLabels(
  records: ApiRecord[] | undefined,
  opts?: { allLabel?: string; fallback?: readonly string[] },
): string[] {
  const allLabel = opts?.allLabel
  const fromApi = (records ?? [])
    .map((row) => mapCategoryLabel(row))
    .filter(Boolean)

  const unique = [...new Set(fromApi)]
  if (unique.length === 0) {
    return opts?.fallback ? [...opts.fallback] : allLabel ? [allLabel] : []
  }

  if (allLabel && !unique.includes(allLabel)) {
    return [allLabel, ...unique]
  }
  return unique
}
