import { localizedString } from '@/lib/api/locale'
import type { IdLabelOption } from '@/lib/api/formPayload'

type ApiRecord = Record<string, unknown>

/** City rows from `GET /generals/cities` → dropdown / filter options. */
export function mapCityOptions(
  records: ApiRecord[] | undefined,
  fallback: IdLabelOption[] = [],
): IdLabelOption[] {
  const fromApi = (records ?? [])
    .map((row) => {
      const value = String(row.id ?? row.city_id ?? row.value ?? '')
      if (!value) return null
      const label =
        localizedString(row.name) ||
        localizedString(row.title) ||
        localizedString(row.label) ||
        value
      return { value, label }
    })
    .filter((row): row is IdLabelOption => row != null)

  return fromApi.length > 0 ? fromApi : fallback
}

/** Category rows with stable ids for API `filters[category]`. */
export function mapCategoryOptions(
  records: ApiRecord[] | undefined,
  opts?: { allLabel?: string; fallback?: IdLabelOption[] },
): IdLabelOption[] {
  const fromApi = (records ?? [])
    .map((row) => {
      const value = String(row.id ?? row.value ?? '')
      if (!value) return null
      const label =
        localizedString(row.name) ||
        localizedString(row.title) ||
        localizedString(row.label) ||
        localizedString(row.name_en) ||
        value
      return { value, label }
    })
    .filter((row): row is IdLabelOption => row != null)

  const list = fromApi.length > 0 ? fromApi : [...(opts?.fallback ?? [])]
  if (opts?.allLabel) {
    return [{ value: '', label: opts.allLabel }, ...list]
  }
  return list
}
